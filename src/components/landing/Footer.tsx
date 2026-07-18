import Image from "next/image";
import { Container } from "./primitives";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-soft text-cream/70">
      <Container className="py-14">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-3">
            <Image
              src="/taelogo.jpg"
              alt="Toronto Academy of Education logo"
              width={64}
              height={48}
              className="h-10 w-auto rounded-lg object-contain"
            />
            <span className="text-base font-semibold text-cream">
              Toronto Academy of Education
            </span>
          </div>
          <p className="text-sm font-medium text-cream/70">
            Toronto Academy CELPIP Preparation Program
          </p>
          <p className="max-w-2xl text-sm leading-6 text-cream/60">
            Practice estimates and AI feedback are for preparation only and
            are not official CELPIP scores. The Toronto Academy CELPIP
            Preparation Program is not affiliated with CELPIP.
          </p>
          <p className="text-xs text-cream/40">
            {year} Toronto Academy of Education. All rights reserved.
          </p>
          <p className="flex items-center gap-2 text-xs text-cream/40">
            <Image
              src="/georgo.png"
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 rounded-sm object-contain opacity-70"
            />
            Powered by Georgo Analytics and Automation
          </p>
        </div>
      </Container>
    </footer>
  );
}
