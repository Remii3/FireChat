// import { auth, firestore } from "@/lib/firebase";
// import { User } from "@/types/types";
// import {
//   keepPreviousData,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";
// import {
//   collection,
//   getCountFromServer,
//   getDocs,
//   limit,
//   query,
//   startAfter,
//   where,
// } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { Button } from "../ui/button";
// import { set } from "firebase/database";

// const fetchAllUsers = async ({
//   searchQuery,
//   lastDocRef,
//   setLastDocRef,
// }: {
//   searchQuery: string;
//   lastDocRef: any;
//   setLastDocRef: any;
// }): Promise<User[]> => {
//   const usersColection = collection(firestore, "users");
//   let q = query(
//     usersColection,
//     where("uid", "!=", auth.currentUser!.uid),
//     limit(1)
//   );

//   const usersSnapshot = await getDocs(q);

//   if (usersSnapshot.docs.length > 0) {
//     setLastDocRef(usersSnapshot.docs[usersSnapshot.docs.length - 1]);
//   }

//   return usersSnapshot.docs.map((userSnap) => ({
//     id: userSnap.id,
//     displayName: userSnap.data().displayName,
//     email: userSnap.data().email,
//     photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
//     uid: userSnap.data().uid,
//     friends: userSnap.data().friends,
//   }));
// };

// function AllUsers() {
//   const [usersList, setUsersList] = useState<User[]>([]);
//   const [lastDocRef, setLastDocRef] = useState(null);
//   const queryClient = useQueryClient();

//   const {
//     data: users,
//     isLoading: isLoadingUsers,
//     error: errorUsers,
//     status,
//   } = useQuery({
//     queryKey: ["allUsers"],
//     queryFn: () =>
//       fetchAllUsers({ lastDocRef, searchQuery: "", setLastDocRef }),
//     placeholderData: keepPreviousData,
//   });

//   console.log("%c All users", "color: blue;", errorUsers, usersList);
//   return (
//     <div>
//       AllUsers
//       {usersList &&
//         usersList.map((user) => <div key={user.id}>{user.displayName}</div>)}
//     </div>
//   );
// }

// export default AllUsers;

import { auth, firestore } from "@/lib/firebase";
import { User } from "@/types/types";
import { useInView } from "react-intersection-observer";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const fetchUsers = async ({ pageParam }: { pageParam: number }) => {
  const usersCollection = collection(firestore, "users");
  let q = query(usersCollection, where("uid", "!=", auth.currentUser!.uid));
  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }
  q = query(q, limit(10));

  const usersSnapshot = await getDocs(q);

  const lastDoc =
    usersSnapshot.docs.length > 0
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1]
      : null;

  const userData = usersSnapshot.docs.map((userSnap) => ({
    displayName: userSnap.data().displayName,
    email: userSnap.data().email,
    photoURL: userSnap.data().photoURL.trim().replace(/^"|"$/g, ""),
    uid: userSnap.data().uid,
    friends: userSnap.data().friends,
  }));
  return { userData, lastDoc };
};
function AllUsers() {
  const { ref, inView } = useInView();

  const {
    data: users,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["allUsers"],
    queryFn: fetchUsers,
    initialPageParam: null,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return null;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="h-24">
      AllUsers
      <div>
        {users &&
          users.pages.map((users: any) =>
            users.userData.map((user, id) => {
              if (users.userData.length === id + 1) {
                return (
                  <div
                    key={id}
                    ref={ref}
                    className="py-56 h-[90vh] bg-blue-500 mb-12"
                  >
                    {user.displayName}
                  </div>
                );
              }
              return (
                <div key={id} className="py-56 h-[90vh] bg-red-500 mb-12">
                  {user.displayName}
                </div>
              );
            })
          )}
        {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin" />}
      </div>
    </div>
  );
}

export default AllUsers;
