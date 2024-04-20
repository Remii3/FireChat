import React from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

const UserSearch = ({
  usersSearch,
  changeUsersSearch,
  handleKeyDown,
  changeUsersSearchHandler,
}: {
  usersSearch: string;
  changeUsersSearch: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  changeUsersSearchHandler: () => void;
}) => {
  return (
    <div className="relative">
      <Input
        placeholder="Search name..."
        value={usersSearch}
        onChange={(e) => changeUsersSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        aria-label="Search for a user"
        className="absolute right-2 top-2"
        onClick={changeUsersSearchHandler}
      >
        <Search className="h-6 w-6" />
      </button>
    </div>
  );
};

export default UserSearch;
