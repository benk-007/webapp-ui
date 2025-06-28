export interface RentalBaseRateModel {
  nightly: number;
  weekendNight?: number;
  weekly?: number;
  monthly?: number;
  minStay: number;
  maxStay?: number;
}
