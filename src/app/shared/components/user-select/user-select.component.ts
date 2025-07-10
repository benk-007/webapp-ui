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
import { Subscription } from 'rxjs';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent
} from '@ng-select/ng-select';

import { UserService } from '../../../features/settings/user-settings/services/user.service';
import { UserItemGetModel } from '../../../features/settings/user-settings/models/user-item-get.model';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [
    NgSelectComponent,
    FormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective
  ],
  templateUrl: './user-select.component.html',
  styleUrl: './user-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UserSelectComponent),
    }
  ]
})
export class UserSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() disable = false;
  @Input() placeholder = 'Select user...';
  @Output() userSelected = new EventEmitter<UserItemGetModel | null>();

  usersList: UserItemGetModel[] = [];
  selectedUser: UserItemGetModel | null = null;

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    // Charger tous les utilisateurs d'un coup (pas de pagination)
    this.subscriptions.push(
      this.userService.getUsersByPage(
        0, // page
        1000, // size large pour récupérer tous les users
        'fullName', // sort
        'asc', // sortDirection
        '' // pas de recherche initiale
      ).subscribe({
        next: (res) => {
          this.usersList = res.content;
        },
        error: (err) => console.error('Failed to retrieve users:', err)
      })
    );
  }

  valueChanged($event: UserItemGetModel | null): void {
    this.markAsTouched();
    if (!this.disabled) {
      this.selectedUser = $event;
      this.onChange(this.selectedUser);
      this.userSelected.emit(this.selectedUser);
    }
  }

  writeValue(obj: UserItemGetModel | null): void {
    this.selectedUser = obj;
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
