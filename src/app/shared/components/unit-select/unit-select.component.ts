import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Subscription
} from 'rxjs';

import { NgSelectComponent, NgLabelTemplateDirective, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { UnitApiService } from '../../../features/units/services/unit-api.service';
import { UnitItemGetModel } from '../../../features/units/models/unit-item-get.model';
import { PageFilterModel } from '../../models/page-filter.model';

@Component({
  selector: 'app-unit-select',
  standalone: true,
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
  // ----- Inputs -----
  @Input() disable = false;
  @Input() allowMultiUnit = false;
  @Input() withParent: boolean | null = false;
  @Input() disableFilter = false;
  @Input() multiple = true;
  @Input() filterByReadiness = true;

  // ----- Output -----
  @Output() updatedUnits = new EventEmitter<UnitItemGetModel[] | null>();

  // ----- Internal state -----
  unitSearchList: UnitItemGetModel[] = [];
  selectedUnits: UnitItemGetModel[] | null = null;

  $unitSearch = new BehaviorSubject<string>('');
  private unitSearchPage = 0;
  private isLastPage = false;

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly unitApiService: UnitApiService) {}

  ngOnInit(): void {
    this.subscribeToUnitSearch();
  }

  private subscribeToUnitSearch(): void {
    this.subscriptions.push(
      this.$unitSearch.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.unitSearchPage = 0;
        this.isLastPage = false;
        this.retrieveUnitSearchList();
      })
    );
  }

  private retrieveUnitSearchList(): void {
    const searchValue = this.$unitSearch.getValue()?.trim();

    const pageFilter: PageFilterModel = {
      page: this.unitSearchPage,
      size: 20,
      sort: 'name',
      sortDirection: 'asc',
      search: searchValue,
      ...(this.disableFilter ? {} : {
        advancedSearchFormValue: {
          nature: 'SINGLE',
          withParent: this.withParent
        }
      })
    };

    this.subscriptions.push(
      this.unitApiService.getUnitsByPage(pageFilter).subscribe({
        next: (res) => {
          console.log('Units retrieved successfully. API response is:', res);

          if (this.unitSearchPage === 0) {
            this.unitSearchList = [];

            for (const unit of res.content) {
              if (unit.nature === 'SINGLE') {
                if (!this.filterByReadiness || unit.readiness) {
                  this.unitSearchList.push(unit);
                }
              }

              if (unit.nature === 'MULTI_UNIT' && unit.subUnits?.length) {
                const readySubUnits = unit.subUnits
                  .filter(sub => !this.filterByReadiness || sub.readiness)
                  .map(sub => ({
                    ...sub,
                    isSubUnit: true,
                    parentUnitId: unit.id
                  }));

                if (readySubUnits.length > 0) {
                  this.unitSearchList.push(unit);
                  this.unitSearchList.push(...readySubUnits);
                }
              }
            }
          } else {
            this.unitSearchList = this.unitSearchList.concat(res.content);
          }

          this.isLastPage = res.last;
        },
        error: (err) => {
          console.error('An error occurred when retrieving unit list. API error response:', err);
        }
      })
    );
  }

  searchUnits($event: { term: string; items: any[] }): void {
    this.unitSearchPage = 0;
    this.isLastPage = false;
    this.$unitSearch.next($event.term);
  }

  onScrollToEnd(): void {
    if (!this.isLastPage) {
      this.unitSearchPage++;
      this.retrieveUnitSearchList();
    }
  }

  valueChanged($event: any): void {
    console.log('value changed in unit select: ', $event);
    this.markAsTouched();

    if (!this.disabled) {
      this.selectedUnits = $event || null;
      this.onChange(this.selectedUnits);
      this.updatedUnits.emit(this.selectedUnits);
    }
  }

  // ----- ControlValueAccessor Implementation -----
  writeValue(obj: any): void {
    this.selectedUnits = obj;
  }

  onChange = (_: any) => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched = () => {};

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
