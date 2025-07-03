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
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


import { SubUnitCreateModalComponent } from './sub-unit-create-modal/sub-unit-create-modal.component';
import { ExistingUnitModalComponent } from './existing-unit-modal/existing-unit-modal.component';
import {BsModalService} from "ngx-bootstrap/modal";

@Component({
  selector: 'app-sub-units',
  standalone: true,
  imports: [
    CommonModule, TranslatePipe, ButtonDirective, ColComponent, RowComponent,
    TableDirective, AvatarComponent, SpinnerComponent, IconDirective,
    EmptyDataComponent, PageTitleComponent
  ],
  providers: [BsModalService],
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
    private unitApiService: UnitApiService,
    // Ajouter ces services :
    private modalService: BsModalService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.multiUnitId = this.route.parent?.snapshot.params['unitId'];
    this.loadSubUnits();
  }

  private loadSubUnits(): void {
    this.subscriptions.push(
      // Appel API : GET /units/{unitId}/sub-units
      this.unitApiService.getSubUnits(this.multiUnitId).subscribe({
        next: (response) => {
          this.subUnits = response.content || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading subUnits:', err);
          this.isLoading = false;
          this.toastrService.error('Failed to load SubUnits', 'Error');
        }
      })
    );
  }

  onAddNewSubUnit(): void {
    const initialState = {
      multiUnitId: this.multiUnitId
    };

    const modalRef = this.modalService.show(SubUnitCreateModalComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.subscriptions.push(
      (modalRef.content as SubUnitCreateModalComponent).subUnitCreated.subscribe(() => {
        this.loadSubUnits(); // Recharger la liste
      })
    );
  }

  onAddExistingUnit(): void {
    const initialState = {
      multiUnitId: this.multiUnitId
    };

    const modalRef = this.modalService.show(ExistingUnitModalComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.subscriptions.push(
      (modalRef.content as ExistingUnitModalComponent).unitAssigned.subscribe(() => {
        this.loadSubUnits(); // Recharger la liste
      })
    );
  }

  onEditSubUnit(subUnit: UnitItemGetModel): void {
    // Navigation vers l'édition de la subUnit
    window.open(`/units/${subUnit.id}`, '_blank');
  }

  onRemoveSubUnit(subUnit: UnitItemGetModel): void {
    const initialState = {
      title: 'Detach SubUnit',
      message: `Are you sure you want to detach "${subUnit.name}" from this multi-unit? The unit will become independent but won't be deleted.`
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, { initialState });

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.detachSubUnit(subUnit);
      })
    );
  }

  private detachSubUnit(subUnit: UnitItemGetModel): void {
    this.subscriptions.push(
      this.unitApiService.detachSubUnit(subUnit.id).subscribe({
        next: () => {
          // Retirer la subUnit de la liste locale
          this.subUnits = this.subUnits.filter(su => su.id !== subUnit.id);

          this.toastrService.success(
            `SubUnit "${subUnit.name}" has been successfully detached.`,
            'SubUnit Detached'
          );
        },
        error: (err) => {
          console.error('Error detaching subUnit:', err);
          this.toastrService.error(
            `Failed to detach "${subUnit.name}". Please try again.`,
            'Detachment Failed'
          );
        }
      })
    );
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
