import LoginForm from "@/components/page/loginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h1 className="text-xl font-bold text-center mb-6">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
