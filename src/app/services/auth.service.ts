import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private readonly _http: HttpClient
  ) { }

  login(form: { username:string, password: string }) {
    return this._http.post<{ token: string }>('http://localhost:3000/login', form);
  }
}
