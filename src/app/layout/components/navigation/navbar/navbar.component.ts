// outer
import { Component, Input, ViewEncapsulation } from '@angular/core';
// end

@Component({
  selector: 'at-layout-navigation-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavbarComponent {
  @Input() pages: any;

  constructor() {}
}
