import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { commonAnimations } from '@common/scss/animations';

@Component({
  selector: 'at-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: commonAnimations
})
export class MaintenanceComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
