import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UnitApiService } from '../../../services/unit-api.service';
import { UnitItemGetModel } from '../../../models/unit-item-get.model';
import {
  ButtonDirective, ColComponent, RowComponent, TableDirective,
  AvatarComponent, SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilPen, cilTrash, cilPlus } from '@coreui/icons';
import { EmptyDataComponent } from '../../../../../shared/components/empty-data/empty-data.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';

@Component({
  selector: 'app-sub-units',
  standalone: true,
  imports: [
    CommonModule, TranslatePipe, ButtonDirective, ColComponent, RowComponent,
    TableDirective, AvatarComponent, SpinnerComponent, IconDirective,
    EmptyDataComponent, PageTitleComponent
  ],
  templateUrl: './sub-units.component.html',
  styleUrl: './sub-units.component.scss'
})
export class SubUnitsComponent implements OnInit, OnDestroy {

  multiUnitId!: string;
  subUnits: UnitItemGetModel[] = [];
  isLoading: boolean = true;
  icons = { cilPen, cilTrash, cilPlus };

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private unitApiService: UnitApiService
  ) {}

  ngOnInit(): void {
    this.multiUnitId = this.route.parent?.snapshot.params['unitId'];
    this.loadSubUnits();
  }

  private loadSubUnits(): void {
    // TODO: Appel API pour récupérer les subUnits
    // Pour l'instant, simulation
    this.isLoading = false;
    this.subUnits = [];
  }

  onAddNewSubUnit(): void {
    // TODO: Ouvrir modal pour créer nouvelle subUnit
    console.log('Add new subUnit');
  }

  onAddExistingUnit(): void {
    // TODO: Ouvrir modal pour assigner unité existante
    console.log('Add existing unit');
  }

  onEditSubUnit(subUnit: UnitItemGetModel): void {
    // Navigation vers l'édition de la subUnit
    window.open(`/units/${subUnit.id}`, '_blank');
  }

  onRemoveSubUnit(subUnit: UnitItemGetModel): void {
    // TODO: Confirmer et détacher la subUnit
    console.log('Remove subUnit', subUnit.id);
  }

  getNameInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  trackBySubUnit(index: number, subUnit: UnitItemGetModel): string {
    return subUnit.id;
  }



  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
