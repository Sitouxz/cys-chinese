export const pair = (zh, en) => ({ zh, en });
export const categories = [
  ["matching", "商业对接", "Business matching"],
  ["trends", "行业动态", "Industry trends"],
  ["policy", "监管政策", "Regulatory policy"],
  ["analysis", "市场分析", "Market analysis"],
].map(([id, zh, en]) => ({ id, zh, en }));
export const industries = [
  ["food", "餐饮", "Food & beverage"],
  ["apparel", "服装", "Apparel"],
  ["goods", "消费品", "Consumer goods"],
  ["toys", "玩具", "Toys"],
  ["logistics", "物流", "Logistics"],
  ["services", "专业服务", "Professional services"],
].map(([id, zh, en]) => ({ id, zh, en }));
export const markets = [
  ["SG", "新加坡", "Singapore"],
  ["CN", "中国", "China"],
  ["MY", "马来西亚", "Malaysia"],
  ["ID", "印尼", "Indonesia"],
  ["TH", "泰国", "Thailand"],
].map(([id, zh, en]) => ({ id, zh, en }));
export const intents = [
  ["distributor", "寻找经销商", "Find distributors"],
  ["brand", "寻找品牌伙伴", "Find brand partners"],
  ["supplier", "寻找供应商", "Find suppliers"],
  ["investor", "寻找投资伙伴", "Find investment partners"],
].map(([id, zh, en]) => ({ id, zh, en }));
export const values = [
  [
    pair("包容", "Inclusion"),
    pair(
      "连接不同背景，共享商业可能。",
      "Different perspectives. Shared possibilities.",
    ),
    pair(
      "让来自不同族裔与社会背景的用户，都能够高效获取资源。",
      "Connect people across cultures and backgrounds with the resources and expertise they need.",
    ),
  ],
  [
    pair("创新", "Innovation"),
    pair(
      "以更合适的方案，回应新的需求。",
      "Better solutions for changing needs.",
    ),
    pair(
      "以科技与专业知识，为企业和个人探索更高效的支付体验。",
      "Combine technology and professional knowledge to explore more efficient payment experiences.",
    ),
  ],
  [
    pair("启迪", "Inspiration"),
    pair(
      "从一次交流，开启长期合作。",
      "One conversation. A lasting partnership.",
    ),
    pair(
      "汇聚专业服务提供商，分享知识、交流经验，共同发现新的合作机会。",
      "Bring professional service providers together to exchange knowledge and discover new opportunities.",
    ),
  ],
];
export const history = [
  [
    "1981",
    "启航于新加坡",
    "Our Singapore beginning",
    "正式成为新加坡持牌金融机构，踏上服务中小企业跨境汇款的征程。",
    "Licensed in Singapore, beginning a journey serving cross-border remittance needs of small and medium businesses.",
  ],
  [
    "2011",
    "迈向更广阔的世界",
    "A broader horizon",
    "更名为 CYS Global Remit，从早期兑换服务迈向国际化汇款平台。",
    "Rebranded as CYS Global Remit, evolving from exchange services into an international remittance platform.",
  ],
  [
    "2020",
    "开启无现金交易时代",
    "Entering the cashless era",
    "助力客户安全便捷完成跨境资金往来，探索数字化支付体验。",
    "Embracing digital payment experiences to help clients manage cross-border transfers conveniently.",
  ],
  [
    "2025",
    "服务的新篇章",
    "A new chapter of service",
    "迁至 GB Building 新办公室，迈入更完善的服务与发展新阶段。",
    "Relocated to GB Building, entering a new phase of service and development.",
  ],
  [
    "2030",
    "展望 · 携手前行",
    "Outlook · Moving forward together",
    "寻找更多合作机会，携手更多伙伴，服务更广泛的中小企业。这是未来展望。",
    "An outlook to seek more partnerships and serve a wider community of businesses; this is a future ambition.",
  ],
].map(([year, zh, en, bodyZh, bodyEn]) => ({
  year,
  title: pair(zh, en),
  body: pair(bodyZh, bodyEn),
}));
export const uses = [
  [
    "family",
    "家人的远方，也在身旁。",
    "Closer to family, wherever they are.",
    "给海外家人汇学费与生活费",
    "Tuition and living expenses overseas",
    "为海外学习与家庭日常支出，咨询适合您的汇款安排。准备好用途与目的地，让交流更清晰。",
    "Discuss transfer arrangements for overseas study and everyday family expenses. Start with the destination and purpose of your payment.",
  ],
  [
    "shopping",
    "让下一程，从容开始。",
    "Start your next journey with confidence.",
    "兑换外币购物",
    "Foreign currency for shopping",
    "旅行与购物前，了解外币兑换所需资料与可用币种。汇率及服务详情须以正式咨询为准。",
    "Explore currencies and the documents needed before travelling or shopping. Rates and availability require a formal enquiry.",
  ],
  [
    "investment",
    "规划跨境的下一步。",
    "Plan your next cross-border step.",
    "境外投资付款",
    "Payments for overseas investment",
    "就境外投资相关付款流程与资料要求进行咨询。本页面不提供投资建议或收益承诺。",
    "Ask about payment procedures and documentation for overseas investments. This page offers no investment advice or promised returns.",
  ],
].map(([id, zh, en, labelZh, labelEn, bodyZh, bodyEn]) => ({
  id,
  title: pair(zh, en),
  label: pair(labelZh, labelEn),
  body: pair(bodyZh, bodyEn),
}));
export const faqs = [
  [
    "preview",
    "这个网站可以真实汇款吗？",
    "Can I transfer money here?",
    "不能。此网站是本地演示，不处理资金、不提供实时汇率，也不创建真实账户。",
    "No. This local preview does not move money, quote live rates or create real accounts.",
  ],
  [
    "preview",
    "示例公司是真实合作伙伴吗？",
    "Are the example companies real partners?",
    "不是。论坛公司、合作伙伴与故事均为虚构示例，不代表背书。",
    "No. Forum companies, partners and stories are fictional illustrations, not endorsements.",
  ],
  [
    "forum",
    "如何发布商业信息？",
    "How do I publish a listing?",
    "登录演示账户，填写业务背景与合作意向，预览后提交。通过审核才会公开。",
    "Use a demo account, add your business context and partnership needs, preview and submit. Publication follows approval.",
  ],
  [
    "forum",
    "审核期间谁能看到内容？",
    "Who can see content under review?",
    "只有作者和演示审核员能看到待审核内容。其他访客只能看到已发布版本。",
    "Only the author and demo moderator can see pending content. Other visitors see the published version.",
  ],
  [
    "forum",
    "修改已发布内容会怎样？",
    "What happens when I edit a published post?",
    "新的版本将进入审核，旧的已发布版本会保留，直到新版本获准。",
    "The new revision enters review. The existing published version stays visible until the revision is approved.",
  ],
  [
    "forum",
    "英文内容如何审核？",
    "How is English content reviewed?",
    "英文、混合语言与不确定的内容均进入人工审核演示，不视为自动安全。",
    "English, mixed-language and uncertain submissions enter the manual-review demonstration. They are not automatically considered safe.",
  ],
  [
    "forum",
    "如何举报内容？",
    "How can I report a listing?",
    "打开帖子并选择举报，提供原因与说明。举报本身不会自动移除帖子。",
    "Open a post and choose Report. Give a reason and explanation. A report does not automatically remove content.",
  ],
  [
    "account",
    "演示密码会被保存吗？",
    "Are demo passwords stored?",
    "不会。密码仅用于当前表单的展示与验证，不存入浏览器数据。请勿使用真实密码。",
    "No. Passwords are used only for form demonstration and validation, never saved. Do not use a real password.",
  ],
  [
    "account",
    "如何重置演示？",
    "How do I reset the preview?",
    "在预览控制台选择重置，只会清除本网站的演示数据。",
    "Choose Reset in Preview controls. Only this application’s mock data is removed.",
  ],
  [
    "contact",
    "咨询表单会发送消息吗？",
    "Does an enquiry send a message?",
    "不会。提交会产生本地回执，显示未来通知的示例。",
    "No. Submission creates a local receipt illustrating a future notification.",
  ],
  [
    "contact",
    "企业咨询需要什么资料？",
    "What should a business enquiry include?",
    "请使用虚构名称和 .example 邮箱，选择业务类型并说明需求，勿填写真实客户资料。",
    "Use a fictional name and .example email, select an audience and describe the need. Do not enter real client information.",
  ],
  [
    "preview",
    "法律条款已获批准吗？",
    "Is the legal copy approved?",
    "没有。条款和隐私内容只用于预览，正式上线前须由内容与合规负责人批准。",
    "No. Terms and privacy copy are illustrative and require content and compliance approval before launch.",
  ],
].map(([category, zh, en, azh, aen], i) => ({
  id: i + 1,
  category,
  question: pair(zh, en),
  answer: pair(azh, aen),
}));
