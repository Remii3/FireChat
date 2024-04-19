"use client";

import ChatWindow from "@/components/ChatWindow";
import UsersSection from "@/components/UsersSection";
import { selectedUserAtom } from "@/context/atom";
import { useFetchUserData } from "@/hooks/useUserData";
import { auth, firestore } from "@/lib/firebase";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import SignInPage from "@/app/signIn/page";
import { FC, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { useLatestMessage } from "@/hooks/useMessages";

const ChatRoom: FC = () => {
  const { markAsRead } = useLatestMessage();
  const [selectedUser] = useAtom(selectedUserAtom);
  const [userAuth, userAuthLoading, userAuthError] = useAuthState(auth);
  const {
    data: userData,
    error: userDataError,
    isLoading: userDataLoading,
  } = useFetchUserData({ userId: auth.currentUser?.uid });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userAuth) return;
    const unsubscribe = onSnapshot(
      doc(firestore, "users", userAuth.uid),
      async () => {
        if (selectedUser) {
          await markAsRead({
            senderId: selectedUser?.uid,
            userId: userAuth.uid,
          });
        }
        await queryClient.invalidateQueries({ queryKey: ["userData"] });
      }
    );

    return () => unsubscribe();
  }, [markAsRead, queryClient, selectedUser, userAuth]);

  if (userDataLoading || userAuthLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (userDataError || userAuthError)
    return <div>Error: {userDataError?.message || userAuthError?.message}</div>;

  if (!userAuthLoading && !userAuth) return <SignInPage />;

  return (
    userData && (
      <>
        <UsersSection user={userData} />
        {selectedUser ? (
          <ChatWindow />
        ) : (
          <div className="w-full rounded-xl flex justify-center items-center h-full bg-white shadow-sm">
            <div className="text-xl">Select a user</div>
          </div>
        )}
      </>
    )
  );
};

export default ChatRoom;
