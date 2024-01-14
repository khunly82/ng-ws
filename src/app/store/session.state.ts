import { createAction, createReducer, on, props } from "@ngrx/store";

export interface SessionState {
  token: string|null;
  username: string|null;
  id: string|null;
}

// les actions sont écoutées par le store et permmetent de declencher un ou plusieurs reducer
export const sessionStart = createAction('session/start', props<SessionState>());
export const sessionStop = createAction('session/stop');

const initialState: SessionState = { token: null, username: null, id: null };


// reducers
// les reducers modifient une partie du store
export const sessionReducer = createReducer(
  initialState,
  on(sessionStart, (_, payload) => payload),
  on(sessionStop, () => initialState),
);