/** Páginas legadas + blog — alinhamento ao shell premium */
import { SITE, NAV, FOOTER_COLS } from "./site-config.mjs";
import { deferredSiteStyles } from "./critical-css.mjs";

export function registerLegacyPages(addPage, { hero, sectionBlock }) {
  addPage({
    slug: "funcionalidades",
    path: "/funcionalidades.html",
    file: "funcionalidades.html",
    title: "Funcionalidades | Plataforma E-Transporte.pro para transporte executivo",
    description:
      "Catálogo completo de funcionalidades: transfer, grupos, motoristas, marketing, automações, Network e gestão para operação executiva.",
    keywords: "funcionalidades transporte executivo, plataforma transfer, software motoristas, automação transporte",
    activeNav: "/funcionalidades.html",
    breadcrumb: [
      { name: "Início", href: "/" },
      { name: "Funcionalidades", href: "/funcionalidades.html" },
    ],
    body: `${hero("Funcionalidades prioritárias da plataforma", "Catálogo completo para entender valor, fluxos principais e ferramentas que aceleram sua operação executiva.", "Catálogo")}
      <section class="page-section"><div class="container"><div class="page-grid page-grid--2">
        <article class="page-card-box"><h3>Operação Transfer e Grupos</h3><ul class="page-list"><li>Solicitações, conversão em reserva e status.</li><li>PDF de confirmação e comunicação ao cliente.</li><li>Contratos por tipo de operação.</li><li>Geolocalização com links de rastreamento.</li></ul></article>
        <article class="page-card-box"><h3>Gestão de Motoristas</h3><ul class="page-list"><li>Fila de solicitações e cadastros.</li><li>Parcerias e documentação.</li><li>Portal do motorista (PRÓ).</li><li>Agendamentos operacionais.</li></ul></article>
        <article class="page-card-box"><h3>Marketing e presença digital</h3><ul class="page-list"><li>Campanhas ativas e leads com exportação.</li><li>Receptivos PDF e QR Codes.</li><li>Website, domínios e e-mail business.</li></ul></article>
        <article class="page-card-box"><h3>Colaboração</h3><ul class="page-list"><li>Network Nacional e Comunidade B2B.</li><li>Tickets de suporte e anotações.</li></ul></article>
        <article class="page-card-box"><h3>Configurações e automações</h3><ul class="page-list"><li>Dados empresariais e contratual.</li><li>Webhooks com testes de payload.</li><li>Comunicador WhatsApp (condicional).</li><li>MFA e perfis de acesso.</li></ul></article>
        <article class="page-card-box"><h3>Beta e condicionais</h3><ul class="page-list"><li>Disparador, Empty Legs, Métricas.</li><li>Veículos e roadmap de maturidade.</li></ul></article>
      </div></div></section>
      ${sectionBlock("Cobertura funcional ampliada", `<div class="page-grid page-grid--3">
        <article class="page-card-box"><h3>Principal</h3><p>Home, Atualizações, Métricas e Abrangência.</p></article>
        <article class="page-card-box"><h3>Transfer</h3><p>Solicitações, Reservas, Contrato e Geo.</p></article>
        <article class="page-card-box"><h3>Grupos</h3><p>Fluxo equivalente ao Transfer.</p></article>
        <article class="page-card-box"><h3>Marketing</h3><p>Campanhas, Leads, Receptivos, QR.</p></article>
        <article class="page-card-box"><h3>Sistema</h3><p>Configurações, Automações, Comunicador.</p></article>
        <article class="page-card-box"><h3>Evolução</h3><p>Mentoria, Empty Legs e expansão contínua.</p></article>
      </div><p style="margin-top:20px"><a href="/modulos.html">Ver mapa de módulos</a> · <a href="/#catalogo">Catálogo na home</a></p>`)}
      ${sectionBlock("Onboarding recomendado", `<p class="page-lead">Home → Atualizações → Transfer/Grupos → Reservas → Contratos → Automações → Campanhas/Leads → Configurações.</p>`)}`,
  });

  addPage({
    slug: "modulos",
    path: "/modulos.html",
    file: "modulos.html",
    title: "Módulos do sistema | Mapa funcional E-Transporte.pro",
    description:
      "Inventário de módulos do painel executivo: status estável, condicional e roadmap — transfer, marketing, Network e automações.",
    keywords: "módulos plataforma transporte executivo, mapa funcional transfer, painel motorista executivo",
    activeNav: "/modulos.html",
    breadcrumb: [
      { name: "Início", href: "/" },
      { name: "Módulos", href: "/modulos.html" },
    ],
    body: `${hero("Mapa institucional de módulos e status", "Visão auditada do painel: o que está estável, condicional ou em evolução.", "Inventário")}
      <section class="page-section"><div class="container page-table-wrap">
        <table class="page-table">
          <thead><tr><th>Módulo</th><th>Escopo</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Transfer / Grupos</td><td>Solicitações, reservas, contratos, PDF</td><td><span class="page-tag page-tag--ok">Estável</span></td></tr>
            <tr><td>Geolocalização</td><td>Rastreamento e links públicos</td><td><span class="page-tag page-tag--ok">Operacional</span></td></tr>
            <tr><td>Campanhas / Leads</td><td>Captação e exportação CSV</td><td><span class="page-tag page-tag--ok">Estável</span></td></tr>
            <tr><td>Network / Comunidade</td><td>Colaboração B2B</td><td><span class="page-tag page-tag--ok">Estável</span></td></tr>
            <tr><td>Automações</td><td>Webhooks e mapeamento</td><td><span class="page-tag page-tag--ok">Estável</span></td></tr>
            <tr><td>Comunicador</td><td>WhatsApp Evolution</td><td><span class="page-tag page-tag--warn">Condicional</span></td></tr>
            <tr><td>Métricas / Veículos</td><td>KPIs e frota</td><td><span class="page-tag page-tag--road">Evolução</span></td></tr>
          </tbody>
        </table>
      </div></section>
      ${sectionBlock("Por domínio", `<div class="page-grid page-grid--3">
        <article class="page-card-box"><h3>Operação</h3><p>Transfer, grupos, geo e abrangência.</p></article>
        <article class="page-card-box"><h3>Growth</h3><p>Campanhas, site, domínio, e-mail.</p></article>
        <article class="page-card-box"><h3>Governança</h3><p>Configurações, tickets, automações.</p></article>
      </div>`)}`,
  });

  addPage({
    slug: "seguranca",
    path: "/seguranca.html",
    file: "seguranca.html",
    title: "Segurança e acesso | E-Transporte.pro",
    description:
      "Segurança da plataforma: login, MFA, sessão, perfis de acesso, webhooks e boas práticas para operadores de transporte executivo.",
    keywords: "segurança plataforma transporte, MFA motorista executivo, acesso painel transfer",
    activeNav: "/seguranca.html",
    breadcrumb: [
      { name: "Início", href: "/" },
      { name: "Segurança", href: "/seguranca.html" },
    ],
    body: `${hero("Segurança, sessão e controle de acesso", "Governança e confiança para operar transfer e transporte corporativo em escala.", "Segurança")}
      <section class="page-section"><div class="container"><div class="page-grid page-grid--2">
        <article class="page-card-box"><h3>Autenticação e sessão</h3><ul class="page-list"><li>Login com proteção CAPTCHA.</li><li>MFA (TOTP) para contas críticas.</li><li>Sessão com renovação planejada.</li><li>Roteamento por perfil de acesso.</li></ul></article>
        <article class="page-card-box"><h3>Acesso por papel</h3><ul class="page-list"><li>Rotas protegidas.</li><li>Feature flags e planos.</li><li>Network condicional.</li><li>Confirmação em ações críticas.</li></ul></article>
        <article class="page-card-box"><h3>Dados e integrações</h3><ul class="page-list"><li>Webhooks com mapeamento controlado.</li><li>Exportação com trilha operacional.</li><li>Transparência sobre dependências externas.</li></ul></article>
        <article class="page-card-box"><h3>Boas práticas</h3><ul class="page-list"><li>MFA ativo em contas administrativas.</li><li>Revisão periódica de automações.</li><li>Testes antes de produção.</li><li>Sem compartilhamento de contas.</li></ul></article>
      </div></div></section>
      ${sectionBlock("Compromisso", `<p class="page-lead">Comunicamos com transparência o que está estável, condicional ou em roadmap — para decisões informadas na implantação.</p><p><a href="/privacidade.html">Política de privacidade</a></p>`)}`,
  });

  addPage({
    slug: "contato",
    path: "/contato.html",
    file: "contato.html",
    title: "Contato | E-Transporte.pro — Implantação e acesso gratuito",
    description:
      "Fale com a equipe E-Transporte.pro para implantação, plano e suporte. Solicite acesso gratuito à plataforma de transporte executivo.",
    keywords: "contato e-transporte, implantação transfer, acesso plataforma transporte executivo",
    activeNav: "/contato.html",
    breadcrumb: [
      { name: "Início", href: "/" },
      { name: "Contato", href: "/contato.html" },
    ],
    body: `${hero("Vamos montar sua operação com método", "Avaliação de cenário, plano adequado e fluxo de implantação — resposta comercial especializada.", "Contato")}
      <section class="page-section"><div class="container"><div class="page-grid page-grid--2">
        <article class="page-card-box"><h2>Canais oficiais</h2><ul class="page-list"><li>E-mail: <a href="mailto:contato@e-transporte.pro">contato@e-transporte.pro</a></li><li>Site: <a href="https://www.e-transporte.pro/">e-transporte.pro</a></li><li>Instagram: <a href="https://www.instagram.com/e_transporte.pro/" target="_blank" rel="noopener noreferrer">@e_transporte.pro</a></li></ul><p>Envie contexto da operação, cidade-base, volume mensal e necessidades de implantação.</p></article>
        <article class="page-card-box"><h2>Escopo da conversa</h2><ul class="page-list"><li>Perfil: transfer, grupos, equipe e metas.</li><li>Maturidade digital: site, domínio, campanhas.</li><li>Integrações: automações e webhooks.</li><li>Governança: segurança e suporte.</li></ul></article>
      </div></div></section>
      ${sectionBlock("Acesso mais rápido", `<p class="page-lead">Use o botão <strong>Solicitar Acesso Gratuito</strong> — formulário oficial com retorno da equipe em breve.</p><div class="hero__actions"><button type="button" class="btn btn--primary" data-open-lead-modal>Solicitar Acesso Gratuito</button></div>`)}`,
    ctaTitle: "Próximo passo: solicitar acesso",
    ctaText: "Preencha o formulário oficial — é o canal mais rápido para iniciar implantação.",
  });
}

const BLOG_ARTICLES = [
  {
    file: "blog-operacao-transfer.html",
    path: "/blog-operacao-transfer.html",
    title: "Fluxo Transfer ponta a ponta | Blog E-Transporte.pro",
    description:
      "Como estruturar fluxo Transfer da solicitação ao PDF, contrato e comunicação — gestão de transporte executivo.",
    keywords: "fluxo transfer, reservas transfer, operação transporte executivo",
    category: "Operação",
    datePublished: "2026-01-10",
    h1: "Fluxo Transfer ponta a ponta: da solicitação ao PDF e comunicação",
    lead: "No transporte executivo, velocidade sem organização vira retrabalho. O fluxo Transfer transforma pedidos em reservas operáveis com rastreabilidade.",
    body: `
      <h2>1. Entrada organizada de demanda</h2>
      <p>A operação começa em <strong>Transfer → Solicitações</strong>, onde cada pedido é analisado antes da conversão em reserva.</p>
      <h2>2. Conversão guiada em reserva</h2>
      <p>A conversão registra dados e evita duplicidade — a equipe sabe o que está pendente e o que já virou execução.</p>
      <h2>3. Contratos alinhados</h2>
      <p>Textos e cláusulas alimentam o PDF final — operação e jurídico alinhados.</p>
      <h2>4. Comunicação estruturada</h2>
      <p>Envio organizado ao cliente com contexto de reserva e documentação.</p>
      <h2>5. Resultado para o negócio</h2>
      <ul class="page-list"><li>Menos erro na passagem de bastão comercial → operação.</li><li>Previsibilidade no histórico.</li><li>Documentação para compliance.</li></ul>
      <p>Veja também <a href="/transfer-aeroporto.html">transfer aeroporto</a> e <a href="/funcionalidades.html">funcionalidades</a>.</p>`,
  },
  {
    file: "blog-network-comunidade.html",
    path: "/blog-network-comunidade.html",
    title: "Network e Comunidade | Colaboração B2B — E-Transporte.pro",
    description:
      "Network Nacional e Comunidade entre operadores: governança, parcerias e escala no transporte executivo.",
    keywords: "network transporte executivo, comunidade operadores transfer",
    category: "Colaboração",
    datePublished: "2026-01-18",
    h1: "Network Nacional e Comunidade: colaboração sem perder governança",
    lead: "Crescer em rede exige equilíbrio: abertura para colaboração e controles claros para preservar qualidade.",
    body: `
      <h2>Network: colaboração orientada por regras</h2>
      <p>Espaço colaborativo entre operadores com aceite de termos — responsabilidade sobre o que é compartilhado.</p>
      <h2>Comunidade: inteligência coletiva</h2>
      <p>Troca de aprendizados e feedbacks em tempo real — menos repetição de erros.</p>
      <h2>Boas práticas</h2>
      <ul class="page-list"><li>Padrões de conteúdo profissional.</li><li>Moderação previsível.</li><li>Melhorias de processo no dia a dia.</li></ul>`,
  },
  {
    file: "blog-automacoes-webhooks.html",
    path: "/blog-automacoes-webhooks.html",
    title: "Automações e webhooks | Integração segura — E-Transporte.pro",
    description:
      "Guia de automações e webhooks para conectar marketing e operação no transporte executivo com segurança.",
    keywords: "automação transporte executivo, webhooks transfer, integração plataforma",
    category: "Tecnologia",
    datePublished: "2026-01-25",
    h1: "Automações e webhooks: como integrar com eficiência e segurança",
    lead: "A automação correta conecta marketing e operação sem caos técnico — mapeamento, testes e governança.",
    body: `
      <h2>1) Objetivo por fluxo</h2>
      <p>Separe captação, operação, cadastro de motoristas e comunicação — cada fluxo com regras próprias.</p>
      <h2>2) Mapeamento explícito</h2>
      <p>Campos mapeados reduzem falhas silenciosas em produção.</p>
      <h2>3) Teste antes de ativar</h2>
      <p>Validação de payload evita quebra de atendimento.</p>
      <h2>4) Segurança</h2>
      <ul class="page-list"><li>Nunca expor chaves em páginas públicas.</li><li>Ambientes de teste e produção separados.</li><li>Monitorar erros e ownership.</li></ul>
      <h2>5) Resultado</h2>
      <p>Campanha → lead → solicitação → reserva com contexto único no painel.</p>`,
  },
];

export function buildBlogFiles(ctx) {
  const { ROOT, writeFileSync, resolve, head, header, footer, buildSchemas } = ctx;

  const listingPage = {
    path: "/blog.html",
    title: "Blog | E-Transporte.pro — Transporte executivo e tecnologia",
    description:
      "Editorial sobre operação de transfer, automações, Network e gestão de transporte executivo.",
    keywords: "blog transporte executivo, gestão transfer, automação transporte",
    breadcrumb: [
      { name: "Início", href: "/" },
      { name: "Blog", href: "/blog.html" },
    ],
  };

  const listingHead = head(listingPage).replace(
    deferredSiteStyles({ page: true, blog: false }),
    deferredSiteStyles({ page: true, blog: true })
  );
  const blogListing = `${listingHead}
<body class="lp-page blog-page">
  ${header("/blog.html")}
  <div class="lp-sticky-cta" data-lp-sticky-cta hidden>
    <div class="lp-sticky-cta__inner">
      <p class="lp-sticky-cta__text"><strong>Acesso gratuito</strong> Plataforma nacional</p>
      <button type="button" class="btn btn--primary" data-open-lead-modal>Solicitar Acesso Gratuito</button>
    </div>
  </div>
  <main id="conteudo-principal">
    <header class="blog-masthead">
      <div class="container blog-masthead__inner">
        <div>
          <span class="blog-masthead__label">Editorial E-Transporte.pro</span>
          <h1>Inteligência para quem opera transporte executivo</h1>
          <p class="blog-masthead__lead">Análises de processo, arquitetura funcional e crescimento comercial.</p>
        </div>
        <div class="blog-masthead__issue" aria-hidden="true"><span>Edição</span><strong>2026</strong></div>
      </div>
    </header>
    <div class="blog-layout">
      <div class="container">
        <a class="blog-featured" href="/blog-operacao-transfer.html">
          <div class="blog-featured__visual"><span class="blog-featured__category">Operação</span></div>
          <div class="blog-featured__body">
            <p class="blog-featured__meta">8 min · Transfer e reservas</p>
            <h2>Fluxo Transfer ponta a ponta</h2>
            <p>Pipeline operacional com rastreabilidade e padrão corporativo.</p>
            <span class="blog-featured__cta">Ler artigo em destaque</span>
          </div>
        </a>
        <div class="blog-grid">
          <a class="blog-card blog-card--wide" href="/blog-automacoes-webhooks.html">
            <div class="blog-card__stripe" aria-hidden="true"></div>
            <div class="blog-card__visual" aria-hidden="true"></div>
            <div class="blog-card__body">
              <span class="blog-card__index">02 — Tecnologia</span>
              <p class="blog-card__meta">9 min · Automação</p>
              <h2>Automações e webhooks</h2>
              <p>Integração segura entre marketing e operação.</p>
              <span class="blog-card__link">Continuar leitura</span>
            </div>
          </a>
          <a class="blog-card" href="/blog-network-comunidade.html">
            <div class="blog-card__stripe" aria-hidden="true"></div>
            <div class="blog-card__visual" aria-hidden="true"></div>
            <div class="blog-card__body">
              <span class="blog-card__index">03 — Rede</span>
              <p class="blog-card__meta">7 min · Network</p>
              <h2>Network e Comunidade</h2>
              <p>Colaboração com governança entre operadores.</p>
              <span class="blog-card__link">Continuar leitura</span>
            </div>
          </a>
        </div>
        <aside class="blog-newsletter">
          <div><h2>Profissionalize sua operação</h2><p>Acesso gratuito à plataforma nacional de gestão.</p></div>
          <button type="button" class="btn btn--primary" data-open-lead-modal>Solicitar Acesso Gratuito</button>
        </aside>
      </div>
    </div>
  </main>
  ${footer()}
  <script type="application/ld+json">${buildSchemas(listingPage)}</script>
  <script src="/js/site.js" defer></script>
  <script src="/js/lead-payload.js" defer></script>
  <script src="/js/main.js" defer></script>
  <script src="/js/seo.js" defer></script>
  <script src="/js/landing.js" defer></script>
</body>
</html>`;

  writeFileSync(resolve(ROOT, "blog.html"), blogListing, "utf8");
  console.log("built blog.html");

  for (const art of BLOG_ARTICLES) {
    const page = {
      ...art,
      slug: art.file.replace(".html", ""),
      breadcrumb: [
        { name: "Início", href: "/" },
        { name: "Blog", href: "/blog.html" },
        { name: art.category, href: art.path },
      ],
      article: { datePublished: art.datePublished, dateModified: art.datePublished },
      ogType: "article",
    };
    const pageHead = head(page).replace(
      deferredSiteStyles({ page: true, blog: false }),
      deferredSiteStyles({ page: true, blog: true })
    );
    const html = `${pageHead}
<body class="lp-page blog-page">
  ${header("/blog.html")}
  <div class="lp-sticky-cta" data-lp-sticky-cta hidden>
    <div class="lp-sticky-cta__inner">
      <p class="lp-sticky-cta__text"><strong>Acesso gratuito</strong></p>
      <button type="button" class="btn btn--primary" data-open-lead-modal>Solicitar Acesso Gratuito</button>
    </div>
  </div>
  <main class="blog-article-wrap" id="conteudo-principal">
    <nav class="breadcrumb container" aria-label="Breadcrumb"><ol>
      <li><a href="/">Início</a></li>
      <li><a href="/blog.html">Blog</a></li>
      <li aria-current="page">${art.category}</li>
    </ol></nav>
    <article class="container blog-article" itemscope itemtype="https://schema.org/Article">
      <a class="blog-article__back" href="/blog.html">Voltar ao editorial</a>
      <p class="blog-article__meta">${art.category} · ${art.datePublished}</p>
      <h1 itemprop="headline">${art.h1}</h1>
      <p class="lead" itemprop="description">${art.lead}</p>
      ${art.body}
      <div class="blog-article__cta">
        <p>Quer aplicar isso na sua operação?</p>
        <button type="button" class="btn btn--primary" data-open-lead-modal>Solicitar Acesso Gratuito</button>
      </div>
    </article>
  </main>
  ${footer()}
  <script type="application/ld+json">${buildSchemas(page)}</script>
  <script src="/js/site.js" defer></script>
  <script src="/js/lead-payload.js" defer></script>
  <script src="/js/main.js" defer></script>
  <script src="/js/seo.js" defer></script>
  <script src="/js/landing.js" defer></script>
</body>
</html>`;

    writeFileSync(resolve(ROOT, art.file), html, "utf8");
    console.log("built", art.file);
  }
}
