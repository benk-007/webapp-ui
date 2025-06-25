import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { TablePostModel } from "../models/table-post.model";
import {environment} from "../../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(private readonly httpClient: HttpClient) {}

  postTable(payload: TablePostModel): Observable<void> {
    return this.httpClient.post<void>(
      environment.apiBaseUrl.concat(environment.tableList),
      payload
    );
  }
}
