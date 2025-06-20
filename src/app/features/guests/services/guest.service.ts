import {Injectable} from '@angular/core';

import {HttpClient, HttpParams} from "@angular/common/http";
import {PageModel} from "../../../shared/models/pageable/page.model";
import {GuestItemGetModel} from "../models/guest-item-get.model";
import {environment} from "../../../../environments/environment";
import {Observable, of} from "rxjs";
import {GuestItemPostModel} from "../models/guest-post.model";
import {GuestItemPatchModel} from "../models/guest-patch.model";


@Injectable({
  providedIn: 'root'
})
export class GuestService {

  constructor(private readonly httpClient: HttpClient) {}

  getGuestsByPage(page: number, size: number, sort: string, sortDirection: string, search: string): Observable<PageModel<GuestItemGetModel>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('size', size.toString());
    params = params.set('page', page.toString());

    return this.httpClient.get<PageModel<GuestItemGetModel>>(environment.apiBaseUrl.concat(environment.guestList), { params });
  }

  /*getGuestsByPage(page: number, size: number, sort: string, sortDirection: string, search: string) {
    const mockData: PageModel<GuestItemGetModel> = {
      content: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          contact: {
            email: 'john.doe@example.com',
            mobile: '+212600000000'
          },
          address: {
            country: 'MA',
            city: 'Casablanca',
            postCode: '10282',
            street1: 'Rue des moineaux',
            street2: '27'
          },
          audit: {
            createdAt: new Date('2024-06-01T10:00:00Z'),
            createdBy: 'Admin',
            modifiedAt: new Date('2024-06-01T10:00:00Z'),
            modifiedBy: 'Admin'
          },
          idDocuments: []
        }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      pageable: {
        sort: {
          sorted: false,
          unsorted: true,
          empty: true
        },
        offset: 0,
        pageNumber: 0,
        pageSize: 10,
        paged: true,
        unpaged: false
      },
      last: true,
      first: true,
      numberOfElements: 1,
      sort: {
        sorted: false,
        unsorted: true,
        empty: true
      },
      empty: false
    };
    return of(mockData); // simulates HTTP call
  }*/

  getGuestById(guestId: string): Observable<GuestItemGetModel> {
    return this.httpClient.get<GuestItemGetModel>(
      environment.apiBaseUrl.concat(environment.guestById).replace(':guestId', guestId)
    );
  }

  postGuest(formData: FormData) {
    return this.httpClient.post(environment.apiBaseUrl.concat(environment.guestList), formData);
  }

  patchGuestById(payload: GuestItemPatchModel, guestId: string): Observable<GuestItemGetModel> {
    return this.httpClient.patch<GuestItemGetModel>(
      environment.apiBaseUrl.concat(environment.guestById).replace(':guestId', guestId),
      payload
    );
  }

  deleteGuestById(id: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.guestById).replace(':guestId', id)
    );
  }


}
