"use client";

import ChatPage from "./chatRoom/page";
import { auth } from "@/lib/firebase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "@/components/Navbar";
import SignInPage from "./signIn/page";
import { Provider } from "jotai";
import { Loader2 } from "lucide-react";
const queryClient = new QueryClient();

export default function Home() {
  const [userAuthData, loading, error] = useAuthState(auth);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <div>
          <Navbar />
          {!userAuthData && (
            <main className="flex max-w-screen-xl w-full h-[calc(100vh-56px)] mx-auto flex-col items-center justify-center pb-20">
              {loading && (
                <div>
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              {!loading && error && <p>Error: {error.message}</p>}
              {!loading && !error && <SignInPage />}
            </main>
          )}
          {!loading && userAuthData && (
            <main className="flex max-w-screen-xl w-full mx-auto flex-col items-center justify-between">
              <ChatPage />
            </main>
          )}
        </div>
      </Provider>
    </QueryClientProvider>
  );
}
