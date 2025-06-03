import {Component, OnDestroy} from '@angular/core';
import {PageTitleComponent} from "../../../../shared/components/page-title/page-title.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {UnitApiService} from "../../services/unit-api.service";
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {TabDirective, TabPanelComponent, TabsComponent, TabsContentComponent, TabsListComponent} from "@coreui/angular";
import {TooltipDirective} from "ngx-bootstrap/tooltip";

@Component({
  selector: 'app-edit-unit',
  imports: [
    PageTitleComponent,
    TranslatePipe,
    TabsComponent,
    TabsListComponent,
    TabDirective,
    TabsContentComponent,
    TabPanelComponent,
    RouterOutlet,
    TooltipDirective,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './edit-unit.component.html',
  styleUrl: './edit-unit.component.scss'
})
export class EditUnitComponent implements OnDestroy {

  title: string;
  private unitId!: string;
  private subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute,
              private readonly unitApiService: UnitApiService,
              private readonly translateService: TranslateService,
              private readonly toastrService: ToastrService) {
    this.subscriptions.push(this.activatedRoute.paramMap.subscribe(value => {
      this.unitId = value.get('unitId') as string;
      this.retrieveUnit();
    }));
    this.title = this.translateService.instant('units.edit-unit.default-title');
  }


  private retrieveUnit() {
    this.subscriptions.push(this.unitApiService.getUnitById(this.unitId).subscribe({
      next: (data) => {
        console.log('Your unit data is: ', data);
      },
      error: (err) => {
        console.error('An error occurred when retrieving the unit', err);
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }
}
