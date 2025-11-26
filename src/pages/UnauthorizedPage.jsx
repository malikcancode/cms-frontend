import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground">403</h1>
        <h2 className="text-2xl font-semibold text-foreground">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
