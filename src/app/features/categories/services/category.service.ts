import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryItemGetModel } from '../models/category-item-get.model';
import { CategoryPostModel } from '../models/category-post.model';
import { CategoryPatchModel } from '../models/category-patch.model';
import { PageModel } from '../../../shared/models/pageable/page.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Récupère la liste paginée des catégories
   * @param page - Numéro de page (commence à 0)
   * @param size - Nombre d'éléments par page
   * @param sort - Champ de tri
   * @param sortDirection - Direction du tri (asc/desc)
   * @param search - Terme de recherche optionnel
   * @returns Observable contenant la page de catégories
   */
  getCategoriesByPage(
    page: number,
    size: number,
    sort: string,
    sortDirection: string,
    search: string
  ): Observable<PageModel<CategoryItemGetModel>> {
    let params = new HttpParams();

    // Ajouter la recherche si elle existe
    if (search) {
      params = params.set('search', search);
    }

    // Paramètres de pagination obligatoires
    params = params.set('size', size.toString());
    params = params.set('page', page.toString());
    params = params.set('sort', sort + ',' + sortDirection);

    return this.httpClient.get<PageModel<CategoryItemGetModel>>(
      environment.apiBaseUrl.concat(environment.incidentCategories),
      { params }
    );
  }

  /**
   * Crée une nouvelle catégorie
   * @param payload - Données de la catégorie à créer
   * @returns Observable contenant la catégorie créée
   */
  postCategory(payload: CategoryPostModel): Observable<CategoryItemGetModel> {
    return this.httpClient.post<CategoryItemGetModel>(
      environment.apiBaseUrl.concat(environment.incidentCategories),
      payload
    );
  }

  /**
   * Met à jour une catégorie existante
   * @param categoryId - ID de la catégorie à modifier
   * @param payload - Données de mise à jour
   * @returns Observable contenant la catégorie mise à jour
   */
  patchCategoryById(categoryId: string, payload: CategoryPatchModel): Observable<CategoryItemGetModel> {
    return this.httpClient.patch<CategoryItemGetModel>(
      environment.apiBaseUrl.concat(environment.incidentCategories) + '/' + categoryId,
      payload
    );
  }
  /**
   * Supprime une catégorie par son ID
   * @param categoryId - ID de la catégorie à supprimer
   * @returns Observable void
   */
  deleteCategoryById(categoryId: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.incidentCategories) + '/' + categoryId
    );
  }
}
