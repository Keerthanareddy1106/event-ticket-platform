import { useEffect } from "react";
import { useAppAuth } from "@/context/demo-auth-context";
import { useNavigate } from "react-router";

const LoginPage: React.FC = () => {
  const { isLoading, isAuthenticated, signinRedirect } = useAppAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated) {
      const redirectPath = localStorage.getItem("redirectPath");
      if (redirectPath) {
        localStorage.removeItem("redirectPath");
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      return;
    }
    signinRedirect();
  }, [isLoading, isAuthenticated, signinRedirect, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Redirecting to login...</p>
    </div>
  );
};

export default LoginPage;
