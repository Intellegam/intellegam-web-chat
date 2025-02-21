interface PoweredByProps {
  poweredByName?: string;
}

export function PoweredBy({ poweredByName = 'Intellegam' }: PoweredByProps) {
  return (
    <p className="text-center text-xs text-muted-foreground">
      Powered by{' '}
      <a
        target="_blank"
        className="font-semibold text-muted-foreground"
        href="https://www.intellegam.com"
      >
        {poweredByName}
      </a>
    </p>
  );
}
