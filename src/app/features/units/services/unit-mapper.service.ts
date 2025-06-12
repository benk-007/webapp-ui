import {Injectable} from '@angular/core';
import {UnitDetailsPatchModel} from "../models/details/unit-details-patch.model";
import {AmenityEnum} from "../models/details/amenity.enum";

@Injectable({
  providedIn: 'root'
})
export class UnitMapperService {

  constructor() {
  }

  formToDetailsPatchModel(value: any, amenitiesRawValues: any): UnitDetailsPatchModel {

    const selected: AmenityEnum[] = Object.entries(amenitiesRawValues)
      .filter(([_, isChecked]) => isChecked)
      .map(([key]) => AmenityEnum[key as keyof typeof AmenityEnum]);

    return {
      type: value.type,
      floorSize: value.floorSize,
      floorSizeUnit: value.floorSizeUnit,
      description: value.description,
      minOccupancy: {
        adults: value.minOccupancy.adults,
        children: value.minOccupancy.children,
        infants: value.minOccupancy.infants
      },
      maxOccupancy: {
        adults: value.maxOccupancy.adults,
        children: value.maxOccupancy.children,
        infants: value.maxOccupancy.infants
      },
      travellerAge: value.travellerAge,
      childrenAllowed: value.childrenAllowed,
      eventsAllowed: value.eventsAllowed,
      smokingAllowed: value.smokingAllowed,
      petsAllowed: value.petsAllowed,
      amenities: selected
    };

    /*
        let rooms: RoomGetModel[] = [];
        if (value.rooms.length > 0) {
          value.rooms.forEach((rm: any) => {

            let beds: BedGetModel[] = [];
            rm.beds.forEach((bed: any) => {
              beds.push({
                type: bed.type,
                quantity: bed.quantity
              })
            })
            let room = {
              id: rm.id ? rm.id : null,
              type: rm.type,
              bathroom: rm.bathroom,
              floorSize: rm.floorSize,
              beds: beds
            }
            rooms.push(room);
          })
        }
        payload.rooms = rooms;*/

  }
}
