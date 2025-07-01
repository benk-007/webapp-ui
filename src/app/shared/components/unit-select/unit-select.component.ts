import {Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";
import {UnitItemGetModel} from "../../../features/units/models/unit-item-get.model";
import {BehaviorSubject, debounceTime, distinctUntilChanged, Subscription} from "rxjs";
import {UnitApiService} from "../../../features/units/services/unit-api.service";
import {PageFilterModel} from "../../models/page-filter.model";
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from "@ng-select/ng-select";

@Component({
  selector: 'app-unit-select',
  imports: [
    NgSelectComponent,
    FormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective
  ],
  templateUrl: './unit-select.component.html',
  styleUrl: './unit-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UnitSelectComponent),
    }
  ]
})
export class UnitSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() disable = false;
  @Input() allowMultiUnit = false;  // Nouveau paramètre pour permettre les MULTI_UNIT si nécessaire
  @Output() updatedUnits = new EventEmitter<UnitItemGetModel[] | null>();

  unitSearchList: UnitItemGetModel[] = [];
  selectedUnits: UnitItemGetModel[] | null = null;

  $unitSearch = new BehaviorSubject<string>('');
  private unitSearchPage = 0;
  private isLastPage = false;

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly unitApiService: UnitApiService) {
  }

  ngOnInit(): void {
    this.subscribeToUnitSearch();
  }

  private subscribeToUnitSearch() {
    this.subscriptions.push(this.$unitSearch.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.unitSearchPage = 0;
      this.isLastPage = false;
      this.retrieveUnitSearchList();
    }))
  }

  private retrieveUnitSearchList() {
    const searchValue = this.$unitSearch.getValue()?.trim();

    const pageFilter: PageFilterModel = {
      page: this.unitSearchPage,
      size: 20,
      sort: 'name',
      sortDirection: 'asc',
      search: searchValue,
      advancedSearchFormValue: this.buildFilterCriteria()
    }

    this.subscriptions.push(
      this.unitApiService.getUnitsByPage(pageFilter).subscribe({
        next: (res) => {
          console.log('Units retrieved successfully. API response is:', res);

          // Filtrage côté client supplémentaire pour plus de sécurité
          const filteredUnits = this.filterAvailableUnits(res.content);

          if (this.unitSearchPage === 0) {
            this.unitSearchList = filteredUnits;
          } else {
            this.unitSearchList = this.unitSearchList.concat(filteredUnits);
          }
          this.isLastPage = res.last;
        },
        error: (err) => {
          console.error('An error occurred when retrieving unit list. API error response:', err);
        }
      })
    )
  }

  private buildFilterCriteria() {
    // Configuration du filtre selon le contexte
    const criteria: any = {};

    // Si allowMultiUnit est false, on veut seulement les SINGLE_UNIT
    if (!this.allowMultiUnit) {
      criteria.nature = 'SINGLE_UNIT';
    }
    // Toujours exclure les sous-unités (unités qui ont un parent)
    criteria.excludeSubUnits = true;

    // Si on permet les MULTI_UNIT, pas de filtre sur nature
    return criteria;
  }

  private filterAvailableUnits(units: UnitItemGetModel[]): UnitItemGetModel[] {
    return units.filter(unit => {
      // Exclure les unités qui sont déjà des sous-unités (ont un parent)
      if (unit.parentUnit) {
        console.log(`Excluding unit ${unit.name} - has parent: ${unit.parentUnit}`);
        return false;
      }

      // Si allowMultiUnit est false, exclure aussi les MULTI_UNIT
      if (!this.allowMultiUnit && unit.nature === 'MULTI_UNIT') {
        console.log(`Excluding unit ${unit.name} - is MULTI_UNIT`);
        return false;
      }

      return true;
    });
  }

  // Called when user types in search box
  searchUnits($event: { term: string; items: any[] }): void {
    this.unitSearchPage = 0;    // Reset to first page for new search term
    this.isLastPage = false;     // Reset last page flag
    this.$unitSearch.next($event.term);
  }

  // Called when user scrolls to the end of dropdown list
  onScrollToEnd(): void {
    if (!this.isLastPage) {
      this.unitSearchPage++;
      this.retrieveUnitSearchList();
    }
  }

  valueChanged($event: any): void {
    console.log('value changed in unit select: ', $event)
    this.markAsTouched();
    if (!this.disabled) {
      if ($event) {
        this.selectedUnits = $event;
      } else {
        this.selectedUnits = null;
      }
      this.onChange(this.selectedUnits);
      this.updatedUnits.emit(this.selectedUnits);
    }
  }

  writeValue(obj: any): void {
    this.selectedUnits = obj;
  }

  onChange = (_: any) => {
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched = () => {
  };

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
