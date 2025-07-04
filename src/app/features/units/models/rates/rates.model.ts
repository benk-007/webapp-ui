import {BasePricingModel} from "./base-pricing.model";
import {AdditionalGuestFeeModel} from "../../../../shared/models/additional-guest-fee.model";

export interface RatesModel {
  basePricing: BasePricingModel;
  additionalGuestFee: AdditionalGuestFeeModel;
}
