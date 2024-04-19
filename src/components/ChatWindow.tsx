"use client";

import { firestore } from "@/lib/firebase";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Message from "@/components/Message";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useInView } from "react-intersection-observer";
import { User } from "@/types/user";
import StatusIcon from "./UsersList/StatusIcon";
import { useGetMessages } from "@/hooks/useMessages";
import NewMessageForm from "./UsersList/NewMessageForm";
import { useAtom } from "jotai";
import { loggedInUserAtom, selectedUserAtom } from "@/context/atom";

function ChatWindow() {
  const [selectedUser] = useAtom(selectedUserAtom);
  const [loggedInUser] = useAtom(loggedInUserAtom);
  const queryClient = useQueryClient();
  const { inView, ref } = useInView();
  const {
    data: messagesPages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetMessages({
    loggedInUserId: loggedInUser?.uid || "",
    selectedUserId: selectedUser?.uid || "",
  });
  const [isRefetching, setIsRefetching] = useState(true);
  useEffect(() => {
    if (selectedUser) {
      setIsRefetching(false);
      const unsubscribe = onSnapshot(
        collection(firestore, "messages"),
        async () => {
          await queryClient.invalidateQueries({ queryKey: ["messages"] });
          setIsRefetching(true);
        }
      );
      return () => unsubscribe();
    }
  }, [queryClient, selectedUser]);

  useEffect(() => {
    if (inView && hasNextPage && isRefetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isRefetching]);

  return (
    <div className="w-full rounded-xl flex flex-col justify-between h-full bg-white shadow-sm">
      <div>
        {selectedUser && (
          <div className="flex items-center p-2 sm:p-4 gap-3 shadow-sm">
            <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
              <AvatarImage
                src={selectedUser.photoURL}
                alt={selectedUser.displayName}
              />
            </Avatar>
            <h4 className="text-xl sm:text-2xl font-medium">
              {selectedUser.displayName}
            </h4>
            <StatusIcon isOnline={selectedUser.isOnline} />
          </div>
        )}
      </div>
      <div className="pb-4 relative flex flex-col overflow-hidden">
        <div className="relative flex flex-col-reverse flex-grow overflow-y-auto px-4 py-4">
          {!selectedUser && <p>Select a user to start chatting</p>}
          {messagesPages &&
            messagesPages.pages.map((messages) =>
              messages.messagesData.map((message, index) => (
                <Message
                  key={message.uid}
                  lastItemRef={
                    messages.messagesData.length === index + 1 ? ref : undefined
                  }
                  message={message}
                />
              ))
            )}
          {isFetchingNextPage && !messagesPages && (
            <Loader2 className="h-6 w-6 animate-spin" />
          )}
        </div>
        <NewMessageForm selectedUser={selectedUser!} />
      </div>
    </div>
  );
}

export default ChatWindow;
