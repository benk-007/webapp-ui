import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IdentityDocumentItemGetModel} from '../models/identity-document-item-get.model';
import {environment} from '../../../../environments/environment';
import {PageModel} from "../../../shared/models/pageable/page.model";


@Injectable({
  providedIn: 'root'
})
export class IdentityDocumentService {
  constructor(private readonly httpClient: HttpClient) {
  }

  getIdentityDocuments(guestId: string, page: number, size: number): Observable<PageModel<IdentityDocumentItemGetModel>> {
    const params = new HttpParams()
      .set('guestId', guestId)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.httpClient.get<PageModel<IdentityDocumentItemGetModel>>(
      environment.apiBaseUrl.concat(environment.identityDocuments), {params}
    );
  }

  deleteDocumentById(documentId: string, guestId: string): Observable<void> {
    const params = new HttpParams().set('guestId', guestId);
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.identityDocuments + `/${documentId}`),
      {params}
    );
  }

  getDocumentById(documentId: string, guestId: string): Observable<IdentityDocumentItemGetModel> {
    const params = new HttpParams().set('guestId', guestId);
    return this.httpClient.get<IdentityDocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.identityDocuments + `/${documentId}`),
      {params}
    );
  }

  patchDocumentById(documentId: string, guestId: string, payload: Partial<IdentityDocumentItemGetModel>): Observable<IdentityDocumentItemGetModel> {
    const params = new HttpParams().set('guestId', guestId);
    return this.httpClient.patch<IdentityDocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.identityDocuments + `/${documentId}`),
      payload,
      {params}
    );
  }

  createDocument(guestId: string, documentData: any): Observable<IdentityDocumentItemGetModel> {
    return this.httpClient.post<IdentityDocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.identityDocuments).concat(`?guestId=${guestId}`),
      documentData
    );
  }

}
