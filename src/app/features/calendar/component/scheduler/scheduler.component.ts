import {Component} from '@angular/core';
import {FormControlDirective, InputGroupComponent, InputGroupTextDirective, TableDirective} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {TranslatePipe} from "@ngx-translate/core";
import {cilSearch} from "@coreui/icons";
import {RoomBookingsGetModel} from "../../models/room-bookings-get.model";
import {roomBookings} from "../../models/sample-data";
import {DatePipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {BookingGetModel} from "../../models/booking-get.model";

@Component({
  selector: 'app-scheduler',
  imports: [
    TableDirective,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    TranslatePipe,
    NgForOf,
    DatePipe,
    JsonPipe,
    NgIf
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  icons = {cilSearch}

  public dates: Date[] = [];
  public roomBookings: RoomBookingsGetModel[] = roomBookings;

  roomBookingCells: { [roomId: string]: GeneratedBookingCell[] } = {};


  constructor() {
    this.generateDateRange();
    this.processRoomBookingsData()

    this.roomBookings.forEach(room => {
      this.roomBookingCells[room.id] = this.generateBookingRowCells(room);
    });
  }


  public generateBookingRowCells(room: RoomBookingsGetModel): GeneratedBookingCell[] {
    const cells: GeneratedBookingCell[] = [];
    console.log('your room is:', room);
    if (room.bookings.length == 0) {
      this.dates.forEach(date => {
        cells.push({
          type: 'empty',
          colspan: 1
        });
        cells.push({
          type: 'empty',
          colspan: 1
        });
      })
    } else {
      for (let i = 0; i < room.bookings.length; i++) {
        let booking = room.bookings[i];
        console.log('your booking is:', booking);
        let dateContinue = false;
        for (let j = 0; j < this.dates.length; j++) {
          const date = this.dates[j];
          console.log('your date is:', date);
          if (!dateContinue) {
            if (booking.startDate < date) {
              const value = this.daysBetween(date, booking.endDate as Date);
              console.log('your days between is:', value);
              cells.push({
                type: 'booking',
                booking: booking,
                colspan: this.daysBetween(date, booking.endDate as Date) * 2 + 1
              })
              dateContinue = true;
            }
          } else {
            continue;
          }
        }
      }


    }


    return cells;
  }

  // Helper functions for template to get booking details from GeneratedBookingCell
  getBookingTitle(cell: GeneratedBookingCell): string {
    return cell.booking ? cell.booking.title : '';
  }

  getBookingColor(cell: GeneratedBookingCell): string {
    return cell.booking ? (cell.booking.color || 'bg-secondary text-white') : '';
  }

  // Helper for Row 1 content (price) - remains the same
  getPriceForDate(date: Date): string {
    return '120€';
  }

  private daysBetween(date1: Date, date2: Date): number {
    const msInDay = 1000 * 60 * 60 * 24;

    // Remove time portion by converting to UTC midnight
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    return Math.floor((utc2 - utc1) / msInDay);
  }

  private generateDateRange(): void {
    const today = new Date();
    let dayOfWeek = today.getDay();
    let diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const dateToAdd = new Date(startOfWeek);
      dateToAdd.setDate(startOfWeek.getDate() + i);
      this.dates.push(dateToAdd);
    }
    console.log('your dates are', this.dates);
  }

  private processRoomBookingsData(): void {
    this.roomBookings = roomBookings.map(resource => ({
      ...resource,
      bookings: resource.bookings.map((booking: any) => { // Use 'any' temporarily for raw data parsing
        // Ensure startDate and endDate are Date objects internally
        return {
          ...booking,
          startDate: this.normalizeDate(new Date(booking.startDate)),
          endDate: this.normalizeDate(new Date(booking.endDate))
        };
      })
    }));
    console.log('Processed Room Bookings:', this.roomBookings);
  }

  private normalizeDate(d: Date): Date {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  }

}

// Helper interface for the pre-calculated cells for Row 2 (internal to component)
interface GeneratedBookingCell {
  type: 'booking' | 'empty';
  booking?: BookingGetModel; // Only present if type is 'booking'
  colspan: number;           // The colspan for this <td>
}
