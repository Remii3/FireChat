import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user";
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@/context/atom";
import { useEffect } from "react";

const fetchUserData = async ({ userId }: { userId: string }): Promise<User> => {
  const userDoc = doc(firestore, "users", userId);
  const userSnapShot = await getDoc(userDoc);

  if (!userSnapShot.exists()) {
    throw new Error(`No user found with ID: ${userId}`);
  }

  return userSnapShot.data() as User;
};

export const useFetchUserData = ({ userId }: { userId?: string }) => {
  const [_, setLoggedInUserAtom] = useAtom(loggedInUserAtom);
  const queryClient = useQueryClient();
  const userData = useQuery({
    queryKey: ["userData", userId],
    queryFn: () => {
      if (!userId) {
        return Promise.reject(new Error("No user ID was provided."));
      }
      return fetchUserData({ userId });
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (userData.isSuccess) {
      setLoggedInUserAtom(userData.data);
      queryClient.invalidateQueries({ queryKey: ["usersFriends"] });
    }
  }, [userData.isSuccess, setLoggedInUserAtom, userData.data, queryClient]);

  return userData;
};
