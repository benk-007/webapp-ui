import {RoomTypeEnum} from "./room-type.enum";
import {BedGetModel} from "./bed-get.model";
import {RoomSubTypeEnum} from "./room-sub-type.enum";
import {FloorSizeUnitEnum} from "../floor-size-unit.enum";

export interface RoomGetModel {
  id?: string;
  name?: string;
  type?: RoomTypeEnum;
  subType?: RoomSubTypeEnum;
  floorSize?: number;
  floorSizeUnit?: FloorSizeUnitEnum;
  bathroom?: RoomGetModel;
  beds?: BedGetModel[];
}
