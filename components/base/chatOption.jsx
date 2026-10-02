import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useChatStore from "@/store/chatStore";
import { Loader2, LogOut, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UserAvatar from "./userAvatar";

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

const ChatOption = () => {
  const { error, currentRoomId, currentRoomData, isOpenOption, toggleOption, leaveRoom, addUserToRoom } =
    useChatStore();
  const [isAdding, setIsAdding] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(null); // "add" | "leave" | null

  // Close the panel with Escape
  useEffect(() => {
    if (!isOpenOption) return;
    const onKeyDown = (e) => e.key === "Escape" && toggleOption();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpenOption, toggleOption]);

  // Reset the add-user form when switching rooms
  useEffect(() => {
    setIsAdding(false);
    setEmail("");
  }, [currentRoomId]);

  if (!isOpenOption) return null;

  const members = currentRoomData?.users || [];

  const onAddUser = async (e) => {
    e.preventDefault();
    if (!email.trim() || !currentRoomId) return;

    setPending("add");
    try {
      await addUserToRoom(currentRoomId, email.trim());
      toast.success("User added to the room");
      setEmail("");
      setIsAdding(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not add user"));
    } finally {
      setPending(null);
    }
  };

  const onLeaveRoom = async () => {
    if (!currentRoomId) return;
    if (!window.confirm(`Leave "${currentRoomData?.name}"? You'll stop receiving its messages.`)) return;

    setPending("leave");
    try {
      await leaveRoom(currentRoomId);
      toast.success("You left the room");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not leave the room"));
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in-0"
        onClick={toggleOption}
        aria-hidden="true"
      />

      <aside
        aria-label="Room info"
        className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] shadow-xl animate-in slide-in-from-right duration-200 md:relative md:inset-auto md:z-auto md:w-72 md:max-w-none md:shadow-none md:animate-none flex flex-col bg-card border-l border-border safe-area-top safe-area-bottom"
      >
        <div className="flex-shrink-0 min-h-16 flex justify-between items-center px-4 border-b border-border">
          <h2 className="text-base font-semibold">Room info</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleOption}
            aria-label="Close room info"
          >
            <X />
          </Button>
        </div>

        <div className="flex flex-col items-center gap-2 px-4 py-5 border-b border-border">
          <UserAvatar name={currentRoomData?.name} size="lg" className="h-16 w-16 text-lg" />
          <p className="font-semibold text-center break-words">{currentRoomData?.name}</p>
        </div>

        {/* List user */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          <div className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Members ({members.length})
          </div>
          {error && <p className="text-destructive text-sm px-2">{error}</p>}
          <ul className="space-y-0.5">
            {members.map((user) => (
              <li key={user._id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/60 transition-colors">
                <UserAvatar name={user.fullname} size="sm" />
                <span className="text-sm truncate">{user.fullname}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-shrink-0 w-full space-y-2 p-4 border-t border-border">
          {isAdding ? (
            <form onSubmit={onAddUser} className="space-y-2">
              <Input
                type="email"
                placeholder="Member's email"
                aria-label="Member's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending === "add"}>
                  {pending === "add" && <Loader2 className="animate-spin" />}
                  Add
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
              <Plus />
              Add user
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onLeaveRoom}
            disabled={pending === "leave"}
          >
            {pending === "leave" ? <Loader2 className="animate-spin" /> : <LogOut />}
            Leave room
          </Button>
        </div>
      </aside>
    </>
  );
};

export default ChatOption;
