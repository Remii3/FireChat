export type User = {
  [e: string]: any;
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  friends: string[];
};

export type MessageType = {
  [e: string]: any;
  id: string;
  text: string;
  photoURL: string;
  recipientId: string;
  senderId: string;
  createdAt: any;
  uid: string;
};
