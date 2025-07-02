import {Component} from '@angular/core';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from "@coreui/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {IconDirective} from "@coreui/icons-angular";
import {cilBath, cilBed, cilMediaPlay, cilPen, cilSearch, cilChevronRight, cilArrowBottom} from "@coreui/icons";
import {SelectableTableDirective} from "../../../../shared/directives/selectable-table.directive";
import {BsModalService} from "ngx-bootstrap/modal";
import {UnitCreateModalComponent} from "../unit-create-modal/unit-create-modal.component";
import {ListContentComponent} from "../../../../shared/components/list-content/list-content.component";
import {UnitItemGetModel} from "../../models/unit-item-get.model";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {UnitApiService} from "../../services/unit-api.service";
import {AuditNamePipe} from "../../../../shared/pipes/audit-name.pipe";
import {TooltipDirective} from "ngx-bootstrap/tooltip";
import {TableControlComponent} from "../../../../shared/components/table-control/table-control.component";
import {EmptyDataComponent} from "../../../../shared/components/empty-data/empty-data.component";
import {PageTitleComponent} from "../../../../shared/components/page-title/page-title.component";
import {MultiUnitCreateModalComponent} from "../multi-unit-create-modal/multi-unit-create-modal.component";
import {PageFilterModel} from "../../../../shared/models/page-filter.model";
import {UnitSelectComponent} from "../../../../shared/components/unit-select/unit-select.component";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-unit-list',
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    TranslatePipe,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    SelectableTableDirective,
    TableDirective,
    AuditNamePipe,
    AvatarComponent,
    RouterLink,
    TooltipDirective,
    ButtonGroupComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    TableControlComponent,
    EmptyDataComponent,
    SpinnerComponent,
    PageTitleComponent,
    NgClass
  ],
  templateUrl: './unit-list.component.html',
  styleUrl: './unit-list.component.scss',
  providers: [BsModalService]
})
export class UnitListComponent extends ListContentComponent {

  icons = {cilSearch, cilBed, cilBath, cilPen, cilMediaPlay, cilArrowBottom, cilChevronRight}

  override listContent: UnitItemGetModel[] = [];
  // Nouvel état pour gérer l'expansion des multi-units
  expandedUnits: Set<string> = new Set();
  // Liste plate pour l'affichage (incluant les sous-unités)
  displayedUnits: UnitItemGetModel[] = [];
  // Unités qui doivent être auto-expandues à cause de la recherche
  autoExpandedUnits: Set<string> = new Set();

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|type|website|status|creationDate|modifiedAt),(asc|desc)$/,
    search: /.{3,}/,
  };

  constructor(public override router: Router,
              public override route: ActivatedRoute,
              public readonly unitApiService: UnitApiService,
              public readonly modalService: BsModalService) {
    super(router, route);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sort = 'modifiedAt';
    this.sortDirection = 'desc';
    this.size = 10;
    this.subscribeToQueryParam();
    this.isAdvancedSearchDisplayed = false;
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    console.log('Retrieving unit list ...')
    let pageFilter: PageFilterModel = {
      page: this.page,
      size: this.size,
      sort: this.sort,
      sortDirection: this.sortDirection,
      search: this.search
    }
    this.subscriptions.push(
      this.unitApiService
        .getUnitsByPage(pageFilter)
        .subscribe({
          next: (data: any) => {
            super.handleSuccessData(data);
            console.log('Raw API response:', data);
            console.log('listContent after processing:', this.listContent);
            // Après avoir reçu les données, auto-expand les multi-units qui ont des résultats de recherche
            this.handleAutoExpansionFromBackend();
            // Puis construire la liste d'affichage
            this.buildDisplayedUnits();
            console.log('displayedUnits after build:', this.displayedUnits);
          },
          error: (err: any) => {
            console.warn('An error occurred when retrieving unit list from API:', err)
            if (!this.firstCallDone) {
              this.firstCallDone = true;
            }
          }
        })
    );
  }

  /**
   * Auto-expand les multi-units qui sont retournées par le backend avec des sous-unités
   * Le backend gère déjà la logique de recherche, on fait juste l'affichage
   */
  private handleAutoExpansionFromBackend(): void {
    // Réinitialiser l'auto-expansion
    this.autoExpandedUnits.clear();

    // Si on est en mode recherche et qu'une multi-unit a des sous-unités,
    // cela signifie que le backend a trouvé des résultats pertinents
    if (this.search && this.search.trim().length > 0) {
      for (const unit of this.listContent) {
        if (unit.nature === 'MULTI_UNIT' && unit.subUnits && unit.subUnits.length > 0) {
          // Auto-expand car le backend a retourné cette multi-unit avec ses sous-unités
          this.autoExpandedUnits.add(unit.id);
          this.expandedUnits.add(unit.id);
        }
      }
    }
  }

  /**
   * Construit la liste d'affichage en incluant ou excluant les sous-unités selon l'état d'expansion
   */
  private buildDisplayedUnits(): void {
    this.displayedUnits = [];

    for (const unit of this.listContent) {
      // Ajouter l'unité principale (le backend a déjà filtré selon la recherche)
      this.displayedUnits.push(unit);

      // Si c'est une multi-unit et qu'elle est expandue, ajouter ses sous-unités
      if (unit.nature === 'MULTI_UNIT' &&
        this.expandedUnits.has(unit.id) &&
        unit.subUnits &&
        unit.subUnits.length > 0) {

        // Marquer les sous-unités comme telles pour l'affichage
        const subUnitsWithParentFlag = unit.subUnits.map(subUnit => ({
          ...subUnit,
          isSubUnit: true,
          parentUnitId: unit.id
        }));

        this.displayedUnits.push(...subUnitsWithParentFlag);
      }
    }
  }

  /**
   * Toggle l'expansion d'une multi-unit
   */
  toggleUnitExpansion(unitId: string): void {
    if (this.expandedUnits.has(unitId)) {
      this.expandedUnits.delete(unitId);
      // Retirer aussi de l'auto-expansion si elle y était
      this.autoExpandedUnits.delete(unitId);
    } else {
      this.expandedUnits.add(unitId);
    }

    // Reconstruire la liste d'affichage
    this.buildDisplayedUnits();
  }

  /**
   * Vérifie si une multi-unit est expandue
   */
  isUnitExpanded(unitId: string): boolean {
    return this.expandedUnits.has(unitId);
  }

  /**
   * Vérifie si une unité est une sous-unité (pour l'affichage)
   */
  isSubUnit(unit: any): boolean {
    return unit.isSubUnit === true;
  }

  /**
   * Vérifie si une unité peut être expandue (multi-unit avec sous-unités)
   */
  canExpand(unit: UnitItemGetModel): boolean {
    const result = unit.nature === 'MULTI_UNIT' && unit.subUnits != null && unit.subUnits.length > 0;
    return result;
  }

  /**
   * Vérifie si une multi-unit a été auto-expandue à cause de la recherche
   */
  isAutoExpanded(unitId: string): boolean {
    return this.autoExpandedUnits.has(unitId);
  }

  openCreateUnitModal() {
    let initialState = {
      class: 'modal-lg'
    }
    let unitCreateModalRef = this.modalService.show(UnitCreateModalComponent, initialState);

    this.subscriptions.push((unitCreateModalRef.content as UnitCreateModalComponent).actionConfirmed.subscribe(
      () => {
        this.refreshListContent();
      }
    ));
  }

  openCreateMultiUnitModal() {
    let initialState = {
      class: 'modal-lg'
    }
    let multiUnitCreateModalRef = this.modalService.show(MultiUnitCreateModalComponent, initialState);

    this.subscriptions.push((multiUnitCreateModalRef.content as MultiUnitCreateModalComponent).actionConfirmed.subscribe(
      () => {
        this.refreshListContent();
      }
    ));
  }

  override refreshListContent(): void {
    // Réinitialiser l'état d'expansion lors du refresh
    this.expandedUnits.clear();
    this.autoExpandedUnits.clear();
    super.refreshListContent();
  }
}
