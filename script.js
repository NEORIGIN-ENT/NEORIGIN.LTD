const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navLinks = document.querySelectorAll(".nav a");
const langButtons = document.querySelectorAll("[data-lang]");

const translations = {
  zh: {
    "meta.description": "NEORIGIN 是一家面向艺人、声音、舞台与文化的高级专业音乐厂牌。",
    "nav.company": "公司",
    "nav.artists": "艺人",
    "nav.labels": "厂牌",
    "nav.release": "发行",
    "nav.orbeat": "ORBEAT",
    "nav.news": "新闻室",
    "nav.join": "加入",
    "nav.contact": "联系",
    "hero.kicker": "文化科技娱乐公司",
    "hero.copy": "NEORIGIN 致力于构建面向未来的数字音乐娱乐新生态。",
    "hero.primary": "查看艺人",
    "hero.secondary": "加入我们",
    "intro.statement": "NEORIGIN 致力于构建面向未来的数字音乐娱乐新生态，连接音乐制作、艺人管理、视觉内容、舞台企划与全球合作。",
    "company.kicker": "公司",
    "company.title": "音乐。艺人。舞台。文化。",
    "company.one.title": "艺人管理",
    "company.one.copy": "从定位、训练、音乐到舞台视觉，建立可持续的艺人系统。",
    "company.two.title": "音乐制作",
    "company.two.copy": "以流行、R&B、Hip-Hop 与舞台型声音为核心，开发发行企划。",
    "company.three.title": "全球业务",
    "company.three.copy": "连接品牌、内容、发行、演出与国际合作资源。",
    "artists.kicker": "艺人",
    "artists.title": "聚焦型艺人矩阵，高标准制作体系。",
    "artists.type.group": "艺人企划 / 项目",
    "artists.type.artist": "艺人",
    "labels.kicker": "旗下厂牌",
    "labels.title": "NEORIGIN 厂牌系统",
    "labels.jelly": "面向流行音乐、数字发行与艺人内容企划的厂牌。",
    "labels.jelly.short": "流行 / 数字发行",
    "labels.orad": "聚焦声音实验、视觉企划与文化科技项目的创意厂牌。",
    "labels.orad.short": "声音 / 视觉实验",
    "release.kicker": "最新发行",
    "release.title": "Signal From Origin",
    "release.copy": "NEORIGIN 首个企划以舞台表现为核心，构建适用于现场、流媒体与视觉叙事的声音系统。",
    "release.link": "发行合作咨询",
    "news.kicker": "新闻室",
    "news.title": "最新动态",
    "news.one.title": "NEORIGIN 官方网站上线",
    "news.one.copy": "品牌正式发布首个官方数字主页与视觉方向。",
    "news.two.title": "NEORIGIN 加入我们通道开放",
    "news.two.copy": "面向音乐、内容、运营、商务与文化科技方向的人才开放联系。",
    "news.three.title": "首个发行企划进入制作阶段",
    "news.three.copy": "音乐、编舞、视觉资产与全球发行工作正在推进。",
    "join.kicker": "加入我们",
    "join.title": "加入 NEORIGIN，共同构建面向未来的数字音乐娱乐新生态。",
    "join.copy": "我们欢迎音乐制作、内容企划、视觉创意、运营、商务合作、技术与文化科技方向的人才加入。请提交个人介绍、所在地、申请方向与相关作品或经历。",
    "join.field.label": "方向",
    "join.field.value": "音乐 / 内容 / 视觉 / 运营 / 商务 / 技术",
    "join.mail.label": "邮箱",
    "join.standard.label": "标准",
    "join.standard.value": "专业能力、审美判断、执行力、长期合作意愿",
    "contact.kicker": "联系",
    "contact.title": "加入我们与商务合作咨询。",
    "contact.join": "加入我们",
    "contact.business": "商务合作",
    "footer.rights": "COPYRIGHT © 2026 NEORIGIN CO. LTD. ALL RIGHTS RESERVED.",
  },
  en: {
    "meta.description": "NEORIGIN is a premium music label building artists, sound, performance, and culture.",
    "nav.company": "Company",
    "nav.artists": "Artists",
    "nav.labels": "Labels",
    "nav.release": "Release",
    "nav.orbeat": "ORBEAT",
    "nav.news": "Newsroom",
    "nav.join": "Join",
    "nav.contact": "Contact",
    "hero.kicker": "Culture Technology Entertainment Company",
    "hero.copy": "NEORIGIN is committed to building a future-facing digital music entertainment ecosystem.",
    "hero.primary": "View Artists",
    "hero.secondary": "Join Us",
    "intro.statement": "NEORIGIN is committed to building a future-facing digital music entertainment ecosystem, connecting music production, artist management, visual content, performance direction, and global partnership.",
    "company.kicker": "Company",
    "company.title": "Music. Artist. Performance. Culture.",
    "company.one.title": "Artist Management",
    "company.one.copy": "We build sustainable artist systems across identity, training, music, stage, and visual direction.",
    "company.two.title": "Music Production",
    "company.two.copy": "We develop release projects centered on pop, R&B, hip-hop, and performance-ready sound.",
    "company.three.title": "Global Business",
    "company.three.copy": "We connect brand, content, distribution, live performance, and international partnerships.",
    "artists.kicker": "Artists",
    "artists.title": "Focused roster. High-standard production.",
    "artists.type.group": "Artist Project",
    "artists.type.artist": "Artist",
    "labels.kicker": "Labels",
    "labels.title": "NEORIGIN Label System",
    "labels.jelly": "A label for pop music, digital distribution, and artist content planning.",
    "labels.jelly.short": "Pop / Digital Release",
    "labels.orad": "A creative label focused on sound experiments, visual direction, and culture-tech projects.",
    "labels.orad.short": "Sound / Visual Lab",
    "release.kicker": "New Release",
    "release.title": "Signal From Origin",
    "release.copy": "The first NEORIGIN project introduces a precise, performance-led sound palette built for stage, streaming, and visual storytelling.",
    "release.link": "Distribution Inquiry",
    "news.kicker": "Newsroom",
    "news.title": "Latest",
    "news.one.title": "NEORIGIN official website opens",
    "news.one.copy": "The label presents its first official digital home and visual direction.",
    "news.two.title": "NEORIGIN Join Us channel opens",
    "news.two.copy": "We welcome talent across music, content, operations, business, and culture technology.",
    "news.three.title": "First release campaign in production",
    "news.three.copy": "Music, choreography, visual assets, and global distribution are underway.",
    "join.kicker": "Join Us",
    "join.title": "Join NEORIGIN and build the future-facing digital music entertainment ecosystem with us.",
    "join.copy": "We welcome talent in music production, content planning, visual creativity, operations, business partnership, technology, and culture-tech. Please submit your profile, location, desired field, and relevant work or experience.",
    "join.field.label": "Field",
    "join.field.value": "Music / Content / Visual / Operations / Business / Technology",
    "join.mail.label": "Email",
    "join.standard.label": "Standard",
    "join.standard.value": "Professional ability, aesthetic judgment, execution, long-term collaboration",
    "contact.kicker": "Contact",
    "contact.title": "Join us and business inquiry.",
    "contact.join": "Join Us",
    "contact.business": "Business",
    "footer.rights": "COPYRIGHT © 2026 NEORIGIN CO. LTD. ALL RIGHTS RESERVED.",
  },
  ko: {
    "meta.description": "NEORIGIN은 아티스트, 사운드, 퍼포먼스, 문화를 구축하는 프리미엄 음악 레이블입니다.",
    "nav.company": "회사",
    "nav.artists": "아티스트",
    "nav.labels": "레이블",
    "nav.release": "릴리즈",
    "nav.orbeat": "ORBEAT",
    "nav.news": "뉴스룸",
    "nav.join": "함께하기",
    "nav.contact": "문의",
    "hero.kicker": "문화 기술 엔터테인먼트 회사",
    "hero.copy": "NEORIGIN은 미래 지향적인 디지털 음악 엔터테인먼트 생태계를 구축합니다.",
    "hero.primary": "아티스트 보기",
    "hero.secondary": "함께하기",
    "intro.statement": "NEORIGIN은 미래 지향적인 디지털 음악 엔터테인먼트 생태계를 구축하며 음악 제작, 아티스트 매니지먼트, 비주얼 콘텐츠, 퍼포먼스 디렉션, 글로벌 파트너십을 연결합니다.",
    "company.kicker": "회사",
    "company.title": "음악. 아티스트. 퍼포먼스. 문화.",
    "company.one.title": "아티스트 매니지먼트",
    "company.one.copy": "정체성, 트레이닝, 음악, 무대, 비주얼 디렉션을 아우르는 지속 가능한 아티스트 시스템을 구축합니다.",
    "company.two.title": "음악 제작",
    "company.two.copy": "팝, R&B, 힙합, 퍼포먼스형 사운드를 중심으로 릴리즈 프로젝트를 개발합니다.",
    "company.three.title": "글로벌 비즈니스",
    "company.three.copy": "브랜드, 콘텐츠, 유통, 공연, 국제 파트너십을 연결합니다.",
    "artists.kicker": "아티스트",
    "artists.title": "집중된 아티스트 라인업과 높은 기준의 프로덕션.",
    "artists.type.group": "아티스트 프로젝트",
    "artists.type.artist": "아티스트",
    "labels.kicker": "산하 레이블",
    "labels.title": "NEORIGIN 레이블 시스템",
    "labels.jelly": "팝 음악, 디지털 유통, 아티스트 콘텐츠 기획을 위한 레이블입니다.",
    "labels.jelly.short": "팝 / 디지털 릴리즈",
    "labels.orad": "사운드 실험, 비주얼 디렉션, 문화 기술 프로젝트에 집중하는 크리에이티브 레이블입니다.",
    "labels.orad.short": "사운드 / 비주얼 랩",
    "release.kicker": "최신 릴리즈",
    "release.title": "Signal From Origin",
    "release.copy": "NEORIGIN의 첫 프로젝트는 무대 중심의 정교한 사운드 팔레트를 통해 라이브, 스트리밍, 비주얼 스토리텔링을 연결합니다.",
    "release.link": "유통 협업 문의",
    "news.kicker": "뉴스룸",
    "news.title": "최신 소식",
    "news.one.title": "NEORIGIN 공식 웹사이트 오픈",
    "news.one.copy": "레이블의 첫 공식 디지털 홈과 비주얼 방향을 공개합니다.",
    "news.two.title": "NEORIGIN 함께하기 채널 오픈",
    "news.two.copy": "음악, 콘텐츠, 운영, 비즈니스, 문화 기술 분야의 인재를 기다립니다.",
    "news.three.title": "첫 릴리즈 캠페인 제작 단계 진입",
    "news.three.copy": "음악, 안무, 비주얼 에셋, 글로벌 유통 작업이 진행 중입니다.",
    "join.kicker": "함께하기",
    "join.title": "NEORIGIN과 함께 미래 지향적인 디지털 음악 엔터테인먼트 생태계를 만들어 갈 인재를 기다립니다.",
    "join.copy": "음악 제작, 콘텐츠 기획, 비주얼 크리에이티브, 운영, 비즈니스 파트너십, 기술 및 문화 기술 분야의 인재를 환영합니다. 프로필, 거주지, 지원 분야, 관련 작업 또는 경력을 보내 주세요.",
    "join.field.label": "분야",
    "join.field.value": "음악 / 콘텐츠 / 비주얼 / 운영 / 비즈니스 / 기술",
    "join.mail.label": "이메일",
    "join.standard.label": "기준",
    "join.standard.value": "전문성, 미적 판단, 실행력, 장기 협업 의지",
    "contact.kicker": "문의",
    "contact.title": "함께하기 및 비즈니스 문의.",
    "contact.join": "함께하기",
    "contact.business": "비즈니스",
    "footer.rights": "COPYRIGHT © 2026 NEORIGIN CO. LTD. ALL RIGHTS RESERVED.",
  },
};

const htmlLang = {
  zh: "zh-CN",
  en: "en",
  ko: "ko",
};

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setLanguage(lang) {
  const dictionary = translations[lang] || translations.zh;

  document.documentElement.lang = htmlLang[lang] || htmlLang.zh;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) {
      element.textContent = dictionary[key];
    }
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":").map((part) => part.trim());
      if (attr && key && dictionary[key]) {
        element.setAttribute(attr, dictionary[key]);
      }
    });
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  localStorage.setItem("neorigin-language", lang);
}

menuButton.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    menuButton.setAttribute("aria-label", "Open menu");
  });
});

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

window.addEventListener("scroll", syncHeader, { passive: true });

setLanguage(localStorage.getItem("neorigin-language") || "zh");
syncHeader();
