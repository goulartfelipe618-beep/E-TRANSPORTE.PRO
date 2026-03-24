/**
 * Resposta esperada do n8n (JSON), após normalização:
 * - Texto da IA: `reply` | `message` | `text` | `output` | `response`
 * - Novas sugestões de botão: `quickReplies` | `suggestions` | `followUps` | `buttons` | `opcoes` (array de strings)
 * Também aceita o formato n8n `[{ "json": { ... } }]`.
 *
 * URLs do webhook: ficheiro `.env` na raiz (ver `.env.example`). Nunca commite `.env`.
 * Nota de segurança: em build, o valor de VITE_* entra no bundle JS — quem abre DevTools
 * pode vê-lo. Para não expor o webhook, use um proxy no vosso servidor (ver docs/SEGURANCA-FRONTEND.txt).
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./AxusChat.module.css";

const WEBHOOK_TEST = (import.meta.env.VITE_N8N_WEBHOOK_TEST ?? "https://n8n.e-transporte.pro/webhook-test/d4e7b3fa-d1a0-4587-a350-e267a2ada6af").trim();
const WEBHOOK_PROD = (import.meta.env.VITE_N8N_WEBHOOK_PROD ?? "https://n8n.e-transporte.pro/webhook/d4e7b3fa-d1a0-4587-a350-e267a2ada6af").trim();
/** Dev: prioriza teste; produção: prioriza prod (com fallback). */
const N8N_URL = import.meta.env.PROD ? WEBHOOK_PROD || WEBHOOK_TEST : WEBHOOK_TEST || WEBHOOK_PROD;

const FAB_TIP_STORAGE_KEY = "e-transporte-axus-fab-tooltip-dismissed";

const QUICK_REPLIES = [
  "Como funciona a plataforma?",
  "Quais são os planos?",
  "Quero fazer um teste grátis",
];

function readFabTipDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FAB_TIP_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export type ChatMessage = {
  id: string;
  role: "user" | "axus" | "error";
  text: string;
};

/** n8n costuma devolver `[{ "json": { ... } }]` — normaliza para o objeto útil. */
function unwrapN8nPayload(data: unknown): Record<string, unknown> | null {
  if (data == null) return null;
  if (typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (first != null && typeof first === "object" && "json" in first) {
      const inner = (first as { json: unknown }).json;
      if (inner != null && typeof inner === "object" && !Array.isArray(inner)) {
        return inner as Record<string, unknown>;
      }
    }
  }
  return null;
}

function parseAxusReply(data: unknown): string | null {
  const o = unwrapN8nPayload(data);
  if (!o) return null;
  const candidates = ["reply", "message", "text", "output", "response"];
  for (const key of candidates) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/**
 * Sugestões pós-IA: o fluxo n8n deve enviar um destes campos (array de strings):
 * `quickReplies`, `suggestions`, `followUps`, `buttons`, `opcoes`
 */
function parseQuickReplies(data: unknown): string[] {
  const o = unwrapN8nPayload(data);
  if (!o) return [];
  const keys = ["quickReplies", "suggestions", "followUps", "buttons", "opcoes"];
  for (const k of keys) {
    const v = o[k];
    if (!Array.isArray(v)) continue;
    const out = v
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 8);
    if (out.length) return out;
  }
  return [];
}

// ── Converte **bold**, listas e parágrafos em JSX ──
function inlineParse(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={styles.mdBold}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (lines.length === 0) return null;

        const isListBlock = lines.every((l) => /^[-•*]\s/.test(l.trim()));

        if (isListBlock) {
          return (
            <ul key={bi} className={styles.mdList}>
              {lines.map((l, li) => (
                <li key={li} className={styles.mdItem}>
                  {inlineParse(l.replace(/^[-•*]\s*/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={bi} className={styles.mdPara}>
            {lines.map((line, li) => (
              <span key={li}>
                {inlineParse(line)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Avatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className={size === "sm" ? styles.avatarSm : styles.avatar} aria-hidden="true">
      <span>Á</span>
    </div>
  );
}

export default function AxusChat() {
  const dialogId = useId();
  const titleId = useId();
  const wrapRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  /** Se true, a bolha "Tire suas dúvidas…" fica oculta (só o FAB). Persiste no localStorage. */
  const [fabTipDismissed, setFabTipDismissed] = useState(readFabTipDismissed);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  /** Primeiras 4 opções; some assim que o utilizador interage (quick ou input). */
  const [showInitialQuick, setShowInitialQuick] = useState(true);
  /** Sugestões vindas da última resposta da IA (n8n). */
  const [dynamicQuick, setDynamicQuick] = useState<string[]>([]);
  const [welcomeTime, setWelcomeTime] = useState("");
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  const configured = Boolean(N8N_URL.trim());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, []);

  useEffect(() => {
    if (open && !welcomeTime) {
      setWelcomeTime(
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      );
    }
  }, [open, welcomeTime]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages, scrollToBottom]);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  const openPanel = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement;
    setOpen(true);
    requestAnimationFrame(() => closeBtnRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  /* Fechar só com pointer fora do `<aside>`. `composedPath()` cobre SVG/filhos e shadow. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      if (e.composedPath().includes(wrap)) return;
      close();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, close]);

  const sendPayload = useCallback(
    async (text: string, quickReply?: string) => {
      const trimmed = text.trim();
      if (!trimmed || sendingRef.current) return;

      if (!configured) {
        setShowInitialQuick(false);
        setDynamicQuick([]);
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "user", text: trimmed },
          {
            id: crypto.randomUUID(),
            role: "error",
            text: "Configure VITE_N8N_WEBHOOK_TEST e VITE_N8N_WEBHOOK_PROD no ficheiro .env (veja .env.example).",
          },
        ]);
        setInput("");
        return;
      }

      /* Esconde todos os botões de sugestão até chegar a nova resposta da IA */
      setShowInitialQuick(false);
      setDynamicQuick([]);

      sendingRef.current = true;
      setSending(true);
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
      setInput("");

      try {
        const res = await fetch(N8N_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            quickReply: quickReply ?? null,
            source: "axus-chat",
            page: window.location.href,
            ts: new Date().toISOString(),
          }),
        });

        let data: unknown = null;
        const ct = res.headers.get("content-type");
        if (ct?.includes("application/json")) {
          try {
            data = await res.json();
          } catch {
            data = null;
          }
        }

        const reply = parseAxusReply(data);
        if (!res.ok) {
          const errObj = unwrapN8nPayload(data);
          throw new Error(
            typeof errObj?.error === "string"
              ? errObj.error
              : `Erro ${res.status}`,
          );
        }

        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "axus",
            text: reply ?? "Mensagem recebida. Confirme a resposta no fluxo n8n.",
          },
        ]);

        const nextQuick = parseQuickReplies(data);
        setDynamicQuick(nextQuick);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao enviar.";
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "error", text: msg }]);
        setDynamicQuick([]);
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [configured],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendPayload(input);
  };

  const dismissFabTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFabTipDismissed(true);
    try {
      window.localStorage.setItem(FAB_TIP_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <aside ref={wrapRef} className={styles.wrap} aria-label="Chat Áxus">
      <div
        id={dialogId}
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        hidden={!open}
      >
        <header className={styles.panelHead}>
          <div className={styles.panelHeadMain}>
            <Avatar size="md" />
            <div className={styles.panelHeadText}>
              <h2 id={titleId} className={styles.brandTitle}>
                Áxus
              </h2>
              <p className={styles.brandSub}>Assistente executiva IA</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeGold}
            aria-label="Fechar chat"
            onClick={close}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className={styles.panelDivider} aria-hidden="true" />

        {!configured ? (
          <p className={styles.configWarn}>
            Webhook não configurado — defina <strong>VITE_N8N_WEBHOOK_*</strong> no <strong>.env</strong> (modelo
            em <strong>.env.example</strong>).
          </p>
        ) : null}

        <div className={styles.scrollArea}>
          <div className={styles.welcomeRow}>
            <Avatar size="sm" />
            <div className={styles.welcomeCol}>
              <div className={styles.welcomeBubble}>
                <p className={styles.welcomeText}>
                  Olá! Sou o <strong>Áxus</strong>, assistente da plataforma{" "}
                  <strong>e-transporte.pro</strong>. Posso apresentar nossos recursos, te ajudar a
                  escolher o plano ideal ou responder qualquer dúvida. Como posso te ajudar hoje?
                </p>
              </div>
              {welcomeTime ? <time className={styles.msgTime}>{welcomeTime}</time> : null}
            </div>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`${styles.msgRow} ${m.role === "user" ? styles.msgRowUser : styles.msgRowAxus}`}
            >
              {m.role !== "user" ? <Avatar size="sm" /> : <span className={styles.avatarSpacer} />}
              <div
                className={`${styles.bubble} ${
                  m.role === "user"
                    ? styles.bubbleUser
                    : m.role === "error"
                      ? styles.bubbleErr
                      : styles.bubbleAxus
                }`}
              >
                {/* Só o Áxus recebe markdown; usuário e erro ficam como texto puro */}
                {m.role === "axus" ? renderMarkdown(m.text) : m.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showInitialQuick ? (
          <div className={`${styles.quickRow} ${styles.quickRowGrid}`} role="group" aria-label="Sugestões iniciais">
            {QUICK_REPLIES.map((label) => (
              <button
                key={label}
                type="button"
                className={styles.quickBtn}
                disabled={sending}
                onClick={() => void sendPayload(label, label)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : dynamicQuick.length > 0 ? (
          <div className={`${styles.quickRow} ${styles.quickRowGrid}`} role="group" aria-label="Sugestões da conversa">
            {dynamicQuick.map((label, i) => (
              <button
                key={`dq-${i}-${label.slice(0, 32)}`}
                type="button"
                className={styles.quickBtn}
                disabled={sending}
                onClick={() => void sendPayload(label, label)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.panelFoot}>
          <div className={styles.footDivider} aria-hidden="true" />
          <form className={styles.footForm} onSubmit={onSubmit}>
            <input
              type="text"
              className={styles.inputPill}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={sending}
              aria-label="Digite sua mensagem"
              autoComplete="off"
            />
            <button
              type="submit"
              className={styles.sendIcon}
              disabled={sending || !input.trim()}
              aria-label="Enviar mensagem"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          <p className={styles.powered}>Powered by IA · e-transporte.pro</p>
        </div>
      </div>

      <div className={styles.launcherDock}>
        {!open && !fabTipDismissed ? (
          <div className={styles.fabTooltip}>
            <span className={styles.fabTooltipText}>Tire suas dúvidas com Áxus</span>
            <button
              type="button"
              className={styles.fabTooltipClose}
              aria-label="Ocultar dica"
              onClick={dismissFabTooltip}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ) : null}
        <div className={styles.launcherRing}>
          <button
            type="button"
            className={styles.launcher}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={dialogId}
            onClick={() => (open ? close() : openPanel())}
          >
            <span className={styles.srOnly}>{open ? "Fechar chat Áxus" : "Abrir chat Áxus"}</span>
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}