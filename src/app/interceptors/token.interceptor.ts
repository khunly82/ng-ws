import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, switchMap } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  return store.select(state => state.session.token)
    .pipe(first(), switchMap(token => {
      if(token) {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
      return next(req);  
    })
  );
};
