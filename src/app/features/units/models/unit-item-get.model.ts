import {AuditGetModel} from "../../../shared/models/audit-get.model";
import {AddressModel} from "../../../shared/models/address.model";

export interface UnitItemGetModel {
  id: string;
  name: string;
  subtitle: string;
  beds: number;
  bathrooms: number;
  audit: AuditGetModel;
  readiness: boolean;
  nature: 'SINGLE' | 'MULTI_UNIT';
  contact: {
    mobile: string;
    email: string;
  },
  address: AddressModel;
  // Champs pour identifier les sous-unités
  parentUnit?: string;
  priority?: number;

  subUnits?: UnitItemGetModel[];
}

