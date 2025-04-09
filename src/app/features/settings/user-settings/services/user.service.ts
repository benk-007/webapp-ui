import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {PageModel} from "../../../../shared/models/pageable/page.model";
import {UserListItemGetModel} from "../models/user-list-item-get.model";
import {HttpClient} from "@angular/common/http";
import {UserPostModel} from "../models/user-post.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private readonly httpClient: HttpClient) {
  }

  getUsersByPage(): Observable<PageModel<UserListItemGetModel>> {
    return this.httpClient.get<PageModel<UserListItemGetModel>>('http://localhost:8080/authMgtApi/users')
  }

  postUser(payload: UserPostModel) {
    return this.httpClient.post<UserListItemGetModel>('http://localhost:8080/authMgtApi/users', payload);
  }
}
