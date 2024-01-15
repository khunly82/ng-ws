import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ActionReducer, MetaReducer, provideStore } from '@ngrx/store';
import { sessionReducer } from './store/session.state';
import { localStorageSync } from 'ngrx-store-localstorage';
import { socketReducer } from './store/socket.state';
import { tokenInterceptor } from './interceptors/token.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';


export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['session'], rehydrate: true})(reducer);
}
const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

export const appConfig: ApplicationConfig = {
  providers: [  
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideStore({ session: sessionReducer, socket: socketReducer }, {metaReducers}),
    provideStoreDevtools({ maxAge: 25 }),
    MessageService,
]
};
