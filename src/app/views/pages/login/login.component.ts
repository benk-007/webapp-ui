import {Component} from '@angular/core';
import {JsonPipe, NgStyle} from '@angular/common';
import {IconDirective} from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  TextColorDirective
} from '@coreui/angular';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthApiService} from "../../../features/authentication/services/auth-api.service";
import {Subscription} from "rxjs";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, ReactiveFormsModule, JsonPipe, RouterLink]
})
export class LoginComponent {

  loginForm: FormGroup;

  private subscriptions: Subscription[]=[];

  constructor(private fb: FormBuilder, private authApiService: AuthApiService) {
    this.loginForm = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    })
  }

  submit(){
    console.log('clicked')
    let payload = this.loginForm.value;
    this.subscriptions.push(this.authApiService.login(payload).subscribe({
      next: result=>{
        console.log('API response is:', result);
      },
      error: err => {
        console.error('An error occurred when login api:', err);
      }
    }))
  }

}
