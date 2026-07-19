import Link from "next/link";

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
};

// Maps module slugs to their app routes. Modules without a route here are
// shown as coming soon even if marked active in the database.
const moduleRoutes: Record<string, string> = {
  "celpip-speaking": "/dashboard/speaking",
  "celpip-writing": "/dashboard/writing",
  "celpip-mock-tests": "/dashboard/mock-tests",
};

// Card for a practice module. Active modules link into the module, coming
// soon modules render as a disabled preview.
export function ModuleCard({ module }: { module: Module }) {
  const href = moduleRoutes[module.slug];
  const isActive = module.status === "active" && Boolean(href);

  return (
    <article
      className={`flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 ${
        isActive ? "" : "opacity-80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl font-semibold tracking-tight text-ink">
          {module.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isActive
              ? "bg-brand/10 text-brand"
              : "bg-cream-soft text-ink/60"
          }`}
        >
          {isActive ? "Active" : "Coming soon"}
        </span>
      </div>

      {module.description ? (
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {module.description}
        </p>
      ) : null}

      <div className="mt-auto pt-5">
        {isActive ? (
          <Link
            href={href}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
          >
            Open module
          </Link>
        ) : (
          <span className="inline-flex h-11 items-center justify-center rounded-full border border-ink/10 bg-cream-soft px-6 text-sm font-semibold text-ink/50">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}
