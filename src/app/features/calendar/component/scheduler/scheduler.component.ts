import {Component} from '@angular/core';
import {FormControlDirective, InputGroupComponent, InputGroupTextDirective, TableDirective} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {TranslatePipe} from "@ngx-translate/core";
import {cilSearch} from "@coreui/icons";
import moment from 'moment';

@Component({
  selector: 'app-scheduler',
  imports: [
    TableDirective,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    TranslatePipe
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  icons = {cilSearch}

  public dates: Date[] = [];
  public bookings: Booking[] = [];

  public rooms: string[] = ['Room 101'];

  constructor() {
    this.generateDateRange();
  }


  private generateDateRange(): void {
    const today = new Date(); // Get the current date and time

    // Calculate the difference to get to Monday.
    // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
    // We want Monday (1).
    // If today is Sunday (0), we want to subtract 6 days to get to Monday.
    // If today is Monday (1), we want to subtract 0 days.
    // If today is Tuesday (2), we want to subtract 1 day.
    // The formula for ISO week (Monday as start) is (dayOfWeek - 1 + 7) % 7
    // For example, if today.getDay() is 0 (Sunday), (0 - 1 + 7) % 7 = 6, so subtract 6 days.
    // If today.getDay() is 1 (Monday), (1 - 1 + 7) % 7 = 0, so subtract 0 days.
    let dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday...
    let diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, diff is 6 to get to Monday. Otherwise, dayOfWeek - 1.

    // Create a new Date object for the start of the week (Monday)
    const startOfWeek = new Date(today); // Clone today's date
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight for consistency

    this.dates = []; // Clear any existing dates

    // Generate three weeks (21 days) of dates
    for (let i = 0; i < 7; i++) {
      const dateToAdd = new Date(startOfWeek); // Clone the startOfWeek date
      dateToAdd.setDate(startOfWeek.getDate() + i); // Add 'i' days to it
      this.dates.push(dateToAdd);
    }

    // Optional: Log the generated dates to verify
    console.log('Generated Dates (Native JS Date Objects):', this.dates);
  }


}

interface Booking {
  id: string;
  room: string; // e.g., 'Room 101'
  startDate: Date;
  endDate: Date;
  title: string;
  color: string; // e.g., 'bg-primary', 'bg-info' for styling
}
