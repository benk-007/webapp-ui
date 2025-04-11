import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {PageModel} from "../../../../shared/models/pageable/page.model";
import {UserItemGetModel} from "../models/user-item-get.model";
import {HttpClient} from "@angular/common/http";
import {UserPostModel} from "../models/user-post.model";
import {UserPatchModel} from "../models/user-patch.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private readonly httpClient: HttpClient) {
  }

  getUsersByPage(): Observable<PageModel<UserItemGetModel>> {
    return this.httpClient.get<PageModel<UserItemGetModel>>('http://localhost:8080/authMgtApi/users')
  }

  postUser(payload: UserPostModel) {
    return this.httpClient.post<UserItemGetModel>('http://localhost:8080/authMgtApi/users', payload);
  }

  patchUserById(payload: UserPatchModel, userId: string){
    return this.httpClient.patch<UserItemGetModel>('http://localhost:8080/authMgtApi/users/'+userId, payload);
  }
}
