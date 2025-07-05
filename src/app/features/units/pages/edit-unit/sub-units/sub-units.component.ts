import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { UnitApiService } from '../../../services/unit-api.service';
import { UnitItemGetModel } from '../../../models/unit-item-get.model';
import {
  ButtonDirective, ColComponent, RowComponent, TableDirective,
  AvatarComponent, SpinnerComponent, FormControlDirective, InputGroupComponent,
  InputGroupTextDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilTrash, cilSearch, cilPen } from '@coreui/icons';
import { EmptyDataComponent } from '../../../../../shared/components/empty-data/empty-data.component';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastrService } from 'ngx-toastr';
import { SubUnitCreateModalComponent } from './sub-unit-create-modal/sub-unit-create-modal.component';
import { SubUnitEditModalComponent } from './sub-unit-edit-modal/sub-unit-edit-modal.component';
import { BsModalService } from "ngx-bootstrap/modal";
import { ListContentComponent } from '../../../../../shared/components/list-content/list-content.component';
import { Router } from '@angular/router';
import { PageFilterModel } from '../../../../../shared/models/page-filter.model';
import { AuditNamePipe } from '../../../../../shared/pipes/audit-name.pipe';
import { SelectableTableDirective } from '../../../../../shared/directives/selectable-table.directive';

@Component({
  selector: 'app-sub-units',
  standalone: true,
  imports: [
    CommonModule, TranslatePipe, ButtonDirective, ColComponent, RowComponent,
    TableDirective, AvatarComponent, SpinnerComponent, IconDirective,
    EmptyDataComponent,FormControlDirective, InputGroupComponent,
    InputGroupTextDirective, AuditNamePipe, SelectableTableDirective
  ],
  providers: [BsModalService],
  templateUrl: './sub-units.component.html',
  styleUrl: './sub-units.component.scss'
})
export class SubUnitsComponent extends ListContentComponent implements OnInit, OnDestroy {

  multiUnitId!: string;
  subUnits: UnitItemGetModel[] = [];
  override listContent: UnitItemGetModel[] = [];
  icons = { cilTrash, cilSearch, cilPen };

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|priority|readiness|createdAt),(asc|desc)$/,
    search: /.{3,}/,
  };

  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    private unitApiService: UnitApiService,
    private modalService: BsModalService,
    private toastrService: ToastrService,
  ) {
    super(router, route);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sort = 'priority';
    this.sortDirection = 'asc';
    this.size = 10;
    this.multiUnitId = this.route.parent?.snapshot.params['unitId'];
    this.subscribeToQueryParam();
    this.isAdvancedSearchDisplayed = false;
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    console.log('Retrieving sub units list ...');

    let pageFilter: PageFilterModel = {
      page: this.page,
      size: this.size,
      sort: this.sort,
      sortDirection: this.sortDirection,
      search: this.search
    };

    this.subscriptions.push(
      this.unitApiService.getSubUnits(this.multiUnitId,pageFilter).subscribe({
        next: (response) => {

          const mockPageData = {
            content: response.content || [],
            totalElements: response.content?.length || 0,
            numberOfElements: response.content?.length || 0,
            pageable: { offset: 0 },
            empty: !response.content || response.content.length === 0,
            last: true,
            first: true
          };

          super.handleSuccessData(mockPageData);
          this.subUnits = this.listContent;
          console.log('SubUnits loaded:', this.subUnits);
        },
        error: (err) => {
          console.error('Error loading subUnits:', err);
          if (!this.firstCallDone) {
            this.firstCallDone = true;
          }
          this.toastrService.error('Failed to load SubUnits', 'Error');
        }
      })
    );
  }

  onAddNewSubUnit(): void {
    const initialState = {
      multiUnitId: this.multiUnitId
    };

    const modalRef = this.modalService.show(SubUnitCreateModalComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.subscriptions.push(
      (modalRef.content as SubUnitCreateModalComponent).subUnitCreated.subscribe(() => {
        this.refreshListContent();
      })
    );
  }


  onEditSubUnit(subUnit: UnitItemGetModel): void {
    const initialState = {
      subUnit: subUnit
    };

    const modalRef = this.modalService.show(SubUnitEditModalComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.subscriptions.push(
      (modalRef.content as SubUnitEditModalComponent).subUnitUpdated.subscribe(() => {
        this.refreshListContent(); // Recharger la liste
      })
    );
  }

  onRemoveSubUnit(subUnit: UnitItemGetModel): void {
    const initialState = {
      title: 'Detach SubUnit',
      message: `Are you sure you want to detach "${subUnit.name}" from this multi-unit? The unit will become independent but won't be deleted.`
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, { initialState });

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.detachSubUnit(subUnit);
      })
    );
  }

  private detachSubUnit(subUnit: UnitItemGetModel): void {
    this.subscriptions.push(
      this.unitApiService.detachSubUnit(subUnit.id).subscribe({
        next: () => {
          this.refreshListContent();
          this.toastrService.success(
            `SubUnit "${subUnit.name}" has been successfully detached.`,
            'SubUnit Detached'
          );
        },
        error: (err) => {
          console.error('Error detaching subUnit:', err);
          this.toastrService.error(
            `Failed to detach "${subUnit.name}". Please try again.`,
            'Detachment Failed'
          );
        }
      })
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
