import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/header/logo.png";

const AuthLayout = ({ title, subtitle, children, backTo }) => (
  <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.1fr]">
    <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-brand/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[120px]"
      />
      <img src={logo} alt="Preach Radio" className="relative h-14 w-auto self-start" />
      <div className="relative max-w-md">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
          Run your station from one calm place.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Manage creators, publish podcasts, curate albums and go live — all from the Preach Radio admin console.
        </p>
      </div>
      <p className="relative text-xs text-zinc-500">© {new Date().getFullYear()} Preach Radio</p>
    </div>

    <div className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <img src={logo} alt="Preach Radio" className="mb-10 h-12 w-auto rounded-lg bg-sidebar p-2 lg:hidden" />
        {backTo && (
          <Link to={backTo} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft size={16} /> Back
          </Link>
        )}
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  </div>
);

AuthLayout.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  backTo: PropTypes.string,
};

export default AuthLayout;
