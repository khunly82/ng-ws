import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SessionState, sessionStop } from '../../store/session.state';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  constructor(
    private readonly _store: Store<{ session: SessionState }>,
    private readonly _router: Router,
  ) { }

  ngOnInit(): void {
    this._store.select((state) => state.session).subscribe(s => {
      if(!s.token) {
        this._router.navigate(['/login']);
      }
    })
  }

  logout() {
    this._store.dispatch(sessionStop());
  }
}
