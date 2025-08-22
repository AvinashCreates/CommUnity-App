import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthRequiredMessage = () => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5" />
          Authentication Required
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Please sign in or create an account to access this feature.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => navigate('/auth')} variant="default">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth')} variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthRequiredMessage;