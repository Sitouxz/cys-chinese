import { Membership } from "./pages/Community.jsx";
import { useEffect } from "react";
import { AppProvider, useApp } from "./components/runtime.jsx";
import { Shell } from "./components/Shell.jsx";
import { Empty } from "./components/ui.jsx";
import {
  About,
  Business,
  Corridor,
  Home,
  Individual,
  Story,
} from "./pages/Marketing.jsx";
import { Auth, Contact, Legal } from "./pages/Forms.jsx";
import {
  Categories,
  Composer,
  Forum,
  Members,
  PostDetail,
  Report,
  Rules,
} from "./pages/Forum.jsx";
import { Member } from "./pages/Member.jsx";
import { Moderation } from "./pages/Moderation.jsx";
import { Preview } from "./pages/Preview.jsx";
const aliases = {
  "/": "/home",
  "/corporate": "/business",
  "/about/intro": "/about#intro",
  "/about/history": "/about#history",
  "/about/culture": "/about#culture",
  "/corridor/partners": "/corridor#partners",
  "/corridor/stories": "/corridor#stories",
  "/business/financial-institutions": "/business?audience=financial",
  "/business/cross-border": "/business?audience=business",
  "/contact/details": "/contact?tab=details",
  "/contact/enquiry": "/contact?tab=enquiry",
  "/contact/feedback": "/contact?tab=feedback",
  "/faq": "/legal?tab=faq",
  "/terms": "/legal?tab=terms",
  "/privacy": "/legal?tab=privacy",
  "/login": "/auth?mode=login",
  "/register": "/auth?mode=register",
};
function Router() {
  const { location, t, go, lang } = useApp();
  const path = location.pathname.replace(/\/$/, "") || "/";
  useEffect(() => {
    if (aliases[path]) {
      const target = new URL(aliases[path], window.location.origin);
      location.searchParams.forEach((v, k) => {
        if (!target.searchParams.has(k)) target.searchParams.set(k, v);
      });
      go(target.pathname + target.search + target.hash, {
        replace: true,
        bypass: true,
      });
    }
  }, [path]);
  useEffect(() => {
    const name =
      {
        home: t("首页", "Home"),
        about: t("关于我们", "About"),
        corridor: t("中新合作走廊", "Corridor"),
        business: t("企业合作", "Business"),
        individual: t("个人用户", "Individual"),
        contact: t("联系", "Contact"),
        legal: t("帮助与条款", "Help & legal"),
        auth: t("演示账户", "Demo account"),
        forum: t("华商论坛", "Chinese Forum"),
        membership: t("会员权益", "Membership"),
        me: t("我的社群", "My community"),
        moderation: t("审核工作台", "Moderation"),
        preview: t("预览控制台", "Preview controls"),
      }[path.split("/")[1]] || t("页面不存在", "Page not found");
    document.title = name + " | CYS 星威环球";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        t(
          "CYS 星威环球双语交互演示，连接中国与东南亚的商业合作。仅使用示例数据。",
          "CYS Global Remit bilingual interactive preview, connecting China and Southeast Asia. Sample data only.",
        ),
      );
    if (location.hash)
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path, lang, location.hash]);
  let page;
  const id = path.split("/").at(-1);
  if (path === "/home" || path === "/") page = <Home />;
  else if (path === "/about") page = <About />;
  else if (path === "/corridor") page = <Corridor />;
  else if (/^\/corridor\/stories\/[^/]+$/.test(path)) page = <Story id={id} />;
  else if (path === "/business") page = <Business />;
  else if (path === "/membership") page = <Membership />;
  else if (path === "/individual") page = <Individual />;
  else if (path === "/contact")
    page = <Contact postId={location.searchParams.get("post")} />;
  else if (path === "/legal") page = <Legal />;
  else if (path === "/auth") page = <Auth />;
  else if (path === "/forum" || path === "/forum/search") page = <Forum />;
  else if (path === "/forum/categories") page = <Categories />;
  else if (
    /^\/forum\/category\/(matching|trends|policy|analysis|[1-4])$/.test(path)
  )
    page = (
      <Forum
        categoryId={
          ["matching", "trends", "policy", "analysis"][Number(id) - 1] || id
        }
      />
    );
  else if (/^\/forum\/post\/[^/]+$/.test(path))
    page = <PostDetail key={id} id={id} />;
  else if (path === "/forum/new") page = <Composer key="new" />;
  else if (/^\/forum\/edit\/[^/]+$/.test(path))
    page = <Composer key={id} id={id} />;
  else if (/^\/forum\/report\/[^/]+$/.test(path))
    page = <Report key={id} id={id} />;
  else if (path === "/forum/members") page = <Members />;
  else if (/^\/forum\/member\/[^/]+$/.test(path)) page = <Members id={id} />;
  else if (path === "/forum/rules") page = <Rules />;
  else if (
    /^\/me\/(forum|posts|replies|saved|notifications|settings|connections|ads)$/.test(
      path,
    )
  )
    page = <Member section={id} />;
  else if (path === "/moderation") page = <Moderation />;
  else if (path === "/preview") page = <Preview />;
  else if (aliases[path]) page = null;
  else
    page = (
      <section className="section shell">
        <Empty title={t("找不到这个页面", "Page not found")} />
      </section>
    );
  return <Shell>{page}</Shell>;
}
export function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
export default App;
