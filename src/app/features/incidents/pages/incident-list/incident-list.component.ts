import {Component} from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {
  cilPen,
  cilSearch,
  cilTrash
} from '@coreui/icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BsModalService} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';

// Imports spécifiques aux incidents
import {IncidentService} from '../../services/incident.service';
import {IncidentGetModel} from '../../models/incident-get.model';
import {IncidentCreateModalComponent} from '../incident-create-modal/incident-create-modal.component';

// Imports des composants partagés
import {TableControlComponent} from '../../../../shared/components/table-control/table-control.component';
import {SelectableTableDirective} from '../../../../shared/directives/selectable-table.directive';
import {AuditNamePipe} from '../../../../shared/pipes/audit-name.pipe';
import {EmptyDataComponent} from '../../../../shared/components/empty-data/empty-data.component';
import {ListContentComponent} from '../../../../shared/components/list-content/list-content.component';
import {ConfirmModalComponent} from "../../../../shared/components/confirm-modal/confirm-modal.component";
import {DatePipe} from "@angular/common";
import {BadgeComponent} from "../../../../shared/components/badge/badge.component";

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [
    // CoreUI components
    ButtonDirective,
    ColComponent,
    RowComponent,
    TranslatePipe,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    SpinnerComponent,
    TableDirective,
    DatePipe,

    // Shared components
    TableControlComponent,
    AuditNamePipe,
    SelectableTableDirective,
    EmptyDataComponent,
    RouterLink,
    BadgeComponent
  ],
  templateUrl: './incident-list.component.html',
  styleUrl: './incident-list.component.scss',
  providers: [BsModalService]
})
export class IncidentListComponent extends ListContentComponent {


  // Icônes utilisées dans le template
  icons = {
    cilSearch,
    cilPen,
    cilTrash
  };

  // Override du contenu de la liste avec le bon type
  override listContent: IncidentGetModel[] = [];

  // Validation des paramètres d'URL (pagination, tri, recherche)
  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|severity|status|createdAt),(asc|desc)$/,
    search: /.{3,}/
  };


  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    public readonly incidentService: IncidentService,
    public readonly modalService: BsModalService,
    private readonly toastr: ToastrService,
    private translateService: TranslateService,
  ) {
    super(router, route);
  }


  override ngOnInit(): void {
    super.ngOnInit();
    // Configuration par défaut du tri et pagination
    this.sort = 'modifiedAt';
    this.sortDirection = 'desc';
    this.size = 10;
    // Démarrage de l'écoute des paramètres URL
    this.subscribeToQueryParam();
    // Pas de recherche avancée pour l'instant
    this.isAdvancedSearchDisplayed = false;
  }

  // ========== GESTION DES DONNÉES ==========

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    // Appel API pour récupérer les incidents
    this.subscriptions.push(
      this.incidentService.getIncidentsByPage(this.page, this.size, this.sort, this.sortDirection, this.search).subscribe({
        next: (data: any) => {
          super.handleSuccessData(data);
        },
        error: (err: any) => {
          console.warn('Error retrieving incidents:', err);
        }
      })
    );
  }


  // Ouverture de la modal de création d'incident
  openCreateIncidentModal() {
    let initialState = {
      class: 'modal-lg'
    }
    let incidentCreateModalRef = this.modalService.show(IncidentCreateModalComponent, initialState);
    this.subscriptions.push(
      (incidentCreateModalRef.content as IncidentCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  // Suppression d'un incident avec confirmation
  deleteIncident(incident: IncidentGetModel): void {
    const initialState = {
      title: this.translateService.instant('incidents.list.delete-modal.title'),
      message: this.translateService.instant('incidents.list.delete-modal.message', {name: incident.name})
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, {initialState});

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.incidentService.deleteIncidentById(incident.id).subscribe({
          next: () => {
            this.refreshListContent();
            this.toastr.success(
              this.translateService.instant('incidents.list.notifications.delete.success.message', {name: incident.name}),
              this.translateService.instant('incidents.list.notifications.delete.success.title')
            );
          },
          error: () => {
            this.toastr.error(
              this.translateService.instant('incidents.list.notifications.delete.error.message'),
              this.translateService.instant('incidents.list.notifications.delete.error.title')
            );
          }
        });
      })
    );
  }


  // Génération des classes CSS pour les badges de severity
  getSeverityBadgeClass(severity: string): string {
    switch (severity) {
      case 'Low':
        return 'bg-severity-low';
      case 'Medium':
        return 'bg-severity-medium';
      case 'High':
        return 'bg-severity-high';
      case 'Critical':
        return 'bg-severity-critical';
      default:
        return 'bg-secondary';
    }
  }
}
