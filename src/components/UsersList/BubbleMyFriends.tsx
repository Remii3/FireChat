"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@/types/user";

function BubbleMyFriends({
  users,
  clickHandler,
}: {
  users: User[] | undefined;
  clickHandler: (selectedUser: User) => void;
}) {
  return (
    <div>
      {users && (
        <>
          <div className="space-x-4 flex">
            {users.map((user) => (
              <button
                key={user.uid}
                type="button"
                onClick={() => clickHandler(user)}
                className="last:mr-4"
                aria-label="Select user to chat with"
              >
                <Avatar>
                  <AvatarImage src={user.photoURL} alt="Profile" />
                  <AvatarFallback className="sr-only">
                    {user.displayName}
                  </AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default BubbleMyFriends;
