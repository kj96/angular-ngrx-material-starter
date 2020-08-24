// outer
import { NgModule } from '@angular/core';
// inner
import { RoboHighlightComponent } from './highlight.component';
// end

@NgModule({
  declarations: [
    RoboHighlightComponent
  ],
  exports: [
    RoboHighlightComponent
  ]
})
export class HighlightModule {
}
