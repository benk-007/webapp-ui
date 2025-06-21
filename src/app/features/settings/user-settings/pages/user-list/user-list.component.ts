import {Component} from '@angular/core';
import {
  AvatarComponent,
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {cilClock, cilPen, cilSearch, cilSortAscending, cilSortDescending, cilSwapVertical} from "@coreui/icons";
import {ListContentComponent} from "../../../../../shared/components/list-content/list-content.component";
import {UserItemGetModel} from "../../models/user-item-get.model";
import {TableControlComponent} from "../../../../../shared/components/table-control/table-control.component";
import {TranslatePipe} from "@ngx-translate/core";
import {SelectableTableDirective} from "../../../../../shared/directives/selectable-table.directive";
import {BadgeComponent} from "../../../../../shared/components/badge/badge.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {DatePipe, TitleCasePipe} from "@angular/common";
import {UserCuModalComponent} from "../user-cu-modal/user-cu-modal.component";
import {BsModalService} from "ngx-bootstrap/modal";
import {AuditNamePipe} from "../../../../../shared/pipes/audit-name.pipe";
import {TooltipDirective} from "ngx-bootstrap/tooltip";
import {EmptyDataComponent} from "../../../../../shared/components/empty-data/empty-data.component";
import {PhoneFormatPipe} from "../../../../../shared/pipes/phone-format.pipe";

@Component({
  selector: 'app-user-list',
  imports: [
    RowComponent,
    ColComponent,
    ButtonDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    TableControlComponent,
    TableDirective,
    AvatarComponent,
    TranslatePipe,
    SelectableTableDirective,
    BadgeComponent,
    DatePipe,
    TitleCasePipe,
    AuditNamePipe,
    TooltipDirective,
    EmptyDataComponent,
    SpinnerComponent,
    PhoneFormatPipe
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  providers: [BsModalService]
})
export class UserListComponent extends ListContentComponent {


  icons = {
    cilSearch, cilClock, cilPen, cilSwapVertical, cilSortAscending, cilSortDescending
  }
  override listContent: UserItemGetModel[] = [];
  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(fullname|role|email|mobile|createdAt),(asc|desc)$/,
    search: /.{3,}/,
  };

  constructor(public override router: Router,
              public override route: ActivatedRoute,
              public readonly userService: UserService,
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
      this.userService
        .getUsersByPage(this.page, this.size, this.sort, this.sortDirection, this.search)
        .subscribe({
          next: (data: any) => {
            super.handleSuccessData(data);
          },
          error: (err: any) => {
            console.warn('An error occurred when retrieving users list from API:', err);
          }
        })
    );
  }

  openUserCuModal(user?: UserItemGetModel) {
    let initialState;
    if (user) {
      initialState = {
        userToEdit: user
      }
    }
    let userCuModalRef;

    if (initialState) {
      userCuModalRef = this.modalService.show(UserCuModalComponent, {initialState});
    } else {
      userCuModalRef = this.modalService.show(UserCuModalComponent);
    }

    this.subscriptions.push((userCuModalRef.content as UserCuModalComponent).actionConfirmed.subscribe(
      () => {
        this.refreshListContent();
      }
    ));
  }


}
