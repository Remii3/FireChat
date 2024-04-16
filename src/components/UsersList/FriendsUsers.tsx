import { UsersListTypes } from "@/types/user";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import UserCard from "./UserCard";

function FriendsUsers({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  usersPages,
  clickHandler,
}: UsersListTypes) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div>
      {usersPages &&
        usersPages.pages.map((users) =>
          users.usersData.map((user, id) => {
            return (
              <UserCard
                key={user.id}
                user={user}
                clickHandler={clickHandler}
                lastItemRef={
                  users.usersData.length === id + 1 ? ref : undefined
                }
              />
            );
          })
        )}
      {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin" />}
    </div>
  );
}

export default FriendsUsers;
