import { createAction, createReducer, createSelector, on, props } from "@ngrx/store";
import { UserModel } from "../models/user.model";
import { SessionState, sessionStop } from "./session.state";
import { MessageModel } from "../models/message.model";

export const loadConnectedUsers = createAction('socket/loadConnectedUsers', props<{ users: UserModel[] }>());
export const loadKnownUsers = createAction('socket/loadKnownUsers', props<{ users: UserModel[] }>());
export const loadUsers = createAction('socket/loadUsers', props<{ users: UserModel[] }>());
export const loadConversation = createAction('socket/loadConversation', props<{ user: string, messages: MessageModel[] }>());
export const newMessage = createAction('socket/newMessage', props<{ message: MessageModel }>());

export interface SocketState {
  connectedUsers: UserModel[],
  knownUsers: UserModel[],
  conversations: {[key: string]: MessageModel[]}, 
}

const initialValue: SocketState = {
  connectedUsers: [],
  knownUsers: [],
  conversations: {},
}

export const socketReducer = createReducer(
  initialValue,
  on(loadConnectedUsers, (state, payload) => {
    return {
      ...state,
      connectedUsers: payload.users.map(u => ({...u, isConnected: true}))
    }
  }),
  on(loadKnownUsers, (state, payload) => {
    return {
      ...state,
      knownUsers: payload.users.map(u => ({...u, isConnected: false}))
    }
  }),
  on(loadConversation, (state, payload) => {
    const conversations = {...state.conversations};
    conversations[payload.user] = payload.messages;
    return {
      ...state,
      conversations: conversations
    }
  }),
  on(newMessage, (state, payload) => {
    const conversations = {...state.conversations};
    const other = payload.message.isSender ? payload.message.to : payload.message.from;
    let conversation = conversations[other.id];
    let knownUsers = state.knownUsers;
    
    // si on a jamais communiqué avec l'utilisateur
    if(knownUsers.every(u => u.id !== other.id)) {
      // on ajoute l'utilisateur dans sa liste
      knownUsers = [...state.knownUsers, other]
    }

    // si on a déjà charger la conversation
    if(conversation) {
      // on ajoute le message à la conversation
      conversation = [...conversation, payload.message];
      conversations[other.id] = conversation;
    }
    
    return {
      ...state,
      knownUsers: knownUsers,
      conversations: conversations,
    }
  }),
  on(sessionStop, () => initialValue)
);

export const selectSortedOtherUsers = createSelector(
  (state: any) => state.socket, 
  (state: any) => state.session, 
  (socket: SocketState, session: SessionState) => [
      ...socket.knownUsers.map(u => ({
        ...u,
        isConnected: socket.connectedUsers.some(cu => cu.id === u.id)
      })),
      ...socket.connectedUsers.filter(u => socket.knownUsers.every(o => o.id !== u.id))
    ].filter(u => u.id !== session.id)
    .sort((u1, u2) => {
      if(u1.isConnected !== u2.isConnected) {
        return u1.isConnected ? -1 : 1;
      }
      return u1.username.localeCompare(u2.username)
    })
  );

export const selectConversation = (id: string) => createSelector(
  (state: any) => state.socket,
  (socket: SocketState) => socket.conversations[id]
);