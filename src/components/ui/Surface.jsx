import PropTypes from "prop-types";

/** White rounded panel used as the base container for content blocks. */
const Surface = ({ title, extra, children, className = "", bodyClassName = "", padded = true }) => (
  <section className={`rounded-2xl border border-line bg-white shadow-card ${className}`}>
    {(title || extra) && (
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
        {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
        {extra}
      </header>
    )}
    <div className={`${padded ? "p-5" : ""} ${bodyClassName}`}>{children}</div>
  </section>
);

Surface.propTypes = {
  title: PropTypes.node,
  extra: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  padded: PropTypes.bool,
};

export default Surface;
