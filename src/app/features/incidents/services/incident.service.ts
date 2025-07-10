import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IncidentGetModel } from '../models/incident-get.model';

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

  getIncidentById(incidentId: string): Observable<IncidentGetModel> {
    return this.httpClient.get<IncidentGetModel>(
      environment.apiBaseUrl.concat(environment.incidentById).replace(':incidentId', incidentId)
    );
  }
}
