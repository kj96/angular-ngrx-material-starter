// outer
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// inner
// end

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class AppsRouting {}
