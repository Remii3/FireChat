import { Button } from "../ui/button";
import { SidebarTypes } from "@/types/user";

type PropsTypes = {
  selectedSidebar: SidebarTypes;
  changeSelectedSidebar: (selected: SidebarTypes) => void;
};

function ListSelector({ selectedSidebar, changeSelectedSidebar }: PropsTypes) {
  return (
    <div className="w-full flex mb-4">
      <Button
        variant={"outline"}
        onClick={() => changeSelectedSidebar("usersFriends")}
        className={`${
          selectedSidebar === "usersFriends" && "bg-muted"
        } rounded-r-none w-full`}
      >
        My contacts
      </Button>
      <Button
        onClick={() => changeSelectedSidebar("usersAll")}
        variant={"outline"}
        className={`${
          selectedSidebar === "usersAll" && "bg-muted"
        } rounded-l-none w-full`}
      >
        All users
      </Button>
    </div>
  );
}

export default ListSelector;
