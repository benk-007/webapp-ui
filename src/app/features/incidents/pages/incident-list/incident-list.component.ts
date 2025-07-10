import { Component } from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  RowComponent
} from "@coreui/angular";
import { TranslatePipe } from "@ngx-translate/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { PageTitleComponent } from "../../../../shared/components/page-title/page-title.component";
import { IncidentCreateModalComponent } from "../incident-create-modal/incident-create-modal.component";

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    TranslatePipe,
    PageTitleComponent
  ],
  templateUrl: './incident-list.component.html',
  styleUrl: './incident-list.component.scss',
  providers: [BsModalService]
})
export class IncidentListComponent {

  constructor(private readonly modalService: BsModalService) {}

  openCreateIncidentModal() {
    const modalRef = this.modalService.show(IncidentCreateModalComponent, {
      class: 'modal-lg'
    });

    // Optionnel : écouter la confirmation pour rafraîchir la liste plus tard
    modalRef.content?.actionConfirmed.subscribe(() => {
      console.log('Incident créé avec succès !');
      // Ici vous pourrez rafraîchir la liste des incidents
    });
  }
}
