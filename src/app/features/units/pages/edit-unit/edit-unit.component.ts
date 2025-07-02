import {Component, OnDestroy} from '@angular/core';
import {PageTitleComponent} from "../../../../shared/components/page-title/page-title.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {UnitApiService} from "../../services/unit-api.service";
import {ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {TooltipDirective} from "ngx-bootstrap/tooltip";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-edit-unit',
  imports: [
    PageTitleComponent,
    TranslatePipe,
    RouterOutlet,
    TooltipDirective,
    RouterLink,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './edit-unit.component.html',
  styleUrl: './edit-unit.component.scss'
})
export class EditUnitComponent implements OnDestroy {

  title: string;
  private unitId!: string;
  private subscriptions: Subscription[] = [];
  openDropdown = false;
 //SubUnit
  isSubUnit: boolean = false;
  parentUnitId?: string;

  //MultiUnit
  isMultiUnit: boolean = false;

  //Title
  unitName: string = '';

  constructor(private activatedRoute: ActivatedRoute,
              private readonly unitApiService: UnitApiService,
              private readonly translateService: TranslateService,
              private router: Router,
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
        //on détermine si c'est une subUnit et on stocke l'ID du parent si nécessaire
        this.isSubUnit = !!data.parentUnit;
        this.parentUnitId = data.parentUnit;
        //Nature Multiunit
        this.isMultiUnit = data.nature === 'MULTI_UNIT';

        //Mettre à jour le title
        this.unitName = data.name;
        this.updateTitle();
      },
      error: (err) => {
        console.error('An error occurred when retrieving the unit', err);
      }
    }))
  }

  private updateTitle() {
    if (this.isSubUnit) {
      this.title = `Edit SubUnit: ${this.unitName}`;
    } else if (this.isMultiUnit) {
      this.title = `Edit MultiUnit: ${this.unitName}`;
    } else {
      this.title = this.translateService.instant('units.edit-unit.default-title');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

}
