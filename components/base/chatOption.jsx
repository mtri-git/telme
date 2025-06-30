import { Button } from "@/components/ui/button";
import useChatStore from "@/store/chatStore";
import { LogOut, Plus, X } from "lucide-react";
import { Card } from "../ui/card";
import { useEffect, useState } from "react";

const ChatOption = () => {
  const { error, currentRoomId, currentRoomData, isOpenOption, toggleOption } =
    useChatStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpenOption) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleOption}
        />
      )}
      
      <aside className={`
        ${isMobile 
          ? 'fixed right-0 top-0 h-full w-80 max-w-[85vw] z-50 shadow-lg' 
          : 'relative w-64'
        }
        flex flex-col bg-background border-l border-border p-4 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            <span>Room Info</span>
          </h2>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={toggleOption}
            >
              <X size={18} />
            </Button>
          )}
        </div>
        
        {/* List user */}
        <ul className="space-y-2 flex-1 overflow-y-auto">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Members ({currentRoomData?.users?.length || 0})
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {currentRoomData?.users?.map((user) => (
            <li key={user._id}>
              <Card className="bg-card border-border">
                <Button variant="ghost" className="w-full justify-start text-card-foreground p-3 h-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.fullname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base truncate">{user.fullname}</span>
                  </div>
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-auto w-full space-y-2 pt-4 border-t border-border">
          <Button variant="outline" className="w-full text-sm sm:text-base">
            <Plus size={18} className="sm:w-6 sm:h-6" />
            <span className="ml-2">Add user</span>
          </Button>
          <Button variant="destructive" className="w-full text-sm sm:text-base">
            <LogOut size={18} className="sm:w-6 sm:h-6" />
            <span className="ml-2">Leave room</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default ChatOption;
