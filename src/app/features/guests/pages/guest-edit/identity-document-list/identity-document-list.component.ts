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
import {DocumentItemGetModel} from "../../../models/document-item-get.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DocumentService} from "../../../services/document.service";
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-identity-document-list',
  imports: [],
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
  override listContent: DocumentItemGetModel[] = [];

  constructor(public override router: Router,
              public override route: ActivatedRoute,
              public readonly identityDocumentService: DocumentService,
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

}
