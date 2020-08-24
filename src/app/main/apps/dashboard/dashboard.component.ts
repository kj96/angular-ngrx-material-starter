// outer
import {ChangeDetectionStrategy, ViewEncapsulation, Component} from '@angular/core';
// inner
import {commonAnimations} from '@common';
// end

@Component({
  selector: 'robo-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: commonAnimations
})
export class DashboardComponent {}
