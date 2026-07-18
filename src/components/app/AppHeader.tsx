import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

// App header for signed in screens. Shows the product name, the signed in
// user's email, and a sign out button.
export function AppHeader({ userEmail }: { userEmail: string }) {
  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5 text-sm font-semibold tracking-tight text-ink sm:text-base"
        >
          <Image
            src="/favicon.png"
            alt="Toronto Academy of Education logo"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-md"
          />
          <span className="min-w-0 leading-tight">
            Toronto Academy of Education
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink/60 sm:inline">
            {userEmail}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
