import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {ButtonDirective, ColComponent, FormDirective, RowComponent} from "@coreui/angular";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import {UnitListComponent} from "../unit-list/unit-list.component";
import {UnitSelectComponent} from "../../../../shared/components/unit-select/unit-select.component";

@Component({
  selector: 'app-multi-unit-create-modal',
  imports: [
    TranslatePipe,
    ButtonDirective,
    ColComponent,
    RowComponent,
    FormDirective,
    ReactiveFormsModule,
    UnitListComponent,
    UnitSelectComponent
  ],
  templateUrl: './multi-unit-create-modal.component.html',
  styleUrl: './multi-unit-create-modal.component.scss'
})
export class MultiUnitCreateModalComponent implements OnDestroy {

  multiUnitForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<string>();
  private readonly subscriptions: Subscription[] = [];

  public constructor(private readonly fb: FormBuilder) {
    this.multiUnitForm = this.fb.group({})
  }

  submit() {

  }

  closeModal() {

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
