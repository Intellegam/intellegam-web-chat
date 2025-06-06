import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Intellegam Chat
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Your AI-powered chat interface with document artifacts, real-time collaboration, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/api/auth/login">
              Sign In with WorkOS
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/register">
              Create Account
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}