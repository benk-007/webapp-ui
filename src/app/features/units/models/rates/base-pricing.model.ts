export interface BasePricingModel {
  nightly: number;
  weekendNight?: number;
  weekly?: number;
  monthly?: number;
  minStay: number;
  maxStay?: number;
}
