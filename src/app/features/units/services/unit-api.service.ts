import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UnitPostModel} from "../models/unit-post.model";
import {UnitItemGetModel} from "../models/unit-item-get.model";
import {PageModel} from "../../../shared/models/pageable/page.model";
import {UnitGetModel} from "../models/unit-get.model";

@Injectable({
  providedIn: 'root'
})
export class UnitApiService {

  constructor(private httpClient: HttpClient) {
  }

  postUnit(payload: UnitPostModel) {
    return this.httpClient.post<UnitItemGetModel>('http://localhost:8080/unitMgtApi/units', payload);
  }

  getUnitsByPage() {
    return this.httpClient.get<PageModel<UnitItemGetModel>>('http://localhost:8080/unitMgtApi/units');
  }

  getUnitById(unitId: string) {
    return this.httpClient.get<UnitGetModel>('http://localhost:8080/unitMgtApi/units/:unitId'.replace(':unitId', unitId));
  }

}
