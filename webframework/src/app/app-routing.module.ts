import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { redirectLoggedInTo, redirectUnauthorizedTo, AuthGuard } from '@angular/fire/auth-guard';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MapComponent } from './components/map/map.component';
import { MyTravelsComponent } from './pages/my-travels/my-travels.component';
import { EditTravelsComponent } from './pages/edit-travels/edit-travels.component';

const routes: Routes = [

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
