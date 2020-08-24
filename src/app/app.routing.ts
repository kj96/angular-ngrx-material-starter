// outer
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// inner
// end

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'apps/dashboard'
  },
  {
    path: 'apps',
    loadChildren: () => import('./main/apps/apps.module').then((m) => m.AppsModule)
  },
  {
    path: 'static',
    loadChildren: () => import('./main/static/static.module').then((m) => m.StaticModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: []
})
export class AppRouting {
}
