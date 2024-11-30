import { Button } from "@/components/ui/button";
import useChatStore from "@/store/chatStore";
import { LogOut, Plus } from "lucide-react";
import { Card } from "../ui/card";

const ChatOption = () => {
  const { error, currentRoomId, currentRoomData, isOpenOption } =
    useChatStore();

  if (!isOpenOption) return null;

  return (
    <aside className="flex flex-col w-64 bg-gray-100 border-r h-full p-4 dark:bg-gray-950">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          <span>Room Info</span>
        </h2>
      </div>
      {/* List user */}
      <ul className="space-y-2">
        <div>User list</div>
        {error && <p>{error}</p>}
        {currentRoomData?.users?.map((user) => (
          <li key={user._id}>
            <Card>
              <Button variant="ghost" className="w-full justify-start">
                {user.fullname}
              </Button>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-auto w-full space-y-2">
        <Button variant="outline" className="w-full">
          <Plus size={24} />
          <span className="ml-2">Add user</span>
        </Button>
        <Button variant="destructive" className="w-full">
          <LogOut size={24} />
          <span className="ml-2">Leave room</span>
        </Button>
      </div>
    </aside>
  );
};

export default ChatOption;
