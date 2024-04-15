import { User } from "@/types/types";
import { atom } from "jotai";

export const selectedUserAtom = atom<null | User>(null);
