"use client";

import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarTypes, User } from "@/types/user";
import { Avatar } from "./ui/avatar";
import { Menu } from "lucide-react";
import { useAtom } from "jotai";
import { selectedUserAtom } from "@/context/atom";
import UsersList from "./UsersList/UsersList";
import BubbleMyFriends from "./UsersList/BubbleMyFriends";
import ListSelector from "./UsersList/ListSelector";
import {
  useAddUserFriend,
  useFetchUsers,
  useFetchUsersFriends,
} from "@/hooks/useUsers";

function UsersSection({ user }: { user: User }) {
  const {
    data: usersAllPages,
    fetchNextPage: fetchNextUsersAllPage,
    hasNextPage: hasNextUsersAllPage,
    isFetchingNextPage: isFetchingNextUsersAllPage,
  } = useFetchUsers();
  const {
    data: usersFriendsPages,
    fetchNextPage: fetchNextUsersFriendsPage,
    hasNextPage: hasNextUsersFriendsPage,
    isFetchingNextPage: isFetchingNextUsersFriendsPage,
  } = useFetchUsersFriends(user);

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

  const { mutate: addFriendMutation } = useAddUserFriend({ user: user });

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
            <UsersList
              fetchNextPage={fetchNextUsersFriendsPage}
              hasNextPage={hasNextUsersFriendsPage}
              isFetchingNextPage={isFetchingNextUsersFriendsPage}
              usersPages={usersFriendsPages}
              clickHandler={changeCurrentChat}
            />
          ) : (
            <UsersList
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
                  <UsersList
                    fetchNextPage={fetchNextUsersFriendsPage}
                    hasNextPage={hasNextUsersFriendsPage}
                    isFetchingNextPage={isFetchingNextUsersFriendsPage}
                    usersPages={usersFriendsPages}
                    clickHandler={closeSheet}
                  />
                ) : (
                  <UsersList
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
