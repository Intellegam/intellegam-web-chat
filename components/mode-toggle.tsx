'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  function toggleTheme(theme: string) {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('p-2 size-[2.125rem]', className)}
      onClick={() => toggleTheme(theme ?? 'system')}
    >
      <Sun
        size={16}
        className="rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all"
      />
      <Moon
        size={16}
        className="absolute rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all"
      />
    </Button>
  );
}
