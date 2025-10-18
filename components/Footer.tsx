import Link from 'next/link';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="container mx-auto px-4 py-3">
        <p className="text-center text-sm text-muted-foreground">
          Made by{' '}
          <Link
            href="https://www.amangly.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground transition-colors underline underline-offset-4"
          >
            amangly
          </Link>
        </p>
      </div>
    </footer>
  );
}