"use client";

import { auth, firestore } from "@/lib/firebase";
import React, { FormEvent, useEffect, useState } from "react";
import SignIn from "@/app/signIn/page";
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import Message from "@/components/Message";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useInView } from "react-intersection-observer";
import { InfiniteMessages } from "@/types/types";
import { User } from "@/types/user";

const addMessage = async ({
  newMessageText,
  recipientId,
}: {
  newMessageText: string;
  recipientId: string;
}) => {
  if (!auth.currentUser || !recipientId) return;
  const { uid, photoURL } = auth.currentUser;
  try {
    await addDoc(collection(firestore, "messages"), {
      text: newMessageText,
      createdAt: serverTimestamp(),
      photoURL,
      senderId: uid,
      recipientId: recipientId,
      unread: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const fetchMessages = async ({
  loggedInUserId,
  selectedUserId,
  pageParam,
}: {
  loggedInUserId: string;
  selectedUserId: string;
  pageParam: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}): Promise<InfiniteMessages> => {
  const messagesRef = collection(firestore, "messages");
  let q = query(
    messagesRef,
    where("senderId", "in", [loggedInUserId, selectedUserId]),
    where("recipientId", "in", [loggedInUserId, selectedUserId]),
    orderBy("createdAt", "desc")
  );

  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }
  q = query(q, limit(10));
  const messagesSnapshot = await getDocs(q);

  const lastDoc =
    messagesSnapshot.docs.length > 0
      ? messagesSnapshot.docs[messagesSnapshot.docs.length - 1]
      : null;
  const messagesData = messagesSnapshot.docs.map((msgSnap) => ({
    text: msgSnap.data().text,
    photoURL: msgSnap.data().photoURL,
    recipientId: msgSnap.data().recipientId,
    senderId: msgSnap.data().senderId,
    createdAt: msgSnap.data().createdAt,
    uid: msgSnap.id,
    unread: msgSnap.data().unread,
  }));

  return { messagesData, lastDoc };
};

function ChatWindow({
  user,
  selectedUser,
}: {
  user: User;
  selectedUser: User;
}) {
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const { inView, ref } = useInView();
  const {
    data: messagesPages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages"],
    queryFn: ({ pageParam }) =>
      fetchMessages({
        pageParam,
        loggedInUserId: user.uid,
        selectedUserId: selectedUser.uid,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteMessages) => {
      if (lastPage && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return null;
    },
  });

  const { mutate, status: messageStatus } = useMutation({
    mutationFn: addMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      setNewMessage("");
    },
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
  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    mutate({
      newMessageText: newMessage,
      recipientId: selectedUser.uid,
    });
  };

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

        <form
          onSubmit={sendMessage}
          className="flex space-x-2 mt-4 basis-10 px-4"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            variant={"default"}
            type="submit"
            disabled={newMessage.trim().length <= 0}
            className="transition"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
