// outer
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// inner
// end

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class AppsRouting {}
