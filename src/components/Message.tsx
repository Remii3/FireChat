import { auth } from "@/lib/firebase";
import { DocumentData } from "firebase/firestore";

function Message({
  message,
  lastItemRef,
}: {
  message: DocumentData;
  lastItemRef?: (node?: Element | null | undefined) => void;
}) {
  const { text, senderId } = message;
  const authorMessage =
    senderId === auth.currentUser!.uid ? "author" : "received";

  return (
    <div
      ref={lastItemRef && lastItemRef}
      className={`flex mb-4 ${
        authorMessage === "received" ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`${
          authorMessage === "received"
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        } px-3 py-2 rounded-md`}
      >
        {text}
      </div>
    </div>
  );
}

export default Message;
