import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserCredentialsPostModel} from "../models/user-credentials-post.model";
import {TokenGetModel} from "../models/token-get.model";

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  constructor(private httpClient: HttpClient) {
  }

  login(payload: UserCredentialsPostModel) {
    return this.httpClient.post<TokenGetModel>('http://localhost:8080/authMgtApi/login', payload);
  }
}
