import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IncidentGetModel } from '../models/incident-get.model';
import {PageModel} from "../../../shared/models/pageable/page.model";

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  constructor(private readonly httpClient: HttpClient) {}

  postIncident(formData: FormData): Observable<IncidentGetModel> {
    return this.httpClient.post<IncidentGetModel>(
      environment.apiBaseUrl.concat(environment.incidentList),
      formData
    );
  }

  getIncidentsByPage(page: number, size: number, sort: string, sortDirection: string, search: string): Observable<PageModel<IncidentGetModel>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('size', size.toString());
    params = params.set('page', page.toString());
    params = params.set('sort', sort + ',' + sortDirection);

    return this.httpClient.get<PageModel<IncidentGetModel>>(
      environment.apiBaseUrl.concat(environment.incidentList),
      { params }
    );
  }
}
