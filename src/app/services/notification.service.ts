import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private infoAudio = new Audio('/assets/sound/info.mp3');
  private successAudio = new Audio('/assets/sound/success.mp3');
  private errorAudio = new Audio('/assets/sound/error.mp3');

  constructor(
    private readonly _messageService: MessageService
  ) { }

  info(summary: string, detail?: string, beep?: boolean) {
    this._messageService.add({ severity: 'info', summary, detail });
    if(beep) {
      this.infoAudio.play();
    }
  }

  error(summary: string, detail?: string, beep?: boolean) {
    this._messageService.add({ severity: 'error', summary, detail });
    if(beep) {
      this.errorAudio.play();
    }
  }

  success(summary: string, detail?: string, beep?: boolean) {
    this._messageService.add({ severity: 'success', summary, detail });
    if(beep) {
      this.successAudio.play();
    }
  }
}
