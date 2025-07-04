import {Component} from '@angular/core';
import {BadgeComponent} from "../../../../../../shared/components/badge/badge.component";
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from "@coreui/angular";
import {EmptyDataComponent} from "../../../../../../shared/components/empty-data/empty-data.component";
import {IconDirective} from "@coreui/icons-angular";
import {SelectableTableDirective} from "../../../../../../shared/directives/selectable-table.directive";
import {TableControlComponent} from "../../../../../../shared/components/table-control/table-control.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ListContentComponent} from "../../../../../../shared/components/list-content/list-content.component";
import {
  cilClock,
  cilPen,
  cilSearch,
  cilSortAscending,
  cilSortDescending,
  cilSwapVertical,
  cilTrash
} from "@coreui/icons";
import {ActivatedRoute, Router} from "@angular/router";
import {BsModalService} from "ngx-bootstrap/modal";
import {ToastrService} from "ngx-toastr";
import {TableCuModalComponent} from "./table-cu-modal/table-cu-modal.component";
import {RateApiService} from "../../../../services/rate-api.service";
import {RatesTableItemGetModel} from "../../../../models/rates/rates-table-item-get.model";
import {ConfirmModalComponent} from "../../../../../../shared/components/confirm-modal/confirm-modal.component";

@Component({
  selector: 'app-rates-table',
  imports: [
    BadgeComponent,
    ButtonDirective,
    ColComponent,
    EmptyDataComponent,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    SelectableTableDirective,
    SpinnerComponent,
    TableControlComponent,
    TableDirective,
    TranslatePipe
  ],
  templateUrl: './rates-table.component.html',
  styleUrl: './rates-table.component.scss',
  standalone: true,
  providers: [BsModalService]
})
export class RatesTableComponent extends ListContentComponent {

  icons = {
    cilSearch,
    cilClock,
    cilPen,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending,
    cilTrash
  };
  unitId!: string
  override listContent: RatesTableItemGetModel[] = [];

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(rateName|fromDate|nightly|weekly|monthly|minStay),(asc|desc)$/,
    search: /.{3,}/
  };

  constructor(
    public override readonly router: Router,
    public override readonly route: ActivatedRoute,
    public readonly rateApiService: RateApiService,
    public readonly modalService: BsModalService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService
  ) {
    super(router, route);
    if (this.route.parent?.parent) {
      this.subscriptions.push(this.route.parent?.parent.paramMap.subscribe(value => {
        this.unitId = value.get('unitId') as string;
      }));
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sort = 'startDate';
    this.sortDirection = 'asc';
    this.size = 10;
    this.subscribeToQueryParam();
    this.isAdvancedSearchDisplayed = false;
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    this.subscriptions.push(
      this.rateApiService.getRatesTablesByPage(this.page, this.size, this.sort, this.sortDirection, this.search, this.unitId).subscribe({
        next: (data: any) => {
          super.handleSuccessData(data);
        },
        error: (err: any) => {
          console.warn('Error retrieving standard rates:', err);
        }
      })
    );
  }

  openRatesTableCuModal(ratesTable?: RatesTableItemGetModel) {
    const initialState = {
      ...(ratesTable ? {ratesTableId: ratesTable.id} : {}),
      unitId: this.unitId
    };

    const modalRef = this.modalService.show(TableCuModalComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.subscriptions.push(
      (modalRef.content as TableCuModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  confirmDeleteRatesTable(ratesTable: RatesTableItemGetModel) {
    const initialState = {
      title: this.translateService.instant('tables.delete-modal.title'),
      message: this.translateService.instant('tables.delete-modal.message')
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, {initialState});
    this.subscriptions.push((confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
      this.deleteRatesTable(ratesTable);
    }))
  }

  private deleteRatesTable(ratesTable: RatesTableItemGetModel) {
    this.subscriptions.push(this.rateApiService.deleteRatesTableById(ratesTable.id).subscribe({
      next: () => {
        let message = this.translateService.instant('tables.delete-modal.notifications.success.message');
        this.toastr.success(
          message.replace(':ratesTableName', ratesTable.name),
          this.translateService.instant('tables.delete-modal.notifications.success.title')
        )
        this.refreshListContent();
      },
      error: (err) => {
        console.error('An error occurred when deleting Rates table with Id:', ratesTable.id, 'Error Api Response:', err);
        this.toastr.error(
          this.translateService.instant('tables.delete-modal.notifications.error.message'),
          this.translateService.instant('tables.delete-modal.notifications.error.title')
        )
      }
    }))
  }
}
