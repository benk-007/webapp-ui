import {Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import { Subscription } from 'rxjs';
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from '@ng-select/ng-select';
import { CategoryService } from '../../../features/incidents/services/category.service';
import { CategoryModel } from '../../../features/incidents/models/category.model';
import {PageFilterModel} from "../../models/page-filter.model";

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
  selectedCategories: string[] = [];

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    const pageFilter: PageFilterModel = {
      page: 0,
      size: 1000,
      sort: 'name',
      sortDirection: 'asc',
      search: ''
    };

    this.subscriptions.push(
      this.categoryService.getCategoriesByPage(pageFilter).subscribe({
        next: (response) => {
          this.categoriesList = response.content;
        },
        error: (err) => console.error('Failed to retrieve categories:', err)
      })
    );
  }

  valueChanged(selectedCategoryIds: string[]): void {
    this.markAsTouched();
    if (!this.disabled) {
      this.selectedCategories = selectedCategoryIds || [];

      // Transformer les IDs en objets CategoryModel complets
      const selectedObjects = this.categoriesList.filter(cat =>
        this.selectedCategories.includes(cat.id)
      );
      this.onChange(selectedObjects);
      this.categoriesSelected.emit(selectedObjects);
    }
  }

  writeValue(obj: string[]): void { // Reçoit des IDs
    this.selectedCategories = obj || [];
  }

  getCategoryById(id: string): CategoryModel | undefined {
    return this.categoriesList.find(cat => cat.id === id);
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
