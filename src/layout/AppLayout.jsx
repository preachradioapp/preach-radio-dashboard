import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Drawer } from "antd";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { logout } from "../store/authSlice";
import { PageLoader } from "../components/ui/States";
import ErrorBoundary from "../components/ErrorBoundary";

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  // Scroll to top on navigation.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[260px] lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <Drawer
        open={menuOpen}
        onClose={closeMenu}
        placement="left"
        width={272}
        closable={false}
        styles={{ body: { padding: 0 } }}
        className="lg:hidden"
      >
        <Sidebar onNavigate={closeMenu} onLogout={handleLogout} />
      </Drawer>

      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        <Topbar onOpenMenu={openMenu} onLogout={handleLogout} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* key resets the boundary when navigating away from a crashed page */}
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
