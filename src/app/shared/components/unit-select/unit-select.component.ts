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
import {RentalRefModel} from "../../../features/incidents/models/rental-ref.model";

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
  displayValue: UnitItemGetModel | UnitItemGetModel[] | null = null;
  private pendingValue: RentalRefModel[] | null = null;



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

            // Appliquer les valeurs en attente
            this.applyPendingValue();
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

  valueChanged($event: UnitItemGetModel[] | UnitItemGetModel | null): void {
    console.log('value changed in unit select: ', $event);
    this.markAsTouched();

    if (!this.disabled) {
      // Gérer le cas single (pas multiple)
      if (!this.multiple) {
        this.selectedUnits = $event ? [$event as UnitItemGetModel] : null;
        this.displayValue = $event; // Mettre à jour displayValue
      } else {
        this.selectedUnits = $event as UnitItemGetModel[] || null;
        this.displayValue = this.selectedUnits; // Mettre à jour displayValue
      }

      // Transformer en RentalRefModel pour l'émission
      let rentalRefToEmit: RentalRefModel[] | RentalRefModel | null = null;

      if (this.selectedUnits && this.selectedUnits.length > 0) {
        const transformedUnits = this.selectedUnits.map(unit => ({
          id: unit.id,
          name: unit.name
        }));

        rentalRefToEmit = this.multiple ? transformedUnits : transformedUnits[0];
      }

      this.onChange(rentalRefToEmit);
      this.updatedUnits.emit(rentalRefToEmit as UnitItemGetModel[] | null);
    }
  }

  writeValue(obj: RentalRefModel[] | RentalRefModel | null): void {
    console.log('UnitSelectComponent writeValue called with:', obj);

    if (obj) {
      const objArray = Array.isArray(obj) ? obj : [obj];

      if (this.unitSearchList.length > 0) {
        // Si la liste est déjà chargée, appliquer directement
        this.selectedUnits = objArray
          .map(ref => this.unitSearchList.find(unit => unit.id === ref.id))
          .filter(Boolean) as UnitItemGetModel[];

        this.updateDisplayValue();
      } else {
        // Sinon, stocker pour application ultérieure
        this.pendingValue = objArray;
        // Et déclencher le chargement de la liste
        this.loadInitialUnits();
      }
    } else {
      this.selectedUnits = null;
      this.displayValue = null;
      this.pendingValue = null;
    }
  }

  /**
   * Charge les unités initiales pour permettre l'affichage des valeurs pré-sélectionnées
   */
  private loadInitialUnits(): void {
    if (this.unitSearchList.length === 0) {
      this.$unitSearch.next(''); // Déclenche le chargement initial
    }
  }

  /**
   * Met à jour displayValue en fonction du mode (single/multiple)
   */
  private updateDisplayValue(): void {
    if (this.selectedUnits && this.selectedUnits.length > 0) {
      if (!this.multiple) {
        this.displayValue = this.selectedUnits[0];
      } else {
        this.displayValue = this.selectedUnits;
      }
    } else {
      this.displayValue = null;
    }
  }

  /**
   * Applique les valeurs en attente une fois la liste chargée
   */
  private applyPendingValue(): void {
    if (this.pendingValue && this.unitSearchList.length > 0) {
      console.log('Applying pending value:', this.pendingValue);

      this.selectedUnits = this.pendingValue
        .map(ref => this.unitSearchList.find(unit => unit.id === ref.id))
        .filter(Boolean) as UnitItemGetModel[];

      this.updateDisplayValue();
      this.pendingValue = null; // Nettoyer la valeur en attente

      console.log('Selected units after applying pending:', this.selectedUnits);
      console.log('Display value after applying pending:', this.displayValue);
    }
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
