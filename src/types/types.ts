import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type MessageType = {
  [e: string]: any;
  text: string;
  photoURL: string;
  recipientId: string;
  senderId: string;
  createdAt: any;
  uid: string;
  unread: boolean;
};

export type InfiniteMessages = {
  messagesData: MessageType[];
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
};
