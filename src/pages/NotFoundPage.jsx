import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <FiAlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
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
