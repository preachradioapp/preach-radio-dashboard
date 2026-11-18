import { lazy } from "react";
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { NotFound, RouteError } from "../components/ErrorBoundary";
import { GuestOnly, RequireAuth } from "./guards";

// Route-level code splitting: each page (and heavy deps like the 100ms SDK and Jodit) loads on demand.
const Login = lazy(() => import("../pages/auth/Login"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const VerifyCode = lazy(() => import("../pages/auth/VerifyCode"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const UsersPage = lazy(() => import("../pages/people/UsersPage"));
const CreatorsPage = lazy(() => import("../pages/people/CreatorsPage"));
const ReportsPage = lazy(() => import("../pages/people/ReportsPage"));
const PodcastsPage = lazy(() => import("../pages/media/PodcastsPage"));
const ReelsPage = lazy(() => import("../pages/media/ReelsPage"));
const StationPage = lazy(() => import("../pages/media/StationPage"));
const LivePage = lazy(() => import("../pages/media/LivePage"));
const AlbumsPage = lazy(() => import("../pages/catalog/AlbumsPage"));
const AlbumDetailPage = lazy(() => import("../pages/catalog/AlbumDetailPage"));
const CategoriesPage = lazy(() => import("../pages/catalog/CategoriesPage"));
const SubcategoriesPage = lazy(() => import("../pages/catalog/SubcategoriesPage"));
const BannersPage = lazy(() => import("../pages/catalog/BannersPage"));
const NotificationsPage = lazy(() => import("../pages/system/NotificationsPage"));
const ContentEditorPage = lazy(() => import("../pages/system/ContentEditorPage"));
const FaqPage = lazy(() => import("../pages/system/FaqPage"));
const SupportContactPage = lazy(() => import("../pages/system/SupportContactPage"));
const SettingsPage = lazy(() => import("../pages/system/SettingsPage"));
const PublicContentPage = lazy(() => import("../pages/public/PublicContentPage"));

/** Old dashboard URLs → new ones, so bookmarks and shared links keep working. */
const LEGACY_REDIRECTS = {
  "/dashboard/UserManagement": "/users",
  "/dashboard/CreatorManagement": "/creators",
  "/dashboard/create-creator": "/creators",
  "/dashboard/CategoriesManagement/Categories": "/categories",
  "/dashboard/CategoriesManagement/Subcategory": "/subcategories",
  "/dashboard/Subscription": "/",
  "/dashboard/station": "/station",
  "/dashboard/live": "/live",
  "/dashboard/podcast": "/podcasts",
  "/dashboard/album": "/albums",
  "/dashboard/reels": "/reels",
  "/dashboard/reports": "/reports",
  "/banner": "/banners",
  "/dashboard/Settings/profile": "/settings",
  "/dashboard/Settings/notification": "/notifications",
  "/dashboard/Settings/Terms&Condition": "/content/terms",
  "/dashboard/Settings/PrivacyPolicy": "/content/privacy",
  "/dashboard/Settings/aboutUs": "/content/about",
  "/dashboard/Settings/FAQ": "/content/faq",
  "/dashboard/Settings/support": "/content/support",
  "/forgetpassword": "/forgot-password",
  "/verify": "/verify-code",
  "/reset": "/reset-password",
};

const guest = (el) => <GuestOnly>{el}</GuestOnly>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "creators", element: <CreatorsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "podcasts", element: <PodcastsPage /> },
      { path: "reels", element: <ReelsPage /> },
      { path: "albums", element: <AlbumsPage /> },
      { path: "albums/:id", element: <AlbumDetailPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "subcategories", element: <SubcategoriesPage /> },
      { path: "banners", element: <BannersPage /> },
      { path: "station", element: <StationPage /> },
      { path: "live", element: <LivePage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "content/terms", element: <ContentEditorPage key="terms" pageKey="terms" /> },
      { path: "content/privacy", element: <ContentEditorPage key="privacy" pageKey="privacy" /> },
      { path: "content/about", element: <ContentEditorPage key="about" pageKey="about" /> },
      { path: "content/faq", element: <FaqPage /> },
      { path: "content/support", element: <SupportContactPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "dashboard/albumDetails/:id", element: <LegacyAlbumRedirect /> },
      ...Object.entries(LEGACY_REDIRECTS).map(([from, to]) => ({
        path: from.slice(1),
        element: <Navigate to={to} replace />,
      })),
      { path: "*", element: <NotFound /> },
    ],
  },

  { path: "/login", element: guest(<Login />), errorElement: <RouteError /> },
  { path: "/forgot-password", element: guest(<ForgotPassword />), errorElement: <RouteError /> },
  { path: "/verify-code", element: guest(<VerifyCode />), errorElement: <RouteError /> },
  { path: "/reset-password", element: guest(<ResetPassword />), errorElement: <RouteError /> },

  // Public legal pages (old paths are linked from the mobile apps / store listings — keep them).
  { path: "/terms-and-conditions", element: <PublicContentPage pageKey="terms" />, errorElement: <RouteError /> },
  { path: "/privacy-policy", element: <PublicContentPage pageKey="privacy" />, errorElement: <RouteError /> },
  { path: "/Terms-and-condition", element: <PublicContentPage pageKey="terms" />, errorElement: <RouteError /> },
  { path: "/privecy-policy", element: <PublicContentPage pageKey="privacy" />, errorElement: <RouteError /> },
]);

function LegacyAlbumRedirect() {
  const { id } = useParams();
  return <Navigate to={`/albums/${id}`} replace />;
}
