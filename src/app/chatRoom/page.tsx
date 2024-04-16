import ChatWindow from "@/components/ChatWindow";
import UsersSection from "@/components/UsersSection";
import { selectedUserAtom } from "@/context/atom";
import { auth, firestore } from "@/lib/firebase";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { useAtom } from "jotai";

const fetchUserData = async (): Promise<null | User> => {
  if (!auth.currentUser?.uid) return null;
  const userDoc = doc(firestore, "users", auth.currentUser.uid);
  const userSnapShot = await getDoc(userDoc);
  if (!userSnapShot.exists()) return null;

  return userSnapShot.data() as User;
};

function ChatPage() {
  const [selectedUser] = useAtom(selectedUserAtom);

  const { data: user } = useQuery({
    queryKey: ["user", auth.currentUser?.uid],
    queryFn: () => fetchUserData(),
    enabled: !!auth.currentUser,
  });
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center h-[calc(100vh-64px-32px)] sm:h-[calc(100vh-80px)] max-w-screen-xl mx-auto gap-4 px-2 sm:gap-8 pt-4 pb-4 sm:pb-16">
      {user && (
        <>
          <UsersSection user={user} />
          {selectedUser ? (
            <ChatWindow user={user} selectedUser={selectedUser} />
          ) : (
            <div className="w-full rounded-xl flex justify-center items-center h-full bg-white shadow-sm">
              <div className="text-xl">Select a user</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChatPage;
