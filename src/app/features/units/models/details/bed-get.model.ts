import {BedTypeEnum} from "./bed-type-enum";

export interface BedGetModel{
  id: string;
  type: BedTypeEnum;
  quantity: number;
}
