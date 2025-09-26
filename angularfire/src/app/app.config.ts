import { getApp } from '@angular/fire/app';
import {
  ReCaptchaEnterpriseProvider,
  initializeAppCheck,
  provideAppCheck,
} from '@angular/fire/app-check';
import { ApplicationConfig } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';

declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

  

    // Firebase Modules (Auth, Firestore, Functions, Storage, Messaging)
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging()),
    provideAppCheck(() => {
      const appCheck = initializeAppCheck(getApp(), {
        provider: new ReCaptchaEnterpriseProvider(
          environment.reCAPTCHAEnterpriseKey.key
        ),
        isTokenAutoRefreshEnabled: true,
      });
      if (location.hostname === 'localhost') {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      return appCheck;
    }),
      // Firebase Initialization
    provideFirebaseApp(() => initializeApp(environment.firebase)),
  ],
};
