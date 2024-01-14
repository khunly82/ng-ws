import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private readonly _http: HttpClient
  ) { }

  getKnownUsers() {
    return this._http.get<UserModel[]>('http://localhost:3000/users');
  }
}
