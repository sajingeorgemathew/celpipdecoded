import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

// Shared frame for signed in app screens: header, main content area, and a
// footer with the scoring disclaimer.
export function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader userEmail={userEmail} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        {children}
      </main>

      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
          <p className="text-xs leading-5 text-ink/50">
            Toronto Academy of Education
          </p>
          <p className="mt-1 text-xs leading-5 text-ink/50">
            Practice estimates and AI feedback are for preparation only and
            are not official CELPIP scores.
          </p>
          <p className="mt-1 text-xs leading-5 text-ink/40">
            Powered by Georgo Analytics and Automation
          </p>
        </div>
      </footer>
    </div>
  );
}
