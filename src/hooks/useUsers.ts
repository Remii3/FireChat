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

const getNextPageParam = (lastPage: InfiniteUsers) => {
  if (lastPage && lastPage.lastDoc) {
    return lastPage.lastDoc;
  }
  return null;
};

const fetchUsers = async ({
  userFriendsList,
  searchParam,
  pageParam,
}: {
  userFriendsList: string[] | null;
  searchParam?: string;
  pageParam: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}): Promise<InfiniteUsers> => {
  const usersCollection = collection(firestore, "users");
  let q = query(usersCollection);

  if (userFriendsList && !searchParam) {
    q = query(q, where("uid", "in", userFriendsList));
  }

  if (searchParam) {
    q = query(q, where("displayName", "==", searchParam));
  }

  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }
  q = query(q, limit(15));

  const usersSnapshot = await getDocs(q);

  const lastDoc =
    usersSnapshot.docs.length > 0
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1]
      : null;

  let usersData = usersSnapshot.docs.map((userSnap) => ({
    displayName: userSnap.data().displayName,
    email: userSnap.data().email,
    photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
    uid: userSnap.data().uid,
    friends: userSnap.data().friends,
    isOnline: userSnap.data().isOnline,
    latestMessages: userSnap.data().latestMessages,
  }));

  usersData = usersData.filter(
    (user) => user.uid !== auth.currentUser?.uid || ""
  );

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

export const useFetchAllUsers = ({ searchParam }: { searchParam?: string }) => {
  return useInfiniteQuery({
    queryKey: ["usersAll"],
    queryFn: ({ pageParam }) =>
      fetchUsers({ pageParam, userFriendsList: null, searchParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteUsers) => getNextPageParam(lastPage),
  });
};

export const useFetchUsersFriends = ({
  user,
  searchParam,
}: {
  user: User;
  searchParam?: string;
}) => {
  return useInfiniteQuery({
    queryKey: ["usersFriends"],
    queryFn: ({ pageParam }) =>
      fetchUsers({ pageParam, userFriendsList: user.friends, searchParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteUsers) => getNextPageParam(lastPage),
  });
};

export const useAddUserFriend = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addFriend"],
    mutationFn: ({ selectedUserId }: { selectedUserId: string }) =>
      addFriend({ selectedUserId, loggedInUserId: user.uid }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });
};
