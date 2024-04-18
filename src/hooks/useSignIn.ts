import { auth, firestore } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const useSignIn = () => {
  return async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const useRef = doc(firestore, "users", result.user.uid);

      await setDoc(
        useRef,
        {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          isOnline: true,
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };
};

export default useSignIn;
