import ChatWindow from "@/components/ChatWindow";
import UsersSection from "@/components/UsersSection";
import { selectedUserAtom } from "@/context/atom";
import { useFetchUserData } from "@/hooks/useUserData";
import { auth } from "@/lib/firebase";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import SignInPage from "../signIn/page";
import { FC } from "react";

const ChatPage: FC = () => {
  const [selectedUser] = useAtom(selectedUserAtom);
  const [userAuth, userAuthLoading, userAuthError] = useAuthState(auth);
  const {
    data: userData,
    error: userDataError,
    isLoading: userDataLoading,
  } = useFetchUserData(auth.currentUser?.uid);

  if (userDataLoading || userAuthLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (userDataError || userAuthError)
    return <div>Error: {userDataError?.message || userAuthError?.message}</div>;

  if (!userAuthLoading && !userAuth) return <SignInPage />;

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center h-[calc(100vh-64px-32px)] sm:h-[calc(100vh-80px)] max-w-screen-xl mx-auto gap-4 px-2 sm:gap-8 pt-4 pb-4 sm:pb-16">
      {userData && (
        <>
          <UsersSection user={userData} />
          {selectedUser ? (
            <ChatWindow user={userData} selectedUser={selectedUser} />
          ) : (
            <div className="w-full rounded-xl flex justify-center items-center h-full bg-white shadow-sm">
              <div className="text-xl">Select a user</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatPage;
