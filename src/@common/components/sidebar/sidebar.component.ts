// outer imports
import {
  Output,
  Component,
  HostBinding,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  OnInit,
  OnDestroy,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import {
  animate,
  AnimationBuilder,
  AnimationPlayer,
  style
} from '@angular/animations';
import { MediaObserver } from '@angular/flex-layout';
// rxjs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// inner imports
import { CommonMatchMediaService } from '@common/services';
//
import { CommonSidebarService } from './sidebar.service';
import { CommonUtils } from '@common/utils';
// imports end

@Component({
  selector: 'at-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements AfterViewInit, OnInit, OnDestroy {
  // Input
  @Input() name: string;
  @Input() key: string;
  @Input() position: 'left' | 'right';
  @HostBinding('class.open') opened: boolean;
  @HostBinding('class.animations-enabled') private _animationsEnabled: boolean;
  @Input() lockedOpen: string;
  @HostBinding('class.locked-open') isLockedOpen: boolean;
  @Input() foldedWidth: number;
  @HostBinding('class.unfolded') unfolded: boolean;
  @Input() invisibleOverlay: boolean;
  @Output() foldedChanged: EventEmitter<boolean>;
  @Output() openedChanged: EventEmitter<boolean>;

  // Private
  private _folded: boolean;
  private _wasActive: boolean;
  private _wasFolded: boolean;
  private _backdrop: HTMLElement | null = null;
  private _player: AnimationPlayer;
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param _animationBuilder
   * @param _changeDetectorRef
   * @param _elementRef
   * @param _matchMediaService
   * @param _sidebarService
   * @param _mediaObserver
   * @param _renderer
   */
  constructor(
    private _animationBuilder: AnimationBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _matchMediaService: CommonMatchMediaService,
    private _sidebarService: CommonSidebarService,
    private _mediaObserver: MediaObserver,
    private _renderer: Renderer2
  ) {
    // Set the defaults
    this.foldedWidth = 64;
    this.foldedChanged = new EventEmitter();
    this.openedChanged = new EventEmitter();
    this.opened = false;
    this.position = 'left';
    this.invisibleOverlay = false;

    // Set the private defaults
    // Set the private defaults
    this._animationsEnabled = false;
    this._folded = false;
    this._unsubscribeAll = new Subject();
  }

  // ---------------------------------------------------------------------------
  // @ Accessors
  // ---------------------------------------------------------------------------

  /**
   * Folded
   *
   * @param {boolean} value
   */
  @Input() set folded(value: boolean) {
    // Set the folded
    this._folded = value;

    // Return if the sidebar is closed
    if (!this.opened) {
      return;
    }

    // Programmatically add/remove padding to the element
    // that comes after or before based on the position
    let sibling, styleRule;

    const styleValue = this.foldedWidth + 'px';

    // Get the sibling and set the style rule
    if (this.position === 'left') {
      sibling = this._elementRef.nativeElement.nextElementSibling;
      styleRule = 'padding-left';
    } else {
      sibling = this._elementRef.nativeElement.previousElementSibling;
      styleRule = 'padding-right';
    }

    // If there is no sibling, return...
    if (!sibling) {
      return;
    }

    // If folded...
    if (value) {
      // Fold the sidebar
      this.fold();

      // Set the folded width
      this._renderer.setStyle(
        this._elementRef.nativeElement,
        'width',
        styleValue
      );
      this._renderer.setStyle(
        this._elementRef.nativeElement,
        'min-width',
        styleValue
      );
      this._renderer.setStyle(
        this._elementRef.nativeElement,
        'max-width',
        styleValue
      );

      // Set the style and class
      this._renderer.setStyle(sibling, styleRule, styleValue);
      this._renderer.addClass(this._elementRef.nativeElement, 'folded');
    }
    // If unfolded...
    else {
      // Unfold the sidebar
      this.unfold();

      // Remove the folded width
      this._renderer.removeStyle(this._elementRef.nativeElement, 'width');
      this._renderer.removeStyle(this._elementRef.nativeElement, 'min-width');
      this._renderer.removeStyle(this._elementRef.nativeElement, 'max-width');

      // Remove the style and class
      this._renderer.removeStyle(sibling, styleRule);
      this._renderer.removeClass(this._elementRef.nativeElement, 'folded');
    }

    // Emit the 'foldedChanged' event
    this.foldedChanged.emit(this.folded);

    CommonUtils.windowDispatchResize();
  }

  get folded(): boolean {
    return this._folded;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Register the sidebar
    this._sidebarService.register(this.name, this);
  }

  /**
   * After View Init
   */
  ngAfterViewInit(): void {
    // Setup visibility
    this._setupVisibility();

    // Setup position
    this._setupPosition();

    // Setup lockedOpen
    this._setupLockedOpen();

    // Setup folded
    this._setupFolded();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // If the sidebar is folded, unfold it to revert modifications
    if (this.folded) {
      this.unfold();
    }

    // Unregister the sidebar
    this._sidebarService.unregister(this.name);

    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setup the visibility of the sidebar
   *
   * @private
   */
  private _setupVisibility(): void {
    // Remove the existing box-shadow
    this._renderer.setStyle(
      this._elementRef.nativeElement,
      'box-shadow',
      'none'
    );

    // Make the sidebar invisible
    this._renderer.setStyle(
      this._elementRef.nativeElement,
      'visibility',
      'hidden'
    );
  }

  /**
   * Setup the sidebar position
   *
   * @private
   */
  private _setupPosition(): void {
    // Add the correct class name to the sidebar
    // element depending on the position attribute
    if (this.position === 'right') {
      this._renderer.addClass(
        this._elementRef.nativeElement,
        'right-positioned'
      );
    } else {
      this._renderer.addClass(
        this._elementRef.nativeElement,
        'left-positioned'
      );
    }
  }

  /**
   * Setup the lockedOpen handler
   *
   * @private
   */
  private _setupLockedOpen(): void {
    // Return if the lockedOpen wasn't set
    if (!this.lockedOpen) {
      // Return
      return;
    }

    // Set the wasActive for the first time
    this._wasActive = false;

    // Set the wasFolded
    this._wasFolded = this.folded;

    // Act on every media change
    this._matchMediaService.onMediaChange
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        // Get the active status
        const isActive = this._mediaObserver.isActive(this.lockedOpen);

        // If the both status are the same, don't act
        if (this._wasActive === isActive) {
          return;
        }

        // Activate the lockedOpen
        if (isActive) {
          // Set the lockedOpen status
          this.isLockedOpen = true;

          // Show the sidebar
          this._showSidebar();

          // Force the the opened status to true
          this.opened = true;

          // Emit the 'openedChanged' event
          this.openedChanged.emit(this.opened);

          // If the sidebar was folded, forcefully fold it again
          if (this._wasFolded) {
            // Fold
            this.folded = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }

          // Hide the backdrop if any exists
          this._hideBackdrop();
          // De-Activate the lockedOpen
        } else {
          // Set the lockedOpen status
          this.isLockedOpen = false;

          // Unfold the sidebar in case if it was folded
          this.unfold();

          // Force the the opened status to close
          this.opened = false;

          // Emit the 'openedChanged' event
          this.openedChanged.emit(this.opened);

          // Hide the sidebar
          this._hideSidebar();
        }

        // Store the new active status
        this._wasActive = isActive;
      });
  }

  /**
   * Setup the initial folded status
   *
   * @private
   */
  private _setupFolded(): void {
    // Return, if sidebar is not folded
    if (!this.folded) {
      return;
    }

    // Return if the sidebar is closed
    if (!this.opened) {
      return;
    }

    // Programmatically add/remove padding to the element
    // that comes after or before based on the position
    let sibling, styleRule;

    const styleValue = this.foldedWidth + 'px';

    // Get the sibling and set the style rule
    if (this.position === 'left') {
      sibling = this._elementRef.nativeElement.nextElementSibling;
      styleRule = 'padding-left';
    } else {
      sibling = this._elementRef.nativeElement.previousElementSibling;
      styleRule = 'padding-right';
    }

    // If there is no sibling, return...
    if (!sibling) {
      return;
    }

    // Fold the sidebar
    this.fold();

    // Set the folded width
    this._renderer.setStyle(
      this._elementRef.nativeElement,
      'width',
      styleValue
    );
    this._renderer.setStyle(
      this._elementRef.nativeElement,
      'min-width',
      styleValue
    );
    this._renderer.setStyle(
      this._elementRef.nativeElement,
      'max-width',
      styleValue
    );

    // Set the style and class
    this._renderer.setStyle(sibling, styleRule, styleValue);
    this._renderer.addClass(this._elementRef.nativeElement, 'folded');
  }

  /**
   * Show the backdrop
   *
   * @private
   */
  private _showBackdrop(): void {
    // Create the backdrop element
    this._backdrop = this._renderer.createElement('div');

    // Add a class to the backdrop element
    this._backdrop.classList.add('sidebar-overlay');

    // Add a class depending on the invisibleOverlay option
    if (this.invisibleOverlay) {
      this._backdrop.classList.add('sidebar-overlay-invisible');
    }

    // Append the backdrop to the parent of the sidebar
    this._renderer.appendChild(
      this._elementRef.nativeElement.parentElement,
      this._backdrop
    );

    // Create the enter animation and attach it to the player
    this._player = this._animationBuilder
      .build([animate('300ms ease', style({ opacity: 1 }))])
      .create(this._backdrop);

    // Play the animation
    this._player.play();

    // Add an event listener to the overlay
    this._backdrop.addEventListener('click', () => {
      this.close();
    });

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Hide the backdrop
   *
   * @private
   */
  private _hideBackdrop(): void {
    if (!this._backdrop) {
      return;
    }

    // Create the leave animation and attach it to the player
    this._player = this._animationBuilder
      .build([animate('300ms ease', style({ opacity: 0 }))])
      .create(this._backdrop);

    // Play the animation
    this._player.play();

    // Once the animation is done...
    this._player.onDone(() => {
      // If the backdrop still exists...
      if (this._backdrop) {
        // Remove the backdrop
        this._backdrop.parentNode.removeChild(this._backdrop);
        this._backdrop = null;
      }
    });

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Change some properties of the sidebar
   * and make it visible
   *
   * @private
   */
  private _showSidebar(): void {
    // Remove the box-shadow style
    this._renderer.removeStyle(this._elementRef.nativeElement, 'box-shadow');

    // Make the sidebar invisible
    this._renderer.removeStyle(this._elementRef.nativeElement, 'visibility');

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Change some properties of the sidebar
   * and make it invisible
   *
   * @private
   */
  private _hideSidebar(delay = true): void {
    const delayAmount = delay ? 300 : 0;

    // Add a delay so close animation can play
    setTimeout(() => {
      // Remove the box-shadow
      this._renderer.setStyle(
        this._elementRef.nativeElement,
        'box-shadow',
        'none'
      );

      // Make the sidebar invisible
      this._renderer.setStyle(
        this._elementRef.nativeElement,
        'visibility',
        'hidden'
      );
    }, delayAmount);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Enable the animations
   *
   * @private
   */
  private _enableAnimations(): void {
    // Return if animations already enabled
    if (this._animationsEnabled) {
      return;
    }

    // Enable the animations
    this._animationsEnabled = true;

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Open the sidebar
   */
  open(): void {
    if (this.opened || this.isLockedOpen) {
      return;
    }
    // Enable the animations
    this._enableAnimations();

    // Show the sidebar
    this._showSidebar();

    // Show the backdrop
    this._showBackdrop();

    // Set the opened status
    this.opened = true;

    // Emit the 'openedChanged' event
    this.openedChanged.emit(this.opened);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Close the sidebar
   */
  close(): void {
    if (!this.opened || this.isLockedOpen) {
      return;
    }

    // Hide the backdrop
    this._hideBackdrop();

    // Set the opened status
    this.opened = false;

    // Emit the 'openedChanged' event
    this.openedChanged.emit(this.opened);

    // Hide the sidebar
    this._hideSidebar();

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggle open/close the sidebar
   */
  toggleOpen(): void {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Fold the sidebar permanently
   */
  fold(): void {
    // Only work if the sidebar is not folded
    if (this.folded) {
      return;
    }

    // Enable the animations
    this._enableAnimations();

    // Fold
    this.folded = true;

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Unfold the sidebar permanently
   */
  unfold(): void {
    // Only work if the sidebar is folded
    if (!this.folded) {
      return;
    }

    // Enable the animations
    this._enableAnimations();

    // Unfold
    this.folded = false;

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggle the sidebar fold/unfold permanently
   */
  toggleFold(): void {
    if (this.folded) {
      this.unfold();
    } else {
      this.fold();
    }
  }


  /**
   * Fold the temporarily unfolded sidebar back
   */
  toggleLockedOpen(): void {
    if (this.isLockedOpen) {
      this.isLockedOpen = false;

      // Set the opened status
      this.opened = false;

      // Hide the sidebar
      this._hideSidebar();

      // Mark for check
      this._changeDetectorRef.markForCheck();

    } else {

      this.isLockedOpen = true;

      // Show the sidebar
      this._showSidebar();

      // Set the opened status
      this.opened = true;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
}
