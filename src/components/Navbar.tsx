"use client";

import { auth, firestore } from "@/lib/firebase";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useAtom } from "jotai";
import { selectedUserAtom } from "@/context/atom";
import { User } from "firebase/auth";
import { onDisconnect } from "firebase/database";
import { collection, doc, updateDoc } from "firebase/firestore";

function Navbar() {
  const [_, setSelectedUser] = useAtom(selectedUserAtom);
  const clientQuery = useQueryClient();

  const signOutHandler = async () => {
    auth.signOut();
    const userRef = doc(firestore, "users", auth.currentUser!.uid);
    await updateDoc(userRef, { isOnline: false });
  };

  const mainMenuHandler = () => {
    if (!auth.currentUser) return;
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
        {auth.currentUser && (
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
