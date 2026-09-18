import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { useApp, Link } from "./runtime.jsx";
export function Arrow({ back = false }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={back ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}
export function Button({
  children,
  secondary = false,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`button ${secondary ? "secondary" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
const FormFeedback = createContext(null);
const errorFields = {
  registrationFields: [
    "firstName",
    "lastName",
    "phone",
    "countryCode",
    "company",
    "position",
    "profileLink",
  ],
  postLength: ["title", "body"],
  fields: ["category", "industry", "product", "intent"],
  markets: ["markets"],
  commentLength: ["body"],
  reason: ["reason", "message"],
  enquiry: ["name", "email", "message", "phone"],
  company: ["company"],
  profile: ["displayName", "company", "industry", "markets", "intro"],
  register: ["email", "password", "confirm"],
  duplicateAccount: ["email"],
  invalidLogin: ["email", "password"],
};
export function Form({ error, children, ...props }) {
  const { errorText } = useApp();
  return (
    <FormFeedback.Provider
      value={error ? { code: error.code, message: errorText(error) } : null}
    >
      <form {...props}>{children}</form>
    </FormFeedback.Provider>
  );
}
export function Field({ label, error, errorKey, children, ...props }) {
  const feedback = useContext(FormFeedback);
  const key = errorKey || props.name || children?.props.name;
  const message =
    error ||
    (feedback && errorFields[feedback.code]?.includes(key)
      ? feedback.message
      : null);
  const generatedId = useId();
  const id = children?.props.id || props.id || generatedId;
  return (
    <label className="field" htmlFor={id}>
      <span id={id + "-label"}>{label}</span>
      {children ? (
        cloneElement(children, {
          id,
          "aria-labelledby": id + "-label",
          "aria-invalid": !!message,
          "aria-describedby": message ? id + "-error" : undefined,
        })
      ) : (
        <input
          id={id}
          aria-labelledby={id + "-label"}
          aria-invalid={!!message}
          aria-describedby={message ? id + "-error" : undefined}
          {...props}
        />
      )}
      {message && (
        <small className="error" id={id + "-error"}>
          {message}
        </small>
      )}
    </label>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
  all = false,
  errorKey,
  name,
}) {
  const { t, txt } = useApp();
  return (
    <Field label={label} errorKey={errorKey || name}>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {all && <option value="">{t("全部", "All")}</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {txt(o)}
          </option>
        ))}
      </select>
    </Field>
  );
}
export function Tabs({ options, value, onChange, label, panelId }) {
  const id = useId();
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o.id}
          type="button"
          id={panelId ? panelId + "-" + o.id : id + o.id}
          role="tab"
          aria-controls={panelId}
          aria-selected={value === o.id}
          tabIndex={value === o.id ? 0 : -1}
          onClick={() => onChange(o.id)}
          onKeyDown={(e) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key))
              return;
            e.preventDefault();
            const next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? options.length - 1
                  : (i + (e.key === "ArrowRight" ? 1 : -1) + options.length) %
                    options.length;
            onChange(options[next].id);
            e.currentTarget.parentElement.children[next].focus();
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
export function Status({ status }) {
  const { t } = useApp();
  const labels = {
    draft: ["草稿", "Draft"],
    pending: ["待审核", "Under review"],
    approved: ["已发布", "Published"],
    rejected: ["未获批准", "Not approved"],
    removed: ["已移除", "Removed"],
    low: ["低风险 · 需审核", "Low risk · Needs review"],
    high: ["高风险", "High risk"],
    mid: ["中风险", "Mid risk"],
    unknown: ["不确定 · 需审核", "Uncertain · Needs review"],
  };
  return (
    <span className={`status ${status}`}>
      <span aria-hidden="true">
        {status === "approved"
          ? "✓"
          : status === "rejected" || status === "high"
            ? "!"
            : "○"}
      </span>{" "}
      {t(...(labels[status] || labels.unknown))}
    </span>
  );
}
export function Empty({ title, children }) {
  const { t } = useApp();
  return (
    <div className="empty">
      <h2>{title || t("未找到符合条件的内容", "No matching results")}</h2>
      <p>
        {children ||
          t(
            "请尝试其他关键词或清除筛选。",
            "Try another keyword or clear the filters.",
          )}
      </p>
      <Link to="/forum" className="text-link">
        {t("返回论坛", "Back to the forum")} <Arrow />
      </Link>
    </div>
  );
}
export function PageTitle({ title, children, dark = false, compact = false }) {
  return (
    <section
      className={`page-title ${dark ? "dark" : ""} ${compact ? "community-title" : ""}`}
    >
      <div className="shell">
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </section>
  );
}
export function Notice({ children, error = false }) {
  return (
    <div
      className={`notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  const ref = useRef(null),
    id = useId();
  const { t } = useApp();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = [
          ...ref.current.querySelectorAll(
            'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]',
          ),
        ].filter((element) => element.checkVisibility());
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <h2 id={id}>{title}</h2>
        <Button secondary onClick={onClose} aria-label={t("关闭", "Close")}>
          ×
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function MarketChecks({ options, value, onChange, legend }) {
  const { txt } = useApp();
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="check-row">
        {options.map((o) => (
          <label key={o.id}>
            <input
              type="checkbox"
              checked={value.includes(o.id)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...value, o.id]
                    : value.filter((v) => v !== o.id),
                )
              }
            />
            {txt(o)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
