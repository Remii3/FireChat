"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "./ui/button";
import { User } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { useAtom } from "jotai";
import { selectedUserAtom } from "@/context/atom";
import AllUsers from "./UsersList/AllUsers";

type UserChatCardProps = {
  user: User;
  onClick: (uid: string, userData: User) => void;
};

const addFriend = async (uid: string, user: User) => {
  await updateDoc(doc(firestore, "users", user.uid), {
    friends: arrayUnion(uid),
  });

  return null;
};

const fetchusers = async ({
  userFriendsList,
}: {
  userFriendsList: string[] | null;
}): Promise<User[]> => {
  const usersColection = collection(firestore, "users");
  let q = query(usersColection, where("uid", "!=", auth.currentUser!.uid));
  if (userFriendsList && userFriendsList.length === 0) return [];
  if (userFriendsList) {
    q = query(
      usersColection,
      where("uid", "!=", auth.currentUser!.uid),
      where("uid", "in", userFriendsList)
    );
  }
  const usersSnapshot = await getDocs(q);

  return usersSnapshot.docs.map((userSnap) => ({
    id: userSnap.id,
    displayName: userSnap.data().displayName,
    email: userSnap.data().email,
    photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
    uid: userSnap.data().uid,
    friends: userSnap.data().friends,
  }));
};

const FriendsBubble = ({ user, onClick }: UserChatCardProps) => {
  return (
    <button
      key={user.id}
      onClick={() => onClick(user.id, user)}
      type="button"
      className="last:mr-4"
      aria-label="Select user to chat with"
    >
      <Avatar>
        <AvatarImage src={user.photoURL} alt="Profile" />
        <AvatarFallback className="sr-only">{user.displayName}</AvatarFallback>
      </Avatar>
    </button>
  );
};

const FriendsListPart = ({ user, onClick }: UserChatCardProps) => {
  return (
    <Button
      className="h-auto w-full justify-start gap-3 font-normal"
      onClick={() => onClick(user.id, user)}
      variant={"ghost"}
      key={user.id}
    >
      <Image
        className="rounded-full aspect-square"
        src={user.photoURL}
        alt={user.displayName}
        height={40}
        width={40}
      />
      <span>{user.displayName}</span>
    </Button>
  );
};

function FriendsListSection({ user }: { user: User }) {
  const [selectedSidebar, setSelectedSidebar] = useState<
    "myFriends" | "allUsers"
  >("myFriends");
  const clientQuery = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: errorUsers,
    isFetching,
  } = useQuery({
    queryKey: ["users", selectedSidebar],
    queryFn: () =>
      fetchusers({
        userFriendsList: selectedSidebar === "myFriends" ? user.friends : null,
      }),
  });
  const { mutate } = useMutation({
    mutationKey: ["addFriend"],
    mutationFn: ({ uid }: { uid: string }) => addFriend(uid, user),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: ["user"] });
      clientQuery.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [_, setSelectedUser] = useAtom(selectedUserAtom);

  const changeCurrentChat = (uid: string, userData: User) => {
    if (!userData.friends || !userData.friends.includes(user.uid)) {
      mutate({ uid });
    }
    clientQuery.invalidateQueries({ queryKey: ["messages"] });
    setSelectedUser(userData);
  };

  const closeSheet = (uid: string, userData: User) => {
    changeCurrentChat(uid, userData);
    setIsOpen(false);
  };

  return (
    <div className="w-full sm:max-w-64 p-2 sm:h-full rounded-xl bg-white shadow-sm">
      <AllUsers />
      <div className="hidden sm:block">
        <div className="w-full flex mb-4">
          <Button
            variant={"outline"}
            onClick={() => setSelectedSidebar("myFriends")}
            className={`${
              selectedSidebar === "myFriends" && "bg-muted"
            } rounded-r-none w-full`}
          >
            My friends
          </Button>
          <Button
            onClick={() => setSelectedSidebar("allUsers")}
            variant={"outline"}
            className={`${
              selectedSidebar === "allUsers" && "bg-muted"
            } rounded-l-none w-full`}
          >
            All users
          </Button>
        </div>

        <div className="flex flex-col gap-2 items-start justify-start">
          {isLoadingUsers &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 w-full flex gap-3 justify-start items-center py-2 px-4"
              >
                <Skeleton className="h-10 w-10 aspect-square rounded-full bg-muted-foreground/10"></Skeleton>
                <Skeleton className="h-5 w-12 bg-muted-foreground/10"></Skeleton>
              </Skeleton>
            ))}
          {!isLoadingUsers && errorUsers && <p>Error loading users</p>}
          {!isLoadingUsers &&
            users &&
            users.length > 0 &&
            users.map((user) => (
              <FriendsListPart
                key={user.id}
                onClick={() => changeCurrentChat(user.uid, user)}
                user={user}
              />
            ))}
          {users && users.length === 0 && !isFetching && <p>No friends</p>}
        </div>
      </div>

      <div className="sm:hidden">
        <div className="flex items-center gap-4">
          {isLoadingUsers &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-12 w-12 shrink-0 rounded-full"
              ></Skeleton>
            ))}
          {users && !isLoadingUsers && (
            <>
              <Sheet open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
                <SheetTrigger>
                  <Avatar className="bg-zinc-100">
                    <div className="aspect-square flex items-center justify-center h-full w-full">
                      <Menu className="h-7 w-7" />
                    </div>
                  </Avatar>
                </SheetTrigger>

                <SheetContent side={"left"}>
                  <div className="flex flex-col gap-3 items-start justify-start pt-6 pr-6">
                    {users.map((user) => (
                      <FriendsListPart
                        key={user.id}
                        onClick={(e) => closeSheet(e, user)}
                        user={user}
                      />
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <div className="overflow-x-auto space-x-4 flex">
                {users.map((user) => (
                  <FriendsBubble
                    key={user.id}
                    user={user}
                    onClick={(e) => changeCurrentChat(e, user)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendsListSection;
