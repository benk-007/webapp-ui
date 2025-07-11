import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IncidentImageGetModel } from '../models/incident-image-get.model';
import { PageModel } from '../../../shared/models/pageable/page.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentImageService {

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Récupère la liste des images d'un incident
   * @param incidentId ID de l'incident
   * @returns Observable contenant la page d'images
   */
  getImagesByIncidentId(incidentId: string): Observable<PageModel<IncidentImageGetModel>> {
    let params = new HttpParams();
    params = params.set('incidentId', incidentId);

    return this.httpClient.get<PageModel<IncidentImageGetModel>>(
      environment.apiBaseUrl.concat(environment.incidentImages),
      { params }
    );
  }

  /**
   * Récupère une image spécifique par son ID (pour téléchargement/visualisation)
   * @param imageId ID de l'image
   * @returns Observable contenant le blob de l'image
   */
  getImageById(imageId: string): Observable<Blob> {
    return this.httpClient.get(
      environment.apiBaseUrl.concat(environment.incidentImageById).replace(':imageId', imageId),
      { responseType: 'blob' }
    );
  }

  /**
   * Ajoute une nouvelle image à un incident
   * @param formData FormData contenant l'incidentId et le fichier
   * @returns Observable contenant l'image créée
   */
  postImage(formData: FormData): Observable<IncidentImageGetModel> {
    return this.httpClient.post<IncidentImageGetModel>(
      environment.apiBaseUrl.concat(environment.incidentImages),
      formData
    );
  }

  /**
   * Supprime une image par son ID
   * @param imageId ID de l'image à supprimer
   * @returns Observable void
   */
  deleteById(imageId: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.incidentImageById).replace(':imageId', imageId)
    );
  }
}
