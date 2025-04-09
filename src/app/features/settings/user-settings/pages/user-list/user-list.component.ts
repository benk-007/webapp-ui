import {Component} from '@angular/core';
import {
  AvatarComponent,
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  TableDirective
} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {cilClock, cilPen, cilSearch} from "@coreui/icons";
import {ListContentComponent} from "../../../../../shared/components/list-content/list-content.component";
import {UserListItemGetModel} from "../../models/user-list-item-get.model";
import {TableControlComponent} from "../../../../../shared/components/table-control/table-control.component";
import {TranslatePipe} from "@ngx-translate/core";
import {SelectableTableDirective} from "../../../../../shared/directives/selectable-table.directive";
import {BadgeComponent} from "../../../../../shared/components/badge/badge.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {DatePipe, NgIf, TitleCasePipe} from "@angular/common";
import {UserCuModalComponent} from "../user-cu-modal/user-cu-modal.component";
import {BsModalService} from "ngx-bootstrap/modal";

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
    NgIf
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  providers: [BsModalService]
})
export class UserListComponent extends ListContentComponent {

  icons = {cilSearch, cilClock, cilPen}
  override listContent: UserListItemGetModel[] = [];
  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|contactName|type|website|status|creationDate|modifiedAt),(asc|desc)$/,
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
        .getUsersByPage()
        .subscribe({
          next: (data: any) => {
            super.handleSuccessData(data);
          },
          error: (err: any) => {
            console.warn('An error occurred when retrieving users list from API:', err)
          }
        })
    );
  }

  getNameInitials(name: string): string {
    if (name) {
      // Split the name into words, removing any extra spaces
      const words = name.trim().split(" ").filter(word => word.trim() !== "");

      // Handle names with different word counts
      if (words.length === 1) {
        // Single word name: Use the first two letters
        return words[0].slice(0, 2).toUpperCase();
      } else if (words.length === 2) {
        // Two words: Use the initials of both words
        return (
          words[0].charAt(0).toUpperCase() +
          words[1].charAt(0).toUpperCase()
        );
      } else {
        // Three or more words: Use the initials of the first two and the last word
        return (
          words[0].charAt(0).toUpperCase() +
          words[1].charAt(0).toUpperCase() +
          words[words.length - 1].charAt(0).toUpperCase()
        );
      }
    } else {
      return 'N/A';
    }
  }

  openUserCuModal(user?: UserListItemGetModel) {
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
