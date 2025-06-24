import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {PageModel} from "../../../shared/models/pageable/page.model";
import {environment} from "../../../../environments/environment";
import {Observable, of} from "rxjs";
import {RatesModel} from "../models/rates.model";


@Injectable({
  providedIn: 'root'
})
export class RateApiService {

  constructor(private httpClient: HttpClient) {
  }

  getUnitRatesById(unitId: string) {
    return this.httpClient.get<RatesModel>(
      environment.apiBaseUrl.concat(environment.unitBaseRateById).replace(':unitId', unitId)
    );
  }

  /*getUnitRatesById(unitId: string): Observable<RatesModel> {
    const mockResponse: RatesModel = {
      rentalBaseRate: {
        nightly: 100,
        weekendNight: 120,
        weekly: 600,
        monthly: 2000,
        minStay: 2,
        maxStay: 14
      },
      additionalGuestFee: {
        feePPPN: 15,
        guestCount: 4
      }
    };
    return of(mockResponse);
  }*/


  patchUnitRatesById(unitId: string, payload: RatesModel) {
    return this.httpClient.patch<RatesModel>(
      environment.apiBaseUrl.concat(environment.unitBaseRateById).replace(':unitId', unitId),
      payload
    );
  }
}
