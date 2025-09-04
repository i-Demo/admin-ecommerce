import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import localeEnPrime from 'primelocale/en.json';
import localeEn from '@angular/common/locales/en';
import localeVi from '@angular/common/locales/vi';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEn, 'en');
registerLocaleData(localeVi, 'vi');

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideTranslateService({
            lang: 'en',
            fallbackLang: 'en',
            loader: provideTranslateHttpLoader({
                prefix: "./assets/i18n/",
                suffix: ".json"
            }),
        }),
        provideAnimationsAsync(),
        MessageService,
        providePrimeNG({
            translation: localeEnPrime.en,
            theme: {
                preset: Aura,
            },
        }),
    ]
};
