import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import toast from "react-hot-toast";

export function JoinMeetingDialog() {
  const [code, setCode] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State to manage dialog open/close

  const onJoinMeeting = () => {
    if (!code) {
      toast.error("Please enter a valid code");
      return;
    }
    console.log("Joining meeting", code);
    window.open("/we-meet?code=" + code, "_blank");
    setIsOpen(false); // Close the dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsOpen(true)} // Open the dialog
        >
          Join a meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a meeting by code</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Code
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onJoinMeeting}>
            Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
