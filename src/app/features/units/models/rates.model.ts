import {RentalBaseRateModel} from "../../../shared/models/rental-base-rate.model";
import {AdditionalGuestFeeModel} from "../../../shared/models/additional-guest-fee.model";

export interface RatesModel {
  rentalBaseRate: RentalBaseRateModel;
  additionalGuestFee: AdditionalGuestFeeModel;
}
