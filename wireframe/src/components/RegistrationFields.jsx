import { useApp } from "./runtime.jsx";
import { Field, Tabs } from "./ui.jsx";
export const registrationDefaults = {
  track: "company",
  firstName: "",
  lastName: "",
  countryCode: "+65",
  phone: "",
  company: "",
  position: "",
  profileLink: "",
  industry: "",
  region: "",
  intent: "",
  occupation: "",
  inquiry: "",
};
export function RegistrationFields({ data, setData }) {
  const { t } = useApp();
  const set = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const field = (key, zh, en, required = false) => (
    <Field
      key={key}
      name={key}
      label={t(zh, en) + (required ? " *" : t("（选填）", " (optional)"))}
      value={data[key]}
      required={required}
      maxLength={key === "inquiry" ? 1000 : 120}
      onChange={(e) => set(key, e.target.value)}
    />
  );
  return (
    <>
      <Tabs
        label={t("注册类型", "Registration type")}
        panelId="registration-track"
        value={data.track}
        onChange={(v) => set("track", v)}
        options={[
          { id: "company", label: t("企业用户", "Company") },
          { id: "individual", label: t("个人用户", "Individual") },
        ]}
      />
      <div
        id="registration-track"
        role="tabpanel"
        aria-labelledby={"registration-track-" + data.track}
      >
        <p className="small">
          {t(
            "注册即可获得银级会员。标有 * 的字段为必填。",
            "Registration grants Silver membership. Fields marked * are required.",
          )}
        </p>
        <div className="form-grid">
          {field("lastName", "姓", "Last name", true)}
          {field("firstName", "名", "First name", true)}
        </div>
        <div className="form-grid">
          <Field label={t("区号", "Country code") + " *"}>
            <select
              name="countryCode"
              value={
                ["+65", "+86"].includes(data.countryCode)
                  ? data.countryCode
                  : "other"
              }
              onChange={(e) =>
                set(
                  "countryCode",
                  e.target.value === "other" ? "+" : e.target.value,
                )
              }
            >
              <option value="+65">{t("新加坡", "Singapore")} +65</option>
              <option value="+86">{t("中国", "China")} +86</option>
              <option value="other">{t("其他", "Other")}</option>
            </select>
          </Field>
          <Field
            name="phone"
            type="tel"
            inputMode="tel"
            required
            maxLength={20}
            label={t("电话", "Phone") + " *"}
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        {!["+65", "+86"].includes(data.countryCode) && (
          <Field
            name="countryCode"
            label={t("国际区号，例如 +60", "International dial code, e.g. +60")}
            value={data.countryCode}
            maxLength={5}
            onChange={(e) => set("countryCode", e.target.value)}
          />
        )}
        {data.track === "company" ? (
          <>
            {field("company", "公司名称", "Company name", true)}
            <Field label={t("职位", "Position") + " *"}>
              <select
                name="position"
                value={data.position}
                required
                onChange={(e) => set("position", e.target.value)}
              >
                <option value="">{t("请选择", "Choose a position")}</option>
                {[
                  ["owner", "老板 / 创始人", "Owner / Founder"],
                  ["partner", "合伙人 / 高管", "Partner / C-level"],
                  ["director", "总监 / 经理", "Director / Manager"],
                  ["staff", "专员 / 执行层", "Specialist / Staff"],
                  ["other", "其他", "Other"],
                ].map(([id, zh, en]) => (
                  <option key={id} value={id}>
                    {t(zh, en)}
                  </option>
                ))}
              </select>
            </Field>
            <details className="registration-extra">
              <summary>
                {t(
                  "补充企业资料（选填）",
                  "Additional company details (optional)",
                )}
              </summary>
              {field("profileLink", "企业主页链接", "Company profile URL")}
              {field("industry", "所属行业", "Industry")}
              {field("region", "目标地区", "Target region")}
              {field("intent", "合作意向类型", "Partnership intent")}
            </details>
          </>
        ) : (
          <>
            {field("occupation", "职业", "Occupation")}
            <Field label={t("咨询内容（选填）", "Inquiry (optional)")}>
              <textarea
                maxLength={1000}
                value={data.inquiry}
                onChange={(e) => set("inquiry", e.target.value)}
              />
            </Field>
          </>
        )}
      </div>
    </>
  );
}
