import { Component } from '@angular/core';
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
import { IconDirective } from '@coreui/icons-angular';
import { cilPen, cilSearch, cilTrash } from '@coreui/icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

// Imports spécifiques aux catégories
import { CategoryService } from '../../services/category.service';
import { CategoryItemGetModel } from '../../models/category-item-get.model';
import { CategoryCreateModalComponent } from '../category-create-modal/category-create-modal.component';
import { CategoryEditModalComponent } from '../category-edit-modal/category-edit-modal.component';

// Imports des composants partagés
import { TableControlComponent } from '../../../../shared/components/table-control/table-control.component';
import { SelectableTableDirective } from '../../../../shared/directives/selectable-table.directive';
import { AuditNamePipe } from '../../../../shared/pipes/audit-name.pipe';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { ListContentComponent } from '../../../../shared/components/list-content/list-content.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DatePipe } from '@angular/common';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-category-list',
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
    BadgeComponent
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  providers: [BsModalService]
})
export class CategoryListComponent extends ListContentComponent {

  // Icônes utilisées dans le template
  icons = {
    cilSearch,
    cilPen,
    cilTrash
  };

  // Override du contenu de la liste avec le bon type
  override listContent: CategoryItemGetModel[] = [];

  // Validation des paramètres d'URL (pagination, tri, recherche)
  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|createdAt),(asc|desc)$/,
    search: /.{1,}/
  };

  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    public readonly categoryService: CategoryService,
    public readonly modalService: BsModalService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService
  ) {
    super(router, route);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Configuration par défaut du tri et pagination
    this.sort = 'name';
    this.sortDirection = 'asc';
    this.size = 10;
    // Démarrage de l'écoute des paramètres URL
    this.subscribeToQueryParam();
    // Pas de recherche avancée pour l'instant
    this.isAdvancedSearchDisplayed = false;
  }

  /**
   * Récupère la liste des catégories depuis l'API
   * Cette méthode override celle de ListContentComponent
   * @param params - Paramètres de l'URL
   */
  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    console.log('Retrieving categories list...');

    this.subscriptions.push(
      this.categoryService
        .getCategoriesByPage(this.page, this.size, this.sort, this.sortDirection, this.search)
        .subscribe({
          next: (data: any) => {
            super.handleSuccessData(data);
          },
          error: (err: any) => {
            console.warn('An error occurred when retrieving categories list from API:', err);
          }
        })
    );
  }

  /**
   * Ouvre la modal de création de catégorie
   */
  openCreateCategoryModal() {
    const initialState = { class: 'modal-lg' };
    const categoryCreateModalRef = this.modalService.show(CategoryCreateModalComponent, initialState);

    this.subscriptions.push(
      (categoryCreateModalRef.content as CategoryCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  /**
   * Ouvre la modal d'édition de catégorie
   * @param category - Catégorie à éditer
   */
  openEditCategoryModal(category: CategoryItemGetModel) {
    const initialState = {
      categoryToEdit: category,
      class: 'modal-lg'
    };
    const categoryEditModalRef = this.modalService.show(CategoryEditModalComponent, { initialState });

    this.subscriptions.push(
      (categoryEditModalRef.content as CategoryEditModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  /**
   * Supprime une catégorie avec confirmation
   * @param category - Catégorie à supprimer
   */
  deleteCategory(category: CategoryItemGetModel): void {
    const initialState = {
      title: this.translateService.instant('categories.list.delete-modal.title'),
      message: this.translateService.instant('categories.list.delete-modal.message', {name: category.name})
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, {initialState});

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.categoryService.deleteCategoryById(category.id).subscribe({
          next: () => {
            this.refreshListContent();
            this.toastr.success(
              this.translateService.instant('categories.list.notifications.delete.success.message', {name: category.name}),
              this.translateService.instant('categories.list.notifications.delete.success.title')
            );
          },
          error: () => {
            this.toastr.error(
              this.translateService.instant('categories.list.notifications.delete.error.message'),
              this.translateService.instant('categories.list.notifications.delete.error.title')
            );
          }
        });
      })
    );
  }
}
