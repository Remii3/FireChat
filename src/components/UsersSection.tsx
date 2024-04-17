"use client";

import React, { useEffect, useState } from "react";
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
import { InfiniteUsers, SidebarTypes, User } from "@/types/user";
import { Avatar } from "./ui/avatar";
import { Menu } from "lucide-react";
import { useAtom } from "jotai";
import { selectedUserAtom } from "@/context/atom";
import AllUsers from "./UsersList/AllUsers";
import FriendsUsers from "./UsersList/FriendsUsers";
import BubbleMyFriends from "./UsersList/BubbleMyFriends";
import ListSelector from "./UsersList/ListSelector";

const fetchUsersAll = async ({
  pageParam,
}: {
  pageParam: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
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
    isOnline: userSnap.data().isOnline,
  }));
  return { usersData, lastDoc };
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
    isOnline: userSnap.data().isOnline,
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

function UsersSection({ user }: { user: User }) {
  const {
    data: usersAllPages,
    fetchNextPage: fetchNextUsersAllPage,
    hasNextPage: hasNextUsersAllPage,
    isFetchingNextPage: isFetchingNextUsersAllPage,
  } = useInfiniteQuery({
    queryKey: ["usersAll"],
    queryFn: ({ pageParam }) => fetchUsersAll({ pageParam }),
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
    onSuccess: async () => {
      await clientQuery.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const [_, setSelectedUser] = useAtom(selectedUserAtom);

  const changeCurrentChat = async (selectedUser: User) => {
    if (!user.friends || !user.friends.includes(selectedUser.uid)) {
      addFriendMutation({ selectedUserId: selectedUser.uid });
    }
    setSelectedUser(selectedUser);
  };

  const closeSheet = (selectedUser: User) => {
    changeCurrentChat(selectedUser);
    setSheetIsOpen(false);
  };

  useEffect(() => {
    clientQuery.invalidateQueries({ queryKey: ["usersFriends"] });
  }, [clientQuery, user.friends]);

  return (
    <div className="w-full sm:max-w-64 p-2 sm:h-full rounded-xl bg-white shadow-sm">
      <div className="hidden sm:block">
        <ListSelector
          selectedSidebar={selectedSidebar}
          changeSelectedSidebar={changeSelectedSidebar}
        />

        <div className="flex flex-col gap-2 items-stretch justify-start">
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
              <div className="flex flex-col gap-3 items-stretch justify-start pt-6 pr-6">
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

export default UsersSection;
