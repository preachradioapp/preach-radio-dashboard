import {
  Bell,
  Clapperboard,
  Disc3,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  Mic,
  Radio,
  RadioTower,
  Settings,
  ShieldAlert,
  UserCog,
  Users,
} from "lucide-react";

/**
 * Single source of truth for the sidebar, mobile drawer, page titles and breadcrumbs.
 * Paths here must match `routes/index.jsx`.
 */
export const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" }],
  },
  {
    title: "Community",
    items: [
      { key: "users", label: "Users", icon: Users, path: "/users" },
      { key: "creators", label: "Creators", icon: UserCog, path: "/creators" },
      { key: "reports", label: "Reports", icon: ShieldAlert, path: "/reports" },
    ],
  },
  {
    title: "Content",
    items: [
      { key: "podcasts", label: "Podcasts", icon: Mic, path: "/podcasts" },
      { key: "reels", label: "Preach Clips", icon: Clapperboard, path: "/reels" },
      { key: "albums", label: "Albums", icon: Disc3, path: "/albums" },
      {
        key: "categories",
        label: "Categories",
        icon: FolderTree,
        children: [
          { key: "categories-list", label: "Categories", path: "/categories" },
          { key: "subcategories", label: "Subcategories", path: "/subcategories" },
        ],
      },
      { key: "banners", label: "Banners", icon: Image, path: "/banners" },
    ],
  },
  {
    title: "Broadcast",
    items: [
      { key: "station", label: "Station", icon: RadioTower, path: "/station" },
      { key: "live", label: "Go Live", icon: Radio, path: "/live" },
    ],
  },
  {
    title: "System",
    items: [
      { key: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
      {
        key: "content",
        label: "Legal & Help",
        icon: FileText,
        children: [
          { key: "terms", label: "Terms & Conditions", path: "/content/terms" },
          { key: "privacy", label: "Privacy Policy", path: "/content/privacy" },
          { key: "about", label: "About Us", path: "/content/about" },
          { key: "faq", label: "FAQ", path: "/content/faq" },
          { key: "support", label: "Support Contact", path: "/content/support" },
        ],
      },
      { key: "settings", label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

const flat = NAV_SECTIONS.flatMap((s) => s.items).flatMap((item) =>
  item.children ? item.children.map((c) => ({ ...c, parent: item })) : [item]
);

/** Finds the nav entry matching the current pathname (longest prefix wins). */
export const findNavItem = (pathname) =>
  flat
    .filter((i) => (i.path === "/" ? pathname === "/" : pathname === i.path || pathname.startsWith(`${i.path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0];
