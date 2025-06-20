import {BookingGetModel} from "./booking-get.model";

export interface RoomBookingsGetModel {
  id: string;
  name: string;
  bookings: BookingGetModel[];
}
