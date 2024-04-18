import { InfiniteData } from "@tanstack/react-query";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type User = {
  [e: string]: any;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  friends: string[];
  isOnline: boolean;
  latestMessages: Record<
    string,
    {
      senderId: string;
      unread: boolean;
      text: string;
    }
  >;
};
export type SidebarTypes = "usersAll" | "usersFriends";
export type InfiniteUsersPages =
  | InfiniteData<InfiniteUsers, unknown>
  | undefined;

export type InfiniteUsers = {
  usersData: User[];
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
};

export type UsersListTypes = {
  usersPages: InfiniteUsersPages;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  clickHandler: (selectedUser: User) => void;
};
