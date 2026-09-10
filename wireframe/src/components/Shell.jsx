import { useEffect, useRef, useState } from "react";
import { useApp, Link } from "./runtime.jsx";
import { Button, Arrow, Modal } from "./ui.jsx";
export function Shell({ children }) {
  const { t, lang, switchLang, session, location, setSession } = useApp();
  const [menu, setMenu] = useState(false),
    [contact, setContact] = useState(false),
    [scrolled, setScrolled] = useState(false);
  const trigger = useRef(null);
  useEffect(() => {
    setMenu(false);
    document
      .querySelectorAll("header details[open]")
      .forEach((d) => d.removeAttribute("open"));
  }, [location]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  const items = [
    [
      "/about",
      t("关于我们", "About"),
      [
        ["#intro", t("公司简介", "Introduction")],
        ["#history", t("星威历史", "History")],
        ["#culture", t("企业文化", "Culture")],
      ],
    ],
    [
      "/corridor",
      t("中新合作走廊", "Corridor"),
      [
        ["#partners", t("伙伴与投资者", "Partners & investors")],
        ["#stories", t("伙伴故事", "Partnership stories")],
      ],
    ],
    [
      "/business",
      t("企业合作", "Business"),
      [
        ["?audience=financial", t("金融机构", "Financial institutions")],
        ["?audience=business", t("跨境企业", "Cross-border corporates")],
      ],
    ],
    ["/individual", t("个人用户", "Individual")],
    ["/forum", t("华商论坛", "Chinese Forum")],
    [
      "/contact",
      t("联系我们", "Contact"),
      [
        ["?tab=details", t("联系方式", "Contact details")],
        ["?tab=enquiry", t("咨询", "Enquiry")],
        ["?tab=feedback", t("反馈", "Feedback")],
      ],
    ],
  ];
  const navigation = (mobile) => (
    <>
      {items.map(([path, label, sub]) =>
        sub ? (
          <details
            key={path}
            className={location.pathname.startsWith(path) ? "active" : ""}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.currentTarget.removeAttribute("open");
                e.currentTarget.querySelector("summary").focus();
              }
            }}
          >
            <summary>
              {label}
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
              >
                <path d="m3 4 3 3 3-3" />
              </svg>
            </summary>
            <div className={mobile ? "" : "dropdown"}>
              <Link to={path}>{t("查看全部", "Overview")}</Link>
              {sub.map(([suffix, text]) => (
                <Link key={suffix} to={path + suffix}>
                  {text}
                </Link>
              ))}
            </div>
          </details>
        ) : (
          <Link
            key={path}
            to={path}
            aria-current={
              location.pathname.startsWith(path) ? "page" : undefined
            }
          >
            {label}
          </Link>
        ),
      )}
    </>
  );
  return (
    <>
      <a className="skip-link" href="#main">
        {t("跳至内容", "Skip to content")}
      </a>
      <header className={scrolled ? "site-header compact" : "site-header"}>
        <div className="shell header-inner">
          <Link
            className="wordmark"
            to="/home"
            aria-label={t("CYS 星威环球 · 首页", "CYS Global Remit · Home")}
          >
            <strong>
              CYS<span>®</span>
            </strong>
            <small>{t("星威环球", "GLOBAL REMIT")}</small>
          </Link>
          <nav
            className="desktop-nav"
            aria-label={t("主导航", "Main navigation")}
          >
            {navigation(false)}
          </nav>
          <div className="header-actions">
            <button
              className="locale"
              onClick={switchLang}
              aria-label={lang === "zh" ? "Switch to English" : "切换至中文"}
            >
              {lang === "zh" ? "EN" : "中文"}
            </button>
            <Link
              className="account-link"
              to={session.id ? "/me/forum" : "/auth"}
            >
              {session.id ? t("我的账户", "My account") : t("登录", "Sign in")}
            </Link>
            <button
              ref={trigger}
              className="menu-toggle"
              aria-label={t("打开菜单", "Open menu")}
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <Modal
          title={t("导航", "Navigation")}
          onClose={() => {
            setMenu(false);
            trigger.current?.focus();
          }}
        >
          <nav className="mobile-nav">{navigation(true)}</nav>
          <Button secondary onClick={switchLang}>
            {lang === "zh" ? "English" : "中文"}
          </Button>
          <Link className="button" to={session.id ? "/me/forum" : "/auth"}>
            {t("我的账户", "My account")}
          </Link>
        </Modal>
      )}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <section className="contact-band">
        <div className="shell row">
          <div>
            <h2>
              {t(
                "让下一次合作，从这里开始。",
                "Your next partnership starts here.",
              )}
            </h2>
            <p>
              {t(
                "与我们交流，为您的跨境需求探索合适方案。",
                "Let’s explore the right approach for your cross-border needs.",
              )}
            </p>
          </div>
          <Link to="/contact?tab=enquiry" className="button">
            {t("与我们联系", "Get in touch")}
            <Arrow />
          </Link>
        </div>
      </section>
      <footer>
        <div className="shell footer-grid">
          <div>
            <Link className="wordmark" to="/home">
              <strong>
                CYS<span>®</span>
              </strong>
              <small>{t("星威环球", "GLOBAL REMIT")}</small>
            </Link>
            <p>{t("1981年启航于新加坡", "Founded in Singapore, 1981")}</p>
            <p className="muted">CYS Global Remit Pte Ltd</p>
          </div>
          <div>
            <h3>{t("探索 CYS", "Explore CYS")}</h3>
            {items.slice(0, 4).map(([path, text]) => (
              <Link key={path} to={path}>
                {text}
              </Link>
            ))}
          </div>
          <div>
            <h3>{t("华商社群", "Chinese community")}</h3>
            <Link to="/forum">{t("华商论坛", "Chinese Forum")}</Link>
            <Link to="/forum/members">
              {t("企业名录", "Company directory")}
            </Link>
            <Link to="/corridor#stories">
              {t("伙伴故事", "Partnership stories")}
            </Link>
            <Link to="/forum/rules">{t("社群规则", "Community rules")}</Link>
          </div>
          <div>
            <h3>{t("我们可以帮助您", "How can we help?")}</h3>
            <Link to="/faq">{t("常见问题", "FAQ")}</Link>
            <Link to="/terms">{t("条款与条件", "Terms")}</Link>
            <Link to="/privacy">{t("隐私声明", "Privacy")}</Link>
            <button className="plain" onClick={() => setContact(true)}>
              {t("联系信息", "Contact information")}
            </button>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>
            © 2026 CYS Global Remit · {t("演示预览", "Demo preview")}
          </span>
          <Link to="/preview">{t("预览控制台", "Preview controls")}</Link>
          {session.id && (
            <button
              className="plain"
              onClick={() => setSession({ role: "guest", id: null })}
            >
              {t("退出演示账户", "Sign out")}
            </button>
          )}
        </div>
      </footer>
      <Link className="demo-badge" to="/preview">
        {t("演示预览 · 示例数据", "Demo preview · Sample data")}
      </Link>
      {contact && (
        <Modal
          title={t("联系 CYS", "Contact CYS")}
          onClose={() => setContact(false)}
        >
          <p>143 Cecil Street, #26-01, Singapore 069542</p>
          <p>+65 6226 2088 · enquiry@cys.com.sg</p>
          <p>
            {t(
              "以上来自所提供资料，正式联系渠道待确认。微信与 WhatsApp 详情待确认。",
              "Details from supplied content; current channels need confirmation. WeChat and WhatsApp details are to be confirmed.",
            )}
          </p>
          <Link
            to="/contact"
            className="button"
            onClick={() => setContact(false)}
          >
            {t("打开演示咨询", "Open demo enquiry")}
          </Link>
        </Modal>
      )}
    </>
  );
}
