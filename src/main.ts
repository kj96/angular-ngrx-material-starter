// outer
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// inner
import { AppModule } from '@app/app.module';
import { environment } from '@env/environment';
// end

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);
bootstrap().catch((err) => console.log(err));
