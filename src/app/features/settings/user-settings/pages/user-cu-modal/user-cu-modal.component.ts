import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {
  ButtonDirective,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {UserItemGetModel} from "../../models/user-item-get.model";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {emailValidator} from "../../../../../shared/validators/email.validator";
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from "ngx-intl-tel-input";
import {NgLabelTemplateDirective, NgSelectComponent} from "@ng-select/ng-select";
import {RoleEnum} from "../../models/role.enum";
import {UserPostModel} from "../../models/user-post.model";
import {UserService} from "../../services/user.service";
import {BsModalRef} from "ngx-bootstrap/modal";
import {ToastrService} from "ngx-toastr";
import {UserPatchModel} from "../../models/user-patch.model";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'app-user-cu-modal',
  imports: [
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    ReactiveFormsModule,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    TranslatePipe,
    NgxIntlTelInputModule,
    NgSelectComponent,
    NgLabelTemplateDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective
  ],
  templateUrl: './user-cu-modal.component.html',
  styleUrl: './user-cu-modal.component.scss'
})
export class UserCuModalComponent implements OnInit, OnDestroy {
  userToEdit!: UserItemGetModel | undefined;
  userForm: FormGroup;
  uniqueEmailError: boolean = false;
  roles = [RoleEnum.ADMINISTRATOR, RoleEnum.ACCOUNTING, RoleEnum.HOUSE_STAFF, RoleEnum.PROPERTY_MANAGER, RoleEnum.PROPERTY_OWNER]
  @Output() actionConfirmed = new EventEmitter<string>();
  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;
  private readonly subscriptions: Subscription[] = [];

  public constructor(private readonly fb: FormBuilder, private readonly userService: UserService,
                     private readonly modalRef: BsModalRef, private readonly translateService: TranslateService,
                     private readonly toastrService: ToastrService) {
    this.userForm = this.fb.group({
      fullName: [null, [Validators.required]],
      email: [null, [Validators.required, emailValidator()]],
      mobile: [null],
      roles: [null, [Validators.required]],
      enabled: [null]
    });

  }

  ngOnInit(): void {
    if (this.userToEdit) {
      this.userForm.patchValue(this.userToEdit);
      this.userForm.patchValue({roles: this.userToEdit.roles[0]});
    }
  }

  submit() {
    if (!this.userToEdit) {
      console.log('User creation mode ...')
      let payload: UserPostModel = {
        fullName: this.userForm.value.fullName,
        email: this.userForm.value.email,
        mobile: this.userForm.value.mobile?.e164Number,
        roles: [this.userForm.value.roles]
      }
      this.subscriptions.push(this.userService.postUser(payload).subscribe({
        next: (res) => {
          console.log('User creation api response is:', res);
          this.actionConfirmed.emit();
          this.closeModal();
          let message = this.translateService.instant('settings.user-settings.create-user.form.notifications.success.message');
          message = message.replace(':name', res.fullName);
          let title = this.translateService.instant('settings.user-settings.create-user.form.notifications.success.title');
          this.toastrService.success(message, title);

          this.toastrService.success(message, title);
        },
        error: (err) => {
          console.log('An error occurred when creating the user:', err);

          if (
            err?.error?.errors?.email &&
            Array.isArray(err.error.errors.email)
          ) {
            console.log(err.error.errors.email);
            const uniqueEmailError = err.error.errors.email.find(
              (err: { code: string }) => err.code === "UniqueEmail"
            );
            this.uniqueEmailError = uniqueEmailError != undefined;
          } else {
            this.toastrService.error(this.translateService.instant('settings.user-settings.create-user.form.notifications.error.message'),
              this.translateService.instant('settings.user-settings.create-user.form.notifications.error.title'));
          }
        }
      }))
    } else {
      console.log('User edition mode for user ...');
      let payload: UserPatchModel = {
        fullName: this.userForm.value.fullName,
        email: this.userForm.value.email,
        mobile: this.userForm.value.mobile?.e164Number,
        roles: [this.userForm.value.roles],
        enabled: this.userForm.value.enabled
      }

      this.subscriptions.push(this.userService.patchUserById(payload, this.userToEdit.id).subscribe({
        next: (res) => {
          console.log('User update api response is:', res);
          this.actionConfirmed.emit();
          this.closeModal();
          let message = this.translateService.instant('settings.user-settings.edit-user.form.notifications.success.message');
          message = message.replace(':name', res.fullName);
          let title = this.translateService.instant('settings.user-settings.edit-user.form.notifications.success.title');
          this.toastrService.success(message, title);
        },
        error: (err) => {
          console.log('An error occurred when updating the user:', err);

          if (
            err?.error?.errors?.email &&
            Array.isArray(err.error.errors.email)
          ) {
            console.log(err.error.errors.email);
            const uniqueEmailError = err.error.errors.email.find(
              (err: { code: string }) => err.code === "UniqueEmail"
            );
            this.uniqueEmailError = uniqueEmailError != undefined;
          } else {
            this.toastrService.error(this.translateService.instant('settings.user-settings.edit-user.form.notifications.error.message'),
              this.translateService.instant('settings.edit-user.form.notifications.error.title'));
          }
        }
      }))
    }
  }

  closeModal() {
    this.modalRef.hide();
    this.userForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

}
