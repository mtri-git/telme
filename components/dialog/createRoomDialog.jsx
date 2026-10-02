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
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import toast from "react-hot-toast";
import useChatStore from "@/store/chatStore";

export function CreateRoomDialog() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createRoom, setCurrentRoomId, setCurrentRoomData } = useChatStore();

  const onCreateRoom = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    setIsSubmitting(true);
    try {
      const room = await createRoom({
        name: name.trim(),
        userEmails: users.split(/[,\s]+/).map((email) => email.trim()).filter(Boolean),
      });
      toast.success("Room created successfully");
      setName("");
      setUsers("");
      setIsOpen(false);
      // Open the new room right away
      if (room?._id) {
        setCurrentRoomId(room._id);
        setCurrentRoomData(room);
      }
    } catch (err) {
      toast.error(err.message || "Could not create room");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Create room">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
          <DialogDescription>
            Create a new chat room. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onCreateRoom}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="users" className="text-right">
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
