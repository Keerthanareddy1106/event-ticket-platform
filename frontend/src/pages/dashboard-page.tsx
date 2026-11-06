import { useRoles } from "@/hooks/use-roles";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const DashboardPage: React.FC = () => {
  const { isLoading, isAdmin, isOrganizer, isStaff } = useRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAdmin) {
      navigate("/dashboard/admin", { replace: true });
      return;
    }

    if (isOrganizer) {
      navigate("/dashboard/events", { replace: true });
      return;
    }

    if (isStaff) {
      navigate("/dashboard/validate-qr", { replace: true });
      return;
    }

    navigate("/dashboard/tickets", { replace: true });
  }, [isLoading, isAdmin, isOrganizer, isStaff, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  );
};

export default DashboardPage;
