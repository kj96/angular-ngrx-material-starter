// outer
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// inner
import { DashboardComponent } from './dashboard.component';
// end

const routes: Routes = [
  {
    path: '**',
    component: DashboardComponent,
    data: {
      breadcrumb: {
        name: 'Dashboard',
        icon: 'dashboard'
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class DashboardRouting {}
