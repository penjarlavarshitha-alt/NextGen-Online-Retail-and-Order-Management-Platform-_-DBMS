import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { NAV_GROUPS } from "../lib/modules";
import { API_CONNECTED } from "../lib/api";

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1 pt-4 first:pt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-inksoft/70">
            {group.label}
          </p>
          {group.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-inksoft hover:bg-canvas hover:text-ink"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
            >
              <span className={`size-1.5 rounded-full ${item.dot}`} />
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function AppLayout({ breadcrumb = "Home", title, actions, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink/10 bg-card">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-ink/10">
          <div className="size-9 rounded-xl bg-primary grid place-items-center text-primary-foreground text-lg font-bold leading-none">
            N
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-[15px] leading-none">NextGen RMS</p>
            <p className="text-[11px] tracking-wide text-inksoft font-mono">Retail &amp; Orders</p>
          </div>
        </div>
        <NavLinks />
        <div className="px-3 py-3 border-t border-ink/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="size-9 rounded-full bg-accent grid place-items-center text-accent-foreground font-bold text-sm">
              DB
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-[11px] text-inksoft font-mono">DBMS Project</p>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-card flex flex-col border-r border-ink/10">
            <div className="flex items-center justify-between px-5 h-16 border-b border-ink/10">
              <p className="font-semibold text-[15px]">NextGen RMS</p>
              <button
                onClick={() => setOpen(false)}
                className="text-inksoft text-sm font-mono"
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <button
            className="flex-1 bg-ink/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-ink/10 bg-card flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden h-9 px-3 rounded-lg bg-canvas text-sm font-medium"
              aria-label="Open navigation"
            >
              ☰
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-inksoft">{breadcrumb}</span>
              <h1 className="text-lg font-semibold leading-none">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-canvas px-3 h-9 text-sm text-inksoft">
              <span className={`size-1.5 rounded-full ${API_CONNECTED ? "bg-pos" : "bg-accent"}`} />
              <span className="font-mono text-xs">
                PostgreSQL · {API_CONNECTED ? "connected" : "not connected"}
              </span>
            </div>
            {actions}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
