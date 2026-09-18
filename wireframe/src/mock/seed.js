import { pair, categories, industries, intents } from "../content/catalog.js";
export const CLOCK = Date.parse("2026-09-10T04:00:00Z");
const names = [
  ["榕禾食集", "Banyan Pantry"],
  ["织远服饰", "Weave Horizon"],
  ["青屿生活", "Isle & Everyday"],
  ["星桥玩具", "Starbridge Play"],
  ["南岸物流", "Southbank Logistics"],
  ["知行顾问", "Fieldwork Advisory"],
  ["杉序包装", "Cedar Packaging"],
  ["海程供应链", "Seaway Supply"],
];
const topics = [
  [
    "寻找新加坡餐饮经销合作伙伴",
    "Seeking a food distribution partner in Singapore",
    "我们专注于常温亚洲调味品，希望与服务新加坡社区商店的经销伙伴交流。产品资料、包装规格和试单要求已整理，希望先讨论储存条件、配送节奏和渠道定位，再共同制定小规模试点方案。",
    "We develop shelf-stable Asian pantry products and want to meet distributors serving neighbourhood shops in Singapore. Product specifications and trial-order requirements are ready. We would like to discuss storage, delivery schedules and channel positioning before planning a small pilot.",
  ],
  [
    "印花服装生产商寻找品牌伙伴",
    "Printed garment maker seeking independent apparel brands",
    "我们为独立品牌提供印花服装开发与小批量生产，正在寻找中国与新加坡的长期合作伙伴。欢迎分享面料要求、尺码范围及打样时间，我们希望从一组样品开始建立透明的合作流程。",
    "We support independent apparel brands with printed garment development and small production runs. We seek partners in China and Singapore. Share your fabric requirements, size range and sampling schedule so we can build a transparent process around an initial sample collection.",
  ],
  [
    "分享东南亚日化渠道试点经验",
    "Sharing lessons from a consumer-goods channel pilot",
    "在拓展新市场之前，我们希望与本地品牌交流零售试点的准备方式。本次讨论围绕产品标签、门店反馈收集与补货节奏，不涉及未经确认的市场数字。欢迎有区域渠道经验的伙伴加入交流。",
    "Before expanding into another market, we would like to exchange approaches to retail pilots with local brands. The discussion covers product labels, collecting shop feedback and replenishment schedules, without relying on unverified market figures. Regional channel partners are welcome.",
  ],
  [
    "寻找重视安全与创意的玩具合作伙伴",
    "Looking for toy partners who value safety and creativity",
    "我们开发适合家庭共同参与的益智玩具，希望寻找具有本地零售经验的伙伴。初步交流将涵盖年龄分组、材料信息、展示方式与安全资料，所有具体要求将在双方确认后再进入样品阶段。",
    "We develop educational toys for families to enjoy together and seek partners with local retail experience. Initial conversations will cover age groups, materials, merchandising and safety documentation. Sampling starts only after both parties agree on requirements.",
  ],
  [
    "跨境仓储项目的资料准备清单交流",
    "Comparing preparation checklists for cross-border warehousing",
    "我们希望与跨境企业一起完善入仓资料与交接清单。讨论范围包括商品尺寸、批次记录、库存更新频率和退货路径。欢迎需要中国与东南亚仓储支持的品牌介绍自己的需求。",
    "We want to improve warehouse onboarding and handover checklists with cross-border businesses. Topics include product dimensions, batch records, inventory update frequency and returns. Brands needing warehousing between China and Southeast Asia are invited to share their needs.",
  ],
  [
    "出海企业如何整理合作尽调资料",
    "Preparing a practical partner due-diligence pack",
    "本次交流关注企业如何整理公司介绍、服务范围、业务联络与资料更新时间。示例仅用于业务讨论，不构成法律意见。希望认识愿意共同提升合作资料清晰度的专业服务伙伴。",
    "This discussion explores how businesses can organise company introductions, service scope, business contacts and document update dates. Examples are for discussion and are not legal advice. We welcome professional service partners interested in clearer collaboration documents.",
  ],
  [
    "可重复使用包装的供应合作讨论",
    "Exploring reusable packaging supply partnerships",
    "我们希望为消费品品牌设计更易回收和重复使用的运输包装，正在寻找能共同测试尺寸、耐用度和回收指引的供应伙伴。先从产品需求与样品评估开始，不预设未经验证的环保效果。",
    "We are exploring transport packaging that is easier to reuse and recycle. We seek supply partners to test dimensions, durability and recovery instructions with consumer brands, beginning with requirements and samples rather than unverified environmental claims.",
  ],
  [
    "区域供应链协作的信息交接经验",
    "Improving information handovers across a regional supply chain",
    "跨团队协作需要清晰的产品、时间与交付信息。我们希望交流一套可读的交接记录，涵盖责任人、里程碑与异常处理方式，并寻找愿意进行小范围流程试点的合作企业。",
    "Cross-team work needs clear product, timing and delivery information. We would like to exchange readable handover records covering owners, milestones and exception handling, and meet businesses willing to pilot a small process improvement.",
  ],
];
export function makeSeed() {
  const profiles = names.map(([zh, en], i) => ({
    id: String(i + 1),
    name: pair(zh, en),
    displayName: pair(
      "示例联络人 " + (i + 1),
      "Demo representative " + (i + 1),
    ),
    industry: industries[[0, 1, 2, 3, 4, 5, 2, 4][i]].id,
    markets: i % 2 ? ["CN", "SG"] : ["SG", "MY"],
    intro: pair(topics[i][2], topics[i][3]),
    verified: i % 2 === 0,
    tier: [
      "platinum",
      "silver",
      "gold",
      "diamond",
      "black",
      "silver",
      "gold",
      "silver",
    ][i],
    email: `member${i + 1}@cys.example`,
  }));
  const revisions = [];
  const posts = Array.from({ length: 32 }, (_, i) => {
    const topic = topics[i % 8];
    const status =
      i < 24
        ? "approved"
        : i < 26
          ? "draft"
          : i < 29
            ? "pending"
            : i < 31
              ? "rejected"
              : "removed";
    const id = String(i + 1),
      revisionId = `r${id}`;
    const suffix =
      i < 8
        ? pair("", "")
        : i < 16
          ? pair(" · 合作需求与准备", " · Partnership requirements")
          : pair(" · 实务交流", " · Practical discussion");
    revisions.push({
      id: revisionId,
      postId: id,
      authorId: i < 24 ? String((i % 8) + 1) : "1",
      title: pair(topic[0] + suffix.zh, topic[1] + suffix.en),
      body: pair(topic[2], topic[3]),
      category: categories[Math.floor(i / 6) % 4].id,
      industry: industries[[0, 1, 2, 3, 4, 5, 2, 4][i % 8]].id,
      product: pair(
        [
          "亚洲调味品",
          "印花服饰",
          "家居日用品",
          "益智玩具",
          "仓储服务",
          "业务咨询",
          "运输包装",
          "供应链支持",
        ][i % 8],
        [
          "Pantry products",
          "Printed apparel",
          "Everyday goods",
          "Educational toys",
          "Warehousing",
          "Business consulting",
          "Transport packaging",
          "Supply-chain support",
        ][i % 8],
      ),
      markets: i % 2 ? ["CN", "SG"] : ["SG", "MY"],
      intent: intents[i % 4].id,
      locale: "seed",
      status,
      risk: i === 29 ? "high" : i === 30 ? "mid" : "low",
      evidence: [],
      policy: "demo-lexicon-v1",
      reason:
        status === "rejected"
          ? pair(
              "请删除不适当的商业承诺，补充真实业务需求。",
              "Remove inappropriate business promises and clarify your partnership need.",
            )
          : null,
      createdAt: CLOCK - i * 3600000,
    });
    return {
      id,
      authorId: revisions.at(-1).authorId,
      revisionId,
      publishedRevisionId:
        status === "approved" || status === "removed" ? revisionId : null,
      removed: status === "removed",
      featured: i < 3,
      publishedAt: CLOCK - i * 3600000,
    };
  });
  const comments = Array.from({ length: 21 }, (_, i) => ({
    id: `c${i + 1}`,
    postId: String(i < 18 ? Math.floor(i / 3) + 1 : 1),
    authorId: i >= 18 ? "1" : String((i % 8) + 1),
    parentId: i < 18 && i % 3 === 2 ? `c${i}` : null,
    body: pair(
      i % 3 === 2
        ? "谢谢补充，我们可以先整理一份需求清单，方便下一步讨论。"
        : "很高兴看到这个合作方向。请问试点阶段需要准备哪些产品资料与时间安排？",
      i % 3 === 2
        ? "Thank you for the detail. We can prepare a requirements checklist to support the next conversation."
        : "This is an interesting partnership direction. What product information and timing would you need for a pilot?",
    ),
    status: i < 18 ? "approved" : i < 20 ? "pending" : "rejected",
    risk: "low",
    createdAt: CLOCK - i * 60000,
    revision: 1,
  }));
  const stories = topics.slice(0, 6).map((topic, i) => ({
    id: `story-${i + 1}`,
    partnerId: String(i + 1),
    title: pair(
      [
        "从一份样品，开始跨境对话",
        "把创意穿在身上，把合作放在心上",
        "先听门店的声音，再迈向新市场",
        "为共同的好奇心，寻找伙伴",
        "让每一次交接，都更清楚",
        "把专业知识变成共同语言",
      ][i],
      [
        "A cross-border conversation, starting with a sample",
        "Connecting creative ideas with careful production",
        "Listening to shops before entering a new market",
        "Finding partners for a shared sense of curiosity",
        "Making every handover clearer",
        "Making expertise a shared language",
      ][i],
    ),
    summary: pair(topic[2], topic[3]),
    body: [
      pair("故事背景", "The context"),
      pair(topic[2], topic[3]),
      pair("合作过程", "Working together"),
      pair(
        "在这个虚构案例中，双方先明确各自需求，再共同整理资料清单与小范围试点。每一步安排都通过透明沟通确认，而不是以未经验证的承诺推进。",
        "In this fictional example, the two teams first clarified their needs, then prepared a shared checklist and a small pilot. Each step was agreed through transparent conversations rather than unverified promises.",
      ),
      pair("下一步", "The next step"),
      pair(
        "试点帮助双方发现需要进一步讨论的问题。他们决定定期回顾资料、记录反馈，并在条件成熟时再讨论扩大合作。此故事仅展示合作思路，不代表真实 CYS 客户成果。",
        "The pilot helped both teams identify questions for further discussion. They agreed to review documents and record feedback before considering wider cooperation. This story illustrates an approach, not an actual CYS client outcome.",
      ),
    ],
  }));
  return {
    version: 1,
    sequence: 100,
    profiles,
    partners: profiles.map((p) => ({ ...p, profileId: p.id })),
    posts,
    revisions,
    comments,
    stories,
    reactions: [],
    bookmarks: [],
    follows: [],
    enquiries: [],
    reports: Array.from({ length: 4 }, (_, i) => ({
      id: `report-${i + 1}`,
      postId: String(i + 1),
      authorId: "2",
      reason: "misleading",
      message: pair(
        "请核实合作描述是否清楚区分示例与实际承诺。",
        "Please review whether the description clearly distinguishes examples from actual commitments.",
      ),
      status: i < 2 ? "open" : "resolved",
      createdAt: CLOCK - i * 60000,
    })),
    notifications: ["1", "9", "17", "27", "28", "29", "30", "31"].map(
      (postId, i) => ({
        id: `n${i + 1}`,
        authorId: "1",
        postId,
        message: pair(
          i < 3
            ? "示例审核回执：您的帖子已获批准。未发送任何邮件。"
            : i < 6
              ? "示例提交回执：您的帖子正在审核。未发送任何邮件。"
              : "示例审核回执：您的帖子未获批准，请查看修改建议。未发送任何邮件。",
          i < 3
            ? "Demo review receipt: your listing was approved. No email was sent."
            : i < 6
              ? "Demo submission receipt: your listing is under review. No email was sent."
              : "Demo review receipt: your listing was not approved. Review the revision guidance. No email was sent.",
        ),
        read: false,
        createdAt: CLOCK - i * 60000,
      }),
    ),
    events: [],
    accounts: profiles.map((p) => ({
      id: p.id,
      email: p.email,
      verified: true,
    })),
  };
}
