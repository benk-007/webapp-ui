import {Component, OnDestroy} from '@angular/core';
import {PageTitleComponent} from "../../../../shared/components/page-title/page-title.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {UnitApiService} from "../../services/unit-api.service";
import {ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {TooltipDirective} from "ngx-bootstrap/tooltip";
import {JsonPipe, NgIf} from "@angular/common";
import {UnitGetModel} from "../../models/unit-get.model";

@Component({
  selector: 'app-edit-unit',
  imports: [
    PageTitleComponent,
    TranslatePipe,
    RouterOutlet,
    TooltipDirective,
    RouterLink,
    RouterLinkActive,
    NgIf,
    JsonPipe
  ],
  templateUrl: './edit-unit.component.html',
  styleUrl: './edit-unit.component.scss'
})
export class EditUnitComponent implements OnDestroy {

  unit!: UnitGetModel;
  private unitId!: string;

  private subscriptions: Subscription[] = [];
  openDropdown = false;

  constructor(private activatedRoute: ActivatedRoute,
              private readonly unitApiService: UnitApiService,
              private readonly translateService: TranslateService,
              private readonly toastrService: ToastrService) {
    this.subscriptions.push(this.activatedRoute.paramMap.subscribe(value => {
      this.unitId = value.get('unitId') as string;
      this.retrieveUnit();
    }));
  }

  private retrieveUnit() {
    this.subscriptions.push(this.unitApiService.getUnitById(this.unitId).subscribe({
      next: (data) => {
        console.log('Your unit data is: ', data);
        this.unit = data;
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
