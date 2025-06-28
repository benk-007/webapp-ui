import {RentalBaseRateModel} from "../../../../../shared/models/rental-base-rate.model";
import {AdditionalGuestFeeModel} from "../../../../../shared/models/additional-guest-fee.model";
import {DaySpecificPricingModel} from "../../../../../shared/models/day-specific-pricing.model";

export interface TableItemGetModel {
  id: string;
  rateName: string;
  fromDate: string;
  untilDate: string;
  rate: {
    rentalBaseRate: RentalBaseRateModel;
    additionalGuestFee?: AdditionalGuestFeeModel;
  };
  daySpecificPricings?: DaySpecificPricingModel[];
}


