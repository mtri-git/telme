import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const chats = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Project Team" },
  ];

  return (
    <aside className="w-64 bg-gray-100 border-r h-full p-4 dark:bg-gray-950">
      <h2 className="text-lg font-bold mb-4">Chats</h2>
      <ul className="space-y-2">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Button variant="ghost" className="w-full justify-start">
              {chat.name}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
