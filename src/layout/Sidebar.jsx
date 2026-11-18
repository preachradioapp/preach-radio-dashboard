import PropTypes from "prop-types";
import { memo, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import logo from "../assets/header/logo.png";
import { NAV_SECTIONS, findNavItem } from "./navigation";

const linkBase =
  "group flex items-center gap-3 rounded-lg px-3 py-[7px] text-[13.5px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/60";
const linkIdle = "text-zinc-400 hover:bg-white/[0.06] hover:text-white";
const linkActive = "bg-white/[0.08] text-white shadow-[inset_2px_0_0_0_#E63946]";

const NavGroup = ({ item, onNavigate }) => {
  const { pathname } = useLocation();
  const containsActive = item.children.some((c) => pathname.startsWith(c.path));
  const [open, setOpen] = useState(containsActive);

  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  const Icon = item.icon;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${linkBase} w-full border-0 bg-transparent ${containsActive ? "text-white" : linkIdle}`}
      >
        <Icon size={18} strokeWidth={1.8} className="shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="ml-[22px] mt-1 space-y-0.5 border-l border-white/10 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.key}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                    isActive ? "bg-white/[0.08] font-medium text-white" : "text-zinc-400 hover:text-white"
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

NavGroup.propTypes = { item: PropTypes.object.isRequired, onNavigate: PropTypes.func };

const Sidebar = ({ onNavigate, onLogout }) => {
  const { pathname } = useLocation();
  const active = findNavItem(pathname);
  const navRef = useRef(null);

  // Keep the current page visible in the sidebar (e.g. "About Us" at the bottom of a
  // short laptop screen). Waits for the group expand animation before scrolling.
  useEffect(() => {
    const id = setTimeout(() => {
      navRef.current
        ?.querySelector('[aria-current="page"]')
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 220);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <aside className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center gap-3 px-5">
        <img src={logo} alt="Preach Radio" className="h-9 w-auto" />
        <span className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Admin
        </span>
      </div>

      <nav ref={navRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto px-3 py-3" aria-label="Main">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                if (item.children) return <NavGroup key={item.key} item={item} onNavigate={onNavigate} />;
                const Icon = item.icon;
                const isActive = active?.key === item.key;
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={onNavigate}
                    className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={onLogout}
          className={`${linkBase} ${linkIdle} w-full border-0 bg-transparent`}
        >
          <LogOut size={18} strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = { onNavigate: PropTypes.func, onLogout: PropTypes.func.isRequired };

export default memo(Sidebar);
