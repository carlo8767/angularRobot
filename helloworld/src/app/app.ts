import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  sender: 'User' | 'Bot';
  text: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('helloworld');

  // Signal for chat messages
  messages = signal<Message[]>([]);
  userInput = signal('');

  // Your backend chatbot endpoint
  private backendUrl = 'http://localhost:8080/helloAI/hello';

  constructor(private http: HttpClient) {}

  sendMessage() {
    const query = this.userInput();
    if (!query.trim()) return;

    // Add user message
    this.messages.set([...this.messages(), { sender: 'User', text: query }]);
    this.userInput.set('');

    // Prepare GET request with correct query param
    const params = new HttpParams().set('message', query); // <-- change here

   this.http.get<{ reply: string }>(this.backendUrl, { params })
  .subscribe({
    next: (response) => {
      let formattedReply = response.reply;

      // Example: replace newlines with <br> for multi-line
      formattedReply = formattedReply.replace(/\n/g, '<br>');

      this.messages.set([...this.messages(), { sender: 'Bot', text: formattedReply }]);

      // Auto-scroll
      setTimeout(() => {
        const chatBox = document.querySelector('.chat-box');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      }, 50);
    },
    error: (err) => {
      console.error('Chatbot request error:', err);
      this.messages.set([...this.messages(), { sender: 'Bot', text: 'Error contacting chatbot' }]);
    }
  });
  }
}
