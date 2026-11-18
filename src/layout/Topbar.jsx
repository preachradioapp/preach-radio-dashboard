import PropTypes from "prop-types";
import { memo, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Dropdown } from "antd";
import { Bell, ChevronDown, LogOut, Menu, Settings } from "lucide-react";
import { useGetProfileQuery } from "../api/authApi";
import { useGetNotificationsQuery } from "../api/adminApi";
import { initials } from "../lib/format";
import { findNavItem } from "./navigation";

const Topbar = ({ onOpenMenu, onLogout }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: profile } = useGetProfileQuery();
  // Small page just to compute the unread badge; polls gently while the tab is open.
  const { data: notifications } = useGetNotificationsQuery(
    { page: 1, limit: 20 },
    { pollingInterval: 120000, skipPollingIfUnfocused: true }
  );

  const unread = useMemo(() => {
    if (!profile?._id) return 0;
    return (notifications?.result ?? []).filter((n) => !n.seenBy?.includes(profile._id)).length;
  }, [notifications, profile?._id]);

  const current = findNavItem(pathname);

  const menu = {
    items: [
      {
        key: "header",
        disabled: true,
        label: (
          <div className="py-1">
            <div className="font-medium text-ink">{profile?.name || "Administrator"}</div>
            <div className="text-xs text-muted">{profile?.email}</div>
          </div>
        ),
      },
      { type: "divider" },
      { key: "settings", icon: <Settings size={15} />, label: "Account settings" },
      { key: "logout", icon: <LogOut size={15} />, label: "Log out", danger: true },
    ],
    onClick: ({ key }) => (key === "logout" ? onLogout() : navigate("/settings")),
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-md sm:px-6">
      <Button
        type="text"
        className="lg:!hidden"
        icon={<Menu size={20} />}
        onClick={onOpenMenu}
        aria-label="Open navigation"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-sm text-muted">
          {current?.parent && <span>{current.parent.label}</span>}
          {current?.parent && <span className="text-line">/</span>}
          <span className="font-medium text-ink">{current?.label ?? ""}</span>
        </div>
      </div>

      <Link
        to="/notifications"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-canvas"
      >
        <Badge count={unread} size="small" overflowCount={9}>
          <Bell size={19} strokeWidth={1.8} />
        </Badge>
      </Link>

      <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-full border-0 bg-transparent py-1 pl-1 pr-2 transition hover:bg-canvas"
        >
          <Avatar src={profile?.profile_image || undefined} size={34} className="!bg-brand-50 !text-brand">
            {initials(profile?.name)}
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-tight text-ink">{profile?.name || "Admin"}</span>
            <span className="block text-xs leading-tight text-muted">Administrator</span>
          </span>
          <ChevronDown size={15} className="hidden text-muted sm:block" />
        </button>
      </Dropdown>
    </header>
  );
};

Topbar.propTypes = { onOpenMenu: PropTypes.func.isRequired, onLogout: PropTypes.func.isRequired };

export default memo(Topbar);
