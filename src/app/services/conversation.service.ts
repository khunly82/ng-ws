import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageModel } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  constructor(
    private readonly _http: HttpClient
  ) { }

  getByOtherId(id: number) {
    return this._http.get<MessageModel[]>('http://localhost:3000/message', {params: {
      otherId: id
    }});
  }
}
