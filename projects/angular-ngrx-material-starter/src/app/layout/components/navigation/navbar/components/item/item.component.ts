// outer imports
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import { layoutSelectors, RootStoreState } from 'app/core/root-store';
import { Observable } from 'rxjs';
//

@Component({
  selector: 'vertical-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavVerticalItemComponent implements OnInit {
  isFolded$: Observable<any>;

  @HostBinding('class') classes = 'nav-item';
  @Input() item: any;

  /**
   * Constructor
   *
   * @param {Store<RootStoreState>} _store
   *
   */
  constructor(private _store: Store<RootStoreState>) {}
  // ---------------------------------------------------------------------------
  // @ Lifecycle hooks
  // ---------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    this.isFolded$ = this._store.select(layoutSelectors.getNavigationIsFolded);
  }
}
