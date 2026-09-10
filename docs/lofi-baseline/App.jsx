import { useEffect, useMemo, useState } from 'react';
import { milestones } from './data.js';

const shortText = 'Lorem ipsum dolor sit amet.';
const bodyText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const routeAliases = {
  '/home': '/',
  '/business': '/corporate',
};

const publicRouteAliases = {
  '/': '/home',
  '/corporate': '/business',
};

function normalizeRoute(route) {
  const cleanRoute = route.length > 1 ? route.replace(/\/$/, '') : route;
  return routeAliases[cleanRoute] || cleanRoute || '/';
}

function getBrowserRoute() {
  const hashRoute = window.location.hash.replace(/^#/, '');
  return normalizeRoute(hashRoute.startsWith('/') ? hashRoute : window.location.pathname);
}

function getPublicRoute(route) {
  const normalizedRoute = normalizeRoute(route);
  return publicRouteAliases[normalizedRoute] || normalizedRoute;
}

function useRoute() {
  const [route, setRoute] = useState(getBrowserRoute);

  useEffect(() => {
    const sync = () => {
      setRoute(getBrowserRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  return route;
}

function go(route) {
  window.history.pushState(null, '', getPublicRoute(route));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const briefPageOptions = [
  { path: '/', phase: 'Phase 1', label: 'Home', scope: 'Hero, values, forum, products, history, entrances, contact, footer' },
  { path: '/about', phase: 'Phase 1', label: 'About', scope: 'Intro, milestone timeline (globe bg, hover-expand), culture (if confirmed)' },
  { path: '/corridor', phase: 'Phase 1', label: 'Corridor', scope: 'Section A partners & investors · Section B partnership stories' },
  { path: '/corporate', phase: 'Phase 1', label: 'Business', scope: 'Two audiences: FI and cross-border corporates (condensed)' },
  { path: '/individual', phase: 'Phase 1', label: 'Individual', scope: 'Three use cases + CTA (condensed)' },
  { path: '/contact', phase: 'Phase 1', label: 'Contact', scope: 'Details, enquiry, feedback' },
  { path: '/legal', phase: 'Phase 1', label: 'Legal', scope: 'FAQ, terms, privacy' },
  { path: '/auth', phase: 'Phase 1', label: 'Auth', scope: 'Register and log in' },
  { path: '/forum', phase: 'Phase 2', label: 'Forum / Post list', scope: 'Post list, search and filters' },
  { path: '/forum/post/1', phase: 'Phase 2', label: 'Forum / Post detail', scope: 'Post, replies and actions' },
  { path: '/forum/new', phase: 'Phase 2', label: 'Forum / Composer', scope: 'Create and preview a post' },
  { path: '/forum/member/1', phase: 'Phase 2', label: 'Forum / Profile', scope: 'Member profile and activity' },
  { path: '/forum/search', phase: 'Phase 2', label: 'Forum / Search', scope: 'Search and filter results' },
  { path: '/moderation', phase: 'Phase 2', label: 'Forum / Moderation', scope: 'Pending, approved and rejected' },
];

function getBriefPage(route) {
  if (/^\/forum\/post\/\d+$/.test(route)) return briefPageOptions[9];
  if (/^\/forum\/(edit|new)\/?\d*$/.test(route)) return briefPageOptions[10];
  if (/^\/forum\/member\/\d+$/.test(route) || route === '/forum/members') return briefPageOptions[11];
  if (route === '/forum/search' || /^\/forum\/(category|categories)/.test(route)) return briefPageOptions[12];
  if (route === '/moderation' || /^\/me\//.test(route) || /^\/forum\/(report|rules)/.test(route)) return briefPageOptions[13];
  return briefPageOptions.find((item) => item.path === route) || briefPageOptions[0];
}

function PageIndicator({ route }) {
  const page = getBriefPage(route);
  return (
    <aside className="brief-page-bar" aria-label="Brief page reference">
      <div className="wf-shell brief-page-inner">
        <span className="brief-phase">{page.phase}</span>
        <div className="brief-page-name"><small>Brief page</small><strong>{page.label}</strong></div>
        <span className="brief-page-scope">{page.scope}</span>
        <label className="brief-page-picker"><span>All pages</span><select value={page.path} onChange={(event) => go(event.target.value)}>{briefPageOptions.map((item) => <option value={item.path} key={item.path}>{item.phase} / {item.label}</option>)}</select></label>
      </div>
    </aside>
  );
}

function Button({ children = 'Lorem ipsum', variant = 'solid', onClick, type = 'button', disabled = false }) {
  return <button type={type} disabled={disabled} className={`wf-button wf-button-${variant}`} onClick={onClick}>{children}</button>;
}

function ImagePlaceholder({ className = '', compact = false }) {
  return <div className={`image-placeholder ${compact ? 'image-placeholder-compact' : ''} ${className}`} aria-label="Lorem ipsum" />;
}

function WireNote({ children, label = 'Wireframe note' }) {
  return (
    <div className="wire-note" role="note">
      <span className="wire-note-label">{label}</span>
      <p>{children}</p>
    </div>
  );
}

function TextLines({ count = 3, dark = false }) {
  return <div className={`text-lines ${dark ? 'text-lines-dark' : ''}`}>{Array.from({ length: count }, (_, index) => <span key={index} />)}</div>;
}

function Header({ route }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]);

  const items = [
    ['/', 'Lorem'],
    ['/about', 'Ipsum'],
    ['/corridor', 'Dolor'],
    ['/corporate', 'Sit amet'],
    ['/forum', 'Chinese Forum'],
    ['/contact', 'Consectetur'],
  ];

  return (
    <header className="wf-header">
      <div className="wf-shell wf-header-inner">
        <div className="header-spacer" aria-hidden="true" />
        <nav className={open ? 'open' : ''} aria-label="Lorem ipsum">
          {items.map(([path, label]) => <button key={path} className={route === path ? 'active' : ''} onClick={() => go(path)}>{label}</button>)}
        </nav>
        <div className="header-actions">
          <Button variant="outline" onClick={() => go('/forum')}>Lorem ipsum</Button>
          <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Lorem ipsum"><span /><span /><span /></button>
        </div>
      </div>
    </header>
  );
}

function Footer({ compact = false }) {
  if (compact) {
    return (
      <footer className="wf-footer home-footer" id="page-footer">
        <div className="wf-shell home-footer-top">
          <div className="home-footer-mark" aria-label="Lorem ipsum"><span /><span /></div>
          <nav aria-label="Lorem ipsum">
            {['/', '/about', '/corridor', '/corporate', '/forum'].map((path, index) => (
              <button key={path} onClick={() => go(path)}>Lorem {index + 1}</button>
            ))}
          </nav>
        </div>
        <div className="wf-shell home-footer-bottom"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span><span>Lorem ipsum · Dolor sit</span></div>
      </footer>
    );
  }

  return (
    <footer className="wf-footer" id="page-footer">
      <div className="wf-shell footer-grid">
        <div className="footer-intro"><TextLines count={4} dark /></div>
        {[0, 1, 2].map((column) => <div className="footer-column" key={column}><strong>Lorem ipsum</strong><button>Lorem</button><button>Ipsum dolor</button><button>Sit amet</button><button>Consectetur</button></div>)}
        <div className="footer-action"><Button variant="light">Lorem ipsum</Button></div>
      </div>
      <div className="wf-shell footer-bottom"><span>Lorem ipsum dolor sit amet</span><span>Lorem ipsum</span></div>
    </footer>
  );
}

function SectionTitle({ align = 'center', eyebrow = false }) {
  return (
    <div className={`section-title section-title-${align}`}>
      {eyebrow && <p>Lorem ipsum</p>}
      <h2>Lorem ipsum dolor sit amet</h2>
      <span>{bodyText}</span>
    </div>
  );
}

const homeSectionMap = [
  ['hero', 'Hero + 4 topics'],
  ['values', '3 values'],
  ['forum-preview', 'Forum'],
  ['products', 'Business matching'],
  ['history', 'History'],
  ['entrances', '2 audiences'],
  ['home-contact', 'Contact CTA'],
  ['page-footer', 'Footer'],
];

function HomeSectionMap() {
  return (
    <aside className="home-section-map" aria-label="Client mockup home page section order">
      <div className="wf-shell home-section-map-inner">
        <strong>Mockup home flow</strong>
        <nav>
          {homeSectionMap.map(([id, label], index) => (
            <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}>
              <span>{String(index + 1).padStart(2, '0')}</span>{label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function HomeValues() {
  return (
    <section className="wf-section home-values-section" id="values">
      <div className="wf-shell">
        <p className="wire-label home-centered-label">Lorem ipsum</p>
        <div className="home-values-row" data-wire-count="3">
          {[1, 2, 3].map((item) => (
            <article key={item}>
              <strong>0{item}</strong>
              <h2>Lorem ipsum</h2>
              <span>LOREM IPSUM</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeServices() {
  const [tab, setTab] = useState(0);

  return (
    <section className="wf-section wf-section-gray home-products-section" id="products">
      <div className="wf-shell">
        <h2>Lorem ipsum dolor sit amet</h2>
        <WireNote>Client flagged this "Product &amp; service" block may not fit their actual content — revised copy to be supplied. Structure shown is provisional.</WireNote>
        <div className="home-product-tabs" role="tablist" aria-label="Lorem ipsum" data-wire-count="3">
          {[1, 2, 3].map((item, index) => (
            <button
              key={item}
              role="tab"
              aria-selected={tab === index}
              className={tab === index ? 'active' : ''}
              onClick={() => setTab(index)}
            >
              Lorem {item}
            </button>
          ))}
        </div>
        <div className="home-product-split">
          <div className="home-product-paths" data-wire-count="3">
            {[1, 2, 3].map((item) => (
              <article className="home-product-path" key={item}>
                <div className="home-product-icon" aria-hidden="true"><span /></div>
                <div>
                  <h3>Lorem ipsum dolor</h3>
                  <p>{shortText}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="home-product-sectors">
            <p className="wire-label">Lorem ipsum</p>
            <div className="home-product-sector-grid" data-wire-count="6">
              {[1, 2, 3, 4, 5, 6].map((item) => <span key={item}>Lorem 0{item}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeHistory() {
  return (
    <section className="wf-section home-history-section" id="history">
      <div className="wf-shell">
        <div className="home-history-heading"><p className="wire-label">Lorem ipsum</p><h2>Lorem ipsum dolor sit amet</h2><p>{bodyText}</p></div>
        <WireNote label="Design phase">Stat figures animate as scroll-triggered number counters when this section enters the viewport.</WireNote>
        <div className="home-history-stats" data-wire-count="4">
          {[1, 2, 3, 4].map((item) => <article key={item}><strong>0{item}+</strong><span>Lorem ipsum dolor</span></article>)}
        </div>
        <div className="home-milestone-track" data-wire-count="5">
          {[1, 2, 3, 4, 5].map((item) => (
            <article key={item}>
              <strong>20{String(item).padStart(2, '0')}</strong>
              <span className="milestone-dot" />
              <h3>Lorem ipsum dolor</h3>
              <p>{shortText}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeEntrances() {
  const entrances = [
    { route: '/corporate', number: '01' },
    { route: '/individual', number: '02' },
  ];
  return (
    <section className="wf-section home-entrances-section" id="entrances">
      <div className="wf-shell">
        <SectionTitle eyebrow />
        <div className="home-audience-grid" data-wire-count="2">
          {entrances.map((item) => (
            <article className="home-audience-panel" key={item.route}>
              <small>{item.number} / LOREM IPSUM</small>
              <h2>Lorem ipsum dolor sit</h2>
              <ul>{[1, 2, 3].map((row) => <li key={row}><span />Lorem ipsum dolor sit amet</li>)}</ul>
              <Button variant="light" onClick={() => go(item.route)}>Lorem ipsum →</Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeForumPreview() {
  return (
    <section className="wf-section wf-section-gray home-forum-section" id="forum-preview" data-wire-count="1">
      <div className="wf-shell home-forum-panel">
        <div className="home-forum-copy">
          <p className="wire-label">Lorem ipsum</p>
          <h2>Lorem ipsum dolor sit amet</h2>
          <p>{longText}</p>
          <Button onClick={() => go('/forum')}>Lorem ipsum</Button>
        </div>
        <div className="home-topic-list" aria-label="Lorem ipsum">
          <header><strong>Lorem ipsum</strong><span>Lorem</span></header>
          {[1, 2, 3, 4].map((item) => (
            <article key={item}>
              <span className="square-mark" />
              <h3>Lorem ipsum dolor sit amet</h3>
              <small>0{item}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <main>
      <HomeSectionMap />
      <section className="home-hero wf-section" id="hero">
        <div className="wf-shell hero-grid">
          <div className="hero-copy">
            <p className="wire-label">Lorem ipsum</p>
            <h1>Lorem ipsum dolor sit amet consectetur</h1>
            <p>{longText}</p>
            <div className="button-row"><Button onClick={() => go('/forum')}>Lorem ipsum</Button><Button variant="outline" onClick={() => go('/about')}>Dolor sit</Button></div>
          </div>
          <ImagePlaceholder className="hero-image" />
        </div>
        <div className="wf-shell home-hero-topics">
          <div className="home-hero-topics-heading"><span>Lorem ipsum · Lorem</span><button onClick={() => go('/forum')}>Lorem ipsum →</button></div>
          <div className="home-hero-topic-grid" data-wire-count="4">
            {[1, 2, 3, 4].map((item) => <article key={item}><small>0{item}</small><strong>Lorem ipsum dolor sit</strong><span>→</span></article>)}
          </div>
        </div>
      </section>
      <div className="home-ticker" aria-label="Lorem ipsum">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <span key={item}>LOREM&nbsp;&nbsp;0{item}.00</span>)}</div>
      <section className="wf-section home-designnote-section">
        <div className="wf-shell">
          <WireNote label="Design phase — landing approved">
            Landing-page wireframe is signed off. Management asked for added interactivity in the design phase: (1) an interactive / animated hero background expressing "global + connection" rather than a static image; (2) scroll-triggered number counters (see History); (3) section-to-section scroll transitions so each section reveals on scroll instead of reading as static blocks.
          </WireNote>
        </div>
      </section>
      <HomeValues />
      <HomeForumPreview />
      <HomeServices />
      <HomeHistory />
      <HomeEntrances />

      <section className="wf-section home-contact-section" id="home-contact" data-wire-count="1">
        <div className="wf-shell home-contact-band">
          <div><p className="wire-label">Lorem ipsum</p><h2>Lorem ipsum dolor sit amet</h2><p>{bodyText}</p></div>
          <Button onClick={() => go('/contact')}>Lorem ipsum</Button>
        </div>
      </section>
    </main>
  );
}

function PageHeading({ eyebrow = 'Lorem ipsum' }) {
  return (
    <section className="page-heading wf-section-gray">
      <div className="wf-shell"><p className="wire-label">{eyebrow}</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div>
    </section>
  );
}

function AboutPage() {
  return (
    <main>
      <PageHeading eyebrow="About us" />
      <section className="wf-section" id="intro">
        <div className="wf-shell split-content">
          <ImagePlaceholder />
          <div><p className="wire-label">01 / CYS introduction</p><h2>Lorem ipsum dolor sit amet</h2><p>{longText}</p><p>{bodyText}</p></div>
        </div>
      </section>
      <section className="wf-section wf-section-gray about-history-section" id="history">
        <div className="wf-shell">
          <div className="section-title section-title-left"><p>02 / History &amp; milestones</p><h2>Lorem ipsum dolor sit amet</h2><span>{bodyText}</span></div>
          <WireNote label="Design intent">
            Full-bleed rotating-earth / globe background. One marker per year from 1981 to 2030. Hovering a year expands that year&rsquo;s detail inline — no click. This replaces the generic hero + text block that was here before.
          </WireNote>
          <div className="milestone-timeline" data-wire-count={milestones.length}>
            {milestones.map((item) => (
              <article className="milestone-node" key={item.year} tabIndex={0}>
                <span className="milestone-dot" />
                <span className="milestone-year">{item.year}</span>
                <div className="milestone-detail"><h3>Lorem ipsum dolor</h3><p>{shortText}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="wf-section about-culture-section" id="culture">
        <div className="wf-shell">
          <div className="section-title section-title-left"><p>03 / Culture</p><h2>Lorem ipsum dolor sit amet</h2><span>{bodyText}</span></div>
          <WireNote>Include only if confirmed — client marked 企业文化 / Culture as &ldquo;if needed&rdquo;.</WireNote>
          <div className="three-card-grid">{[1, 2, 3].map((item) => <article className="wire-card" key={item}><ImagePlaceholder compact /><small>0{item}</small><h3>Lorem ipsum dolor</h3><p>{bodyText}</p></article>)}</div>
        </div>
      </section>
    </main>
  );
}

function CorridorPage() {
  return (
    <main>
      <PageHeading eyebrow="CN–SG corridor" />
      <section className="wf-section corridor-partners-section" id="partners">
        <div className="wf-shell">
          <div className="section-title section-title-left"><p>Section A / Partners &amp; investors</p><h2>Lorem ipsum dolor sit amet</h2><span>{bodyText}</span></div>
          <WireNote>Partner &amp; investor showcase: a large &ldquo;40+ years partnership&rdquo; statement, a wall of partner / investor logos, then the CYS vision copy. This is a different content type from the stories section below.</WireNote>
          <div className="corridor-partner-band"><strong>40+</strong><p>{bodyText}</p></div>
          <p className="wire-label">Partner / investor logos</p>
          <div className="four-card-grid">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div className="logo-tile" key={item}>Logo</div>)}</div>
          <div className="split-content corridor-vision">
            <div><p className="wire-label">Partners &amp; investors — vision</p><h2>Lorem ipsum dolor sit</h2><p>{longText}</p></div>
            <ImagePlaceholder />
          </div>
        </div>
      </section>
      <section className="wf-section wf-section-gray corridor-stories-section" id="stories">
        <div className="wf-shell">
          <div className="section-title section-title-left"><p>Section B / Partnership stories</p><h2>Lorem ipsum dolor sit amet</h2><span>{bodyText}</span></div>
          <WireNote>Editorial story / article cards — a separate content type from the logo wall above. Each card opens a full partnership story.</WireNote>
          <div className="three-card-grid">{[1, 2, 3, 4, 5, 6].map((item) => <article className="wire-card" key={item}><ImagePlaceholder compact /><small>Story 0{item}</small><h3>Lorem ipsum dolor sit</h3><p>{bodyText}</p><Button variant="outline">Lorem ipsum →</Button></article>)}</div>
        </div>
      </section>
    </main>
  );
}

function IndividualPage() {
  return (
    <main>
      <PageHeading eyebrow="Individual user" />
      <section className="wf-section" id="use-cases">
        <div className="wf-shell">
          <WireNote>Condensed layout — three use cases and one CTA only. The generic hero and alternating image/text blocks are removed; this page carries very little copy.</WireNote>
          <div className="three-card-grid">{[1, 2, 3].map((item) => <article className="wire-card" key={item}><ImagePlaceholder compact /><small>Use case 0{item}</small><h3>Lorem ipsum dolor</h3><p>{shortText}</p></article>)}</div>
        </div>
      </section>
      <section className="center-cta"><div className="center-cta-box"><p>Lorem ipsum</p><h2>Lorem ipsum dolor sit amet</h2><span>{bodyText}</span><Button>Lorem ipsum →</Button></div></section>
    </main>
  );
}

function BusinessPage() {
  const [tab, setTab] = useState(0);
  const audiences = [
    { number: '01', label: 'Financial institution' },
    { number: '02', label: 'Cross-border corporates' },
  ];
  const active = audiences[tab];
  return (
    <main>
      <PageHeading eyebrow="Business users" />
      <section className="wf-section" id="audiences">
        <div className="wf-shell">
          <WireNote>Condensed layout — two audiences only: financial institutions and cross-border corporates. Each is a short summary, a privileges list, and one CTA.</WireNote>
          <div className="home-product-tabs" role="tablist" aria-label="Lorem ipsum" data-wire-count="2">
            {audiences.map((item, index) => (
              <button key={item.number} role="tab" aria-selected={tab === index} className={tab === index ? 'active' : ''} onClick={() => setTab(index)}>{item.number} / {item.label}</button>
            ))}
          </div>
          <div className="split-content business-audience">
            <div>
              <p className="wire-label">{active.number} / {active.label}</p>
              <h2>Lorem ipsum dolor sit amet</h2>
              <p>{longText}</p>
              <ul className="wire-checklist">{[1, 2, 3, 4, 5, 6].map((item) => <li key={item}><span />Lorem ipsum dolor sit amet</li>)}</ul>
              <Button>Lorem ipsum →</Button>
            </div>
            <ImagePlaceholder />
          </div>
        </div>
      </section>
    </main>
  );
}

function LegalPage() {
  const [active, setActive] = useState(0);
  return (
    <main>
      <section className="page-heading wf-section-gray"><div className="wf-shell"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div></section>
      <section className="wf-section"><div className="wf-shell legal-layout"><aside>{['Lorem ipsum', 'Dolor sit', 'Amet consectetur'].map((item, index) => <button className={active === index ? 'active' : ''} key={item} onClick={() => setActive(index)}>{item}</button>)}</aside><div className="legal-copy"><h2>Lorem ipsum dolor sit amet</h2>{Array.from({ length: 6 }, (_, index) => <article key={index}><span>0{index + 1}</span><div><h3>Lorem ipsum dolor sit</h3><p>{index % 2 === 0 ? longText : bodyText}</p></div></article>)}</div></div></section>
    </main>
  );
}

function AuthPage() {
  const [mode, setMode] = useState('Lorem');
  const [done, setDone] = useState(false);
  return (
    <main className="auth-page wf-section-gray">
      <div className="wf-shell auth-layout">
        <div className="auth-copy"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{longText}</p><ImagePlaceholder compact /></div>
        <div className="auth-panel">{done ? <div className="success-panel compact-success"><span className="square-mark" /><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p><Button variant="outline" onClick={() => setDone(false)}>Lorem ipsum</Button></div> : <><div className="forum-tabs">{['Lorem', 'Ipsum'].map((item) => <button className={mode === item ? 'active' : ''} key={item} onClick={() => setMode(item)}>{item}</button>)}</div><form className="wire-form auth-form" onSubmit={(event) => { event.preventDefault(); setDone(true); }}><label>Lorem ipsum<input required /></label><label>Ipsum dolor<input type="email" required /></label><label>Dolor sit<input type="password" required /></label>{mode === 'Ipsum' ? <label>Consectetur<input type="password" required /></label> : null}<label className="checkbox-row"><input type="checkbox" required /> Lorem ipsum dolor sit amet</label><Button type="submit">Lorem ipsum</Button></form></>}</div>
      </div>
    </main>
  );
}

const forumItems = Array.from({ length: 8 }, (_, index) => ({ id: index + 1, title: `Lorem ipsum dolor sit amet ${index + 1}` }));

function ForumNav({ active }) {
  return <div className="forum-nav"><div className="wf-shell"><nav><button className={active === 'list' ? 'active' : ''} onClick={() => go('/forum')}>Lorem</button><button className={active === 'mine' ? 'active' : ''} onClick={() => go('/me/posts')}>Ipsum</button><button className={active === 'review' ? 'active' : ''} onClick={() => go('/moderation')}>Dolor</button></nav><Button onClick={() => go('/forum/new')}>Lorem ipsum</Button></div></div>;
}

function Forum() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => forumItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <main className="forum-page">
      <ForumNav active="list" />
      <section className="forum-heading"><div className="wf-shell"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div></section>
      <div className="wf-shell forum-body">
        <div className="forum-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lorem ipsum dolor sit amet" /><Button variant="outline">Lorem</Button><Button variant="outline">Ipsum</Button></div>
        <div className="filter-row">{['Lorem', 'Ipsum', 'Dolor', 'Sit amet', 'Consectetur'].map((item) => <button key={item}>{item}</button>)}</div>
        <div className="listing-grid">
          {filtered.map((item) => <article className="listing-card" key={item.id}><ImagePlaceholder compact /><div><small>Lorem ipsum</small><h2>{item.title}</h2><p>{bodyText}</p><div className="listing-meta"><span>Lorem</span><span>Ipsum</span><span>Dolor</span></div><Button variant="outline" onClick={() => go(`/forum/post/${item.id}`)}>Lorem ipsum</Button></div></article>)}
        </div>
      </div>
    </main>
  );
}

function PostDetail() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="forum-page">
      <ForumNav active="list" />
      <div className="wf-shell post-detail-wrap">
        <button className="text-link" onClick={() => go('/forum')}>← Lorem ipsum</button>
        <div className="post-detail-grid">
          <article className="post-detail-card"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet consectetur</h1><TextLines count={2} /><ImagePlaceholder className="post-main-image" /><p>{longText}</p><p>{bodyText}</p><div className="button-row"><Button>Lorem</Button><Button variant="outline">Ipsum</Button><Button variant="outline">Dolor</Button></div><div className="comment-box"><h2>Lorem ipsum</h2>{submitted && <div className="notice-box">Lorem ipsum dolor sit amet.</div>}<textarea placeholder="Lorem ipsum dolor sit amet" /><Button onClick={() => setSubmitted(true)}>Lorem ipsum</Button></div></article>
          <aside className="post-sidebar"><ImagePlaceholder compact /><h2>Lorem ipsum</h2><TextLines count={4} /><Button>Lorem ipsum</Button></aside>
        </div>
      </div>
    </main>
  );
}

function NewPost({ setCreated }) {
  const [done, setDone] = useState(false);
  const submit = (event) => { event.preventDefault(); setCreated(true); setDone(true); };
  return (
    <main className="forum-page">
      <ForumNav active="mine" />
      <div className="wf-shell narrow-page">
        {done ? <div className="success-panel"><div className="square-mark" /><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p><Button onClick={() => go('/me/posts')}>Lorem ipsum</Button></div> : <><div className="plain-page-title"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div><WireForm onSubmit={submit} /></>}
      </div>
    </main>
  );
}

function WireForm({ compact = false, onSubmit }) {
  return (
    <form className={`wire-form ${compact ? 'wire-form-compact' : ''}`} onSubmit={onSubmit || ((event) => event.preventDefault())}>
      <label>Lorem ipsum<input required /></label>
      <label>Ipsum dolor<input required /></label>
      <label>Sit amet<select required defaultValue=""><option value="" disabled>Lorem ipsum</option><option>Lorem</option><option>Ipsum</option></select></label>
      <label>Consectetur<textarea rows={compact ? 4 : 7} required /></label>
      <label className="checkbox-row"><input type="checkbox" required /> Lorem ipsum dolor sit amet</label>
      <Button type="submit">Lorem ipsum</Button>
    </form>
  );
}

function MyPosts({ created }) {
  const items = created ? [0, 1, 2, 3] : [1, 2, 3];
  return (
    <main className="forum-page">
      <ForumNav active="mine" />
      <div className="wf-shell dashboard-wrap">
        <div className="plain-page-title"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div>
        <div className="dashboard-grid"><aside>{['Lorem ipsum', 'Dolor sit', 'Amet consectetur', 'Adipiscing elit'].map((item, index) => <button className={index === 0 ? 'active' : ''} key={item}>{item}</button>)}</aside><section><div className="filter-row">{['Lorem', 'Ipsum', 'Dolor', 'Sit amet'].map((item) => <button key={item}>{item}</button>)}</div><div className="dashboard-list">{items.map((item) => <article key={item}><div className="square-mark" /><div><small>Lorem ipsum</small><h2>Lorem ipsum dolor sit amet</h2><TextLines count={2} /></div><Button variant="outline">Lorem</Button></article>)}</div></section></div>
      </div>
    </main>
  );
}

function Moderation() {
  const [approved, setApproved] = useState(false);
  return (
    <main className="forum-page">
      <ForumNav active="review" />
      <div className="moderation-layout">
        <aside className="review-queue"><h1>Lorem ipsum</h1>{[1, 2, 3, 4].map((item) => <button key={item}><span className="square-mark" /><div><strong>Lorem ipsum dolor</strong><small>Lorem ipsum</small></div></button>)}</aside>
        <section className="review-content">
          {approved ? <div className="success-panel"><div className="square-mark" /><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p><Button variant="outline" onClick={() => setApproved(false)}>Lorem ipsum</Button></div> : <><div className="review-actions"><span>Lorem ipsum</span><div><Button variant="outline">Lorem</Button><Button onClick={() => setApproved(true)}>Ipsum</Button></div></div><div className="review-columns"><article><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet consectetur</h1><TextLines count={3} /><ImagePlaceholder /><p>{longText}</p></article><aside><h2>Lorem ipsum</h2>{[1, 2, 3].map((item) => <div className="review-check" key={item}><span className="square-mark" /><div><strong>Lorem ipsum</strong><small>Dolor sit amet</small></div></div>)}<label>Lorem ipsum<textarea rows={6} /></label></aside></div></>}
        </section>
      </div>
    </main>
  );
}

const fullForumItems = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: `Lorem ipsum dolor sit amet ${String(index + 1).padStart(2, '0')}`,
  category: ['Lorem', 'Ipsum', 'Dolor', 'Sit amet'][index % 4],
  replies: 12 + index * 3,
  views: 84 + index * 17,
}));

const fullForumCategories = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  title: ['Lorem ipsum', 'Ipsum dolor', 'Dolor sit', 'Sit amet', 'Amet consectetur', 'Consectetur adipiscing'][index],
  topics: 24 + index * 11,
  replies: 105 + index * 28,
}));

const fullForumMembers = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: `Lorem ipsum ${String(index + 1).padStart(2, '0')}`,
  posts: 18 + index * 7,
  replies: 42 + index * 13,
}));

const fullDashboardModes = [
  ['/me/forum', 'Lorem ipsum'],
  ['/me/posts', 'Dolor sit'],
  ['/me/replies', 'Amet consectetur'],
  ['/me/saved', 'Adipiscing elit'],
  ['/me/notifications', 'Sed eiusmod'],
  ['/me/settings', 'Tempor incididunt'],
];

function FullForumNav({ active }) {
  const items = [
    ['/forum', 'list', 'Lorem'],
    ['/forum/categories', 'categories', 'Ipsum'],
    ['/forum/members', 'members', 'Dolor'],
    ['/forum/search', 'search', 'Sit amet'],
    ['/me/forum', 'mine', 'Consectetur'],
    ['/moderation', 'review', 'Adipiscing'],
  ];

  return (
    <div className="forum-nav full-forum-nav">
      <div className="wf-shell">
        <nav aria-label="Lorem ipsum">{items.map(([path, key, label]) => <button key={path} className={active === key ? 'active' : ''} onClick={() => go(path)}>{label}</button>)}</nav>
        <Button onClick={() => go('/forum/new')}>Lorem ipsum</Button>
      </div>
    </div>
  );
}

function FullForumHeading({ compact = false }) {
  return <section className={`forum-heading ${compact ? 'forum-heading-compact' : ''}`}><div className="wf-shell"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div></section>;
}

function ForumPagination({ page, setPage, total = 4 }) {
  return <div className="forum-pagination" aria-label="Lorem ipsum">{Array.from({ length: total }, (_, index) => index + 1).map((item) => <button className={page === item ? 'active' : ''} key={item} onClick={() => setPage(item)}>{String(item).padStart(2, '0')}</button>)}</div>;
}

function FullListingCard({ item }) {
  return <article className="listing-card"><ImagePlaceholder compact /><div><small>{item.category} / {String(item.id).padStart(2, '0')}</small><h2>{item.title}</h2><p>{bodyText}</p><div className="listing-meta"><span>{item.replies}</span><span>{item.views}</span><span>Lorem</span></div><Button variant="outline" onClick={() => go(`/forum/post/${item.id}`)}>Lorem ipsum</Button></div></article>;
}

function FullForumFeed({ items = fullForumItems }) {
  return <div className="listing-grid">{items.map((item) => <FullListingCard item={item} key={item.id} />)}</div>;
}

function FullForumEmpty() {
  return <div className="forum-empty"><span className="square-mark" /><h2>Lorem ipsum dolor sit amet</h2><p>{bodyText}</p><Button variant="outline" onClick={() => go('/forum/new')}>Lorem ipsum</Button></div>;
}

function FullForum() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Lorem');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => fullForumItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [query]);
  return <main className="forum-page"><FullForumNav active="list" /><FullForumHeading /><div className="wf-shell forum-body"><div className="forum-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lorem ipsum dolor sit amet" /><Button variant="outline" onClick={() => go('/forum/search')}>Lorem</Button><Button variant="outline" onClick={() => go('/forum/categories')}>Ipsum</Button></div><div className="filter-row">{['Lorem', 'Ipsum', 'Dolor', 'Sit amet', 'Consectetur'].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>{filtered.length > 0 ? <FullForumFeed items={filtered.slice(0, 8)} /> : <FullForumEmpty />}<ForumPagination page={page} setPage={setPage} /></div></main>;
}

function CategoryDirectory() {
  return <main className="forum-page"><FullForumNav active="categories" /><FullForumHeading compact /><div className="wf-shell forum-body forum-two-column"><section className="category-directory"><div className="directory-head"><span>Lorem ipsum</span><span>Ipsum</span><span>Dolor</span></div>{fullForumCategories.map((item) => <button className="category-row" key={item.id} onClick={() => go(`/forum/category/${item.id}`)}><span className="category-square" /><span><strong>{item.title}</strong><small>{shortText}</small></span><b>{item.topics}</b><b>{item.replies}</b></button>)}</section><aside className="forum-side-panel"><h2>Lorem ipsum</h2><TextLines count={5} /><div className="side-stat-grid">{[1, 2, 3, 4].map((item) => <div key={item}><strong>0{item}</strong><span>Lorem</span></div>)}</div><Button onClick={() => go('/forum/rules')}>Lorem ipsum</Button></aside></div></main>;
}

function CategoryPage({ categoryId }) {
  const [sort, setSort] = useState('Lorem');
  const [page, setPage] = useState(1);
  const category = fullForumCategories[(Number(categoryId) - 1) % fullForumCategories.length];
  const items = fullForumItems.filter((item) => item.id % 3 === Number(categoryId) % 3);
  return <main className="forum-page"><FullForumNav active="categories" /><FullForumHeading compact /><div className="wf-shell forum-body"><div className="forum-context-bar"><button onClick={() => go('/forum/categories')}>Lorem ipsum</button><span>{category?.title || 'Lorem ipsum'}</span><Button onClick={() => go('/forum/new')}>Lorem ipsum</Button></div><div className="filter-row">{['Lorem', 'Ipsum', 'Dolor', 'Sit amet'].map((item) => <button className={sort === item ? 'active' : ''} key={item} onClick={() => setSort(item)}>{item}</button>)}</div><FullForumFeed items={items} /><ForumPagination page={page} setPage={setPage} total={3} /></div></main>;
}

function FullForumSearch() {
  const [query, setQuery] = useState('Lorem');
  const [scope, setScope] = useState('Lorem');
  const filtered = useMemo(() => fullForumItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [query]);
  return <main className="forum-page"><FullForumNav active="search" /><FullForumHeading compact /><div className="wf-shell forum-body search-page"><form className="search-panel" onSubmit={(event) => event.preventDefault()}><label>Lorem ipsum<input value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Ipsum dolor<select value={scope} onChange={(event) => setScope(event.target.value)}><option>Lorem</option><option>Ipsum</option><option>Dolor</option></select></label><Button type="submit">Lorem ipsum</Button></form><div className="results-heading"><div><p className="wire-label">Lorem ipsum</p><h2>Lorem ipsum dolor sit amet</h2></div><span>{String(filtered.length).padStart(2, '0')}</span></div>{filtered.length > 0 ? <div className="forum-result-list">{filtered.map((item) => <button key={item.id} onClick={() => go(`/forum/post/${item.id}`)}><span className="square-mark" /><span><small>{item.category} / {item.replies}</small><strong>{item.title}</strong><em>{shortText}</em></span><b>{item.views}</b></button>)}</div> : <FullForumEmpty />}</div></main>;
}

function FullMembersPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => fullForumMembers.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [query]);
  return <main className="forum-page"><FullForumNav active="members" /><FullForumHeading compact /><div className="wf-shell forum-body"><div className="forum-toolbar members-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lorem ipsum" /><Button variant="outline">Lorem</Button></div><div className="member-grid">{filtered.map((member) => <article className="member-card" key={member.id}><ImagePlaceholder compact /><div><small>Lorem ipsum / 0{member.id}</small><h2>{member.name}</h2><p>{shortText}</p><div className="member-stats"><span><b>{member.posts}</b>Lorem</span><span><b>{member.replies}</b>Ipsum</span></div><Button variant="outline" onClick={() => go(`/forum/member/${member.id}`)}>Lorem ipsum</Button></div></article>)}</div></div></main>;
}

function FullMemberProfile({ memberId }) {
  const [tab, setTab] = useState('Lorem');
  const member = fullForumMembers[(Number(memberId) - 1) % fullForumMembers.length] || fullForumMembers[0];
  return <main className="forum-page"><FullForumNav active="members" /><div className="profile-header"><div className="wf-shell profile-header-grid"><ImagePlaceholder compact className="profile-avatar" /><div><p className="wire-label">Lorem ipsum</p><h1>{member.name}</h1><p>{bodyText}</p><div className="button-row"><Button>Lorem ipsum</Button><Button variant="outline">Dolor sit</Button></div></div><div className="profile-stat-block"><strong>{member.posts}</strong><span>Lorem ipsum</span><strong>{member.replies}</strong><span>Dolor sit</span></div></div></div><div className="wf-shell forum-body profile-body"><div className="forum-tabs">{['Lorem', 'Ipsum', 'Dolor'].map((item) => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div><div className="profile-layout"><section className="dashboard-list">{fullForumItems.slice(0, 5).map((item) => <article key={item.id}><span className="square-mark" /><div><small>{item.category} / {item.replies}</small><h2>{item.title}</h2><TextLines count={2} /></div><Button variant="outline" onClick={() => go(`/forum/post/${item.id}`)}>Lorem</Button></article>)}</section><aside className="forum-side-panel"><h2>Lorem ipsum</h2><TextLines count={6} /><Button variant="outline">Lorem ipsum</Button></aside></div></div></main>;
}

function FullPostDetail({ postId }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [voted, setVoted] = useState(false);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState(3);
  const post = fullForumItems[(Number(postId) - 1) % fullForumItems.length] || fullForumItems[0];
  const submitReply = (event) => { event.preventDefault(); if (!reply.trim()) return; setReplies((value) => value + 1); setReply(''); };
  return <main className="forum-page"><FullForumNav active="list" /><div className="wf-shell post-detail-wrap"><div className="forum-context-bar"><button onClick={() => go('/forum')}>Lorem ipsum</button><span>{post.category}</span><Button variant="outline" onClick={() => go(`/forum/report/${post.id}`)}>Dolor sit</Button></div><div className="post-detail-grid"><article className="post-detail-card"><p className="wire-label">{post.category} / {String(post.id).padStart(2, '0')}</p><h1>{post.title}</h1><TextLines count={2} /><ImagePlaceholder className="post-main-image" /><p>{longText}</p><p>{bodyText}</p><div className="thread-actions"><Button variant={voted ? 'solid' : 'outline'} onClick={() => setVoted((value) => !value)}>Lorem {post.replies + (voted ? 1 : 0)}</Button><Button variant={bookmarked ? 'solid' : 'outline'} onClick={() => setBookmarked((value) => !value)}>Ipsum</Button><Button variant="outline" onClick={() => go(`/forum/edit/${post.id}`)}>Dolor</Button></div><section className="thread-replies"><div className="thread-section-head"><div><p className="wire-label">Lorem ipsum</p><h2>Lorem ipsum dolor</h2></div><span>0{replies}</span></div>{Array.from({ length: replies }, (_, index) => <article className="reply-item" key={index}><span className="reply-avatar" /><div className="reply-copy"><div><strong>Lorem ipsum {String(index + 1).padStart(2, '0')}</strong><small>Dolor sit / 0{index + 1}</small></div><p>{index % 2 === 0 ? longText : bodyText}</p><div className="reply-actions"><button>Lorem {index + 2}</button><button>Ipsum</button><button>Dolor</button></div></div></article>)}</section><form className="comment-box" onSubmit={submitReply}><h2>Lorem ipsum</h2><textarea required value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Lorem ipsum dolor sit amet" /><div className="composer-footer"><span>{reply.length} / 500</span><Button type="submit">Lorem ipsum</Button></div></form></article><aside className="post-sidebar"><ImagePlaceholder compact /><h2>Lorem ipsum</h2><TextLines count={4} /><Button onClick={() => go('/forum/member/1')}>Lorem ipsum</Button><div className="side-link-list">{fullForumItems.slice(0, 4).map((item) => <button key={item.id} onClick={() => go(`/forum/post/${item.id}`)}><small>{item.category}</small><strong>{item.title}</strong></button>)}</div></aside></div></div></main>;
}

function FullPostComposer({ setCreated, editing = false }) {
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState(editing ? 'Lorem ipsum dolor sit amet' : '');
  const [content, setContent] = useState(editing ? longText : '');
  const submit = (event) => { event.preventDefault(); setCreated?.(true); setDone(true); };
  return <main className="forum-page"><FullForumNav active="mine" /><div className="wf-shell composer-wrap">{done ? <div className="success-panel"><div className="square-mark" /><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p><Button onClick={() => go('/me/posts')}>Lorem ipsum</Button></div> : <><div className="plain-page-title"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div><div className="composer-grid"><form className="wire-form forum-composer" onSubmit={submit}><label>Lorem ipsum<input required value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Ipsum dolor<select required defaultValue="Lorem"><option>Lorem</option><option>Ipsum</option><option>Dolor</option></select></label><label>Dolor sit<input required defaultValue={editing ? 'Lorem, ipsum' : ''} /></label><label>Consectetur<textarea required rows={12} value={content} onChange={(event) => setContent(event.target.value)} /></label><div className="upload-block"><ImagePlaceholder compact /><Button type="button" variant="outline">Lorem ipsum</Button></div><label className="checkbox-row"><input type="checkbox" required /> Lorem ipsum dolor sit amet</label><div className="composer-actions"><Button type="button" variant="outline" onClick={() => setPreview((value) => !value)}>Lorem ipsum</Button><Button type="submit">Dolor sit</Button></div></form><aside className="composer-aside"><h2>Lorem ipsum</h2><TextLines count={7} />{preview ? <div className="composer-preview"><span className="square-mark" /><h3>{title || 'Lorem ipsum'}</h3><p>{content || bodyText}</p></div> : <ImagePlaceholder compact />}</aside></div></>}</div></main>;
}

function FullReportPost() {
  const [done, setDone] = useState(false);
  return <main className="forum-page"><FullForumNav active="list" /><div className="wf-shell narrow-page">{done ? <div className="success-panel"><div className="square-mark" /><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p><Button onClick={() => go('/forum')}>Lorem ipsum</Button></div> : <><div className="plain-page-title"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div><form className="wire-form report-form" onSubmit={(event) => { event.preventDefault(); setDone(true); }}><label>Lorem ipsum<select required defaultValue=""><option value="" disabled>Lorem ipsum</option><option>Ipsum</option><option>Dolor</option></select></label><label>Dolor sit<textarea rows={9} required /></label><label className="checkbox-row"><input type="checkbox" required /> Lorem ipsum dolor sit amet</label><Button type="submit">Lorem ipsum</Button></form></>}</div></main>;
}

function FullForumDashboard({ route, created }) {
  const [removed, setRemoved] = useState([]);
  const [read, setRead] = useState([]);
  const isSettings = route === '/me/settings';
  const isNotifications = route === '/me/notifications';
  const items = (created ? [{ ...fullForumItems[0], id: 99 }, ...fullForumItems] : fullForumItems).slice(0, 6).filter((item) => !removed.includes(item.id));
  return <main className="forum-page"><FullForumNav active="mine" /><div className="wf-shell dashboard-wrap"><div className="dashboard-heading-row"><div className="plain-page-title"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div><Button onClick={() => go('/forum/new')}>Lorem ipsum</Button></div><div className="dashboard-grid full-dashboard"><aside>{fullDashboardModes.map(([path, label]) => <button className={route === path ? 'active' : ''} key={path} onClick={() => go(path)}>{label}</button>)}</aside><section>{isSettings ? <SettingsForm /> : <><div className="dashboard-tools"><div className="filter-row">{['Lorem', 'Ipsum', 'Dolor'].map((item) => <button key={item}>{item}</button>)}</div><span>{String(items.length).padStart(2, '0')}</span></div><div className="dashboard-list">{items.map((item) => <article className={read.includes(item.id) ? 'is-read' : ''} key={item.id}><button className="square-control" onClick={() => isNotifications && setRead((value) => [...value, item.id])} aria-label="Lorem ipsum" /><div><small>{isNotifications ? 'Lorem ipsum' : item.category} / {item.replies}</small><h2>{item.title}</h2><TextLines count={2} /></div><Button variant="outline" onClick={() => route === '/me/saved' ? setRemoved((value) => [...value, item.id]) : go(`/forum/post/${item.id}`)}>Lorem</Button></article>)}</div></>}</section></div></div></main>;
}

function SettingsForm() {
  const [done, setDone] = useState(false);
  return done ? <div className="success-panel compact-success"><span className="square-mark" /><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p><Button variant="outline" onClick={() => setDone(false)}>Lorem ipsum</Button></div> : <form className="wire-form settings-form" onSubmit={(event) => { event.preventDefault(); setDone(true); }}><label>Lorem ipsum<input required defaultValue="Lorem ipsum" /></label><label>Ipsum dolor<input required defaultValue="Lorem ipsum" /></label><label>Sit amet<select defaultValue="Lorem"><option>Lorem</option><option>Ipsum</option></select></label><label>Consectetur<textarea rows={7} defaultValue={bodyText} /></label><label className="checkbox-row"><input type="checkbox" defaultChecked /> Lorem ipsum dolor sit amet</label><label className="checkbox-row"><input type="checkbox" /> Ipsum dolor sit amet</label><Button type="submit">Lorem ipsum</Button></form>;
}

function FullForumRules() {
  return <main className="forum-page"><FullForumNav active="categories" /><FullForumHeading compact /><div className="wf-shell narrow-page rules-page"><div className="rules-list">{Array.from({ length: 6 }, (_, index) => <article key={index}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>Lorem ipsum dolor sit amet</h2><p>{longText}</p></div></article>)}</div><div className="centered-action"><Button onClick={() => go('/forum')}>Lorem ipsum</Button></div></div></main>;
}

function FullModeration() {
  const [selected, setSelected] = useState(1);
  const [resolved, setResolved] = useState([]);
  const [filter, setFilter] = useState('Lorem');
  const queue = [1, 2, 3, 4, 5].filter((item) => !resolved.includes(item));
  const resolve = () => { setResolved((value) => [...value, selected]); const next = queue.find((item) => item !== selected); if (next) setSelected(next); };
  return <main className="forum-page"><FullForumNav active="review" /><div className="moderation-toolbar"><div className="filter-row">{['Lorem', 'Ipsum', 'Dolor'].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><span>{String(queue.length).padStart(2, '0')}</span></div><div className="moderation-layout full-moderation"><aside className="review-queue"><h1>Lorem ipsum</h1>{queue.map((item) => <button className={selected === item ? 'selected' : ''} key={item} onClick={() => setSelected(item)}><span className="square-mark" /><div><strong>Lorem ipsum dolor {item}</strong><small>Lorem ipsum</small></div></button>)}</aside><section className="review-content">{queue.length === 0 ? <FullForumEmpty /> : <><div className="review-actions"><span>Lorem ipsum / 0{selected}</span><div><Button variant="outline" onClick={resolve}>Lorem</Button><Button onClick={resolve}>Ipsum</Button></div></div><div className="review-columns"><article><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet consectetur</h1><TextLines count={3} /><ImagePlaceholder /><p>{longText}</p><div className="thread-replies compact-thread"><article className="reply-item"><span className="reply-avatar" /><div className="reply-copy"><strong>Lorem ipsum</strong><p>{bodyText}</p></div></article></div></article><aside><h2>Lorem ipsum</h2>{[1, 2, 3, 4].map((item) => <div className="review-check" key={item}><span className="square-mark" /><div><strong>Lorem ipsum</strong><small>Dolor sit amet</small></div></div>)}<label>Lorem ipsum<textarea rows={6} /></label></aside></div></>}</section></div></main>;
}

function Contact() {
  const [done, setDone] = useState(false);
  return (
    <main>
      <section className="page-heading wf-section-gray"><div className="wf-shell"><p className="wire-label">Lorem ipsum</p><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p></div></section>
      <section className="wf-section"><div className="wf-shell contact-layout"><aside><h2>Lorem ipsum</h2><TextLines count={7} /><ImagePlaceholder compact /></aside>{done ? <div className="success-panel"><div className="square-mark" /><h1>Lorem ipsum dolor sit amet</h1><p>{bodyText}</p><Button variant="outline" onClick={() => setDone(false)}>Lorem ipsum</Button></div> : <WireForm onSubmit={(event) => { event.preventDefault(); setDone(true); }} />}</div></section>
    </main>
  );
}

export default function App() {
  const route = useRoute();
  const [created, setCreated] = useState(false);
  let screen;

  if (route === '/') screen = <Home />;
  else if (route === '/about') screen = <AboutPage />;
  else if (route === '/corridor') screen = <CorridorPage />;
  else if (route === '/corporate') screen = <BusinessPage />;
  else if (route === '/individual') screen = <IndividualPage />;
  else if (route === '/forum') screen = <FullForum />;
  else if (route === '/forum/categories') screen = <CategoryDirectory />;
  else if (/^\/forum\/category\/\d+$/.test(route)) screen = <CategoryPage categoryId={route.split('/').pop()} />;
  else if (route === '/forum/search') screen = <FullForumSearch />;
  else if (route === '/forum/members') screen = <FullMembersPage />;
  else if (/^\/forum\/member\/\d+$/.test(route)) screen = <FullMemberProfile memberId={route.split('/').pop()} />;
  else if (/^\/forum\/post\/\d+$/.test(route)) screen = <FullPostDetail postId={route.split('/').pop()} />;
  else if (route === '/forum/new') screen = <FullPostComposer setCreated={setCreated} />;
  else if (/^\/forum\/edit\/\d+$/.test(route)) screen = <FullPostComposer setCreated={setCreated} editing />;
  else if (/^\/forum\/report\/\d+$/.test(route)) screen = <FullReportPost />;
  else if (route === '/forum/rules') screen = <FullForumRules />;
  else if (fullDashboardModes.some(([path]) => path === route)) screen = <FullForumDashboard route={route} created={created} />;
  else if (route === '/moderation') screen = <FullModeration />;
  else if (route === '/contact') screen = <Contact />;
  else if (route === '/legal') screen = <LegalPage />;
  else if (route === '/auth') screen = <AuthPage />;
  else screen = <Home />;

  return <div className="wireframe-app"><Header route={route} /><PageIndicator route={route} />{screen}<Footer compact={route === '/'} /></div>;
}
