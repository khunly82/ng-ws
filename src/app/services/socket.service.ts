import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import { SessionState, sessionStop } from '../store/session.state';
import { loadConnectedUsers, newMessage, setIsTyping } from '../store/socket.state';
import { UserModel } from '../models/user.model';
import { NotificationService } from './notification.service';
import { MessageModel } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  _socket: Socket|undefined;

  constructor(
    private readonly _store: Store<{session: SessionState}>,
    private readonly _notificationService: NotificationService,
  ) { 
    _store.select(state => state.session).subscribe(session => {
      this.closeSocket();
      if(session.token) {
        this.createSocket(session.token);
      } 
    })
  } 

  sendMessage(otherId: string, message: string) {
    this._socket?.emit('sendMessage', {
      message, 
      to: otherId, 
      date: new Date()
    });
  }

  notifyIsTyping(to: string, isTyping: boolean) {
    this._socket?.emit('notifyIsTyping', {
      to, 
      isTyping,
    });
  }

  private createSocket(token: string) {
    this._socket = new Socket({ 
      url: 'http://localhost:3000', 
      options: { transports: ['websocket'], path: '/ws', auth: cb => cb({ token }) } 
    });

    this._socket.fromEvent<string>('info').subscribe((message: any) => {
      this._notificationService.info(message);
    });

    this._socket.fromEvent<string>('error').subscribe((message: any) => {
      this._notificationService.error('Erreur', message, true);
    });

    this._socket.fromEvent<string>('connect_error').subscribe((message: any) => {
      this._notificationService.error('Erreur', message, true);
      this.closeSocket();
      this._store.dispatch(sessionStop());
    });

    this._socket.fromEvent<UserModel[]>('connectedUsers').subscribe(users => {
      this._store.dispatch(loadConnectedUsers({ users }));
    });

    this._socket.fromEvent<MessageModel>('newMessage').subscribe(message => {
      if(!message.isSender) {
        this._notificationService.info(`Nouveau message de ${message.from.username}`, message.message, true);
      }
      this._store.dispatch(newMessage({message}));
    });

    this._socket.fromEvent<{ from: string, isTyping: boolean }>('isTyping').subscribe(data => {
      this._store.dispatch(setIsTyping(data));
    });
  }

  private closeSocket() {
    this._socket?.disconnect();
    this._socket = undefined;
  }

}
