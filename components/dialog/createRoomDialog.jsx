import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import useChatStore from "@/store/chatStore";
import { ToolTip } from "../base/toolTip";

export function CreateRoomDialog() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState("");

  const { fetchRooms } = useChatStore();

  const onCreateRoom = () => {
    console.log("Creating room", name, users);
    axiosInstance
      .post("/rooms", {
        name,
        userEmails: users.split(",").map((email) => email.trim()),
      })
      .then((response) => {
        console.log("🚀 ~ onCreateRoom ~ response", response);
        fetchRooms();
        toast.success("Room created successfully");
      })
      .catch((err) => {
        console.log("🚀 ~ onCreateRoom");
      })
      .finally(() => {
        setName("");
        setUsers("");
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" className="float-right">
          <ToolTip content="Create room">
            <Plus />
          </ToolTip>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
          <DialogDescription>
            Create a new chat room. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Users
            </Label>
            {/* description */}
            <Textarea
              placeholder="Enter email separated by comma"
              id="users"
              className="col-span-3"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onCreateRoom}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
