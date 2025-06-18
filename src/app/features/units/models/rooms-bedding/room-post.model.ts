import {RoomTypeEnum} from "./room-type.enum";
import {RoomSubTypeEnum} from "./room-sub-type.enum";
import {FloorSizeUnitEnum} from "../floor-size-unit.enum";
import {BedGetModel} from "./bed-get.model";

export interface RoomPostModel {
  name?: string;
  type?: RoomTypeEnum;
  subType?: RoomSubTypeEnum;
  floorSize?: number;
  floorSizeUnit?: FloorSizeUnitEnum;
  bathroomId?: string;
  description?: string;
  beds?: BedGetModel[];
}
