import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentItemGetModel } from '../models/document-item-get.model';
import { environment } from '../../../../environments/environment';
import {PageModel} from "../../../shared/models/pageable/page.model";


@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private readonly httpClient: HttpClient) {}

  getDocumentsByGuestId(guestId: string, page: number, size: number): Observable<PageModel<DocumentItemGetModel>> {
    const params = new HttpParams()
      .set('guestId', guestId)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.httpClient.get<PageModel<DocumentItemGetModel>>(
      environment.apiBaseUrl.concat(environment.idDocuments), { params }
    );
  }

  deleteDocumentById(documentId: string, guestId: string): Observable<void> {
    const params = new HttpParams().set('guestId', guestId);
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.idDocuments + `/${documentId}`),
      { params }
    );
  }

  getDocumentById(documentId: string, guestId: string): Observable<DocumentItemGetModel> {
    const params = new HttpParams().set('guestId', guestId);
    return this.httpClient.get<DocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.idDocuments + `/${documentId}`),
      { params }
    );
  }

  patchDocumentById(documentId: string, guestId: string, payload: Partial<DocumentItemGetModel>): Observable<DocumentItemGetModel> {
    const params = new HttpParams().set('guestId', guestId);
    return this.httpClient.patch<DocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.idDocuments + `/${documentId}`),
      payload,
      { params }
    );
  }

  createDocument(guestId: string, documentData: any): Observable<DocumentItemGetModel> {
    return this.httpClient.post<DocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.idDocuments).concat(`?guestId=${guestId}`),
      documentData
    );
  }

}
