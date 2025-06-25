import { Component } from '@angular/core';
import {
  AvatarComponent,
  ButtonDirective,
  ColComponent, FormControlDirective, InputGroupComponent, InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {BsModalService} from "ngx-bootstrap/modal";
import {ToastrService} from "ngx-toastr";
import {TableCreateModalComponent} from "../table-create-modal/table-create-modal.component";
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
import {TableService} from "../../services/table.service";
import {TableItemGetModel} from "../../models/table-get.model";
import {EmptyDataComponent} from "../../../../../../shared/components/empty-data/empty-data.component";
import {TableControlComponent} from "../../../../../../shared/components/table-control/table-control.component";
import {SelectableTableDirective} from "../../../../../../shared/directives/selectable-table.directive";
import {IconDirective} from "@coreui/icons-angular";
import {BadgeComponent} from "../../../../../../shared/components/badge/badge.component";

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    TranslatePipe,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    SpinnerComponent,
    TableControlComponent,
    SelectableTableDirective,
    TableDirective,
    EmptyDataComponent,
    RouterLink,
    BadgeComponent,
  ],
  templateUrl: './table-list.component.html',
  styleUrl: './table-list.component.scss',
  providers: [BsModalService]
})
export class TableListComponent extends ListContentComponent {

  icons = {
    cilSearch,
    cilClock,
    cilPen,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending,
    cilTrash
  };

  override listContent: TableItemGetModel[] = [];

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(rateName|fromDate|nightly|weekly|monthly|minStay),(asc|desc)$/,
    search: /.{3,}/
  };

  constructor(
    public override readonly router: Router,
    public override readonly route: ActivatedRoute,
    public readonly tableService: TableService,
    public readonly modalService: BsModalService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService
  ) {
    super(router, route);
  }

  openTableCreateModal() {
    const initialState = { class: 'modal-lg' };
    const tableCreateModalRef = this.modalService.show(TableCreateModalComponent, initialState);

    this.subscriptions.push(
      (tableCreateModalRef.content as TableCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sort = 'fromDate';
    this.sortDirection = 'asc';
    this.size = 10;
    this.subscribeToQueryParam();
    this.isAdvancedSearchDisplayed = false;
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    this.subscriptions.push(
      this.tableService.getTablesByPage(this.page, this.size, this.sort, this.sortDirection, this.search).subscribe({
        next: (data: any) => {
          super.handleSuccessData(data);
        },
        error: (err: any) => {
          console.warn('Error retrieving standard rates:', err);
        }
      })
    );
  }
}
