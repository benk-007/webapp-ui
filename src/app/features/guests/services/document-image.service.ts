import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentImageGetModel } from '../models/document-image-get.model';
import { PageModel } from '../../../shared/models/pageable/page.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentImageService {

  constructor(private readonly httpClient: HttpClient) {}

  getImagesByDocumentId(idDocumentId: string): Observable<PageModel<DocumentImageGetModel>> {
    const params = new HttpParams().set('idDocumentId', idDocumentId);
    return this.httpClient.get<PageModel<DocumentImageGetModel>>(
      environment.apiBaseUrl.concat(environment.idDocumentImages), { params }
    );
  }

  getImageById(imageId: string): Observable<Blob> {
    return this.httpClient.get(
      environment.apiBaseUrl.concat(environment.idDocumentImageById).replace(':imageId', imageId),
      { responseType: 'blob' }
    );
  }

  postImage(idDocumentId: string, formData: FormData): Observable<DocumentImageGetModel> {
    return this.httpClient.post<DocumentImageGetModel>(
      `${environment.apiBaseUrl}${environment.idDocumentImages}?idDocumentId=${idDocumentId}`,
      formData
    );
  }

  deleteById(imageId: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.idDocumentImageById).replace(':imageId', imageId)
    );
  }
}
