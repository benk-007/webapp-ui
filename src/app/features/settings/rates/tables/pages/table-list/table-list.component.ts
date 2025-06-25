import { Component } from '@angular/core';
import {ButtonDirective, ColComponent, RowComponent} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
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

@Component({
  selector: 'app-table-list',
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    TranslatePipe
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

  constructor(
    public override readonly router: Router,
    public override readonly route: ActivatedRoute,
    public readonly modalService: BsModalService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService
  ) {
    super(router, route);}

  openTableCreateModal() {
    const initialState = { class: 'modal-lg' };
    const tableCreateModalRef = this.modalService.show(TableCreateModalComponent, initialState);

    this.subscriptions.push(
      (tableCreateModalRef.content as TableCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }
}
