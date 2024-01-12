import { createAction, createReducer, on, props } from "@ngrx/store";

export interface SessionState {
  token: string|null;
  username: string |null;
}

// les actions sont écoutées par le store et permmetent de declencher un ou plusieurs reducer
export const sessionStart = createAction('session/start', props<{ token: string, username: string }>());
export const sessionStop = createAction('session/stop');

const initialState: SessionState = { token: null, username: null };


// reducers
// les reducers modifient une partie du store
export const sessionReducer = createReducer(
  initialState,
  on(sessionStart, (state, payload) => {
    return payload;
  }),
  on(sessionStop, () => {
    return initialState;
  }),
);