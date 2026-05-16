/** Configuração global SEO — E-Transporte.pro */
export const SITE = {
  baseUrl: "https://www.e-transporte.pro",
  name: "E-Transporte.pro",
  legalName: "E-Transporte.pro",
  email: "contato@e-transporte.pro",
  locale: "pt_BR",
  country: "BR",
  logo: "https://www.e-transporte.pro/apple-touch-icon.png",
  description:
    "Plataforma nacional para transporte executivo: gestão de reservas, motoristas, geolocalização em tempo real, automação e escala para operadores de transfer e transporte corporativo.",
  keywords: [
    "transporte executivo",
    "plataforma para transporte executivo",
    "sistema para transporte executivo",
    "software para motoristas executivos",
    "gestão de transporte executivo",
    "reservas de transfer",
    "transporte corporativo",
    "geolocalização em tempo real",
    "automação para transporte",
    "transfer aeroporto",
    "software de transfer",
    "gestão de frota",
  ].join(", "),
  rating: { value: "4.9", count: "127" },
  sameAs: [
    "https://www.instagram.com/e_transporte.pro/",
  ],
  loginUrl: "https://app.e-transporte.pro/login",
};

export const NAV = [
  { href: "/sobre.html", label: "Sobre" },
  { href: "/servicos.html", label: "Serviços" },
  { href: "/#catalogo", label: "Plataforma" },
  { href: "/blog.html", label: "Blog" },
  { href: "/faq.html", label: "FAQ" },
  { href: "/contato.html", label: "Contato" },
];

export const FOOTER_COLS = [
  {
    title: "Plataforma",
    links: [
      { href: "/funcionalidades.html", label: "Funcionalidades" },
      { href: "/modulos.html", label: "Módulos" },
      { href: "/seguranca.html", label: "Segurança" },
      { href: "/rastreamento.html", label: "Rastreamento" },
    ],
  },
  {
    title: "Serviços",
    links: [
      { href: "/transfer-aeroporto.html", label: "Transfer aeroporto" },
      { href: "/transporte-corporativo.html", label: "Transporte corporativo" },
      { href: "/eventos.html", label: "Eventos" },
      { href: "/grupos.html", label: "Grupos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/sobre.html", label: "Sobre" },
      { href: "/trabalhe-conosco.html", label: "Trabalhe conosco" },
      { href: "/blog.html", label: "Blog" },
      { href: "/faq.html", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos.html", label: "Termos de uso" },
      { href: "/privacidade.html", label: "Privacidade (LGPD)" },
      { href: "/contato.html", label: "Contato" },
      { href: SITE.loginUrl, label: "Login do painel", external: true },
    ],
  },
];

export const LOCAL_PAGES = [
  {
    slug: "transporte-executivo-sao-paulo",
    city: "São Paulo",
    region: "SP",
    airports: "Guarulhos (GRU), Congonhas (CGH) e Viracopos",
  },
  {
    slug: "transporte-executivo-rio-de-janeiro",
    city: "Rio de Janeiro",
    region: "RJ",
    airports: "Galeão (GIG) e Santos Dumont (SDU)",
  },
  {
    slug: "transporte-executivo-belo-horizonte",
    city: "Belo Horizonte",
    region: "MG",
    airports: "Confins (CNF) e Pampulha",
  },
  {
    slug: "transporte-executivo-brasilia",
    city: "Brasília",
    region: "DF",
    airports: "Brasília (BSB)",
  },
  {
    slug: "transfer-aeroporto-guarulhos",
    city: "Guarulhos",
    region: "SP",
    airports: "Aeroporto Internacional de Guarulhos (GRU)",
    focus: "transfer",
  },
  {
    slug: "transfer-aeroporto-galeao",
    city: "Rio de Janeiro",
    region: "RJ",
    airports: "Aeroporto Internacional do Galeão (GIG)",
    focus: "transfer",
  },
];
