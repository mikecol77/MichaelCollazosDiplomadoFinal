// frontend/src/main.ts
import 'zone.js'; // <- Asegura zone.js (requerido si NO es una app zoneless)
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
