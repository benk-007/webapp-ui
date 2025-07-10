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
import { CategoryService } from '../../../features/incidents/services/category.service';
import { CategoryModel } from '../../../features/incidents/models/category.model';

@Component({
  selector: 'app-category-select',
  standalone: true,
  imports: [
    NgSelectComponent,
    FormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective
  ],
  templateUrl: './category-select.component.html',
  styleUrl: './category-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CategorySelectComponent),
    }
  ]
})
export class CategorySelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() disable = false;
  @Output() categoriesSelected = new EventEmitter<CategoryModel[]>();

  categoriesList: CategoryModel[] = [];
  selectedCategories: CategoryModel[] = [];

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.subscriptions.push(
      this.categoryService.getCategories().subscribe({
        next: (categories) => {
          this.categoriesList = categories;
        },
        error: (err) => console.error('Failed to retrieve categories:', err)
      })
    );
  }

  valueChanged(selectedCategories: CategoryModel[]): void {
    this.markAsTouched();
    if (!this.disabled) {
      this.selectedCategories = selectedCategories || [];
      this.onChange(this.selectedCategories);
      this.categoriesSelected.emit(this.selectedCategories);
    }
  }

  writeValue(obj: CategoryModel[]): void {
    this.selectedCategories = obj || [];
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
