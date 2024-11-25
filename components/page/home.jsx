import Sidebar from "@/components/base/sidebar";
import ChatWindow from "@/components/base/chatWindow";

const HomePage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
};

export default HomePage;
