"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
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
  useFetchAllUsers,
  useFetchUsersFriends,
} from "@/hooks/useUsers";
import { useLatestMessage } from "@/hooks/useMessages";
import UserSearch from "./UsersList/UserSearch";

function UsersSection({ user }: { user: User }) {
  const [usersSearch, setUsersSearch] = useState("");
  const {
    data: usersAllPages,
    fetchNextPage: fetchNextUsersAllPage,
    hasNextPage: hasNextUsersAllPage,
    isFetchingNextPage: isFetchingNextUsersAllPage,
    refetch: refetchUsersAll,
  } = useFetchAllUsers({ searchParam: usersSearch });
  const {
    data: usersFriendsPages,
    fetchNextPage: fetchNextUsersFriendsPage,
    hasNextPage: hasNextUsersFriendsPage,
    isFetchingNextPage: isFetchingNextUsersFriendsPage,
    refetch: refetchUsersFriends,
  } = useFetchUsersFriends({ user, searchParam: usersSearch });

  const [selectedSidebar, setSelectedSidebar] = useState<
    "usersFriends" | "usersAll"
  >("usersFriends");
  const { markAsRead } = useLatestMessage();
  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  const changeSelectedSidebar = (selected: SidebarTypes) => {
    setSelectedSidebar(selected);
  };

  const toggleSheetIsOpen = (state: boolean) => {
    setSheetIsOpen(state);
  };

  const { mutate: addFriendMutation } = useAddUserFriend({ user: user });

  const [_, setSelectedUser] = useAtom(selectedUserAtom);

  const changeCurrentChat = (selectedUser: User) => {
    if (!user.friends || !user.friends.includes(selectedUser.uid)) {
      addFriendMutation({ selectedUserId: selectedUser.uid });
    }
    markAsRead({ userId: user.uid, senderId: selectedUser.uid });
    setSelectedUser(selectedUser);
  };

  const closeSheet = (selectedUser: User) => {
    changeCurrentChat(selectedUser);
    setSheetIsOpen(false);
  };
  const changeUsersSearchHandler = () => {
    refetchUsersAll();
    refetchUsersFriends();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      changeUsersSearchHandler();
    }
  };

  return (
    <div className="w-full sm:max-w-64 p-2 sm:h-full rounded-xl bg-white shadow-sm">
      <div className="hidden sm:flex flex-col gap-3 justify-between h-full">
        <div className="h-[calc(100%-52px)]">
          <ListSelector
            selectedSidebar={selectedSidebar}
            changeSelectedSidebar={changeSelectedSidebar}
          />

          <div className="flex flex-col gap-2 items-stretch justify-start h-[calc(100%-56px)] overflow-y-auto">
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
        <UserSearch
          changeUsersSearch={setUsersSearch}
          usersSearch={usersSearch}
          handleKeyDown={handleKeyDown}
          changeUsersSearchHandler={changeUsersSearchHandler}
        />
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
              <div className="flex flex-col gap-3 items-stretch pt-6 pr-6 h-full">
                <div className="h-[calc(100%-52px)]">
                  <ListSelector
                    selectedSidebar={selectedSidebar}
                    changeSelectedSidebar={changeSelectedSidebar}
                  />
                  <div className="flex flex-col overflow-y-auto h-[calc(100%-56px)]">
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
                </div>

                <UserSearch
                  changeUsersSearch={setUsersSearch}
                  usersSearch={usersSearch}
                  handleKeyDown={handleKeyDown}
                  changeUsersSearchHandler={changeUsersSearchHandler}
                />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full overflow-x-auto">
            <BubbleMyFriends
              users={usersFriendsPages?.pages[0].usersData}
              clickHandler={changeCurrentChat}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersSection;
