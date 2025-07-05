import {AddressModel} from "../../../shared/models/address.model";

export interface UnitInfosPatchModel {
  name?: string;
  subtitle?: string;
  address?: AddressModel;
  contact?: {
    mobile?: string;
    email?: string;
  },
  calendarColor?: string;
  readiness?: boolean;

  priority?: number;
}
