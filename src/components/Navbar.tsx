"use client";

import { auth, firestore } from "@/lib/firebase";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useAtom } from "jotai";
import { loggedInUserAtom, selectedUserAtom } from "@/context/atom";
import { doc, updateDoc } from "firebase/firestore";

function Navbar() {
  const [_, setSelectedUser] = useAtom(selectedUserAtom);
  const [loggedInUser] = useAtom(loggedInUserAtom);
  const clientQuery = useQueryClient();

  const signOutHandler = async (): Promise<void> => {
    try {
      auth.signOut();
      const userRef = doc(firestore, "users", auth.currentUser!.uid);
      await updateDoc(userRef, { isOnline: false });
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const mainMenuHandler = () => {
    if (!loggedInUser) return;
    setSelectedUser(null);
    clientQuery.invalidateQueries({ queryKey: ["messages"] });
  };

  return (
    <header className="w-full shadow-sm bg-white/75 backdrop-blur-lg">
      <nav className="max-w-screen-xl py-3 px-2 w-full mx-auto flex items-center justify-between">
        <div>
          <Link href="/" aria-label="Main menu" onClick={mainMenuHandler}>
            <h1 className="text-2xl font-bold">Chat App</h1>
          </Link>
        </div>
        {loggedInUser && (
          <Button
            variant={"outline"}
            className="space-x-2"
            onClick={signOutHandler}
            aria-label="Sign out"
          >
            <span>Sign Out</span> <LogOut className="h-4 w-4" />
          </Button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
