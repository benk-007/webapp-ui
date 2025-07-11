import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

// Imports spécifiques aux incidents
import { IncidentService } from '../../services/incident.service';
import { IncidentGetModel } from '../../models/incident-get.model';

// Composants partagés
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';

@Component({
  selector: 'app-incident-edit',
  standalone: true,
  imports: [
    // Angular common
    NgIf,

    // Routing
    RouterLink,
    RouterLinkActive,
    RouterOutlet,

    // UI Components
    TooltipDirective,
    TranslatePipe,

    // Shared components
    PageTitleComponent
  ],
  templateUrl: './incident-edit.component.html',
  styleUrl: './incident-edit.component.scss'
})
export class IncidentEditComponent implements OnDestroy {

  // ========== PROPRIÉTÉS ==========

  // Incident actuellement édité
  incident!: IncidentGetModel;

  // ID de l'incident récupéré depuis l'URL
  private incidentId!: string;

  // Gestion des subscriptions
  private subscriptions: Subscription[] = [];

  // ========== CONSTRUCTEUR ==========

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly incidentService: IncidentService,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    // Écoute des changements de paramètres d'URL
    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(params => {
        this.incidentId = params.get('id') as string;
        this.retrieveIncident();
      })
    );
  }

  // ========== MÉTHODES PRIVÉES ==========

  /**
   * Récupère l'incident depuis l'API
   */
  private retrieveIncident(): void {
    this.subscriptions.push(
      this.incidentService.getIncidentById(this.incidentId).subscribe({
        next: (data) => {
          console.log('Incident data retrieved:', data);
          this.incident = data;
        },
        error: (err) => {
          console.error('Error retrieving incident:', err);
          this.toastrService.error(
            this.translateService.instant('incidents.edit.notifications.load.error.message'),
            this.translateService.instant('incidents.edit.notifications.load.error.title')
          );
        }
      })
    );
  }

  // ========== LIFECYCLE HOOKS ==========

  ngOnDestroy(): void {
    // Nettoyage des subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
