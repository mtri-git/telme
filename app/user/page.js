import UserList from "@/components/page/user";

const UserPage = () => {
  return (    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 bg-card shadow-md rounded text-card-foreground">
        <h1 className="text-xl font-bold text-center mb-6">User list</h1>
            <UserList />
      </div>
    </div>
  );
};

export default UserPage;
