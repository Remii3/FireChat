import { User } from "@/types/user";
import { atom } from "jotai";

export const selectedUserAtom = atom<null | User>(null);
export const loggedInUserAtom = atom<null | User>(null);
