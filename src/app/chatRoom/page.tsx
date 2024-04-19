"use client";

import ChatRoom from "@/components/ChatRoom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const ChatPage = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full flex flex-col sm:flex-row sm:items-center h-[calc(100vh-64px-32px)] sm:h-[calc(100vh-80px)] max-w-screen-xl mx-auto gap-4 px-2 sm:gap-8 pt-4 pb-4 sm:pb-16">
        <ChatRoom />
      </div>
    </QueryClientProvider>
  );
};

export default ChatPage;
