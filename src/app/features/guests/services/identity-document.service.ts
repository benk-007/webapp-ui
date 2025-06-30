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

  getIdentityDocumentById(identityDocumentId: string): Observable<IdentityDocumentItemGetModel> {
    return this.httpClient.get<IdentityDocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.identityDocumentById.replace(':identityDocumentId', identityDocumentId)));
  }

  getIdentityDocumentImageById(identityDocumentId: string): Observable<Blob> {
    let params = new HttpParams();
    return this.httpClient.get(environment.apiBaseUrl.concat(environment.identityDocumentImageById.replace(':identityDocumentId', identityDocumentId)), {
      params: params,
      responseType: "blob"
    });
  }

  createDocument(payload: FormData): Observable<IdentityDocumentItemGetModel> {
    return this.httpClient.post<IdentityDocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.identityDocuments), payload);
  }

  updateDocument(identityDocumentId: string, formData: FormData) {
    return this.httpClient.patch<IdentityDocumentItemGetModel>(environment.apiBaseUrl.concat(environment.identityDocumentById.replace(':identityDocumentId', identityDocumentId)), formData)
  }

  deleteDocumentById(identityDocumentId: string): Observable<void> {
    return this.httpClient.delete<void>(environment.apiBaseUrl.concat(environment.identityDocumentById.replace(':identityDocumentId', identityDocumentId)));
  }


}
