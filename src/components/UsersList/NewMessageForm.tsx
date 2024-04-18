import React, { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useAddMessage } from "@/hooks/useMessages";
import { User } from "@/types/user";

const NewMessageForm = ({ selectedUser }: { selectedUser: User }) => {
  const [newMessage, setNewMessage] = useState("");

  const { mutate, status: messageStatus } = useAddMessage({
    newMessageText: newMessage,
    recipientId: selectedUser.uid,
  });

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate();
    setNewMessage("");
  };
  return (
    <form onSubmit={sendMessage} className="flex space-x-2 mt-4 basis-10 px-4">
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <Button
        variant={"default"}
        type="submit"
        disabled={newMessage.trim().length <= 0}
        className="transition"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default NewMessageForm;
