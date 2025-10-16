import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [AsyncPipe],
})
export class HeaderComponent {
  chatService = inject(ChatService);
  user$ = this.chatService.user$;
}
