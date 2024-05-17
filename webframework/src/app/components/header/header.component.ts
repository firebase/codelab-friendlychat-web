import { Component, inject } from '@angular/core';
import { TravelService } from '../../services/travel.service';
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

}
