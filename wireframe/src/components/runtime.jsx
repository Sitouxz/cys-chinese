import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  freshState,
  mutate,
  STORAGE_KEY,
  SESSION_KEY,
  localText,
} from "../mock/service.js";
const Context = createContext(null);
const errors = {
  login: ["请先登录演示账户。", "Please sign in to a demo account."],
  forbidden: [
    "您无法执行此操作。",
    "This action is unavailable for this role.",
  ],
  unavailable: ["此内容不存在或无法公开查看。", "This content is unavailable."],
  postLength: [
    "标题需为 8–100 字，正文需为 30–3,000 字。",
    "Use 8–100 characters for the title and 30–3,000 for the body.",
  ],
  fields: [
    "请填写有效的业务分类、行业、产品与合作意向。",
    "Choose valid business fields and enter a product or service.",
  ],
  markets: ["请选择 1–5 个不同市场。", "Choose 1–5 distinct markets."],
  consent: [
    "请勾选必要的同意选项。",
    "Please accept the required acknowledgement.",
  ],
  stale: [
    "此版本已经处理或更新，请重新打开队列。",
    "This revision changed or was already reviewed. Reopen the queue.",
  ],
  reason: [
    "请选择原因并填写 10–2,000 字的说明。",
    "Select a reason and provide a 10–2,000 character explanation.",
  ],
  commentLength: ["评论需为 2–1,000 字。", "Comments need 2–1,000 characters."],
  parent: ["无法回复此评论。", "This comment cannot receive a reply."],
  duplicateReport: [
    "您已举报此内容，审核尚未完成。",
    "You already have an open report for this listing.",
  ],
  enquiry: [
    "请填写示例姓名、有效的 .example 邮箱与 10–2,000 字的信息。",
    "Enter a demo name, a valid .example email and a 10–2,000 character message.",
  ],
  company: [
    "请填写 2–120 字的示例公司名称。",
    "Enter a demo company name of 2–120 characters.",
  ],
  profile: [
    "请检查姓名、公司、行业、市场与简介的长度。",
    "Check your name, company, industry, markets and introduction length.",
  ],
  register: [
    "请使用 .example 邮箱、8–128 字密码并确认一致，勾选演示条款。",
    "Use a .example email and matching 8–128 character passwords, and acknowledge demo terms.",
  ],
  duplicateAccount: [
    "此示例邮箱已注册，请登录。",
    "This demo email is already registered. Please sign in.",
  ],
  invalidLogin: [
    "示例登录资料无效。请使用页面提供的账号。",
    "Invalid demo credentials. Use the account provided on this page.",
  ],
  network: [
    "暂时无法保存，内容已保留。请重试。",
    "We could not save this. Your content is preserved. Try again.",
  ],
  underReview: [
    "此版本正在审核，请等待审核结果后再编辑。",
    "This revision is under review. Wait for the decision before editing.",
  ],
  unverified: ["请先完成演示验证。", "Complete demo verification first."],
};
function read(storage, key, fallback) {
  try {
    const value = window[storage].getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const value = read("localStorage", STORAGE_KEY, null);
    return value?.version === 1 &&
      Object.keys(freshState()).every((k) => k in value) &&
      Array.isArray(value.posts) &&
      Array.isArray(value.revisions)
      ? value
      : freshState();
  });
  const stateRef = useRef(state);
  const [session, setSessionState] = useState(() =>
    read("sessionStorage", SESSION_KEY, { role: "guest", id: null }),
  );
  const sessionRef = useRef(session);
  const [location, setLocation] = useState(() => new URL(window.location.href));
  const [lang, setLang] = useState(() =>
    new URLSearchParams(window.location.search).get("lang") === "en"
      ? "en"
      : new URLSearchParams(window.location.search).get("lang") === "zh"
        ? "zh"
        : read("localStorage", STORAGE_KEY + "-locale", "zh"),
  );
  const [scenario, setScenarioState] = useState(() =>
    read("sessionStorage", SESSION_KEY + "-scenario", "default"),
  );
  const [storageWarning, setStorageWarning] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false),
    dirty = useRef(false),
    resume = useRef(null);
  const t = (zh, en) => (lang === "en" ? en : zh);
  const txt = (value) => localText(value, lang);
  const errorText = (error) => {
    const entry = errors[error?.code || error] || errors.fields;
    return t(...entry);
  };
  const persist = (next) => {
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setStorageWarning(true);
    }
  };
  const setSession = (value) => {
    sessionRef.current = value;
    setSessionState(value);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
    } catch {
      setStorageWarning(true);
    }
  };
  const setScenario = (value) => {
    setScenarioState(value);
    try {
      sessionStorage.setItem(SESSION_KEY + "-scenario", JSON.stringify(value));
    } catch {
      setStorageWarning(true);
    }
  };
  function go(path, { replace = false, bypass = false } = {}) {
    if (
      !bypass &&
      dirty.current &&
      !window.confirm(
        t(
          "尚有未保存的内容。确定离开？",
          "You have unsaved changes. Leave this page?",
        ),
      )
    )
      return;
    dirty.current = false;
    const url = new URL(path, window.location.origin);
    url.searchParams.set("lang", lang);
    window.history[replace ? "replaceState" : "pushState"](
      {},
      "",
      url.pathname + url.search + url.hash,
    );
    setLocation(new URL(url));
    if (url.hash)
      requestAnimationFrame(() =>
        document.getElementById(url.hash.slice(1))?.scrollIntoView(),
      );
    else window.scrollTo(0, 0);
  }
  const query = (key, value) => {
    const url = new URL(location);
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
    if (key !== "page") url.searchParams.delete("page");
    go(url.pathname + url.search + url.hash, { bypass: true });
  };
  useEffect(() => {
    const sync = () => {
      if (
        dirty.current &&
        !window.confirm(
          t(
            "尚有未保存的内容。确定离开？",
            "You have unsaved changes. Leave this page?",
          ),
        )
      ) {
        window.history.pushState({}, "", location.href);
        return;
      }
      dirty.current = false;
      setLocation(new URL(window.location.href));
      const next = new URLSearchParams(window.location.search).get("lang");
      if (next === "en" || next === "zh") setLang(next);
    };
    const unload = (e) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("beforeunload", unload);
    };
  }, [location, lang]);
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    try {
      localStorage.setItem(STORAGE_KEY + "-locale", JSON.stringify(lang));
    } catch {
      setStorageWarning(true);
    }
  }, [lang]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  async function act(action, data = {}) {
    if (lock.current) return null;
    const actor = { ...sessionRef.current };
    lock.current = true;
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 260));
      if (scenario === "failure") {
        setScenario("default");
        const error = new Error("network");
        error.code = "network";
        throw error;
      }
      const next = mutate(stateRef.current, actor, action, data, scenario);
      persist(next.state);
      return next.result || { success: true };
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function gate(callback) {
    if (session.id) callback();
    else {
      resume.current = callback;
      go(
        "/auth?mode=login&return=" +
          encodeURIComponent(location.pathname + location.search),
      );
    }
  }
  function login(account) {
    setSession({ role: "member", id: account.id });
    const destination = location.searchParams.get("return");
    go(
      destination?.startsWith("/") && !destination.startsWith("//")
        ? destination
        : "/me/forum",
      { bypass: true },
    );
  }
  useEffect(() => {
    if (session.id && resume.current) {
      const fn = resume.current;
      resume.current = null;
      fn();
    }
  }, [session]);
  function switchLang() {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    history.replaceState({}, "", url);
    setLocation(url);
  }
  function reset() {
    dirty.current = false;
    resume.current = null;
    persist(freshState());
    setSession({ role: "guest", id: null });
    setScenario("default");
    setLang("zh");
    window.history.replaceState({}, "", "/home?lang=zh");
    setLocation(new URL(window.location.href));
    window.scrollTo(0, 0);
  }
  return (
    <Context.Provider
      value={{
        state: scenario === "empty" ? { ...state, previewEmpty: true } : state,
        session,
        setSession,
        location,
        lang,
        t,
        txt,
        go,
        query,
        switchLang,
        scenario,
        setScenario,
        toast: setToast,
        busy,
        act,
        gate,
        login,
        reset,
        dirty,
        errorText,
      }}
    >
      {storageWarning && (
        <div className="storage-warning" role="status">
          {t(
            "浏览器储存不可用，刷新后演示可能重置。",
            "Browser storage is unavailable. This preview may reset on refresh.",
          )}
        </div>
      )}
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
export function Link({ to, children, className = "", onClick, ...props }) {
  const { go, lang } = useApp();
  const url = new URL(to, window.location.origin);
  url.searchParams.set("lang", lang);
  return (
    <a
      href={url.pathname + url.search + url.hash}
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
          return;
        e.preventDefault();
        onClick?.(e);
        go(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
