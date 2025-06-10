'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ModeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  function toggleTheme() {
    // Cycle through: dark -> light -> system
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      // theme === 'system'
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('p-2 size-[2.125rem]', className)}
      onClick={() => toggleTheme()}
      title={`Current theme: ${theme}${theme === 'system' ? ` (${systemTheme})` : ''}`}
    >
      <Sun
        size={16}
        className={cn(
          'transition-all',
          theme === 'light' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        )}
      />
      <Moon
        size={16}
        className={cn(
          'absolute transition-all',
          theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
        )}
      />
      <Monitor
        size={16}
        className={cn(
          'absolute transition-all',
          theme === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
        )}
      />
    </Button>
  );
}
