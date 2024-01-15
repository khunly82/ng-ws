import { createAction, createReducer, createSelector, on, props } from "@ngrx/store";
import { UserModel } from "../models/user.model";
import { SessionState, sessionStop } from "./session.state";
import { MessageModel } from "../models/message.model";

export const loadConnectedUsers = createAction('socket/loadConnectedUsers', props<{ users: UserModel[] }>());
export const loadKnownUsers = createAction('socket/loadKnownUsers', props<{ users: UserModel[] }>());
export const setIsTyping = createAction('socket/setIsTyping', props<{ from: string, isTyping: boolean }>());
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
      connectedUsers: payload.users.map(u => ({
        ...u, 
        isConnected: true, 
        isTyping: state.knownUsers.find(ku => u.id === ku.id)?.isTyping ?? false
      }))
    }
  }),
  on(loadKnownUsers, (state, payload) => {
    return {
      ...state,
      knownUsers: payload.users.map(u => ({...u, isConnected: false, isTyping: false}))
    }
  }),
  on(setIsTyping, (state, payload) => {
    let user = state.knownUsers.find(u => u.id === payload.from);
    if(user) {
      user = {...user, isTyping: payload.isTyping};
    }
    return {
      ...state,
      knownUsers: state.knownUsers.map(u => u.id === user?.id ? user : u)
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

    // si on a déjà chargé la conversation
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

export const selectOtherUsers = createSelector(
  (state: any) => state.socket, 
  (state: any) => state.session, 
  (socket: SocketState, session: SessionState) => [
      ...socket.knownUsers.map(u => ({
        ...u,
        isConnected: socket.connectedUsers.some(cu => cu.id === u.id)
      })),
      ...socket.connectedUsers.filter(u => socket.knownUsers.every(o => o.id !== u.id))
    ].filter(u => u.id !== session.id)
);

export const selectSortedOtherUsers = createSelector(
  selectOtherUsers,
  (users: UserModel[]) => 
    users.sort((u1, u2) => {
      if(u1.isConnected !== u2.isConnected) {
        return u1.isConnected ? -1 : 1;
      }
      return u1.username.localeCompare(u2.username)
    })
);

export const selectUser = (id: string) => createSelector(
  selectOtherUsers,
  (users: UserModel[]) => users.find(u => u.id === id)
);

export const selectConversation = (id: string) => createSelector(
  (state: any) => state.socket,
  (socket: SocketState) => socket.conversations[id]
);