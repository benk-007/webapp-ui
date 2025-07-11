import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent,
} from '@coreui/angular';
import { CommonModule } from '@angular/common';

import { CategoryService } from '../../services/category.service';
import { CategoryPostModel } from '../../models/category-post.model';

@Component({
  selector: 'app-category-create-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    TranslatePipe,
    CommonModule
  ],
  templateUrl: './category-create-modal.component.html',
  styleUrl: './category-create-modal.component.scss'
})
export class CategoryCreateModalComponent implements OnInit, OnDestroy {

  categoryForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<void>();

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      name: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Aucune initialisation spéciale nécessaire pour la création
  }

  /**
   * Soumission du formulaire de création
   * Valide le formulaire et envoie les données au service
   */
  submit(): void {
    if (!this.categoryForm.valid) {
      this.markFormGroupTouched();
      this.toastrService.error('Please fill in all required fields.');
      return;
    }

    const formValue = this.categoryForm.value;
    const payload: CategoryPostModel = {
      name: formValue.name.trim()
    };

    console.log('Category payload:', payload);

    this.subscriptions.push(
      this.categoryService.postCategory(payload).subscribe({
        next: (response) => {
          this.actionConfirmed.emit();
          this.closeModal();
          const msg = this.translateService.instant('categories.create.form.notifications.success.message', { name: response.name });
          const title = this.translateService.instant('categories.create.form.notifications.success.title');
          this.toastrService.success(msg, title);
        },
        error: (err) => {
          console.error('Error while creating category:', err);
          const msg = this.translateService.instant('categories.create.form.notifications.error.message');
          const title = this.translateService.instant('categories.create.form.notifications.error.title');
          this.toastrService.error(msg, title);
        }
      })
    );
  }

  /**
   * Marque tous les champs du formulaire comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Ferme la modal et remet à zéro le formulaire
   */
  closeModal(): void {
    this.modalRef.hide();
    this.categoryForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
