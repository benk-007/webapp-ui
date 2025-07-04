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
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent
} from '@ng-select/ng-select';

import { GuestService } from '../../../features/guests/services/guest.service';

import { GuestItemGetModel } from '../../../features/guests/models/guest-item-get.model';
import {GuestModel} from "../../../features/availability/models/guest-model";
import {PageFilterModel} from "../../models/page-filter.model";

@Component({
  selector: 'app-guest-select',
  standalone: true,
  imports: [
    NgSelectComponent,
    FormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective
  ],
  templateUrl: './guest-select.component.html',
  styleUrl: './guest-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GuestSelectComponent),
    }
  ]
})
export class GuestSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() disable = false;
  @Output() guestSelected = new EventEmitter<GuestModel | null>();

  guestSearchList: GuestModel[] = [];
  selectedGuest: GuestModel | null = null;

  $guestSearch = new BehaviorSubject<string>('');
  private guestSearchPage = 0;
  private isLastPage = false;

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly guestService: GuestService) {}

  ngOnInit(): void {
    this.subscribeToGuestSearch();
  }

  private subscribeToGuestSearch() {
    this.subscriptions.push(
      this.$guestSearch.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.guestSearchPage = 0;
        this.isLastPage = false;
        this.retrieveGuestSearchList();
      })
    );
  }

  private retrieveGuestSearchList() {
    const searchValue = this.$guestSearch.getValue()?.trim();

    const pageFilter: PageFilterModel = {
      page: this.guestSearchPage,
      size: 20,
      sort: 'name',
      sortDirection: 'asc',
      search: searchValue
    };

    this.subscriptions.push(
      this.guestService.getGuestsByPage(
        pageFilter.page,
        pageFilter.size,
        pageFilter.sort,
        pageFilter.sortDirection,
        pageFilter.search
      ).subscribe({
        next: (res) => {
          const guests: GuestModel[] = res.content.map((g: GuestItemGetModel) => ({
            id: g.id,
            name: `${g.firstName} ${g.lastName}`,
            email: g.contact?.email ?? '',
            phone: g.contact?.mobile ?? ''
          }));

          this.guestSearchList = this.guestSearchPage === 0 ? guests : this.guestSearchList.concat(guests);
          this.isLastPage = res.last;
        },
        error: (err) => console.error('Failed to retrieve guests:', err)
      })
    );
  }

  searchGuests($event: { term: string; items: any[] }): void {
    this.guestSearchPage = 0;
    this.isLastPage = false;
    this.$guestSearch.next($event.term);
  }

  onScrollToEnd(): void {
    if (!this.isLastPage) {
      this.guestSearchPage++;
      this.retrieveGuestSearchList();
    }
  }

  valueChanged($event: GuestModel | null): void {
    this.markAsTouched();
    if (!this.disabled) {
      this.selectedGuest = $event;
      this.onChange(this.selectedGuest);
      this.guestSelected.emit(this.selectedGuest);
    }
  }

  writeValue(obj: GuestModel | null): void {
    this.selectedGuest = obj;
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
