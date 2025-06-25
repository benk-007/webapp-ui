export interface TablePostModel {
  rateName: string;
  fromDate: string;
  untilDate: string;

  rate: {
    rentalBaseRate: {
      nightly: number;
      weekendNight?: number;
      weekly?: number;
      monthly?: number;
      minStay: number;
      maxStay?: number;
    };
    additionalGuestFee: {
      feePPPN?: number;
      guestCount?: number;
    };
  };

  daySpecificPricings: DaySpecificPricingModel[];
}

export interface DaySpecificPricingModel {
  daysOfWeek: string[];
  nightly: number;
  ppPn?: number;
  guestCount?: number;
}
