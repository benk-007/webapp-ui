import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CategoryModel } from '../models/category.model';
import { PageFilterModel } from '../../../shared/models/page-filter.model';
import {PageModel} from "../../../shared/models/pageable/page.model";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private readonly httpClient: HttpClient) {}

  getCategoriesByPage(pageFilter: PageFilterModel): Observable<PageModel<CategoryModel>> {
    let params = new HttpParams()
      .set('page', pageFilter.page.toString())
      .set('size', pageFilter.size.toString())
      .set('sort', pageFilter.sort + ',' + pageFilter.sortDirection);

    if (pageFilter.search) {
      params = params.set('search', pageFilter.search);
    }

    return this.httpClient.get<PageModel<CategoryModel>>(
      environment.apiBaseUrl.concat(environment.incidentCategories),
      { params }
    );
  }

  // Méthode pour récupérer toutes les catégories (pour le dropdown)
  getAllCategories(): Observable<CategoryModel[]> {
    const params = new HttpParams().set('size', '1000'); // Taille large pour récupérer toutes

    return this.httpClient.get<PageModel<CategoryModel>>(
      environment.apiBaseUrl.concat(environment.incidentCategories),
      { params }
    ).pipe(
      map((response: PageModel<CategoryModel>) => response.content)
    );
  }
}
