import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/app/common/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/common/ui/card';
import { serverAuthStartMicrosoftEntraId } from '@/server-functions/auth';
import { useServerFn } from '@tanstack/react-start';

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});

function LoginComponent() {
  const startSSO = useServerFn(serverAuthStartMicrosoftEntraId);
  const handleMicrosoftSignIn = async () => {
    await startSSO({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account using Microsoft Entra ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleMicrosoftSignIn}
            className="w-full h-12 text-base font-medium bg-[#0078d4] hover:bg-[#106ebe] text-white border-0"
          >
            <svg
              className="w-5 h-5 mr-3"
              viewBox="0 0 21 21"
              fill="currentColor"
            >
              <path d="M0 0h10v10H0V0zm11 0h10v10H11V0zM0 11h10v10H0V11zm11 0h10v10H11V11z" />
            </svg>
            Sign in with Microsoft
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Secure authentication
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Your organization uses Microsoft Entra ID for secure access.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
