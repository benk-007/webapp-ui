import {UnitTypeEnum} from "../unit-type.enum";
import {FloorSizeUnitEnum} from "../floor-size-unit.enum";
import {OccupancyModel} from "./occupancy.model";
import {AmenityEnum} from "./amenity.enum";

export interface UnitDetailsPatchModel {
  type?: UnitTypeEnum;
  floorSize?: number;
  floorSizeUnit?: FloorSizeUnitEnum;
  description?: string;
  minOccupancy?: OccupancyModel;
  maxOccupancy?: OccupancyModel;
  travellerAge?: number;
  childrenAllowed?: boolean;
  eventsAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  amenities?: AmenityEnum[];
}
