"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  DocumentData,
  QueryDocumentSnapshot,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "./ui/button";
import { InfiniteUsers, SidebarTypes, User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { useAtom } from "jotai";
import { selectedUserAtom } from "@/context/atom";
import AllUsers from "./UsersList/AllUsers";
import FriendsUsers from "./UsersList/FriendsUsers";
import BubbleMyFriends from "./UsersList/BubbleMyFriends";
import ListSelector from "./UsersList/ListSelector";

const fetchUsersAll = async ({
  pageParam,
}: {
  pageParam: number;
}): Promise<InfiniteUsers> => {
  const usersCollection = collection(firestore, "users");
  let q = query(usersCollection, where("uid", "!=", auth.currentUser!.uid));
  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }
  q = query(q, limit(15));

  const usersSnapshot = await getDocs(q);

  const lastDoc =
    usersSnapshot.docs.length > 0
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1]
      : null;

  const usersData = usersSnapshot.docs.map((userSnap) => ({
    displayName: userSnap.data().displayName,
    email: userSnap.data().email,
    photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
    uid: userSnap.data().uid,
    friends: userSnap.data().friends,
  }));
  return { usersData, lastDoc };
};

const addFriend = async ({
  selectedUserId,
  loggedInUserId,
}: {
  selectedUserId: string;
  loggedInUserId: string;
}) => {
  await updateDoc(doc(firestore, "users", loggedInUserId), {
    friends: arrayUnion(selectedUserId),
  });

  return null;
};

const fetchUsersFriends = async ({
  pageParam,
  userFriendsList,
}: {
  userFriendsList: string[] | null;
  pageParam: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}): Promise<InfiniteUsers> => {
  const usersColection = collection(firestore, "users");
  let q = query(usersColection, where("uid", "!=", auth.currentUser!.uid));
  if (userFriendsList && userFriendsList.length === 0)
    return { usersData: [], lastDoc: null };
  if (userFriendsList) {
    q = query(
      usersColection,
      where("uid", "!=", auth.currentUser!.uid),
      where("uid", "in", userFriendsList)
    );
  }
  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }
  const usersSnapshot = await getDocs(q);

  const lastDoc =
    usersSnapshot.docs.length > 0
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1]
      : null;

  const usersData = usersSnapshot.docs.map((userSnap) => ({
    id: userSnap.id,
    displayName: userSnap.data().displayName,
    email: userSnap.data().email,
    photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
    uid: userSnap.data().uid,
    friends: userSnap.data().friends,
  }));
  return { usersData, lastDoc };
};

function FriendsListSection({ user }: { user: User }) {
  const {
    data: usersAllPages,
    fetchNextPage: fetchNextUsersAllPage,
    hasNextPage: hasNextUsersAllPage,
    isFetchingNextPage: isFetchingNextUsersAllPage,
  } = useInfiniteQuery({
    queryKey: ["usersAll"],
    queryFn: fetchUsersAll,
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteUsers) => {
      if (lastPage && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return null;
    },
  });

  const {
    data: usersFriendsPages,
    fetchNextPage: fetchNextUsersFriendsPage,
    hasNextPage: hasNextUsersFriendsPage,
    isFetchingNextPage: isFetchingNextUsersFriendsPage,
  } = useInfiniteQuery({
    queryKey: ["usersFriends"],
    queryFn: ({ pageParam }) =>
      fetchUsersFriends({ pageParam, userFriendsList: user.friends }),
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteUsers) => {
      if (lastPage && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return null;
    },
  });

  const [selectedSidebar, setSelectedSidebar] = useState<
    "usersFriends" | "usersAll"
  >("usersFriends");
  const clientQuery = useQueryClient();

  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  const changeSelectedSidebar = (selected: SidebarTypes) => {
    setSelectedSidebar(selected);
  };

  const toggleSheetIsOpen = (state: boolean) => {
    setSheetIsOpen(state);
  };

  const { mutate: addFriendMutation } = useMutation({
    mutationKey: ["addFriend"],
    mutationFn: ({ selectedUserId }: { selectedUserId: string }) =>
      addFriend({ selectedUserId, loggedInUserId: user.uid }),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: ["user"] });
      clientQuery.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [_, setSelectedUser] = useAtom(selectedUserAtom);

  const changeCurrentChat = async (selectedUser: User) => {
    if (!user.friends || !user.friends.includes(selectedUser.uid)) {
      addFriendMutation({ selectedUserId: selectedUser.uid });
      clientQuery.invalidateQueries({ queryKey: ["user"] });
      clientQuery.invalidateQueries({ queryKey: ["usersFriends"] });
    }
    clientQuery.invalidateQueries({ queryKey: ["messages"] });
    setSelectedUser(selectedUser);
  };

  const closeSheet = (selectedUser: User) => {
    changeCurrentChat(selectedUser);
    setSheetIsOpen(false);
  };

  return (
    <div className="w-full sm:max-w-64 p-2 sm:h-full rounded-xl bg-white shadow-sm">
      <div className="hidden sm:block">
        <ListSelector
          selectedSidebar={selectedSidebar}
          changeSelectedSidebar={changeSelectedSidebar}
        />

        <div className="flex flex-col gap-2 items-start justify-start">
          {selectedSidebar === "usersFriends" ? (
            <FriendsUsers
              fetchNextPage={fetchNextUsersFriendsPage}
              hasNextPage={hasNextUsersFriendsPage}
              isFetchingNextPage={isFetchingNextUsersFriendsPage}
              usersPages={usersFriendsPages}
              clickHandler={changeCurrentChat}
            />
          ) : (
            <AllUsers
              fetchNextPage={fetchNextUsersAllPage}
              hasNextPage={hasNextUsersAllPage}
              isFetchingNextPage={isFetchingNextUsersAllPage}
              usersPages={usersAllPages}
              clickHandler={changeCurrentChat}
            />
          )}
        </div>
      </div>

      <div className="sm:hidden">
        <div className="flex items-center gap-4">
          <Sheet open={sheetIsOpen} onOpenChange={(e) => toggleSheetIsOpen(e)}>
            <SheetTrigger>
              <Avatar className="bg-zinc-100">
                <div className="aspect-square flex items-center justify-center h-full w-full">
                  <Menu className="h-7 w-7" />
                </div>
              </Avatar>
            </SheetTrigger>

            <SheetContent side={"left"}>
              <div className="flex flex-col gap-3 items-start justify-start pt-6 pr-6">
                <ListSelector
                  selectedSidebar={selectedSidebar}
                  changeSelectedSidebar={changeSelectedSidebar}
                />
                {selectedSidebar === "usersFriends" ? (
                  <FriendsUsers
                    fetchNextPage={fetchNextUsersFriendsPage}
                    hasNextPage={hasNextUsersFriendsPage}
                    isFetchingNextPage={isFetchingNextUsersFriendsPage}
                    usersPages={usersFriendsPages}
                    clickHandler={closeSheet}
                  />
                ) : (
                  <AllUsers
                    fetchNextPage={fetchNextUsersAllPage}
                    hasNextPage={hasNextUsersAllPage}
                    isFetchingNextPage={isFetchingNextUsersAllPage}
                    usersPages={usersAllPages}
                    clickHandler={closeSheet}
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>
          <BubbleMyFriends
            users={usersFriendsPages?.pages[0].usersData}
            clickHandler={changeCurrentChat}
          />
        </div>
      </div>
    </div>
  );
}

export default FriendsListSection;
