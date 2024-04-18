import { auth, firestore } from "@/lib/firebase";
import { InfiniteMessages } from "@/types/types";
import { User } from "@/types/user";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

const createMessagesQuery = ({
  loggedInUserId,
  selectedUserId,
}: {
  loggedInUserId: string;
  selectedUserId: string;
}) => {
  const messagesRef = collection(firestore, "messages");
  return query(
    messagesRef,
    where("senderId", "in", [loggedInUserId, selectedUserId]),
    where("recipientId", "in", [loggedInUserId, selectedUserId]),
    orderBy("createdAt", "desc")
  );
};

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
    await updateDoc(doc(firestore, "users", recipientId), {
      friends: arrayUnion(uid),
      [`latestMessages.${uid}`]: {
        senderId: uid,
        unread: true,
        text: newMessageText,
      },
    });
  } catch (error) {
    console.error(error);
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
  let q = createMessagesQuery({ loggedInUserId, selectedUserId });
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

export const useAddMessage = ({
  recipientId,
  newMessageText,
}: {
  recipientId: string;
  newMessageText: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addMessage"],
    mutationFn: () => addMessage({ recipientId, newMessageText }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useGetMessages = ({
  loggedInUserId,
  selectedUserId,
}: {
  loggedInUserId: string;
  selectedUserId: string;
}) => {
  return useInfiniteQuery({
    queryKey: ["messages"],
    queryFn: ({ pageParam }) =>
      fetchMessages({
        pageParam,
        loggedInUserId,
        selectedUserId,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage: InfiniteMessages) => {
      if (lastPage && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return null;
    },
  });
};

export const useLatestMessage = () => {
  const markAsRead = async ({
    userId,
    senderId,
  }: {
    userId: string;
    senderId: string;
  }) => {
    const userRef = doc(firestore, "users", userId);

    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;

      if (userData.latestMessages[senderId]?.unread) {
        userData.latestMessages[senderId].unread = false;
        await updateDoc(userRef, {
          latestMessages: userData.latestMessages,
        });
      }
    }
  };
  return { markAsRead };
};
