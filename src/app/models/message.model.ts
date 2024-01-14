import { UserModel } from "./user.model";

export interface MessageModel {
  id: number;
  message: string;
  from: UserModel;
  to: UserModel;
  date: Date;
  isSender: boolean;
}