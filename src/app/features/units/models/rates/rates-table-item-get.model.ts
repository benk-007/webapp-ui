import {BasePricingGetModel} from "./base-pricing-get.model";
import {AuditGetModel} from "../../../../shared/models/audit-get.model";

export interface RatesTableItemGetModel {
  id: string;
  name: string;
  startDate: string;
  endDate: Date;
  basePricing: BasePricingGetModel;
  audit: AuditGetModel;
}
