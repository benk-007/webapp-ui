import {RatesModel} from "./rates.model";
import {AuditGetModel} from "../../../../shared/models/audit-get.model";
import {DaySpecificPricingModel} from "../../../../shared/models/day-specific-pricing.model";

export interface RatesTableGetModel {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  rate: RatesModel;
  daySpecificPrices: DaySpecificPricingModel[];
  audit: AuditGetModel;
}
