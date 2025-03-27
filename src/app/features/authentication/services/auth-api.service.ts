import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserCredentialsPostModel} from "../models/user-credentials-post.model";
import {TokenGetModel} from "../models/token-get.model";
import {ForgotPasswordPostModel} from "../models/forgot-password-post.model";

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  constructor(private httpClient: HttpClient) {
  }

  login(payload: UserCredentialsPostModel) {
    return this.httpClient.post<TokenGetModel>('http://localhost:8080/authMgtApi/login', payload);
  }

  forgotPassword(payload: ForgotPasswordPostModel) {
    return this.httpClient.post<void>('http://localhost:8080/authMgtApi/forgot-password', payload);
  }
}
