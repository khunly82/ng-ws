import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { SessionState, sessionStop } from '../../store/session.state';
import { ButtonModule } from 'primeng/button';
import { SocketService } from '../../services/socket.service';
import { SocketState, selectSortedOtherUsers } from '../../store/socket.state';
import { UserModel } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  username: string|null = null;
  users: UserModel[] = [];
  menuOpen: boolean = true;

  constructor(
    private readonly _store: Store<{ session: SessionState, socket: SocketState }>,
    private readonly _router: Router,
    private readonly _socketService: SocketService,
  ) { }

  ngOnInit(): void {
    this._store.select((state) => state.session).subscribe(s => {
      this.username = s.username;
      if(!s.token) {
        this._router.navigate(['/login']);
      }
    })
    this._store.select(selectSortedOtherUsers).subscribe((users) => {
      this.users = users
    });
  }

  logout() {
    this._store.dispatch(sessionStop());
  }
}
