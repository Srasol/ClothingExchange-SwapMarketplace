import {
  FaArrowLeft,
  FaPlus,
} from "react-icons/fa";

function PageHeader({
  label,
  title,
  description,
  icon,
  count,
  countLabel,
  backText,
  onBack,
  actionText,
  onAction,
}) {
  return (
    <section className="fashion-page-header">
      <div className="fashion-page-header-content">
        <div className="fashion-page-header-copy">
          {backText && onBack && (
            <button
              type="button"
              className="fashion-page-back"
              onClick={onBack}
            >
              <FaArrowLeft />
              {backText}
            </button>
          )}

          {label && (
            <span className="fashion-page-label">
              {label}
            </span>
          )}

          <h1>{title}</h1>

          {description && <p>{description}</p>}

          {actionText && onAction && (
            <button
              type="button"
              className="fashion-page-action"
              onClick={onAction}
            >
              <FaPlus />
              {actionText}
            </button>
          )}
        </div>

        <div className="fashion-page-header-right">
          {icon && (
            <div className="fashion-page-icon">
              {icon}
            </div>
          )}

          {count !== undefined && (
            <div className="fashion-page-count">
              <strong>{count}</strong>
              <span>{countLabel}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageHeader;