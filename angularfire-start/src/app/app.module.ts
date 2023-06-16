import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import {
  provideFirestore,
  getFirestore,
  connectFirestoreEmulator,
} from '@angular/fire/firestore';
import {
  provideFunctions,
  getFunctions,
  connectFunctionsEmulator,
} from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import {
  provideStorage,
  getStorage,
  connectStorageEmulator,
} from '@angular/fire/storage';
import {
  ReCaptchaEnterpriseProvider,
  initializeAppCheck,
  provideAppCheck,
} from '@angular/fire/app-check';

import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    ChatPageComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (location.hostname === 'localhost') {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (location.hostname === 'localhost') {
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      }
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (location.hostname === 'localhost') {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      }
      return functions;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (location.hostname === 'localhost') {
        connectStorageEmulator(storage, '127.0.0.1', 5001);
      }
      return storage;
    }),
    provideMessaging(() => {
      return getMessaging();
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
