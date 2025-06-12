import {RoomTypeEnum} from "./room-type.enum";
import {BedGetModel} from "./bed-get.model";

export interface RoomGetModel {
  id: string;
  type: RoomTypeEnum;
  bathroom: number;
  floorSize: number;
  beds?: BedGetModel[];
}
