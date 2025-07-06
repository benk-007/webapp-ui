import {AddressModel} from "../../../shared/models/address.model";
import {ParentUnitGetModel} from "./parent-unit-get.model";

export interface UnitInfosGetModel {
  id: string;
  name: string;
  subtitle: string;
  address: AddressModel;
  contact: {
    mobile: string;
    email?: string;
  };
  calendarColor: string;
  readiness: boolean;
  parent: ParentUnitGetModel;
  nature: 'SINGLE' | 'MULTI_UNIT';
  priority: number;
}
