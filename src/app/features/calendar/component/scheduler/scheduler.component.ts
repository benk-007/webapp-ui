import {Component} from '@angular/core';
import {FormControlDirective, InputGroupComponent, InputGroupTextDirective, TableDirective} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {TranslatePipe} from "@ngx-translate/core";
import {cilSearch} from "@coreui/icons";
import {RoomBookingsGetModel} from "../../models/room-bookings-get.model";
import {roomBookings} from "../../models/sample-data";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {BookingGetModel} from "../../models/booking-get.model";
import moment from "moment";

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
    NgIf
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  icons = {cilSearch}

  public dates: moment.Moment[] = [];
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
      let lastDate = this.dates[0];
      let dateContinue = false;
      room.bookings.forEach((booking, bookingIndex) => {

        const bookingStartDate = moment(booking.startDate).startOf('day');
        const bookingEndDate = moment(booking.endDate).startOf('day');
        console.log('Booking to render has a start date of', bookingStartDate, 'and a last date of:', bookingEndDate);
        this.dates.forEach((date, index) => {
          console.log('Date from columns is:', date);
          if (!dateContinue) {
            if (bookingStartDate.isBefore(date) && index == 0) {
              const bookingDays = this.daysBetween(lastDate, bookingEndDate);
              cells.push({
                type: 'booking',
                booking: booking,
                colspan: bookingDays * 2 + 1
              });
              dateContinue = true;
              lastDate = bookingEndDate;
            } else if (bookingStartDate.isSame(date)) {
              console.log('last date is:', lastDate, 'booking start date is:', bookingStartDate);
              const emptyDays = this.daysBetween(lastDate, bookingStartDate);
              console.log('Empty days between bookings:', emptyDays);
              if (index == 0 || bookingIndex==0) {
                cells.push({
                  type: 'empty',
                  colspan: 1
                });
              }
              if (emptyDays != 0) {
                for (let i = 0; i < emptyDays; i++) {
                  cells.push({
                    type: 'empty',
                    colspan: 1
                  });
                  cells.push({
                    type: 'empty',
                    colspan: 1
                  });
                }
              }
              if (bookingEndDate.isAfter(this.dates[this.dates.length - 1])) {
                const bookingDays = this.daysBetween(bookingStartDate, this.dates[this.dates.length - 1]);
                cells.push({
                  type: 'booking',
                  booking: booking,
                  colspan: bookingDays * 2 + 1
                });
              } else {
                const bookingDays = this.daysBetween(bookingStartDate, bookingEndDate);
                cells.push({
                  type: 'booking',
                  booking: booking,
                  colspan: bookingDays * 2
                });
              }
              dateContinue = true;
              lastDate = bookingEndDate;
            }
          } else {
            if (bookingEndDate.isSame(date)) {
              dateContinue = false;
              //Treat last booking
              if (bookingIndex + 1 === room.bookings.length) {
                const emptyDays = this.daysBetween(bookingEndDate, this.dates[this.dates.length - 1]);
                console.log('your empty cells are:', emptyDays);
                cells.push({
                  type: 'empty',
                  colspan: 1
                });
                if (emptyDays != 0) {
                  for (let i = 0; i < emptyDays; i++) {
                    cells.push({
                      type: 'empty',
                      colspan: 1
                    });
                    cells.push({
                      type: 'empty',
                      colspan: 1
                    });
                  }
                }
              }
            }
          }

        });
      });
    }
    console.log('Generated bookings are:', cells);
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
  getPriceForDate(date: moment.Moment): string {
    return '120€';
  }

  private daysBetween(startDate: moment.Moment, endDate: moment.Moment): number {
    return endDate.diff(startDate, 'days');
  }

  private generateDateRange(): void {
    const startOfWeek = moment().startOf('week').add(1, 'day'); // Start from Monday
    this.dates = [];
    for (let i = 0; i < 14; i++) {
      this.dates.push(startOfWeek.clone().add(i, 'days').startOf('day'));
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


/*
if (!dateContinue) {
  //column date is before booking startDate
  if (date.isBefore(bookingStartDate)) {
    console.log('Cell with two empty cells')
    cells.push({
      type: 'empty',
      colspan: 1
    });
    cells.push({
      type: 'empty',
      colspan: 1
    });
  } else if (date.isSame(bookingStartDate)) {
    console.log('Cell with one empty cell and a booking')
    cells.push({
      type: 'empty',
      colspan: 1
    });
    cells.push({
      type: 'booking',
      booking: booking,
      colspan: this.daysBetween(bookingStartDate, bookingEndDate) * 2
    });
    dateContinue = true;
  }


}*/
