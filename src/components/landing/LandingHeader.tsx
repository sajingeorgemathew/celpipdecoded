"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BrandMark } from "@/components/brand/BrandMark";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Speaking", href: "#modules" },
  { label: "Writing", href: "#modules" },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-ink/95 text-cream backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:h-20 sm:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center"
          aria-label="CELPIP Decoded home"
        >
          {/* One brand treatment per breakpoint so the header never overflows:
              full lockup on desktop/tablet, compact lockup on mid phones, and
              just the mark on the narrowest screens (down to 320px). */}
          <BrandLogo variant="dark" className="hidden sm:inline-flex" />
          <BrandLogo
            variant="dark"
            compact
            className="hidden min-[400px]:inline-flex sm:hidden"
          />
          <BrandMark size={30} title="" className="min-[400px]:hidden" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-cream/80 transition-colors hover:text-cream"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-cream transition-colors hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-brand px-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark sm:px-5"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Get started</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/10 lg:hidden"
          >
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
            {menuOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 5.5h14M3 10h14M3 14.5h14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-cream/10 bg-ink px-5 pb-6 pt-2 lg:hidden"
        >
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="border-b border-cream/10 py-4 text-base font-semibold text-cream/85 transition-colors hover:text-cream"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={closeMenu}
              className="py-4 text-base font-semibold text-cream/85 transition-colors hover:text-cream sm:hidden"
            >
              Sign in
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
