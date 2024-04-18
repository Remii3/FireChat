import { auth, firestore } from "@/lib/firebase";
import { InfiniteUsers, User } from "@/types/user";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  DocumentData,
  QueryDocumentSnapshot,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

const fetchUsersAll = async ({
  pageParam,
}: {
  pageParam: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}): Promise<InfiniteUsers> => {
  const usersCollection = collection(firestore, "users");
  let q = query(usersCollection, where("uid", "!=", auth.currentUser!.uid));

  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }
  q = query(q, limit(15));

  const usersSnapshot = await getDocs(q);

  const lastDoc =
    usersSnapshot.docs.length > 0
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1]
      : null;

  const usersData = usersSnapshot.docs.map((userSnap) => ({
    displayName: userSnap.data().displayName,
    email: userSnap.data().email,
    photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
    uid: userSnap.data().uid,
    friends: userSnap.data().friends,
    isOnline: userSnap.data().isOnline,
  }));
  return { usersData, lastDoc };
};

const fetchUsersFriends = async ({
  pageParam,
  userFriendsList,
}: {
  userFriendsList: string[] | null;
  pageParam: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}): Promise<InfiniteUsers> => {
  const usersColection = collection(firestore, "users");
  let q = query(usersColection, where("uid", "!=", auth.currentUser!.uid));
  if (userFriendsList && userFriendsList.length === 0)
    return { usersData: [], lastDoc: null };
  if (userFriendsList) {
    q = query(
      usersColection,
      where("uid", "!=", auth.currentUser!.uid),
      where("uid", "in", userFriendsList)
    );
  }
  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }
  const usersSnapshot = await getDocs(q);

  const lastDoc =
    usersSnapshot.docs.length > 0
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1]
      : null;

  const usersData = usersSnapshot.docs.map((userSnap) => ({
    id: userSnap.id,
    displayName: userSnap.data().displayName,
    email: userSnap.data().email,
    photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
    uid: userSnap.data().uid,
    friends: userSnap.data().friends,
    isOnline: userSnap.data().isOnline,
  }));
  return { usersData, lastDoc };
};

const addFriend = async ({
  selectedUserId,
  loggedInUserId,
}: {
  selectedUserId: string;
  loggedInUserId: string;
}) => {
  await updateDoc(doc(firestore, "users", loggedInUserId), {
    friends: arrayUnion(selectedUserId),
  });

  return null;
};

export const useFetchUsers = () => {
  return useInfiniteQuery({
    queryKey: ["usersAll"],
    queryFn: ({ pageParam }) => fetchUsersAll({ pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteUsers) => {
      if (lastPage && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return null;
    },
  });
};

export const useFetchUsersFriends = (user: User) => {
  return useInfiniteQuery({
    queryKey: ["usersFriends"],
    queryFn: ({ pageParam }) =>
      fetchUsersFriends({ pageParam, userFriendsList: user.friends }),
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteUsers) => {
      if (lastPage && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return null;
    },
  });
};

export const useAddUserFriend = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addFriend"],
    mutationFn: ({ selectedUserId }: { selectedUserId: string }) =>
      addFriend({ selectedUserId, loggedInUserId: user.uid }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
