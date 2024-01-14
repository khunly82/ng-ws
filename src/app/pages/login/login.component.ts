import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { sessionStart } from '../../store/session.state';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  fg!: FormGroup
  loading: boolean = false;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notificationService: NotificationService,
    private readonly _router: Router,
    private readonly _store: Store,
  ) {}

  ngOnInit(): void {
    this.fg = this._fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  submit() {
    if(this.fg.invalid) {
      return;
    }
    this.loading = true;
    this._authService.login(this.fg.value).pipe(finalize(() => {
      this.loading = false;
    })).subscribe({
      next: response => {
        this._router.navigate(['/']);
        const decoded: any = jwtDecode(response.token);
        this._store.dispatch(sessionStart({ token: response.token, ...decoded }));
      },
      error: _ => {
        this._notificationService.error('Bad credentials');
      }
    });
  }
}
