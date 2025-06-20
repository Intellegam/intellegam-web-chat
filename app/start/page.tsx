'use client';
import AnimatedNetwork from '@/components/animated-network';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
      {/* Page indicator */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Image
              src={logo}
              alt="Intellegam"
              width={20}
              height={20}
              className="size-5"
            />
          </div>
          <div className="text-sm font-medium text-foreground">
            Intellegam Chat
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left Side - Hero Text */}
          <div className="space-y-8 text-center lg:text-left backdrop-blur-[1px] mt-16 md:mt-0">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="block text-foreground mb-2">Made for</span>
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent pb-1">
                  Knowledge
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed max-w-xl font-medium">
                Chat with your knowledge base using plain language.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button
                asChild
                size="lg"
                className="px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
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
          </div>

          {/* Right Side - Simple CTA or Visual Element */}
          <div className="flex justify-center lg:justify-end">
            <div className="text-center space-y-4"></div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-16 border-t border-border/20 text-center">
          <div className="flex flex-wrap justify-center items-center gap-x-6 text-xs md:text-sm text-muted-foreground/70">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors duration-200 font-medium"
            >
              TERMS
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors duration-200 font-medium"
            >
              PRIVACY POLICY
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors duration-200 font-medium"
            >
              CONTACT US
            </Link>
          </div>

          <p className="text-xs text-muted-foreground/50 text-center mt-4">
            MADE WITH LOVE BY INTELLEGAM
          </p>
        </div>
      </div>

      {/* Animated pipes background */}
      <AnimatedNetwork
        isDark={resolvedTheme === 'dark'}
        terms={[
          'onboarding',
          'policy',
          'procedure',
          'handbook',
          'directory',
          'org chart',
          'contact',
          'form',
          'workflow',
          'meeting notes',
          'project docs',
          'brand assets',
          'guidelines',
          'training',
          'expense report',
          'IT request',
          'equipment',
          'calendar',
        ]}
      />

      {/* Subtle overlay for readability */}
      <div
        className="absolute inset-0 bg-background/50"
        style={{ zIndex: 2 }}
      />
    </div>
  );
}
