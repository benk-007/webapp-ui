import {Component} from '@angular/core';
import {
  ButtonDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  TableColorDirective,
  TableDirective
} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {TranslatePipe} from "@ngx-translate/core";
import {cilSearch} from "@coreui/icons";

@Component({
  selector: 'app-scheduler',
  imports: [
    TableDirective,
    TableColorDirective,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    TranslatePipe,
    ButtonDirective
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  icons = {cilSearch}

}
