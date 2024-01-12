import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, map, tap } from "rxjs";

export const IsLoggedGuard: CanActivateFn = (route, state) => {

  const store = inject(Store);
  const router = inject(Router);
  const token$: Observable<string|null> = store.select(({ session }) => session.token);

  return token$.pipe(
    // tranformer un obs en un autre obs
    map(token => !!token),
    // exécuter qq chose en plus sur le resulat de l'ob-
    tap(isConnected => {
      if(!isConnected) {
        router.navigate(['/login']);
      }
    })
  );
}