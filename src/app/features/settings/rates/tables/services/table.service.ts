import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import { TablePostModel } from "../models/table-post.model";
import {environment} from "../../../../../../environments/environment";
import {PageModel} from "../../../../../shared/models/pageable/page.model";
import {TableItemGetModel} from "../models/table-get.model";

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(private readonly httpClient: HttpClient) {}

  postTable(payload: TablePostModel, unitId?: string): Observable<void> {
    let params = new HttpParams();
    if (unitId) {
      params = params.set('unitId', unitId);
    }

    return this.httpClient.post<void>(
        environment.apiBaseUrl.concat(environment.rateList),
        payload,
        { params }
    );
  }


  getTablesByPage(page: number, size: number, sort: string, sortDirection: string, search: string, unitId: string): Observable<PageModel<TableItemGetModel>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    params = params.set('size', size.toString());
    params = params.set('page', page.toString());

    return this.httpClient.get<PageModel<TableItemGetModel>>(environment.apiBaseUrl.concat(environment.rateList), { params });
  }

  patchTableById(payload: TablePostModel, rateId: string): Observable<TableItemGetModel> {
    return this.httpClient.patch<TableItemGetModel>(
      environment.apiBaseUrl.concat(environment.rateById).replace(':rateId', rateId),
      payload
    );
  }

  deleteTableById(id: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.rateById).replace(':rateId', id)
    );
  }
}
