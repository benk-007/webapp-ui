import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryModel } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private readonly httpClient: HttpClient) {}

  getCategories(): Observable<CategoryModel[]> {
    return this.httpClient.get<CategoryModel[]>(
      environment.apiBaseUrl.concat(environment.incidentCategories)
    );
  }
}
