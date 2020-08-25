// outer imports
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
// rxjs
import { take } from 'rxjs/operators';
// imports end

@Component({
  selector: 'anms-mat-select-search',
  templateUrl: './mat-select-search.component.html',
  styleUrls: ['./mat-select-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatSelectSearchComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatSelectSearchComponent
  implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  /** Current search value */
  get value(): string {
    return this._value;
  }

  constructor(
    @Inject(MatSelect) public matSelect: MatSelect,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  /** Label of the search placeholder */
  @Input() placeholderLabel = 'Search';

  /** Label to be shown when no entries are found. Set to null if no message should be shown. */
  @Input() noEntriesFoundLabel = 'empty';

  /** Reference to the search input field */
  @ViewChild('searchSelectInput', { static: true, read: ElementRef })
  searchSelectInput: ElementRef;
  private _value: string;

  /** Reference to the MatSelect options */
  public _options: QueryList<MatOption>;

  /** Previously selected values when using <mat-select [multiple]="true"> */
  private previousSelectedValues: any[];

  /** Whether the backdrop class has been set */
  private overlayClassSet = false;

  /** Event that emits when the current value changes */
  private change = new EventEmitter<string>();

  onChange: Function = (_: any) => {};
  onTouched: Function = (_: any) => {};

  /**
   * On init
   */
  ngOnInit(): void {
    // set custom panel class
    const panelClass = 'mat-select-search-panel';
    if (this.matSelect.panelClass) {
      if (Array.isArray(this.matSelect.panelClass)) {
        this.matSelect.panelClass.push(panelClass);
      } else if (typeof this.matSelect.panelClass === 'string') {
        this.matSelect.panelClass = [this.matSelect.panelClass, panelClass];
      } else if (typeof this.matSelect.panelClass === 'object') {
        this.matSelect.panelClass[panelClass] = true;
      }
    } else {
      this.matSelect.panelClass = panelClass;
    }

    // TODO CLEAR SUBSCRIBE
    // when the select dropdown panel is opened or closed
    this.matSelect.openedChange.pipe().subscribe((opened) => {
      if (opened) {
        // focus the search field when opening
        this._focus();
      } else {
        // clear it when closing
        this._reset();
      }
    });
    // TODO CLEAR SUBSCRIBE
    // set the first item active after the options changed
    this.matSelect.openedChange
      .pipe(take(1))
      .pipe()
      .subscribe(() => {
        this._options = this.matSelect.options;
        // TODO CLEAR SUBSCRIBE
        this._options.changes.pipe().subscribe(() => {
          const keyManager = this.matSelect._keyManager;
          if (keyManager && this.matSelect.panelOpen) {
            // avoid "expression has been changed" error
            setTimeout(() => {
              keyManager.setFirstItemActive();
            });
          }
        });
      });

    // detect changes when the input changes
    this.change.pipe().subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });

    this.initMultipleHandling();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {}

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    this.setOverlayClass();
  }

  /**
   * Handles the key down event with MatSelect.
   * Allows e.g. selecting with enter key, navigation with arrow keys, etc.
   *
   * @param  event
   * @private
   */
  _handleKeydown(event: KeyboardEvent): void {
    // if (event.altKeykey === 32) {
    //   // do not propagate spaces to MatSelect, as this would select the currently active option
    //   event.stopPropagation();
    // }
  }

  writeValue(value: string): void {
    const valueChanged = value !== this._value;
    if (valueChanged) {
      this._value = value;
      this.change.emit(value);
    }
  }

  onInputChange(value): void {
    const valueChanged = value !== this._value;
    if (valueChanged) {
      this._value = value;
      this.onChange(value);
      this.change.emit(value);
    }
  }

  onBlur(value: string): void {
    this.writeValue(value);
    this.onTouched();
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  /**
   * Focuses the search input field
   * @private
   */
  public _focus(): void {
    if (!this.searchSelectInput) {
      return;
    }
    // save and restore scrollTop of panel, since it will be reset by focus()
    // note: this is hacky
    const panel = this.matSelect.panel.nativeElement;
    const scrollTop = panel.scrollTop;

    // focus
    this.searchSelectInput.nativeElement.focus();

    panel.scrollTop = scrollTop;
  }

  /**
   * Resets the current search value
   * @param {boolean} focus whether to focus after resetting
   * @private
   */
  public _reset(focus?: boolean): void {
    if (!this.searchSelectInput) {
      return;
    }
    this.searchSelectInput.nativeElement.value = '';
    this.onInputChange('');
    if (focus) {
      this._focus();
    }
  }

  /**
   * Sets the overlay class  to correct offsetY
   * so that the selected option is at the position of the select box when opening
   */
  private setOverlayClass(): void {
    if (this.overlayClassSet) {
      return;
    }
    const overlayClass = 'cdk-overlay-pane-select-search';
    // TODO CLEAR SUBSCRIBE
    // this.matSelect.overlayDir.attach.pipe().subscribe(() => {
    //   // note: this is hacky, but currently there is no better way to do this
    //   this.searchSelectInput.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add(
    //     overlayClass
    //   );
    // });

    this.overlayClassSet = true;
  }

  /**
   * Initializes handling <mat-select [multiple]="true">
   * Note: to improve this code, mat-select should be extended to allow disabling resetting the selection while filtering.
   */
  private initMultipleHandling(): void {
    // if <mat-select [multiple]="true">
    // store previously selected values and restore them when they are deselected
    // because the option is not available while we are currently filtering
    this.matSelect.valueChange
      // TODO CLEAR SUBSCRIBE
      .pipe()
      .subscribe((values) => {
        if (this.matSelect.multiple) {
          let restoreSelectedValues = false;
          if (
            this._value &&
            this._value.length &&
            this.previousSelectedValues &&
            Array.isArray(this.previousSelectedValues)
          ) {
            if (!values || !Array.isArray(values)) {
              values = [];
            }
            const optionValues = this.matSelect.options.map(
              (option) => option.value
            );
            this.previousSelectedValues.forEach((previousValue) => {
              if (
                values.indexOf(previousValue) === -1 &&
                optionValues.indexOf(previousValue) === -1
              ) {
                // if a value that was selected before is deselected and not found in the options, it was deselected
                // due to the filtering, so we restore it.
                values.push(previousValue);
                restoreSelectedValues = true;
              }
            });
          }

          if (restoreSelectedValues) {
            this.matSelect._onChange(values);
          }

          this.previousSelectedValues = values;
        }
      });
  }
}
