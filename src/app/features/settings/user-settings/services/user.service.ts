import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {PageModel} from "../../../../shared/models/pageable/page.model";
import {UserItemGetModel} from "../models/user-item-get.model";
import {HttpClient, HttpParams} from "@angular/common/http";
import {UserPostModel} from "../models/user-post.model";
import {UserPatchModel} from "../models/user-patch.model";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private readonly httpClient: HttpClient) {
  }

  getUsersByPage(page: number, size: number, sort: string, sortDirection: string, search: string): Observable<PageModel<UserItemGetModel>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('size', size.toString());
    params = params.set('page', page.toString());

    return this.httpClient.get<PageModel<UserItemGetModel>>(environment.apiBaseUrl.concat(environment.userList), {params})
  }

  postUser(payload: UserPostModel) {
    return this.httpClient.post<UserItemGetModel>(environment.apiBaseUrl.concat(environment.userList), payload);
  }

  patchUserById(payload: UserPatchModel, userId: string) {
    return this.httpClient.patch<UserItemGetModel>(environment.apiBaseUrl.concat(environment.userById).replace(':userId', userId), payload);
  }
}
