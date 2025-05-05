
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Page not found
      </p>
      <Button asChild>
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFound;
