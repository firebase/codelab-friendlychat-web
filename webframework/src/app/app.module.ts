import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatCardModule} from '@angular/material/card'; 
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MapComponent } from './components/map/map.component';
import { MatRadioModule } from '@angular/material/radio';
import { HeaderComponent } from './components/header/header.component';
import { MyTravelsComponent } from './pages/my-travels/my-travels.component';
import { EditTravelsComponent } from './pages/edit-travels/edit-travels.component';
import { EditStopComponent } from './edit-stop/edit-stop.component';
import { EditTravelComponent } from './edit-travel/edit-travel.component';

import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';





@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    MapComponent,
    HeaderComponent,
    MyTravelsComponent,
    EditTravelsComponent,
    EditStopComponent,
    EditTravelComponent,
  ],
  imports: [
    MatCardModule,
    MatRadioModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    MatGridListModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
