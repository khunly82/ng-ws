import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { sessionStart } from '../../store/session.state';
import { jwtDecode } from 'jwt-decode';

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
    private readonly _messageService: MessageService,
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
        this._store.dispatch(sessionStart({ token: response.token, username: decoded.username }));
      },
      error: err => {
        this._messageService.add({ severity: 'error', summary: 'Bad credentials' });
      }
    });
  }
}
