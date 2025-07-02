import {AddressModel} from "../../../shared/models/address.model";

export interface UnitInfosGetModel {
  id: string;
  name: string;
  subtitle?: string;
  address: AddressModel;
  contact: {
    mobile: string;
    email?: string;
  };
  calendarColor: string;
  readiness: boolean;

  parentUnit?: string
}
