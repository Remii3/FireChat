"use client";

import { auth, firestore } from "@/lib/firebase";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "@/app/signIn/page";
import {
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useAtom } from "jotai";
import { selectedUserAtom } from "@/context/atom";

const addMessage = async ({
  newMessageText,
  userId,
  recipientId,
}: {
  newMessageText: string;
  userId: string;
  recipientId: string;
}) => {
  if (!auth.currentUser || !recipientId || !userId) return;
  const { uid, photoURL } = auth.currentUser;
  try {
    await addDoc(collection(firestore, "messages"), {
      text: newMessageText,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
      senderId: userId,
      recipientId: recipientId,
    });
  } catch (error) {
    console.log(error);
  }
};

function ChatWindow() {
  const [selectedUser] = useAtom(selectedUserAtom);
  const [user] = useAuthState(auth);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const observer = useRef<IntersectionObserver>();
  const [messages, setMessages] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      const messagesRef = collection(firestore, "messages");
      const q = query(
        messagesRef,
        where("senderId", "in", [user?.uid, selectedUser?.uid]),
        where("recipientId", "in", [user?.uid, selectedUser?.uid]),
        orderBy("createdAt", "desc"),
        limit(25)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = [];
        let newLastVisible = null;
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() });
          newLastVisible = doc;
        });
        setMessages(newMessages.reverse());
        setLastVisible(newLastVisible);
      });

      return () => unsubscribe();
    }
  }, [selectedUser, user]);

  const { mutate, status: messageStatus } = useMutation({
    mutationFn: addMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      setNewMessage("");
    },
  });

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messageStatus]);

  const fetchMoreMessages = async () => {
    if (lastVisible && !loading) {
      setLoading(true);
      const messagesRef = collection(firestore, "messages");
      const q = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(25)
      );

      const snapshot = await getDocs(q);
      const newMessages = [];
      let newLastVisible = null;
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
        newLastVisible = doc;
      });
      newMessages.reverse();
      setMessages((prevMessages) => [...newMessages, ...prevMessages]);
      setLastVisible(newLastVisible);
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const { scrollTop } = event.currentTarget;
    if (scrollTop === 0) {
      fetchMoreMessages();
    }
  };

  if (!user) {
    return <SignIn />;
  }
  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    mutate({
      newMessageText: newMessage,
      userId: user.uid,
      recipientId: selectedUser.uid,
    });
  };
  console.log(selectedUser);
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
        <div
          onScroll={handleScroll}
          className="relative flex flex-col flex-grow overflow-y-auto px-4 py-4"
        >
          {!selectedUser && <p>Select a user to start chatting</p>}
          {selectedUser &&
            messages &&
            messages
              .reverse()
              .map((msg) => <Message key={msg.id} message={msg} />)}
          <div ref={endOfMessagesRef}></div>
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
