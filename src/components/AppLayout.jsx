import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { NAV_GROUPS } from "../lib/modules";
import { API_CONNECTED } from "../lib/api";

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-2 text-sm">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 pt-4 first:pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">
            {group.label}
          </p>

          <div className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                activeOptions={{ exact: item.to === "/" }}
                className="
                  group
                  flex items-center gap-3
                  px-3 py-2.5
                  rounded-xl
                  font-medium
                  text-slate-600
                  transition-all duration-200
                  hover:bg-white/80
                  hover:text-indigo-700
                  hover:shadow-sm
                  hover:translate-x-0.5
                "
                activeProps={{
                  className: `
                    group
                    flex items-center gap-3
                    px-3 py-2.5
                    rounded-xl
                    font-semibold
                    text-indigo-700
                    bg-gradient-to-r from-indigo-100 to-blue-100
                    border border-indigo-200
                    shadow-sm
                  `,
                }}
              >
                <span
                  className={`
                    size-2
                    rounded-full
                    ${item.dot}
                    transition-all duration-200
                    group-hover:scale-125
                  `}
                />

                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AppLayout({
  breadcrumb = "Home",
  title,
  actions,
  children,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#eef6ff]
        via-[#f5f3ff]
        to-[#eef2ff]
        text-ink
        flex
      "
    >
      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          hidden md:flex
          w-64
          shrink-0
          flex-col
          bg-gradient-to-b
          from-[#f0f7ff]
          via-[#f7f5ff]
          to-[#eef2ff]
          border-r
          border-indigo-100
          shadow-sm
        "
      >
        {/* Sidebar Logo */}
        <div
          className="
            flex items-center gap-3
            px-5
            h-16
            border-b
            border-indigo-100
            bg-white/60
          "
        >
          <div
            className="
              size-10
              rounded-xl
              bg-gradient-to-br
              from-blue-500
              via-indigo-500
              to-violet-500
              grid
              place-items-center
              text-white
              text-lg
              font-bold
              shadow-md
              shadow-indigo-200
            "
          >
            N
          </div>

          <div className="leading-tight">
            <p className="font-bold text-[15px] text-slate-800">
              NextGen RMS
            </p>

            <p className="text-[11px] tracking-wide text-slate-500 font-mono mt-0.5">
              Retail &amp; Orders
            </p>
          </div>
        </div>

        {/* Navigation */}
        <NavLinks />

        {/* Admin User */}
        <div className="px-3 py-3 border-t border-indigo-100">
          <div
            className="
              flex items-center gap-3
              px-3 py-3
              rounded-xl
              bg-white/70
              border border-indigo-100
              shadow-sm
            "
          >
            <div
              className="
                size-9
                rounded-full
                bg-gradient-to-br
                from-indigo-400
                to-blue-500
                grid
                place-items-center
                text-white
                font-bold
                text-xs
              "
            >
              DB
            </div>

            <div className="leading-tight min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Admin User
              </p>

              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                DBMS Project
              </p>
            </div>

            <span
              className="
                ml-auto
                size-2
                rounded-full
                bg-emerald-400
                shadow-sm
                shadow-emerald-300
              "
            />
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="
              w-72
              bg-gradient-to-b
              from-[#f0f7ff]
              via-[#f7f5ff]
              to-[#eef2ff]
              flex
              flex-col
              border-r
              border-indigo-100
              shadow-2xl
            "
          >
            {/* Mobile Logo */}
            <div
              className="
                flex items-center justify-between
                px-5
                h-16
                border-b
                border-indigo-100
                bg-white/70
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    size-9
                    rounded-xl
                    bg-gradient-to-br
                    from-blue-500
                    via-indigo-500
                    to-violet-500
                    grid
                    place-items-center
                    text-white
                    font-bold
                    shadow-md
                  "
                >
                  N
                </div>

                <div>
                  <p className="font-bold text-[15px] text-slate-800">
                    NextGen RMS
                  </p>

                  <p className="text-[10px] text-slate-500 font-mono">
                    Retail &amp; Orders
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="
                  size-9
                  rounded-lg
                  bg-indigo-50
                  hover:bg-red-50
                  hover:text-red-500
                  text-slate-500
                  transition
                "
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>

            <NavLinks onNavigate={() => setOpen(false)} />
          </div>

          {/* Overlay */}
          <button
            className="
              flex-1
              bg-slate-900/30
              backdrop-blur-sm
            "
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div
        className="
          flex-1
          flex
          flex-col
          min-w-0
          bg-gradient-to-br
          from-[#eef6ff]
          via-[#f8f7ff]
          to-[#eef2ff]
        "
      >
        {/* TOP HEADER */}
        <header
          className="
            h-16
            shrink-0
            border-b
            border-indigo-200
            bg-gradient-to-r
            from-[#eef6ff]
            via-[#f5f3ff]
            to-[#eef2ff]
            flex
            items-center
            justify-between
            px-4
            sm:px-6
            shadow-sm
          "
        >
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(true)}
              className="
                md:hidden
                h-9
                px-3
                rounded-lg
                bg-indigo-50
                text-sm
                font-medium
                text-indigo-700
                hover:bg-indigo-100
                transition
              "
              aria-label="Open navigation"
            >
              ☰
            </button>

            {/* Breadcrumb + Title */}
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-inksoft">
                {breadcrumb}
              </span>

              <h1 className="text-lg font-semibold leading-none">
                {title}
              </h1>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* PostgreSQL Status */}
            <div
              className="
                hidden
                sm:flex
                items-center
                gap-2
                rounded-full
                bg-white/60
                border
                border-indigo-200
                px-3
                h-9
                text-sm
                text-inksoft
                shadow-sm
              "
            >
              <span
                className={`
                  size-1.5
                  rounded-full
                  ${
                    API_CONNECTED
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }
                `}
              />

              <span className="font-mono text-xs">
                PostgreSQL ·{" "}
                {API_CONNECTED
                  ? "connected"
                  : "not connected"}
              </span>
            </div>

            {/* Page Action */}
            {actions}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className="
            flex-1
            overflow-y-auto
            p-4
            sm:p-6
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}