"use client";

import ChatPage from "./chatRoom/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Provider } from "jotai";
import { FC, useState } from "react";

const Home: FC = () => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <Navbar />
        <main className="flex max-w-screen-xl w-full mx-auto flex-col items-center justify-center h-full min-h-[calc(100vh-64px)]">
          <ChatPage />
        </main>
      </Provider>
    </QueryClientProvider>
  );
};

export default Home;
