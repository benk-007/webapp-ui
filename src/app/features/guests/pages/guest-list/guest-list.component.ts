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
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {
  cilClock,
  cilPen,
  cilSearch,
  cilSortAscending,
  cilSortDescending,
  cilSwapVertical,
  cilTrash
} from '@coreui/icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {GuestService} from '../../services/guest.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {GuestItemGetModel} from '../../models/guest-item-get.model';
import {GuestCreateModalComponent} from '../guest-create-modal/guest-create-modal.component';
import {TooltipDirective} from 'ngx-bootstrap/tooltip';
import {TableControlComponent} from '../../../../shared/components/table-control/table-control.component';
import {SelectableTableDirective} from '../../../../shared/directives/selectable-table.directive';
import {AuditNamePipe} from '../../../../shared/pipes/audit-name.pipe';
import {EmptyDataComponent} from '../../../../shared/components/empty-data/empty-data.component';
import {ListContentComponent} from '../../../../shared/components/list-content/list-content.component';
import {ToastrService} from 'ngx-toastr';
import {ConfirmModalComponent} from "../../../../shared/components/confirm-modal/confirm-modal.component";

@Component({
  selector: 'app-guest-list',
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
    AuditNamePipe,
    AvatarComponent,
    SelectableTableDirective,
    TableDirective,
    EmptyDataComponent,
    RouterLink,
    TooltipDirective
  ],
  templateUrl: './guest-list.component.html',
  styleUrl: './guest-list.component.scss',
  providers: [BsModalService]
})
export class GuestListComponent extends ListContentComponent {
  icons = {
    cilSearch,
    cilClock,
    cilPen,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending,
    cilTrash
  };

  override listContent: GuestItemGetModel[] = [];

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(firstName|lastName|birthDate|createdAt),(asc|desc)$/,
    search: /.{3,}/
  };

  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    public readonly guestService: GuestService,
    public readonly modalService: BsModalService,
    private readonly toastr: ToastrService,
    private translateService: TranslateService,
  ) {
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
    this.subscriptions.push(
      this.guestService.getGuestsByPage(this.page, this.size, this.sort, this.sortDirection, this.search).subscribe({
        next: (data: any) => {
          super.handleSuccessData(data);
        },
        error: (err: any) => {
          console.warn('Error retrieving guests:', err);
        }
      })
    );
  }

  openGuestCreateModal() {
    let initialState = {
      class: 'modal-lg'
    }
    let guestCreateModalRef = this.modalService.show(GuestCreateModalComponent, initialState);
    this.subscriptions.push(
      (guestCreateModalRef.content as GuestCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  deleteGuest(guest: GuestItemGetModel): void {
    const initialState = {
      title: this.translateService.instant('guests.list.delete-modal.title'),
      message: this.translateService.instant('guests.list.delete-modal.message', {name: `${guest.firstName} ${guest.lastName}`})
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, {initialState});

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.guestService.deleteGuestById(guest.id).subscribe({
          next: () => {
            this.refreshListContent();
            this.toastr.success(
              this.translateService.instant('guests.list.notifications.delete.success.message', {name: `${guest.firstName} ${guest.lastName}`}),
              this.translateService.instant('guests.list.notifications.delete.success.title')
            );
          },
          error: () => {
            this.toastr.error(
              this.translateService.instant('guests.list.notifications.delete.error.message'),
              this.translateService.instant('guests.list.notifications.delete.error.title')
            );
          }
        });
      })
    );
  }
}
