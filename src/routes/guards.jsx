import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { ADMIN_ROLES, selectAccessToken, selectRole } from "../store/authSlice";

/** Requires a token issued to an admin role. Remembers where the user was heading. */
export const RequireAuth = ({ children }) => {
  const token = useSelector(selectAccessToken);
  const role = useSelector(selectRole);
  const location = useLocation();

  // Sessions persisted before role tracking existed have no role; the backend still enforces roles per route.
  const allowed = token && (!role || ADMIN_ROLES.includes(role));
  if (!allowed) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

RequireAuth.propTypes = { children: PropTypes.node };

/** Keeps signed-in admins away from the login / reset screens. */
export const GuestOnly = ({ children }) => {
  const token = useSelector(selectAccessToken);
  if (token) return <Navigate to="/" replace />;
  return children;
};

GuestOnly.propTypes = { children: PropTypes.node };
