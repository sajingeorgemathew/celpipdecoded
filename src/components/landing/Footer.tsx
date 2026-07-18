import { Container } from "./primitives";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { brand } from "@/config/brand";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-soft text-cream/70">
      <Container className="py-14">
        <div className="flex flex-col items-center gap-5 text-center">
          <BrandLogo variant="dark" />
          <p className="text-sm font-medium text-cream/70">
            Independent CELPIP preparation and practice platform.
          </p>
          <p className="max-w-2xl text-sm leading-6 text-cream/60">
            {brand.disclaimer}
          </p>
          <p className="text-xs text-cream/40">
            {year} {brand.productName}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
