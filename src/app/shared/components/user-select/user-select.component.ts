import {Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent
} from '@ng-select/ng-select';

import { UserService } from '../../../features/settings/user-settings/services/user.service';
import { UserItemGetModel } from '../../../features/settings/user-settings/models/user-item-get.model';
import {UserRefModel} from "../../../features/incidents/models/user-ref.model";

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
  @Output() userSelected = new EventEmitter<UserRefModel | null>();

  usersList: UserItemGetModel[] = [];
  selectedUser: UserItemGetModel | null = null;
  private pendingValue: UserRefModel | null = null;

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.subscriptions.push(
      this.userService.getUsersByPage(0, 1000, 'fullName', 'asc', '').subscribe({
        next: (res) => {
          this.usersList = res.content;
          // Appliquer la valeur en attente si elle existe
          if (this.pendingValue) {
            this.applyPendingValue();
          }
        },
        error: (err) => console.error('Failed to retrieve users:', err)
      })
    );
  }

  private applyPendingValue(): void {
    if (this.pendingValue && this.usersList.length > 0) {
      this.selectedUser = this.usersList.find(user => user.id === this.pendingValue!.id) || null;
      this.pendingValue = null; // Nettoyer la valeur en attente
    }
  }

  valueChanged(selectedUserItem: UserItemGetModel | null): void {
    this.markAsTouched();
    if (!this.disabled) {
      this.selectedUser = selectedUserItem;

      let userRefToEmit: UserRefModel | null = null;
      if (selectedUserItem) {
        // Transforme en UserRefModel pour l'émission
        userRefToEmit = {
          id: selectedUserItem.id,
          name: selectedUserItem.fullName
        };
      }

      this.onChange(userRefToEmit); // Émet UserRefModel
      this.userSelected.emit(userRefToEmit);
    }
  }

  writeValue(obj: UserRefModel | null): void {
    if (obj) {
      if (this.usersList.length > 0) {
        // Si la liste est déjà chargée, appliquer directement
        this.selectedUser = this.usersList.find(user => user.id === obj.id) || null;
      } else {
        // Sinon, stocker pour application ultérieure
        this.pendingValue = obj;
      }
    } else {
      this.selectedUser = null;
      this.pendingValue = null;
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
