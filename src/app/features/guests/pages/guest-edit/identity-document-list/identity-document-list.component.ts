import {Component} from '@angular/core';
import {ListContentComponent} from "../../../../../shared/components/list-content/list-content.component";
import {
  cilClock,
  cilPen,
  cilSearch,
  cilSortAscending,
  cilSortDescending,
  cilSwapVertical,
  cilTrash
} from "@coreui/icons";
import {IdentityDocumentItemGetModel} from "../../../models/identity-document-item-get.model";
import {ActivatedRoute, Router} from "@angular/router";
import {IdentityDocumentService} from "../../../services/identity-document.service";
import {ToastrService} from "ngx-toastr";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
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
import {TableControlComponent} from "../../../../../shared/components/table-control/table-control.component";
import {AuditNamePipe} from "../../../../../shared/pipes/audit-name.pipe";
import {BadgeComponent} from "../../../../../shared/components/badge/badge.component";
import {DatePipe, NgClass} from "@angular/common";
import {EmptyDataComponent} from "../../../../../shared/components/empty-data/empty-data.component";

@Component({
  selector: 'app-identity-document-list',
  imports: [
    ColComponent,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    TranslatePipe,
    ButtonDirective,
    TableControlComponent,
    AuditNamePipe,
    BadgeComponent,
    DatePipe,
    EmptyDataComponent,
    SpinnerComponent,
    TableDirective,
    AvatarComponent,
    NgClass
  ],
  templateUrl: './identity-document-list.component.html',
  styleUrl: './identity-document-list.component.scss'
})
export class IdentityDocumentListComponent extends ListContentComponent {
  icons = {
    cilSearch,
    cilClock,
    cilPen,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending,
    cilTrash
  };
  guestId!: string;
  override listContent: IdentityDocumentItemGetModel[] = [];

  constructor(public override router: Router,
              public override route: ActivatedRoute,
              public readonly identityDocumentService: IdentityDocumentService,
              private readonly toastr: ToastrService,
              private readonly translateService: TranslateService) {
    super(router, route);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.size = 10;
    this.subscriptions.push(
      this.route.parent!.paramMap.subscribe(paramMap => {
        const id = paramMap.get('id');
        if (id) {
          this.guestId = id;
          this.subscribeToQueryParam();
        }
      })
    );
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    this.subscriptions.push(
      this.identityDocumentService.getIdentityDocuments(this.guestId, this.page, this.size).subscribe({
        next: (data) => {
          console.log('Identity documents retrieved successfully. API response is:', data);
          super.handleSuccessData(data);
        },
        error: (err) => {
          console.warn('An error occurred when retrieving identity documents. API error is:', err);
        }
      })
    );
  }

  confirmDeletion(identityDocument: IdentityDocumentItemGetModel) {

  }

  openIdentityDocumentCuModal(identityDocument?: IdentityDocumentItemGetModel) {

  }
}
