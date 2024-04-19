"use client";

import ChatRoom from "@/components/ChatRoom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const ChatPage = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <div className="w-full flex flex-col justify-center sm:flex-row items-center h-[calc(100vh-64px-64px)] sm:h-[calc(100vh-80px)] max-w-screen-xl mx-auto gap-4 px-2 sm:gap-8 pt-4 pb-4 sm:pb-16">
      <QueryClientProvider client={queryClient}>
        <ChatRoom />
      </QueryClientProvider>
    </div>
  );
};

export default ChatPage;
