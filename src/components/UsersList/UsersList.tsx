"use client";

import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { UsersListTypes } from "@/types/user";
import UserCard from "./UserCard";

function AllUsers({
  usersPages,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
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
          users.usersData.map((user, index) => {
            return (
              <UserCard
                key={user.uid}
                user={user}
                clickHandler={clickHandler}
                lastItemRef={
                  users.usersData.length === index + 1 ? ref : undefined
                }
              />
            );
          })
        )}
      {isFetchingNextPage && (
        <div className="w-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
}

export default AllUsers;
