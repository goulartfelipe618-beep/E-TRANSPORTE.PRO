/**
 * Gera páginas HTML com SEO técnico, Schema.org e layout premium.
 * Executar: node scripts/build-pages.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, NAV, FOOTER_COLS, LOCAL_PAGES } from "./site-config.mjs";
import { registerLegacyPages, buildBlogFiles } from "./legacy-and-blog.mjs";
import { CRITICAL_HEADER_STYLE, deferredSiteStyles } from "./critical-css.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSchemas(page) {
  const url = `${SITE.baseUrl}${page.path}`;
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE.baseUrl}/#website`,
      url: SITE.baseUrl + "/",
      name: SITE.name,
      description: SITE.description,
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE.baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE.baseUrl}/faq.html?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE.baseUrl}/#organization`,
      name: SITE.name,
      url: SITE.baseUrl + "/",
      logo: { "@type": "ImageObject", url: SITE.logo },
      email: SITE.email,
      sameAs: SITE.sameAs,
      description: SITE.description,
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE.baseUrl}/#localbusiness`,
      name: SITE.name,
      description: "Plataforma nacional de gestão para transporte executivo e transfer.",
      url: SITE.baseUrl + "/",
      email: SITE.email,
      image: SITE.logo,
      priceRange: "$$",
      areaServed: { "@type": "Country", name: "Brasil" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: SITE.rating.value,
        reviewCount: SITE.rating.count,
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
        description: "Solicitação de acesso gratuito para avaliação",
      },
      description: SITE.description,
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${SITE.baseUrl}/#website` },
      inLanguage: "pt-BR",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".page-hero h1", ".page-hero__lead", ".page-section p"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumb.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: item.href ? `${SITE.baseUrl}${item.href}` : undefined,
      })),
    },
  ];

  if (page.service) {
    graph.push({
      "@type": "Service",
      name: page.service.name,
      description: page.service.description,
      provider: { "@id": `${SITE.baseUrl}/#organization` },
      areaServed: "Brasil",
      serviceType: page.service.type,
    });
  }

  if (page.faq) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faq.map((q) => ({
        "@type": "Question",
        name: q.q,
        acceptedAnswer: { "@type": "Answer", text: q.a },
      })),
    });
  }

  if (page.article) {
    graph.push({
      "@type": "Article",
      headline: page.title,
      description: page.description,
      author: { "@type": "Organization", name: SITE.name },
      publisher: { "@id": `${SITE.baseUrl}/#organization` },
      datePublished: page.article.datePublished,
      dateModified: page.article.dateModified || page.article.datePublished,
      mainEntityOfPage: { "@id": `${url}#webpage` },
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 0);
}

function head(page) {
  const url = `${SITE.baseUrl}${page.path}`;
  const kw = page.keywords || SITE.keywords;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />
  <meta name="keywords" content="${esc(kw)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="author" content="E-Transporte.pro" />
  <meta name="theme-color" content="#0e1016" />
  <link rel="canonical" href="${esc(url)}" />
  <meta property="og:type" content="${page.ogType || "website"}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:title" content="${esc(page.ogTitle || page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="E-Transporte.pro" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(page.ogTitle || page.title)}" />
  <meta name="twitter:description" content="${esc(page.description)}" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  ${CRITICAL_HEADER_STYLE}
  ${deferredSiteStyles({ page: true, blog: false })}
</head>`;
}

function header(active) {
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}"${active === n.href || active === n.label ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`
  ).join("\n        ");
  return `<header class="topbar" role="banner">
    <div class="container topbar__inner">
      <a class="brand" href="/">E-Transporte<span>.pro</span></a>
      <button class="btn btn--ghost mobile-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="nav-menu">Menu</button>
      <nav class="menu" id="nav-menu" data-nav aria-label="Principal">
        ${links}
        <button type="button" class="btn btn--primary menu__cta" data-open-lead-modal aria-haspopup="dialog">Solicitar Acesso Gratuito</button>
      </nav>
    </div>
  </header>`;
}

function footer() {
  const cols = FOOTER_COLS.map(
    (c) => `<div>
          <h3>${esc(c.title)}</h3>
          <ul>${c.links
            .map((l) => {
              const ext = l.external ? ' target="_blank" rel="noopener noreferrer"' : "";
              return `<li><a href="${l.href}"${ext}>${esc(l.label)}</a></li>`;
            })
            .join("")}</ul>
        </div>`
  ).join("");
  return `<footer class="lp-footer" role="contentinfo">
    <div class="container">
      <div class="lp-footer__grid">
        <div class="lp-footer__brand">
          <p class="brand">E-Transporte<span>.pro</span></p>
          <p>${esc(SITE.description)}</p>
        </div>
        ${cols}
      </div>
      <div class="lp-footer__bottom">
        <span>© <span data-year></span> ${esc(SITE.name)}</span>
        <span>Plataforma para transporte executivo · Brasil</span>
      </div>
    </div>
  </footer>`;
}

function breadcrumb(items) {
  const lis = items
    .map((item, i) => {
      const isLast = i === items.length - 1;
      if (isLast) return `<li aria-current="page">${esc(item.name)}</li>`;
      return `<li><a href="${item.href}">${esc(item.name)}</a></li>`;
    })
    .join("");
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${lis}</ol></nav>`;
}

function ctaBand(title, text) {
  return `<aside class="page-cta lp-cta-band" aria-label="Chamada para ação">
      <h2>${esc(title)}</h2>
      <p>${text}</p>
      <div class="hero__actions">
        <button type="button" class="btn btn--primary" data-open-lead-modal>Solicitar Acesso Gratuito</button>
        <a class="btn btn--ghost" href="/contato.html">Falar com a equipe</a>
      </div>
    </aside>`;
}

function pageShell(page, bodyHtml) {
  return `${head(page)}
<body class="lp-page page-inner" data-page="${esc(page.slug || "")}">
  ${header(page.activeNav)}
  <div class="lp-sticky-cta" data-lp-sticky-cta hidden>
    <div class="lp-sticky-cta__inner">
      <p class="lp-sticky-cta__text"><strong>Acesso gratuito</strong> Plataforma nacional</p>
      <button type="button" class="btn btn--primary" data-open-lead-modal>Solicitar Acesso Gratuito</button>
    </div>
  </div>
  <main id="conteudo-principal">
    ${breadcrumb(page.breadcrumb)}
    ${bodyHtml}
    ${ctaBand(page.ctaTitle || "Profissionalize sua operação executiva agora", page.ctaText || "Solicite acesso gratuito à plataforma E-Transporte.pro e centralize reservas, motoristas, automação e geolocalização.")}
  </main>
  ${footer()}
  <script type="application/ld+json">${buildSchemas(page)}</script>
  <script src="/js/site.js" defer></script>
  <script src="/js/main.js" defer></script>
  <script src="/js/seo.js" defer></script>
  <script src="/js/landing.js" defer></script>
</body>
</html>`;
}

function hero(h1, lead, eyebrow = "E-Transporte.pro") {
  return `<header class="page-hero lp-reveal">
      <span class="lp-eyebrow">${esc(eyebrow)}</span>
      <h1>${h1}</h1>
      <p class="page-hero__lead">${lead}</p>
    </header>`;
}

function sectionBlock(title, html, id) {
  const idAttr = id ? ` id="${id}"` : "";
  return `<section class="page-section lp-reveal"${idAttr}>
      <div class="container">
        <h2>${esc(title)}</h2>
        ${html}
      </div>
    </section>`;
}

const FAQ_ITEMS = [
  {
    q: "O que é a E-Transporte.pro?",
    a: "É uma plataforma nacional de gestão para operadores de transporte executivo e transfer, reunindo reservas, motoristas, financeiro, marketing, geolocalização e automações em um único painel.",
  },
  {
    q: "A plataforma funciona como sistema para transfer?",
    a: "Sim. O fluxo cobre solicitações, reservas confirmadas, contratos PDF, comunicação e links de rastreio em tempo real.",
  },
  {
    q: "Serve para transporte corporativo?",
    a: "Sim. Há módulos para grupos, contratos corporativos, receptivos para hotéis e agências e CRM de clientes.",
  },
  {
    q: "Como funciona o software para motoristas executivos?",
    a: "Cadastro de motoristas, documentação, portal do motorista e candidaturas integradas ao painel do operador.",
  },
  {
    q: "O que inclui a geolocalização em tempo real?",
    a: "Geração de links públicos de rastreamento para o passageiro acompanhar a viagem no dia do serviço.",
  },
  {
    q: "Como solicitar acesso gratuito?",
    a: "Clique em Solicitar Acesso Gratuito, preencha nome, e-mail, telefone e cidade. Nossa equipe retorna com o fluxo de implantação.",
  },
  {
    q: "Quais planos existem?",
    a: "FREE, STANDART e PRÓ — com recursos progressivos de contratos, campanhas, domínio, automações e captação avançada.",
  },
  {
    q: "A plataforma substitui meu site institucional?",
    a: "O módulo Website (PRÓ) produz o site do operador com domínio próprio integrado ao painel de gestão.",
  },
  {
    q: "Como funciona o rastreamento para o passageiro?",
    a: "Após a reserva, o operador gera link público de rastreio alinhado ao módulo de geolocalização.",
  },
  {
    q: "A plataforma é indicada para operação nacional?",
    a: "Sim. Arquitetura pensada para múltiplas cidades, Network entre operadores e gestão centralizada.",
  },
  {
    q: "Há automação entre marketing e operação?",
    a: "Sim. Webhooks e regras conectam formulários, campanhas e solicitações no painel em tempo real.",
  },
  {
    q: "Como funciona a captura de leads?",
    a: "Formulários do site e campanhas com UTM alimentam o funil de leads com conformidade LGPD.",
  },
];

function faqHtml(items) {
  return `<div class="lp-faq page-faq">${items
    .map(
      (item) => `<details>
            <summary>${esc(item.q)}</summary>
            <div class="lp-faq__body">${item.a}</div>
          </details>`
    )
    .join("")}</div>`;
}

const PAGES = [];

function addPage(def) {
  PAGES.push(def);
}

// Sobre
addPage({
  slug: "sobre",
  path: "/sobre.html",
  file: "sobre.html",
  title: "Sobre a E-Transporte.pro | Plataforma nacional de transporte executivo",
  description:
    "Conheça a E-Transporte.pro: plataforma tecnológica para gestão de transporte executivo, transfer e transporte corporativo em escala nacional.",
  keywords: "sobre e-transporte, plataforma transporte executivo, empresa gestão transfer",
  activeNav: "Sobre",
  breadcrumb: [
    { name: "Início", href: "/" },
    { name: "Sobre", href: "/sobre.html" },
  ],
  body: `${hero("A plataforma que profissionaliza o transporte executivo no Brasil", "Somos um ecossistema tecnológico para operadores que precisam sair do caos do WhatsApp e operar com padrão corporativo, automação e escala.", "Sobre nós")}
    ${sectionBlock("Nossa missão", `<p class="page-lead">Entregar infraestrutura de gestão que transforma operadores locais em empresas executivas escaláveis — com reservas, motoristas, financeiro, marketing e rastreamento em um único painel.</p>
      <ul class="page-list">
        <li><strong>Experiência:</strong> arquitetura alinhada a dezenas de módulos operacionais reais.</li>
        <li><strong>Expertise:</strong> fluxos transfer, grupos, campanhas e geolocalização integrados.</li>
        <li><strong>Autoridade:</strong> operação nacional com Network e comunidade B2B.</li>
        <li><strong>Confiança:</strong> contratos, LGPD e suporte à implantação.</li>
      </ul>`)}
    ${sectionBlock("Para quem é", `<p>Empresas de transfer, motoristas executivos, frotas corporativas, receptivos de hotelaria e agências que vendem transporte premium.</p>`)}`,
});

// Serviços hub
addPage({
  slug: "servicos",
  path: "/servicos.html",
  file: "servicos.html",
  title: "Serviços | Gestão de transfer, corporativo, eventos e grupos",
  description:
    "Serviços suportados pela E-Transporte.pro: transfer aeroporto, transporte corporativo, eventos, grupos, rastreamento e automação comercial.",
  activeNav: "Serviços",
  breadcrumb: [{ name: "Início", href: "/" }, { name: "Serviços", href: "/servicos.html" }],
  service: { name: "Gestão de transporte executivo", description: "Plataforma completa para operadores.", type: "Transportation" },
  body: `${hero("Todos os serviços que sua operação executiva precisa gerenciar", "Um painel único para vender, reservar, rastrear e escalar — do transfer ao evento corporativo em volume.")}
    <section class="page-section"><div class="container"><div class="page-cards">
      <a class="page-card" href="/transfer-aeroporto.html"><h3>Transfer aeroporto</h3><p>GRU, GIG, BSB e todo o Brasil.</p></a>
      <a class="page-card" href="/transporte-corporativo.html"><h3>Transporte corporativo</h3><p>Contratos, SLA e faturamento.</p></a>
      <a class="page-card" href="/eventos.html"><h3>Eventos</h3><p>Logística e grupos com contrato.</p></a>
      <a class="page-card" href="/grupos.html"><h3>Grupos e excursões</h3><p>Volume, itinerário e orçamento.</p></a>
      <a class="page-card" href="/frota.html"><h3>Frota e veículos</h3><p>Cadastro, documentação e vitrine.</p></a>
      <a class="page-card" href="/rastreamento.html"><h3>Rastreamento</h3><p>Geolocalização em tempo real.</p></a>
    </div></div></section>`,
});

// Individual service pages - template function
function servicePage({ slug, path, file, title, description, h1, lead, serviceName, serviceType, sections }) {
  addPage({
    slug,
    path,
    file,
    title,
    description,
    breadcrumb: [
      { name: "Início", href: "/" },
      { name: "Serviços", href: "/servicos.html" },
      { name: serviceName, href: path },
    ],
    service: { name: serviceName, description, type: serviceType },
    body: `${hero(h1, lead)}${sections.map((s) => sectionBlock(s.title, s.html)).join("")}`,
  });
}

servicePage({
  slug: "transfer-aeroporto",
  path: "/transfer-aeroporto.html",
  file: "transfer-aeroporto.html",
  title: "Transfer aeroporto | Sistema de reservas e rastreamento",
  description: "Software para transfer aeroporto/hotel: solicitações, reservas, contratos PDF e geolocalização em tempo real para passageiros.",
  h1: "Transfer aeroporto com padrão executivo e gestão profissional",
  lead: "Capture orçamentos, confirme reservas e envie rastreio em tempo real — sem perder mensagens no WhatsApp.",
  serviceName: "Transfer aeroporto",
  serviceType: "AirportTransfer",
  sections: [
    {
      title: "O que você ganha",
      html: `<ul class="page-list"><li>Formulário → solicitação → reserva no painel</li><li>Contratos e PDF na confirmação</li><li>Link de rastreio no dia da viagem</li><li>CRM e histórico do passageiro</li></ul>`,
    },
    {
      title: "Aeroportos e rotas",
      html: `<p>Operação preparada para hubs como Guarulhos, Galeão, Brasília, Confins e aeroportos regionais. Veja também nossas <a href="/transfer-aeroporto-guarulhos.html">páginas locais de transfer</a>.</p>`,
    },
  ],
});

servicePage({
  slug: "transporte-corporativo",
  path: "/transporte-corporativo.html",
  file: "transporte-corporativo.html",
  title: "Transporte corporativo premium | Plataforma de gestão",
  description: "Gestão de transporte corporativo: contratos, reservas recorrentes, faturamento e rastreamento para empresas e hotéis.",
  h1: "Transporte corporativo que empresas confiam",
  lead: "SLA, contrato, métricas e operação centralizada — o padrão que RH e travel managers exigem.",
  serviceName: "Transporte corporativo",
  serviceType: "CorporateTransportation",
  sections: [
    {
      title: "Para empresas e operadores B2B",
      html: `<p>Centralize clientes corporativos, viagens recorrentes e relatórios financeiros. Integração com campanhas e leads para captação comercial estruturada.</p>`,
    },
  ],
});

servicePage({
  slug: "eventos",
  path: "/eventos.html",
  file: "eventos.html",
  title: "Transporte para eventos | Grupos e logística executiva",
  description: "Gestão de transporte para eventos, convenções e casamentos: solicitações em grupo, contratos e operação escalável.",
  h1: "Eventos e convenções com logística executiva sob controle",
  lead: "Do orçamento em volume à execução rastreada — grupos, itinerários e contratos específicos.",
  serviceName: "Transporte para eventos",
  serviceType: "EventTransportation",
  sections: [{ title: "Fluxo para eventos", html: `<p>Formulário de grupos → solicitação → reserva → contrato de grupo → comunicação ao cliente.</p>` }],
});

servicePage({
  slug: "grupos",
  path: "/grupos.html",
  file: "grupos.html",
  title: "Transporte em grupos | Excursões e volume",
  description: "Sistema para reservas de grupos, excursões e transporte em volume com contratos e gestão financeira integrada.",
  h1: "Grupos, excursões e volume — sem planilhas paralelas",
  lead: "Módulo dedicado a solicitações e reservas de grupo com termos legais próprios.",
  serviceName: "Transporte em grupos",
  serviceType: "GroupTransportation",
  sections: [{ title: "Captação estruturada", html: `<p>Campos para número de pessoas, itinerário, datas e tipo de evento — alimentando o painel automaticamente.</p>` }],
});

servicePage({
  slug: "frota",
  path: "/frota.html",
  file: "frota.html",
  title: "Gestão de frota | Veículos e motoristas executivos",
  description: "Cadastro de veículos, documentação, amenidades e vínculo com motoristas — vitrine profissional para sua operação.",
  h1: "Frota e veículos com padrão executivo",
  lead: "Matrícula, categoria, imagens e documentação integradas ao site institucional do operador.",
  serviceName: "Gestão de frota",
  serviceType: "FleetManagement",
  sections: [{ title: "Integração com motoristas", html: `<p>Vínculo veículo-motorista, portal do motorista e verificação pública de credenciais quando aplicável.</p>` }],
});

servicePage({
  slug: "rastreamento",
  path: "/rastreamento.html",
  file: "rastreamento.html",
  title: "Rastreamento em tempo real | Geolocalização para transfer",
  description: "Geolocalização em tempo real para transporte executivo: links públicos de rastreio para passageiros e padrão premium.",
  h1: "Geolocalização em tempo real que fecha contratos corporativos",
  lead: "Links de rastreio gerados no painel — experiência premium no dia da viagem.",
  serviceName: "Rastreamento executivo",
  serviceType: "TrackingService",
  sections: [{ title: "Como funciona", html: `<p>Após confirmação da reserva, o operador disponibiliza link de acompanhamento alinhado ao módulo <code>transfer/geolocalizacao</code>.</p>` }],
});

// Trabalhe conosco
addPage({
  slug: "trabalhe-conosco",
  path: "/trabalhe-conosco.html",
  file: "trabalhe-conosco.html",
  title: "Trabalhe conosco | Parceiros e operadores",
  description: "Seja operador ou parceiro na rede E-Transporte.pro. Solicite acesso à plataforma de gestão para transporte executivo.",
  breadcrumb: [{ name: "Início", href: "/" }, { name: "Trabalhe conosco", href: "/trabalhe-conosco.html" }],
  body: `${hero("Cresça com a plataforma nacional de transporte executivo", "Para operadores e parceiros que querem escalar com tecnologia, não com planilhas.")}
    ${sectionBlock("Como participar", `<p>Solicite acesso gratuito. Nossa equipe avalia seu perfil operacional e conduz o onboarding no painel.</p><p>Motoristas parceiros: fluxo via módulo de candidaturas após implantação do operador.</p>`)}`,
});

// FAQ standalone
addPage({
  slug: "faq",
  path: "/faq.html",
  file: "faq.html",
  title: "FAQ | Plataforma para transporte executivo",
  description: "Perguntas frequentes sobre a E-Transporte.pro: planos, transfer, corporativo, motoristas, geolocalização e acesso gratuito.",
  activeNav: "FAQ",
  breadcrumb: [{ name: "Início", href: "/" }, { name: "FAQ", href: "/faq.html" }],
  faq: FAQ_ITEMS,
  body: `${hero("Perguntas frequentes", "Respostas diretas sobre a plataforma — otimizadas para busca, IA generativa e decisão de compra.", "FAQ")}
    <section class="page-section"><div class="container">${faqHtml(FAQ_ITEMS)}</div></section>`,
});

// Legal
addPage({
  slug: "privacidade",
  path: "/privacidade.html",
  file: "privacidade.html",
  title: "Política de Privacidade | LGPD — E-Transporte.pro",
  description: "Política de privacidade e proteção de dados (LGPD) da plataforma E-Transporte.pro.",
  breadcrumb: [{ name: "Início", href: "/" }, { name: "Privacidade", href: "/privacidade.html" }],
  body: `${hero("Política de Privacidade", "Transparência no tratamento de dados de operadores e leads captados pelos formulários integrados.", "LGPD")}
    ${sectionBlock("Dados coletados", `<p>Coletamos dados informados voluntariamente em formulários de acesso, contato e operação, incluindo nome, e-mail, telefone e cidade.</p>`)}
    ${sectionBlock("Finalidade", `<p>Utilizamos os dados para contato comercial, implantação da plataforma, suporte e melhoria do serviço, conforme base legal de consentimento e execução de contrato.</p>`)}
    ${sectionBlock("Seus direitos", `<p>Você pode solicitar acesso, correção ou exclusão de dados pelo e-mail <a href="mailto:contato@e-transporte.pro">contato@e-transporte.pro</a>.</p>`)}`,
});

addPage({
  slug: "termos",
  path: "/termos.html",
  file: "termos.html",
  title: "Termos de Uso | E-Transporte.pro",
  description: "Termos de uso da plataforma E-Transporte.pro para operadores de transporte executivo.",
  breadcrumb: [{ name: "Início", href: "/" }, { name: "Termos", href: "/termos.html" }],
  body: `${hero("Termos de Uso", "Condições gerais de utilização da plataforma de gestão E-Transporte.pro.", "Legal")}
    ${sectionBlock("Uso da plataforma", `<p>O acesso é destinado a operadores e gestores autorizados. O usuário é responsável pelas informações cadastradas e pela conformidade de sua operação de transporte.</p>`)}
    ${sectionBlock("Planos e disponibilidade", `<p>Recursos variam conforme plano (FREE, STANDART, PRÓ). A disponibilidade de módulos pode evoluir com atualizações da plataforma.</p>`)}`,
});

// Local pages
for (const loc of LOCAL_PAGES) {
  const isTransfer = loc.focus === "transfer";
  const title = isTransfer
    ? `Transfer ${loc.airports} | Reservas e rastreamento`
    : `Transporte executivo ${loc.city} | Plataforma de gestão`;
  const h1 = isTransfer
    ? `Transfer ${loc.airports} com gestão profissional`
    : `Transporte executivo em ${loc.city} — escale com tecnologia`;
  addPage({
    slug: loc.slug,
    path: `/${loc.slug}.html`,
    file: `${loc.slug}.html`,
    title,
    description: `${isTransfer ? "Transfer e" : ""} Transporte executivo em ${loc.city} (${loc.region}): plataforma para reservas, motoristas, geolocalização e automação. Solicite acesso gratuito.`,
    keywords: `transporte executivo ${loc.city}, transfer ${loc.city}, motorista executivo ${loc.region}, transporte corporativo ${loc.city}`,
    breadcrumb: [
      { name: "Início", href: "/" },
      { name: loc.city, href: `/${loc.slug}.html` },
    ],
    service: {
      name: isTransfer ? `Transfer ${loc.city}` : `Transporte executivo ${loc.city}`,
      description: `Gestão de operação em ${loc.city} e região.`,
      type: "Transportation",
    },
    body: `${hero(h1, `Operadores em ${loc.city} usam a E-Transporte.pro para centralizar reservas, frota e rastreio — com cobertura em ${loc.airports}.`, `SEO Local · ${loc.region}`)}
      ${sectionBlock(`Por que ${loc.city}`, `<p>O mercado de transporte executivo em ${loc.city} exige padrão corporativo, pontualidade em aeroportos e rastreamento em tempo real. Sem sistema, você perde leads e margem.</p>`)}
      ${sectionBlock("Recursos para sua região", `<ul class="page-list"><li>Reservas de transfer e grupos</li><li>Geolocalização para passageiros</li><li>Campanhas e leads locais</li><li>Contratos e PDF</li></ul><p>Veja também: <a href="/servicos.html">todos os serviços</a> e <a href="/transfer-aeroporto.html">transfer aeroporto</a>.</p>`)}`,
  });
}

registerLegacyPages(addPage, { hero, sectionBlock });

// Generate files
for (const page of PAGES) {
  const html = pageShell(page, `<article class="container page-article">${page.body}</article>`);
  const out = resolve(ROOT, page.file);
  writeFileSync(out, html.replace(/\n/g, "\n"), "utf8");
  console.log("built", page.file);
}

// Sitemap
const staticPages = [
  "/",
  "/sobre.html",
  "/servicos.html",
  "/frota.html",
  "/transfer-aeroporto.html",
  "/transporte-corporativo.html",
  "/eventos.html",
  "/grupos.html",
  "/rastreamento.html",
  "/trabalhe-conosco.html",
  "/faq.html",
  "/contato.html",
  "/blog.html",
  "/funcionalidades.html",
  "/modulos.html",
  "/seguranca.html",
  "/privacidade.html",
  "/termos.html",
  "/blog-operacao-transfer.html",
  "/blog-network-comunidade.html",
  "/blog-automacoes-webhooks.html",
  ...LOCAL_PAGES.map((l) => `/${l.slug}.html`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (p) => `  <url>
    <loc>${SITE.baseUrl}${p === "/" ? "/" : p}</loc>
    <changefreq>${p === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${p === "/" ? "1.0" : p.includes("blog") ? "0.7" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

writeFileSync(resolve(ROOT, "public/sitemap.xml"), sitemap, "utf8");
console.log("built public/sitemap.xml");

// robots.txt
const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${SITE.baseUrl}/sitemap.xml
`;
writeFileSync(resolve(ROOT, "public/robots.txt"), robots, "utf8");
console.log("built public/robots.txt");

buildBlogFiles({
  ROOT,
  writeFileSync,
  resolve,
  head,
  header,
  footer,
  buildSchemas,
});
