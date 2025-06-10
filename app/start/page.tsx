'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AnimatedPipes from '@/components/animated-pipes';

export default function WelcomePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logo =
    resolvedTheme === 'light'
      ? '/images/intellegam_logo_light.svg'
      : '/images/intellegam_logo_dark.svg';

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10 backdrop-blur-[2px] bg-background/2 border border-border/5 rounded-2xl p-8">
        {/* Logo with subtle glass effect */}
        <div className="flex flex-col items-center justify-center mb-6 animate-in fade-in duration-1000">
          <div className="w-20 h-20 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center shadow-lg mb-3">
            <Image
              src={logo}
              alt="Intellegam Logo"
              width={48}
              height={48}
              className="size-12"
            />
          </div>
          <span className="font-medium text-lg text-foreground">
            Intellegam
          </span>
        </div>

        {/* Header Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="block text-foreground mb-2">Welcome to</span>
              <span className="block bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent">
                Intellegam Chat
              </span>
            </h1>

            <div className="h-0.5 w-20 bg-gradient-to-r from-primary/60 to-primary/30 mx-auto rounded-full" />
          </div>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Experience intelligent conversations with AI that truly understands
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <Button
            asChild
            size="lg"
            className="px-8 shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <a href="/login">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 border-border/60 hover:bg-muted/30 transition-all duration-200"
          >
            <a href="/register">Create Account</a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/70 pt-8 animate-in fade-in duration-1000 delay-700">
          By continuing, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Terms
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Animated pipes background */}
      <AnimatedPipes isDark={resolvedTheme === 'dark'} />
      
      {/* Subtle overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/60 to-background/70" style={{ zIndex: 2 }} />
    </div>
  );
}
