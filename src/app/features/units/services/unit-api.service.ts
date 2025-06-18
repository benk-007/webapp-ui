import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UnitPostModel} from "../models/unit-post.model";
import {UnitItemGetModel} from "../models/unit-item-get.model";
import {PageModel} from "../../../shared/models/pageable/page.model";
import {UnitGetModel} from "../models/unit-get.model";
import {environment} from "../../../../environments/environment";
import {UnitInfosGetModel} from "../models/unit-infos-get.model";
import {UnitInfosPatchModel} from "../models/unit-infos-patch.model";
import {UnitInstructionsGetModel} from "../models/unit-instructions-get.model";
import {UnitInstructionsPatchModel} from "../models/unit-instructions-patch.model";
import {UnitDetailsGetModel} from "../models/details/unit-details-get.model";
import {UnitDetailsPatchModel} from "../models/details/unit-details-patch.model";
import {RoomGetModel} from "../models/rooms-bedding/room-get.model";
import {RoomPostModel} from "../models/rooms-bedding/room-post.model";
import {RoomPatchModel} from "../models/rooms-bedding/room-patch.model";


@Injectable({
  providedIn: 'root'
})
export class UnitApiService {

  constructor(private httpClient: HttpClient) {
  }

  postUnit(payload: UnitPostModel) {
    return this.httpClient.post<UnitItemGetModel>(environment.apiBaseUrl.concat(environment.unitList), payload);
  }

  updateUnitInfosById(unitId: string, payload: UnitInfosPatchModel) {
    return this.httpClient.patch<UnitInfosGetModel>(environment.apiBaseUrl.concat(environment.unitInfosById).replace(':unitId', unitId), payload);
  }

  getUnitsByPage() {
    return this.httpClient.get<PageModel<UnitItemGetModel>>(environment.apiBaseUrl.concat(environment.unitList));
  }

  getUnitById(unitId: string) {
    return this.httpClient.get<UnitGetModel>(environment.apiBaseUrl.concat(environment.unitById).replace(':unitId', unitId));
  }

  getUnitInfosById(unitId: string) {
    return this.httpClient.get<UnitInfosGetModel>(environment.apiBaseUrl.concat(environment.unitInfosById).replace(':unitId', unitId));
  }

  getUnitDetailsById(unitId: string) {
    return this.httpClient.get<UnitDetailsGetModel>(environment.apiBaseUrl.concat(environment.unitDetailsById).replace(':unitId', unitId))
  }

  updateUnitDetailsById(unitId: string, payload: UnitDetailsPatchModel) {
    return this.httpClient.patch<UnitDetailsGetModel>(environment.apiBaseUrl.concat(environment.unitDetailsById).replace(':unitId', unitId), payload);
  }

  // Nouvelles méthodes pour les instructions
  getUnitInstructionsById(unitId: string) {
    return this.httpClient.get<UnitInstructionsGetModel>(
      environment.apiBaseUrl.concat(environment.unitInstructionsById).replace(':unitId', unitId)
    );
  }

  updateUnitInstructionsById(unitId: string, payload: UnitInstructionsPatchModel) {
    return this.httpClient.patch<UnitInstructionsGetModel>(
      environment.apiBaseUrl.concat(environment.unitInstructionsById).replace(':unitId', unitId),
      payload
    );
  }


  getUnitRooms(unitId: string) {
    return this.httpClient.get<PageModel<RoomGetModel>>(environment.apiBaseUrl.concat(environment.unitRoomsById).replace(':unitId', unitId));
  }

  createRoom(payload: RoomPostModel, unitId: string) {
    return this.httpClient.post<RoomGetModel>(environment.apiBaseUrl.concat(environment.unitRoomsById).replace(':unitId', unitId), payload);
  }

  updateRoom(payload: RoomPatchModel, unitId: string, roomId: string) {
    return this.httpClient.patch<RoomGetModel>(environment.apiBaseUrl.concat(environment.unitRoomById).replace(':unitId', unitId).replace(':roomId', roomId), payload);
  }

  deleteRoom(unitId: string, roomId: string) {
    return this.httpClient.delete<void>(environment.apiBaseUrl.concat(environment.unitRoomById).replace(':unitId', unitId).replace(':roomId', roomId));
  }
}
