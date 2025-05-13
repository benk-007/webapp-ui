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
import {cilBath, cilBed, cilMediaPlay, cilPen, cilSearch} from "@coreui/icons";
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
    PageTitleComponent
  ],
  templateUrl: './unit-list.component.html',
  styleUrl: './unit-list.component.scss',
  providers: [BsModalService]
})
export class UnitListComponent extends ListContentComponent {

  icons = {cilSearch, cilBed, cilBath, cilPen, cilMediaPlay}

  override listContent: UnitItemGetModel[] = [];
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
    console.log('Retrieving users list ...')
    this.subscriptions.push(
      this.unitApiService
        .getUnitsByPage()
        .subscribe({
          next: (data: any) => {
            super.handleSuccessData(data);
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

}
