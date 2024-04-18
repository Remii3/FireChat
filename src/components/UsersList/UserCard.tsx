import { Button } from "../ui/button";
import Image from "next/image";
import { User, UsersListTypes } from "@/types/user";
import StatusIcon from "./StatusIcon";
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@/context/atom";

type UserCardType = {
  lastItemRef?: (node?: Element | null | undefined) => void;
  user: User;
} & Pick<UsersListTypes, "clickHandler">;

function UserCard({ user, lastItemRef, clickHandler }: UserCardType) {
  const [loggedInUser] = useAtom(loggedInUserAtom);
  if (!loggedInUser) return null;
  return (
    <Button
      className="h-auto w-full justify-between gap-3 font-normal"
      onClick={() => clickHandler(user)}
      variant={"ghost"}
      ref={lastItemRef && lastItemRef}
      key={user.uid}
    >
      <div className="flex items-center gap-3">
        <Image
          className="rounded-full aspect-square"
          src={user.photoURL}
          alt={user.displayName}
          height={40}
          width={40}
        />
        <div className="flex flex-col gap-1 items-start">
          <span>{user.displayName}</span>
          {loggedInUser.latestMessages[user.uid] && (
            <span
              className={`${
                loggedInUser.latestMessages[user.uid].unread
                  ? "font-medium"
                  : "font-normal"
              } text-xs`}
            >
              {loggedInUser.latestMessages[user.uid].text}
            </span>
          )}
        </div>
      </div>
      <StatusIcon isOnline={user.isOnline} />
    </Button>
  );
}

export default UserCard;
