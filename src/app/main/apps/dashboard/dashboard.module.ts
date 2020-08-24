// outer
import { NgModule } from '@angular/core';
// inner
import { SharedMaterialModule, SharedOtherModule, CardModule, DemoModule } from '@common';
import { SharedModule } from '@app/shared';
//
import { DashboardRouting } from './dashboard.routing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
// end

@NgModule({
  imports: [
    //
    DashboardRouting,
    //
    SharedMaterialModule,
    SharedOtherModule,
    CardModule,
    DemoModule,
    //
    SharedModule
  ],
  declarations: [
    DashboardComponent,
  ],
  providers: [DashboardService]
})
export class DashboardModule {}
