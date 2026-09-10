import { useState } from "react";
import { useApp, Link } from "../components/runtime.jsx";
import { Button, Field, Modal, Notice, PageTitle } from "../components/ui.jsx";
export function Preview() {
  const {
    t,
    session,
    setSession,
    scenario,
    setScenario,
    reset,
    switchLang,
    lang,
  } = useApp();
  const [confirm, setConfirm] = useState(false);
  const routes = [
    ["/home", "首页", "Home"],
    ["/about", "关于我们", "About"],
    ["/corridor", "合作走廊", "Corridor"],
    ["/business", "企业合作", "Business"],
    ["/individual", "个人用户", "Individual"],
    ["/contact", "联系", "Contact"],
    ["/legal", "帮助与条款", "Help & legal"],
    ["/auth", "登录", "Sign in"],
    ["/forum", "论坛", "Forum"],
    ["/forum/categories", "分类", "Topics"],
    ["/forum/members", "企业名录", "Companies"],
    ["/forum/new", "发布需求", "Composer"],
    ["/me/forum", "会员中心", "Member area"],
    ["/moderation", "审核", "Moderation"],
  ];
  return (
    <>
      <PageTitle title={t("预览控制台", "Preview controls")}>
        {t(
          "切换角色，演示完整流程，然后重置再开始。",
          "Switch roles, explore the full journey, then reset to start again.",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell">
          <Notice>
            {t(
              "仅本地模拟：无真实账户、支付、邮件或人工智能服务。角色选择用于预览，不是生产权限控制。",
              "Local simulation only: no real accounts, payments, emails or AI services. Role selection is a preview tool, not production access control.",
            )}
          </Notice>
          <div className="preview-controls">
            <div>
              <h2>{t("您的演示角色", "Your demo role")}</h2>
              <Field label={t("选择角色", "Choose role")}>
                <select
                  value={
                    session.role === "member" && session.id === "2"
                      ? "other"
                      : session.role
                  }
                  onChange={(e) =>
                    setSession(
                      e.target.value === "guest"
                        ? { role: "guest", id: null }
                        : e.target.value === "moderator"
                          ? { role: "moderator", id: "moderator" }
                          : {
                              role: "member",
                              id: e.target.value === "other" ? "2" : "1",
                            },
                    )
                  }
                >
                  <option value="guest">{t("访客", "Guest")}</option>
                  <option value="member">
                    {t("会员一 · 榕禾食集", "Member one · Banyan Pantry")}
                  </option>
                  <option value="other">
                    {t("会员二 · 织远服饰", "Member two · Weave Horizon")}
                  </option>
                  <option value="moderator">{t("审核员", "Moderator")}</option>
                </select>
              </Field>
              <Button secondary onClick={switchLang}>
                {lang === "zh" ? "Switch to English" : "切换至中文"}
              </Button>
            </div>
            <div>
              <h2>{t("演示情境", "Demo scenario")}</h2>
              <Field
                label={t(
                  "下一次提交的情境",
                  "Scenario for the next submission",
                )}
              >
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                >
                  {[
                    ["default", "默认政策", "Default policy"],
                    ["empty", "空论坛示例", "Empty forum scenario"],
                    ["loading", "模拟列表加载", "Simulate list loading"],
                    [
                      "list-error",
                      "模拟列表错误与重试",
                      "Simulate list error and retry",
                    ],
                    [
                      "high",
                      "高风险 · 中文内容阻止",
                      "High risk · Block Chinese content",
                    ],
                    [
                      "mid",
                      "中风险 · 中文内容阻止",
                      "Mid risk · Block Chinese content",
                    ],
                    ["low", "低风险 · 待审核", "Low risk · Queue"],
                    ["unknown", "不确定 · 待审核", "Uncertain · Queue"],
                    [
                      "scan-failure",
                      "扫描失败 · 待审核",
                      "Scan failure · Queue",
                    ],
                    [
                      "mid-review",
                      "备选政策：中风险进入审核",
                      "Alternative policy: mid risk queued",
                    ],
                    [
                      "failure",
                      "下一次保存失败（然后可重试）",
                      "Fail next save (then retry)",
                    ],
                  ].map(([id, zh, en]) => (
                    <option key={id} value={id}>
                      {t(zh, en)}
                    </option>
                  ))}
                </select>
              </Field>
              {scenario === "mid-review" && (
                <Notice>
                  {t(
                    "备选审核政策，不是默认客户规则。",
                    "Alternative review policy, not the default client rule.",
                  )}
                </Notice>
              )}
              <p>
                {t(
                  "英文与混合语言始终进入人工审核。",
                  "English and mixed-language submissions always enter manual review.",
                )}
              </p>
            </div>
          </div>
          <h2>{t("完整演示路线", "A complete walkthrough")}</h2>
          <ol className="walkthrough">
            {[
              [
                "以访客身份浏览首页、历史、故事与服务。",
                "Explore Home, history, stories and services as a guest.",
              ],
              [
                "在论坛收藏帖子，登录后继续操作。",
                "Save a forum listing and continue through demo sign-in.",
              ],
              [
                "以会员身份发布需求，查看待审核状态。",
                "Submit a listing as a member and see its pending status.",
              ],
              [
                "切换审核员，批准提交的具体版本。",
                "Switch to Moderator and approve the exact submitted revision.",
              ],
              [
                "返回访客，确认帖子出现在论坛与首页。",
                "Return as Guest and find the listing in the forum and on Home.",
              ],
              [
                "编辑、拒绝并重新提交，验证旧版本在审核期间保持公开。",
                "Edit, reject and resubmit, checking that the previous version stays public during review.",
              ],
            ].map(([zh, en]) => (
              <li key={en}>{t(zh, en)}</li>
            ))}
          </ol>
          <div className="actions">
            <Link className="button" to="/home">
              {t("开始浏览", "Start exploring")}
            </Link>
            <Link className="button secondary" to="/moderation">
              {t("打开审核工作台", "Open moderation")}
            </Link>
            <Button secondary onClick={() => setConfirm(true)}>
              {t("重置全部演示数据", "Reset all demo data")}
            </Button>
          </div>
          <h2>{t("页面索引", "Page index")}</h2>
          <div className="page-index">
            {routes.map(([path, zh, en]) => (
              <Link key={path} to={path}>
                {t(zh, en)}
              </Link>
            ))}
          </div>
          <h2>{t("正式上线前的确认事项", "Decisions before production")}</h2>
          <p>
            {t(
              "CYS 内容负责人：正式标志、联络渠道、伙伴与故事。合规负责人：牌照及服务表述、法律文本、审核政策。Neu Entity：真实身份、数据库与服务集成。公开 Dislike、认证及通知产品仍是待确认政策。",
              "CYS content owner: final logo, contact channels, partners and stories. Compliance owner: licence and service wording, legal copy and moderation policy. Neu Entity: real identity, database and service integrations. Public Dislike, verification and notifications remain open policy decisions.",
            )}
          </p>
        </div>
      </section>
      {confirm && (
        <Modal
          title={t("重置本网站演示？", "Reset this site’s demo?")}
          onClose={() => setConfirm(false)}
        >
          <p>
            {t(
              "所有本地示例将重新生成，返回访客与中文。只影响本网站的演示空间。",
              "All local examples will be reseeded, returning to Guest and Chinese. Only this app’s mock namespace is affected.",
            )}
          </p>
          <Button
            onClick={() => {
              setConfirm(false);
              reset();
            }}
          >
            {t("确认重置", "Confirm reset")}
          </Button>
        </Modal>
      )}
    </>
  );
}
