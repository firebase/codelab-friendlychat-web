import { Component, inject } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: true,
})
export class LoginPageComponent {
  chatService = inject(ChatService);
  user$ = this.chatService.user$;
}
