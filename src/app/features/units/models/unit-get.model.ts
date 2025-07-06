import {AuditGetModel} from "../../../shared/models/audit-get.model";
import {AddressModel} from "../../../shared/models/address.model";
import {ParentUnitGetModel} from "./parent-unit-get.model";

export interface UnitGetModel {
  id: string;
  name: string;
  subtitle: string;
  audit: AuditGetModel;
  readiness: boolean;
  contact: {
    mobile: string;
    email: string;
  },
  address: AddressModel;

  parent?: ParentUnitGetModel;
  nature: 'SINGLE' | 'MULTI_UNIT';
}
