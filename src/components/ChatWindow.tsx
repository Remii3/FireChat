"use client";

import { firestore } from "@/lib/firebase";
import React, { useEffect } from "react";
import SignIn from "@/app/signIn/page";
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

function ChatWindow({
  user,
  selectedUser,
}: {
  user: User;
  selectedUser: User;
}) {
  const queryClient = useQueryClient();
  const { inView, ref } = useInView();
  const {
    data: messagesPages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetMessages({
    loggedInUserId: user.uid,
    selectedUserId: selectedUser.uid,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["messages"] });
  }, [queryClient, selectedUser]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "posts"), () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    });

    return () => unsubscribe();
  }, [queryClient]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="w-full rounded-xl flex flex-col justify-between h-full bg-white shadow-sm">
      <div>
        {selectedUser && (
          <div className="flex items-center px-4 py-4 gap-3 shadow-sm">
            <Avatar>
              <AvatarImage
                src={selectedUser.photoURL}
                alt={selectedUser.displayName}
              />
            </Avatar>
            <h4 className="text-2xl font-medium">{selectedUser.displayName}</h4>
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
        <NewMessageForm selectedUser={selectedUser} />
      </div>
    </div>
  );
}

export default ChatWindow;
