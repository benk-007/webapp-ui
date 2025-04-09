import {AfterViewInit, Directive, ElementRef, EventEmitter, Output} from '@angular/core';

@Directive({
  selector: '[appSelectableTable]',
  standalone: true
})
export class SelectableTableDirective implements AfterViewInit {

  checkedValues: any[] = [];
  @Output() selectionChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  private observer: MutationObserver;

  constructor(private el: ElementRef) {
    // Initialize the MutationObserver to watch for changes in the table body
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          this.addRowCheckboxes(); // Add checkboxes to newly added rows
        }
      });
    });
  }

  ngAfterViewInit() {
    // Modify table structure
    this.addMasterCheckbox();
    this.addRowCheckboxes();

    // Observe the table body for changes
    const tbody = this.el.nativeElement.querySelector('tbody');
    if (tbody) {
      this.observer.observe(tbody, {childList: true});
    }
  }

  ngOnDestroy() {
    // Disconnect the observer when the directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private addMasterCheckbox() {
    const thead = this.el.nativeElement.querySelector('thead');
    const rowHeader = thead.querySelector('tr');


    const masterCheckbox = document.createElement('input');
    masterCheckbox.setAttribute('id', 'masterCheckbox');
    masterCheckbox.setAttribute('type', 'checkbox');
    masterCheckbox.classList.add('form-check-input'); // Add cFormCheckInput here
    masterCheckbox.addEventListener('change', (event) => {
      // @ts-ignore
      this.toggleRowCheckboxes(event.target.checked);
      this.updateCheckedValues();
    });
    const th = document.createElement('th');
    th.setAttribute('scope', 'col')
    th.setAttribute('class', 'text-center')

    th.appendChild(masterCheckbox);
    rowHeader.insertBefore(th, rowHeader.firstChild);
  }

  private addRowCheckboxes() {
    const tbody = this.el.nativeElement.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row: HTMLTableRowElement, index: number) => {
      if (!row.querySelector('input[type="checkbox"]')) {
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('value', '' + index);
        checkbox.classList.add('form-check-input');
        checkbox.addEventListener('change', () => {
          this.updateCheckedValues();
        });
        const td = document.createElement('td');
        td.setAttribute('class', 'text-center')
        td.appendChild(checkbox);
        row.insertBefore(td, row.firstChild);
      }
    });
  }

  private toggleRowCheckboxes(checked: boolean) {
    const checkboxes = this.el.nativeElement.querySelectorAll('tbody input[type="checkbox"]');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = checked;
    });
  }

  private updateCheckedValues() {
    this.checkedValues = [];
    const checkboxes = this.el.nativeElement.querySelectorAll('tbody input[type="checkbox"]:checked');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      this.checkedValues.push(checkbox.value);
    });
    this.selectionChange.emit(this.checkedValues); // Emit selection change event
  }
}
