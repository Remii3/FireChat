"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Send, Smile } from "lucide-react";
import { useAddMessage } from "@/hooks/useMessages";
import { User } from "@/types/user";
import EmojiPicker from "emoji-picker-react";

const NewMessageForm = ({ selectedUser }: { selectedUser: User }) => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { mutate, isPending, isSuccess } = useAddMessage({
    newMessageText: newMessage,
    recipientId: selectedUser.uid,
  });

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate();
  };

  useEffect(() => {
    setNewMessage("");
  }, [isSuccess]);

  return (
    <div className="relative">
      <EmojiPicker
        style={{ position: "absolute", bottom: "60px", left: "16px" }}
        open={showEmojiPicker}
        onEmojiClick={(a, b) => setNewMessage((prev) => prev + a.emoji)}
      />

      <form
        onSubmit={sendMessage}
        className="flex relative space-x-2 mt-4 basis-10 px-4"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="pl-10"
        />
        <button
          type="button"
          aria-label="Show emoji picker"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <Smile
            className={`${
              showEmojiPicker && "rotate-45"
            } h-6 w-6 absolute top-2 left-6 cursor-pointer transition hover:rotate-45`}
          />
        </button>
        <Button
          variant={"default"}
          type="submit"
          disabled={newMessage.trim().length <= 0}
          className="transition"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin"></Loader2>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default NewMessageForm;
