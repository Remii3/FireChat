import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Menu } from "lucide-react";
import UserCard from "./UserCard";
import { InfiniteUsers, User } from "@/types/user";

function BubbleMyFriends({ users }: { users: any[] }) {
  return (
    <div>
      {users && (
        <>
          <div className="overflow-x-auto space-x-4 flex">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
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
