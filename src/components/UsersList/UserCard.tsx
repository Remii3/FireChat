import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { User, UsersListTypes } from "@/types/user";

type UserCardType = {
  lastItemRef?: (node?: Element | null | undefined) => void;
  user: User;
} & Pick<UsersListTypes, "clickHandler">;

function UserCard({ user, lastItemRef, clickHandler }: UserCardType) {
  return (
    <Button
      className="h-auto w-full justify-start gap-3 font-normal"
      onClick={() => clickHandler(user)}
      variant={"ghost"}
      ref={lastItemRef && lastItemRef}
      key={user.uid}
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
}

export default UserCard;
