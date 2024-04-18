import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";

const fetchUserData = async (userId: string): Promise<User> => {
  const userDoc = doc(firestore, "users", userId);
  const userSnapShot = await getDoc(userDoc);

  if (!userSnapShot.exists()) {
    throw new Error(`No user found with ID: ${userId}`);
  }

  return userSnapShot.data() as User;
};

export const useFetchUserData = (userId?: string) => {
  return useQuery({
    queryKey: ["userData", userId],
    queryFn: () => {
      if (!userId) {
        return Promise.reject(new Error("No user ID was provided."));
      }
      return fetchUserData(userId);
    },
    enabled: !!userId,
  });
};
