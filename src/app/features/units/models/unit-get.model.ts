import {AuditGetModel} from "../../../shared/models/audit-get.model";
import {AddressModel} from "../../../shared/models/address.model";

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

  parentUnit?: string;
}
