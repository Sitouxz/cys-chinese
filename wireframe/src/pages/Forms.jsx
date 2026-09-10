import { useState } from "react";
import { useApp, Link } from "../components/runtime.jsx";
import {
  Button,
  Field,
  Form,
  Notice,
  PageTitle,
  Tabs,
  Empty,
} from "../components/ui.jsx";
import { faqs } from "../content/catalog.js";
import { demoEmail } from "../mock/service.js";
export function Contact({ postId = null }) {
  const { t, location, query, act, busy, errorText, session } = useApp();
  const tab = ["details", "feedback"].includes(location.searchParams.get("tab"))
    ? location.searchParams.get("tab")
    : "enquiry";
  const [data, setData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    audience: ["individual", "financial"].includes(
      location.searchParams.get("audience"),
    )
      ? location.searchParams.get("audience")
      : "business",
    reason: "suggestion",
    consent: false,
    marketing: false,
  });
  const [error, setError] = useState(null),
    [receipt, setReceipt] = useState(null);
  const change = (key, value) => {
    setData((d) => ({ ...d, [key]: value }));
    setReceipt(null);
  };
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await act("enquiry", {
        ...data,
        audience: tab === "feedback" ? "feedback" : data.audience,
        postId,
      });
      if (response) setReceipt(response.id);
    } catch (e) {
      setError(e);
    }
  };
  if (postId && !session.id)
    return (
      <Empty title={t("请先登录", "Please sign in")}>
        <Link
          to={
            "/auth?return=" +
            encodeURIComponent(location.pathname + location.search)
          }
        >
          {t("打开演示登录", "Open demo sign-in")}
        </Link>
      </Empty>
    );
  return (
    <>
      <PageTitle
        title={
          postId
            ? t("与企业建立联系", "Connect with this company")
            : t(
                "每一份需求，值得认真倾听。",
                "Every need deserves a thoughtful conversation.",
              )
        }
      >
        {t(
          "请仅使用虚构资料。所有提交只产生本地回执。",
          "Use fictional details only. All submissions create a local receipt.",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell">
          <Tabs
            panelId="contact-panel"
            label={t("联系选项", "Contact options")}
            value={tab}
            onChange={(id) => query("tab", id)}
            options={[
              { id: "details", label: t("联系方式", "Contact details") },
              { id: "enquiry", label: t("方案咨询", "Enquiry") },
              { id: "feedback", label: t("用户反馈", "Feedback") },
            ]}
          />
          <div
            className="contact-layout"
            role="tabpanel"
            id="contact-panel"
            aria-labelledby={"contact-panel-" + tab}
          >
            <aside>
              <h2>{t("从一次交流开始。", "Start with a conversation.")}</h2>
              <p>
                {t(
                  "告诉我们您的业务方向或个人需求，探索合适的下一步。",
                  "Tell us about your business or personal needs to explore a suitable next step.",
                )}
              </p>
              <dl>
                <dt>
                  {t("地址 · 所提供资料", "Address · Supplied information")}
                </dt>
                <dd>
                  143 Cecil Street, #26-01
                  <br />
                  Singapore 069542
                </dd>
                <dt>{t("电话", "Phone")}</dt>
                <dd>+65 6226 2088</dd>
                <dt>{t("邮箱", "Email")}</dt>
                <dd>enquiry@cys.com.sg</dd>
              </dl>
              <p className="small muted">
                {t(
                  "正式联系渠道待确认。微信与 WhatsApp 详情待确认，请使用右侧演示咨询。",
                  "Current contact channels need confirmation. WeChat and WhatsApp details are pending; use the demo enquiry here.",
                )}
              </p>
              <Link className="text-link" to="/faq">
                {t("浏览常见问题", "Browse frequently asked questions")}
              </Link>
            </aside>
            <div>
              {tab === "details" ? (
                <div className="contact-details">
                  <h2>{t("我们如何帮助您？", "How can we help?")}</h2>
                  <p>
                    {t(
                      "企业方案、个人支付需求或网站反馈，都可以从演示表单开始。预览不会拨打电话或发送邮件。",
                      "Explore business solutions, personal payment needs or website feedback using the demo form. The preview does not call or send email.",
                    )}
                  </p>
                  <Button onClick={() => query("tab", "enquiry")}>
                    {t("填写演示咨询", "Open demo enquiry")}
                  </Button>
                </div>
              ) : (
                <Form error={error} onSubmit={submit} noValidate>
                  <h2>
                    {tab === "feedback"
                      ? t("分享您的反馈", "Share your feedback")
                      : t("一起规划下一步", "Plan the next step")}
                  </h2>
                  {location.searchParams.get("topic") && (
                    <p className="notice">
                      {t("咨询主题", "Enquiry topic")}:{" "}
                      {location.searchParams.get("topic")}
                    </p>
                  )}
                  <div className="form-grid">
                    <Field
                      label={
                        tab === "feedback"
                          ? t("示例姓名（可选）", "Demo name (optional)")
                          : t("示例姓名 *", "Demo name *")
                      }
                      name="name"
                      value={data.name}
                      maxLength={80}
                      onChange={(e) => change("name", e.target.value)}
                      autoComplete="off"
                    />
                    <Field
                      label={
                        tab === "feedback"
                          ? t(
                              "回复邮箱（可选，.example）",
                              "Reply email (optional, .example)",
                            )
                          : t(
                              "示例邮箱（.example）*",
                              "Demo email (.example) *",
                            )
                      }
                      name="email"
                      value={data.email}
                      type="email"
                      maxLength={254}
                      placeholder="hello@company.example"
                      onChange={(e) => change("email", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  {tab !== "feedback" && (
                    <>
                      <Field label={t("用户类型 *", "Audience *")}>
                        <select
                          name="audience"
                          value={data.audience}
                          onChange={(e) => change("audience", e.target.value)}
                        >
                          <option value="business">
                            {t("跨境企业", "Cross-border business")}
                          </option>
                          <option value="financial">
                            {t("金融机构", "Financial institution")}
                          </option>
                          <option value="individual">
                            {t("个人用户", "Individual")}
                          </option>
                        </select>
                      </Field>
                      {data.audience !== "individual" && (
                        <Field
                          label={t("示例公司 *", "Demo company *")}
                          name="company"
                          value={data.company}
                          maxLength={120}
                          onChange={(e) => change("company", e.target.value)}
                        />
                      )}
                      <Field
                        label={t("演示电话（可选）", "Demo phone (optional)")}
                        name="phone"
                        type="tel"
                        maxLength={30}
                        value={data.phone}
                        onChange={(e) => change("phone", e.target.value)}
                      />
                    </>
                  )}
                  {tab === "feedback" && (
                    <fieldset>
                      <legend>{t("反馈类型 *", "Feedback category *")}</legend>
                      <div className="check-row">
                        {[
                          ["clear", "网站功能很清晰", "Clear and helpful"],
                          ["slow", "网站有点卡顿", "Loading feels slow"],
                          ["suggestion", "其他建议", "Other suggestion"],
                        ].map(([id, zh, en]) => (
                          <label key={id}>
                            <input
                              type="radio"
                              name="feedback"
                              value={id}
                              checked={data.reason === id}
                              onChange={() => change("reason", id)}
                            />
                            {t(zh, en)}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  <Field
                    label={t(
                      "您的需求或反馈 *（10–2,000 字）",
                      "Your message * (10–2,000 characters)",
                    )}
                  >
                    <textarea
                      name="message"
                      value={data.message}
                      rows={6}
                      maxLength={2000}
                      onChange={(e) => change("message", e.target.value)}
                    />
                  </Field>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={data.consent}
                      onChange={(e) => change("consent", e.target.checked)}
                    />
                    {t(
                      "我确认只填写虚构资料，并同意本地演示处理。",
                      "I am using fictional details and consent to local demo processing.",
                    )}{" "}
                    <Link to="/privacy">{t("隐私声明", "Privacy")}</Link>
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={data.marketing}
                      onChange={(e) => change("marketing", e.target.checked)}
                    />
                    {t(
                      "演示可选项：接收营销信息（不会实际发送）",
                      "Optional demo preference: marketing updates (nothing will be sent)",
                    )}
                  </label>
                  {error && <Notice error>{errorText(error)}</Notice>}
                  {receipt ? (
                    <Notice>
                      {t(
                        "演示提交成功，未发送任何消息。",
                        "Demo submission complete. No message was sent.",
                      )}
                      <br />
                      {t("回执", "Receipt")}: {receipt}
                    </Notice>
                  ) : (
                    <Button type="submit" disabled={busy}>
                      {busy
                        ? t("正在保存…", "Saving…")
                        : t("提交演示咨询", "Submit demo enquiry")}
                    </Button>
                  )}
                </Form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export function Legal() {
  const { t, txt, location, query } = useApp();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("");
  const tab = ["terms", "privacy"].includes(location.searchParams.get("tab"))
    ? location.searchParams.get("tab")
    : "faq";
  const filtered = faqs.filter(
    (f) =>
      (!category || f.category === category) &&
      (txt(f.question) + txt(f.answer))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title={t(
          "清晰的信息，安心的探索。",
          "Clear information for a confident next step.",
        )}
      >
        {t("帮助与条款", "Help & terms")}
      </PageTitle>
      <section className="section">
        <div className="shell article-body">
          <Tabs
            panelId="help-panel"
            label={t("帮助与条款", "Help & terms")}
            value={tab}
            onChange={(id) => query("tab", id)}
            options={[
              { id: "faq", label: t("常见问题", "FAQ") },
              { id: "terms", label: t("条款与条件", "Terms") },
              { id: "privacy", label: t("隐私声明", "Privacy") },
            ]}
          />
          <div
            id="help-panel"
            role="tabpanel"
            aria-labelledby={"help-panel-" + tab}
          >
            {tab === "faq" ? (
              <>
                <div className="form-grid">
                  <Field
                    label={t("搜索问题", "Search questions")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Field label={t("分类", "Category")}>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">{t("全部", "All")}</option>
                      {[
                        ["preview", "演示", "Preview"],
                        ["forum", "论坛", "Forum"],
                        ["account", "账户", "Account"],
                        ["contact", "联系", "Contact"],
                      ].map(([id, zh, en]) => (
                        <option key={id} value={id}>
                          {t(zh, en)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {filtered.length ? (
                  filtered.map((f) => (
                    <details className="faq" key={f.id}>
                      <summary>{txt(f.question)}</summary>
                      <p>{txt(f.answer)}</p>
                    </details>
                  ))
                ) : (
                  <Empty />
                )}
              </>
            ) : (
              <>
                <Notice>
                  {t(
                    "示例法律文本 · 仅供预览，未获正式批准。",
                    "Illustrative legal text · For preview only, not approved legal terms.",
                  )}
                </Notice>
                {(tab === "privacy"
                  ? [
                      [
                        "本地演示资料",
                        "Local preview data",
                        "本预览使用浏览器中的虚构社群数据，保存帖子、评论与审核回执，以便演示连续流程。请勿输入真实个人资料、客户信息或密码。",
                        "This preview uses fictional community data in your browser. Listings, comments and review receipts are saved to demonstrate connected workflows. Do not enter real personal details, client information or passwords.",
                      ],
                      [
                        "收集最少资料",
                        "Data minimisation",
                        "咨询表单只保存回执编号、用户类型与帖子关联，不保存姓名、邮箱或信息正文。密码从不保存。社群内容保持本地，请使用虚构资料。",
                        "Enquiry forms retain only a receipt ID, audience and listing reference, not names, emails or message text. Passwords are never saved. Community content remains local; use fictional information.",
                      ],
                      [
                        "清除与控制",
                        "Removal and control",
                        "您可在预览控制台重置本网站的演示数据。不会影响其他网站的浏览器储存。若浏览器禁止储存，刷新后数据可能重置。",
                        "Reset this app’s mock data in Preview controls without affecting other sites. If browser storage is disabled, data may reset on refresh.",
                      ],
                      [
                        "正式服务前",
                        "Before a live service",
                        "正式上线前，须确认资料处理目的、保存期限、访问与更正方式、跨境传输安排以及可联系的数据保护负责人。",
                        "Before launch, confirm processing purposes, retention, access and correction procedures, cross-border transfer arrangements and a reachable data protection officer.",
                      ],
                    ]
                  : [
                      [
                        "预览的用途",
                        "Purpose of this preview",
                        "本网站用于展示 CYS 网站的拟定体验，所有账户、合作伙伴、故事与社群活动均为本地示例。它不构成金融服务、报价或合作承诺。",
                        "This site demonstrates a proposed CYS experience. Accounts, partners, stories and community activity are local examples. It is not a financial service, quotation or partnership commitment.",
                      ],
                      [
                        "负责任的参与",
                        "Responsible participation",
                        "请以尊重、清晰和诚实的方式交流。不得发布诈骗、冒充、骚扰或未经证实的保证收益内容。发布前需要审核。",
                        "Participate respectfully and clearly. Do not post scams, impersonation, harassment or unsupported guaranteed-return claims. Publication requires review.",
                      ],
                      [
                        "内容与审核",
                        "Content and review",
                        "提交不保证发布。待审核内容仅向作者及演示审核员显示。审核可能批准、拒绝或要求修改，举报后不会立即自动删除。",
                        "Submission does not guarantee publication. Pending content is visible only to its author and the demo moderator. Review can approve, reject or request changes. Reports do not trigger immediate automatic removal.",
                      ],
                      [
                        "正式条款的确认",
                        "Formal terms",
                        "本示例不替代正式法律文件。实际服务范围、资格、费用、责任与投诉流程须在正式上线前由相关负责人批准。",
                        "This example does not replace formal legal documents. Actual service scope, eligibility, fees, responsibilities and complaint procedures require approval before launch.",
                      ],
                    ]
                ).map(([zh, en, bzh, ben]) => (
                  <section key={en}>
                    <h2>{t(zh, en)}</h2>
                    <p>{t(bzh, ben)}</p>
                  </section>
                ))}
              </>
            )}
          </div>
          <p>
            <Link className="text-link" to="/contact">
              {t("仍需帮助？与我们交流", "Need more help? Get in touch")}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
export function Auth() {
  const { t, location, query, state, act, busy, login, errorText, go } =
    useApp();
  const mode = ["register", "forgot", "verify", "reset"].includes(
    location.searchParams.get("mode"),
  )
    ? location.searchParams.get("mode")
    : "login";
  const [email, setEmail] = useState("member1@cys.example"),
    [password, setPassword] = useState("DemoPass123"),
    [confirm, setConfirm] = useState(""),
    [consent, setConsent] = useState(false),
    [show, setShow] = useState(false),
    [error, setError] = useState(null),
    [newId, setNewId] = useState(() => location.searchParams.get("account")),
    [receipt, setReceipt] = useState(false);
  const changeMode = (value) => {
    setError(null);
    setReceipt(false);
    query("mode", value);
  };
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "register") {
        const result = await act("register", {
          email,
          password,
          confirm,
          consent,
        });
        if (result) {
          setNewId(result.id);
          setPassword("");
          setConfirm("");
          go(
            `/auth?mode=verify&account=${encodeURIComponent(result.id)}&return=${encodeURIComponent(location.searchParams.get("return") || "/me/forum")}`,
          );
        }
      } else if (mode === "login") {
        const account = state.accounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase(),
        );
        if (!account || password !== "DemoPass123")
          throw { code: "invalidLogin" };
        if (!account.verified) {
          setNewId(account.id);
          go(`/auth?mode=verify&account=${encodeURIComponent(account.id)}`);
          return;
        }
        login(account);
        setPassword("");
      } else if (mode === "forgot") {
        if (!demoEmail(email)) throw { code: "register" };
        setReceipt(true);
      } else if (mode === "reset") {
        if (
          password.length < 8 ||
          password.length > 128 ||
          password !== confirm
        )
          throw { code: "register" };
        setPassword("");
        setConfirm("");
        setReceipt(true);
      }
    } catch (e) {
      setError(e);
    }
  };
  const title =
    mode === "register"
      ? t("加入对话，发现可能。", "Join the conversation.")
      : mode === "forgot" || mode === "reset"
        ? t("重新开始，保持连接。", "Reconnect with your account.")
        : mode === "verify"
          ? t("完成演示验证", "Complete demo verification")
          : t("欢迎回来。", "Welcome back.");
  return (
    <section className="section auth-section">
      <div className="shell auth-layout">
        <aside className="dark">
          <p className="origin">CYS GLOBAL REMIT</p>
          <h1>
            {t(
              "好的合作，\n始于彼此了解。",
              "Good partnerships begin with understanding.",
            )}
          </h1>
          <p>
            {t(
              "分享需求，认识伙伴，开启下一次商业对话。",
              "Share a need, meet a partner and start your next business conversation.",
            )}
          </p>
          <p className="small">
            {t(
              "本地演示 · 不创建真实账户",
              "Local demonstration · No real accounts",
            )}
          </p>
        </aside>
        <div className="auth-form">
          <h2>{title}</h2>
          <p>
            {t(
              "只使用虚构邮箱与演示密码，密码不会被保存。",
              "Use fictional email addresses and demo passwords only. Passwords are never stored.",
            )}
          </p>
          {mode === "verify" ? (
            <>
              <Notice>
                {t(
                  "演示验证链接已准备，未发送任何邮件。验证后请使用您的虚构邮箱及统一演示密码 DemoPass123 登录。",
                  "A demo verification link is ready. No email was sent. After verification, sign in with your fictional email and the shared demo password DemoPass123.",
                )}
              </Notice>
              <Button
                disabled={busy || !newId}
                onClick={async () => {
                  try {
                    await act("verify", { id: newId });
                    changeMode("login");
                  } catch (e) {
                    setError(e);
                  }
                }}
              >
                {t("模拟验证邮箱", "Simulate email verification")}
              </Button>
              <p>
                <Button secondary onClick={() => changeMode("login")}>
                  {t("返回登录", "Back to sign-in")}
                </Button>
              </p>
            </>
          ) : mode === "reset" &&
            location.searchParams.get("expired") === "1" ? (
            <>
              <Notice error>
                {t(
                  "演示链接已过期，请重新申请。",
                  "This demo link has expired. Request a new one.",
                )}
              </Notice>
              <Button
                onClick={() => {
                  go("/auth?mode=forgot");
                  setReceipt(false);
                }}
              >
                {t("重新申请", "Request again")}
              </Button>
            </>
          ) : receipt ? (
            <>
              <Notice>
                {mode === "forgot"
                  ? t(
                      "演示重置链接已准备，未发送邮件。",
                      "A demo reset link is ready. No email was sent.",
                    )
                  : t(
                      "演示重置完成。未更改真实密码，演示登录仍使用 DemoPass123。",
                      "Demo reset complete. No real password changed; demo sign-in still uses DemoPass123.",
                    )}
              </Notice>
              <Button
                onClick={() => {
                  if (mode === "forgot") {
                    setPassword("");
                    go("/auth?mode=reset");
                    setReceipt(false);
                  } else {
                    setPassword("DemoPass123");
                    changeMode("login");
                  }
                }}
              >
                {mode === "forgot"
                  ? t("打开演示重置链接", "Open demo reset link")
                  : t("返回登录", "Back to sign-in")}
              </Button>
            </>
          ) : (
            <Form error={error} onSubmit={submit} noValidate>
              {mode !== "reset" && (
                <Field
                  label={t("示例邮箱", "Demo email")}
                  name="email"
                  value={email}
                  type="email"
                  maxLength={254}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
              {mode !== "forgot" && (
                <>
                  <Field
                    label={t("演示密码", "Demo password")}
                    name="password"
                    value={password}
                    type={show ? "text" : "password"}
                    maxLength={128}
                    autoComplete="off"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={show}
                      onChange={(e) => setShow(e.target.checked)}
                    />
                    {t("显示密码", "Show password")}
                  </label>
                  {["register", "reset"].includes(mode) && (
                    <Field
                      label={t("确认演示密码", "Confirm demo password")}
                      name="confirm"
                      value={confirm}
                      type={show ? "text" : "password"}
                      maxLength={128}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  )}
                </>
              )}
              {mode === "register" && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  {t(
                    "我已阅读示例条款，理解此为本地演示。",
                    "I have read the illustrative terms and understand this is a local demo.",
                  )}
                  <Link to="/terms">{t("条款", "Terms")}</Link>
                </label>
              )}
              {error && <Notice error>{errorText(error)}</Notice>}
              <Button type="submit" disabled={busy}>
                {busy
                  ? t("处理中…", "Working…")
                  : mode === "register"
                    ? t("创建演示账户", "Create demo account")
                    : mode === "forgot"
                      ? t("准备演示链接", "Prepare demo link")
                      : mode === "reset"
                        ? t("模拟重置", "Simulate reset")
                        : t("登录演示账户", "Sign in to demo")}
              </Button>
            </Form>
          )}
          {mode === "login" && (
            <>
              <p className="demo-credentials">
                member1@cys.example
                <br />
                {t("演示密码", "Demo password")}: DemoPass123
              </p>
              <div className="actions">
                <Button secondary onClick={() => changeMode("register")}>
                  {t("注册", "Register")}
                </Button>
                <button className="plain" onClick={() => changeMode("forgot")}>
                  {t("忘记密码？", "Forgot password?")}
                </button>
              </div>
            </>
          )}
          {mode === "register" && (
            <p>
              <Button secondary onClick={() => changeMode("login")}>
                {t("已有账户？登录", "Have an account? Sign in")}
              </Button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
