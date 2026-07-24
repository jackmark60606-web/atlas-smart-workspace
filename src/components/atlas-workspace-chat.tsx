"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  User,
  Send,
  Megaphone,
  Wallet,
  Users,
  TrendingUp,
  ShieldCheck,
  CornerDownLeft,
  Lock,
} from "lucide-react";

/**
 * Atlas — standalone Arabic B2B workspace chat.
 *
 * Design goals implemented here:
 * 1. Full RTL support (dir="rtl") with modern Arabic typography.
 * 2. Context-aware workspaces (Marketing / Finance / Sales / HR). Each workspace
 *    keeps an ISOLATED message thread + tailored triggers, so a Finance question
 *    can never leak into a Marketing conversation ("prompt contamination").
 * 3. All financial / statistical figures are rendered in full grouped format
 *    (e.g. 5,000,000 — never 5M).
 * 4. A friendly, concise, non-bureaucratic consultant tone for every reply.
 */

/* ----------------------------- Types ----------------------------- */
type WorkspaceId = "marketing" | "finance" | "sales" | "hr";
type Role = "user" | "assistant";
type Message = { id: string; role: Role; text: string };

type Workspace = {
  id: WorkspaceId;
  label: string;
  tagline: string;
  icon: React.ReactNode;
  accent: string; // oklch base color for the workspace
  greeting: string;
  prompts: string[];
  /** Context-isolated reply engine — only ever reads this workspace's domain. */
  reply: (input: string) => string;
};

/* --------------------- Full number formatting --------------------- */
// Always show the complete figure with thousands separators: 5,000,000 (never 5M).
const money = (n: number) => `${new Intl.NumberFormat("en-US").format(n)} ريال`;
const num = (n: number) => new Intl.NumberFormat("en-US").format(n);
const pct = (n: number) => `${n}%`;

/* --------------------------- Workspaces --------------------------- */
const WORKSPACES: Workspace[] = [
  {
    id: "marketing",
    label: "التسويق",
    tagline: "حملات، محتوى، وأداء القنوات",
    icon: <Megaphone className="h-4 w-4" />,
    accent: "oklch(0.62 0.19 25)",
    greeting:
      "أهلاً 👋 أنا أطلس، وهذا فضاء التسويق. اسألني عن أداء الحملات أو الميزانية الإعلانية وسأعطيك خلاصة سريعة قابلة للتنفيذ — بدون تعقيد.",
    prompts: [
      "كيف أداء حملة الربع الأخير؟",
      "وزّع الميزانية الإعلانية القادمة",
      "أفكار محتوى لإطلاق منتج",
    ],
    reply: (input) => {
      const t = input.toLowerCase();
      const has = (...k: string[]) => k.some((x) => t.includes(x));

      if (has("حمل", "أداء", "اداء", "قناة", "قنوات"))
        return [
          "خلاصة أداء حملات الربع — النقاط المهمة فقط:",
          "",
          `• إجمالي الإنفاق الإعلاني: ${money(1250000)}`,
          `• العملاء المحتملون (Leads): ${num(48500)}`,
          `• تكلفة العميل المحتمل: ${money(26)}`,
          `• معدل التحويل: ${pct(4.2)}`,
          "",
          `أفضل قناة كانت البحث المدفوع بعائد ${pct(38)} من الإيراد. توصيتي: انقل جزءاً من ميزانية العرض (Display) إلى البحث في الربع القادم.`,
        ].join("\n");

      if (has("ميزاني", "وزّع", "وزع", "توزيع", "budget"))
        return [
          "اقتراح سريع لتوزيع الميزانية القادمة:",
          "",
          `• الميزانية الإجمالية المتاحة: ${money(2000000)}`,
          `• البحث المدفوع: ${money(900000)} (45%)`,
          `• السوشال ميديا: ${money(600000)} (30%)`,
          `• المحتوى والـ SEO: ${money(300000)} (15%)`,
          `• تجارب واختبارات: ${money(200000)} (10%)`,
          "",
          "خصّصنا 10% للتجارب حتى نكتشف قنوات جديدة دون مخاطرة كبيرة. جاهز أعدّله حسب هدفك.",
        ].join("\n");

      if (has("محتوى", "أفكار", "افكار", "إطلاق", "اطلاق", "منتج"))
        return [
          "أفكار محتوى لإطلاق قوي — مباشرة وقابلة للتنفيذ:",
          "",
          "• فيديو قصير (30 ثانية) يوضّح المشكلة قبل الحل",
          "• سلسلة 3 منشورات «خلف الكواليس» لبناء الترقّب",
          "• شهادة عميل حقيقية مع رقم نتيجة ملموس",
          "• صفحة هبوط واحدة بعرض واضح وزر واحد فقط",
          "",
          "ابدأ بالفيديو القصير — عادةً يحقّق أعلى تفاعل في أول 48 ساعة.",
        ].join("\n");

      return "أنا هنا لفريق التسويق تحديداً. جرّب تسألني عن أداء الحملات، توزيع الميزانية، أو أفكار المحتوى — وسأعطيك خلاصة سريعة بالأرقام.";
    },
  },
  {
    id: "finance",
    label: "المالية",
    tagline: "إيرادات، تدفّق نقدي، وميزانيات",
    icon: <Wallet className="h-4 w-4" />,
    accent: "oklch(0.6 0.15 155)",
    greeting:
      "أهلاً 👋 هذا فضاء المالية. اسألني عن الإيرادات أو التدفّق النقدي وسأجيبك بأرقام كاملة وواضحة، مع توصية عملية واحدة في كل مرة.",
    prompts: [
      "ما وضع الإيرادات هذا العام؟",
      "كيف التدفّق النقدي الحالي؟",
      "حلّل مصروفات التشغيل",
    ],
    reply: (input) => {
      const t = input.toLowerCase();
      const has = (...k: string[]) => k.some((x) => t.includes(x));

      if (has("إيراد", "ايراد", "revenue", "مبيعات", "دخل"))
        return [
          "ملخّص الإيرادات للسنة المالية الحالية:",
          "",
          `• الإيراد التراكمي حتى الآن: ${money(8600000)}`,
          `• الهدف السنوي: ${money(12000000)}`,
          `• نسبة الإنجاز: ${pct(72)}`,
          `• متوسط الإيراد الشهري: ${money(955000)}`,
          "",
          "أنت في المسار الصحيح لتجاوز الهدف. توصيتي: ثبّت هذا المعدل شهرين إضافيين قبل رفع أهداف المبيعات.",
        ].join("\n");

      if (has("تدفّق", "تدفق", "نقد", "cash", "سيول"))
        return [
          "نظرة سريعة على التدفّق النقدي:",
          "",
          `• النقد المتاح حالياً: ${money(3400000)}`,
          `• الداخل المتوقّع خلال 30 يوماً: ${money(1200000)}`,
          `• الالتزامات المستحقّة خلال 30 يوماً: ${money(780000)}`,
          `• صافي التدفّق المتوقّع: ${money(420000)}`,
          "",
          "وضعك النقدي مريح. لديك تغطية تشغيلية تكفي أكثر من 4 أشهر — يمكنك التفكير في استثمار الفائض.",
        ].join("\n");

      if (has("مصروف", "مصاريف", "تشغيل", "expenses", "تكلف"))
        return [
          "تحليل مصروفات التشغيل لهذا الربع:",
          "",
          `• إجمالي المصروفات: ${money(2150000)}`,
          `• الرواتب والبدلات: ${money(1290000)} (60%)`,
          `• التسويق: ${money(430000)} (20%)`,
          `• التشغيل والتقنية: ${money(322500)} (15%)`,
          `• أخرى: ${money(107500)} (5%)`,
          "",
          "بند التقنية ارتفع 12% عن الربع الماضي — يستحق مراجعة سريعة للاشتراكات غير المستخدمة.",
        ].join("\n");

      return "أنا مخصّص لفريق المالية هنا. اسألني عن الإيرادات، التدفّق النقدي، أو مصروفات التشغيل — وستأتيك الأرقام كاملة وواضحة.";
    },
  },
  {
    id: "sales",
    label: "المبيعات",
    tagline: "صفقات، خطوط الأنابيب، والأهداف",
    icon: <TrendingUp className="h-4 w-4" />,
    accent: "oklch(0.55 0.16 255)",
    greeting:
      "أهلاً 👋 هذا فضاء المبيعات. اسألني عن الصفقات أو خط الأنابيب (Pipeline) وسأعطيك الصورة بسرعة مع الخطوة التالية الأوضح.",
    prompts: [
      "ما حالة خط الأنابيب؟",
      "أي الصفقات قريبة من الإغلاق؟",
      "هل نحقق هدف الربع؟",
    ],
    reply: (input) => {
      const t = input.toLowerCase();
      const has = (...k: string[]) => k.some((x) => t.includes(x));

      if (has("أنابيب", "انابيب", "pipeline", "خط"))
        return [
          "حالة خط الأنابيب الآن:",
          "",
          `• قيمة الصفقات المفتوحة: ${money(6800000)}`,
          `• عدد الصفقات النشطة: ${num(54)}`,
          `• متوسط قيمة الصفقة: ${money(126000)}`,
          `• معدل الإغلاق المتوقّع: ${pct(31)}`,
          "",
          "أكبر تركّز للقيمة في مرحلة التفاوض. ركّز جهد الأسبوع على أعلى 5 صفقات — تمثّل وحدها 45% من القيمة.",
        ].join("\n");

      if (has("إغلاق", "اغلاق", "قريب", "close", "تقفل"))
        return [
          "الصفقات الأقرب للإغلاق هذا الشهر:",
          "",
          `• مجموعة الخليج للتقنية: ${money(940000)} — احتمال 85%`,
          `• شركة النخبة اللوجستية: ${money(610000)} — احتمال 70%`,
          `• مؤسسة الأفق الطبية: ${money(455000)} — احتمال 65%`,
          "",
          `القيمة المرجّحة لهذه الثلاث: ${money(1509750)}. ابدأ بصفقة الخليج — تحتاج فقط توقيع العقد النهائي.`,
        ].join("\n");

      if (has("هدف", "target", "ربع", "نحقق", "نحقّق"))
        return [
          "متابعة هدف الربع:",
          "",
          `• هدف الربع: ${money(3000000)}`,
          `• المُحقّق حتى الآن: ${money(2280000)}`,
          `• المتبقّي: ${money(720000)}`,
          `• نسبة الإنجاز: ${pct(76)}`,
          "",
          "متبقٍّ أسبوعان وأنت قريب جداً. إغلاق صفقتين متوسطتين يكفي لتجاوز الهدف — أنت في وضع ممتاز.",
        ].join("\n");

      return "هذا فضاء المبيعات. اسألني عن خط الأنابيب، الصفقات القريبة من الإغلاق، أو تقدّمك نحو هدف الربع.";
    },
  },
  {
    id: "hr",
    label: "الموارد البشرية",
    tagline: "التوظيف، الفرق، والسياسات",
    icon: <Users className="h-4 w-4" />,
    accent: "oklch(0.62 0.14 300)",
    greeting:
      "أهلاً 👋 هذا فضاء الموارد البشرية. اسألني عن أعداد الفريق، التوظيف، أو السياسات وسأجيبك ببساطة وود.",
    prompts: [
      "كم عدد الموظفين حالياً؟",
      "ما وضع التوظيف المفتوح؟",
      "لخّص سياسة الإجازات",
    ],
    reply: (input) => {
      const t = input.toLowerCase();
      const has = (...k: string[]) => k.some((x) => t.includes(x));

      if (has("عدد", "موظف", "فريق", "headcount"))
        return [
          "لمحة سريعة عن الفريق:",
          "",
          `• إجمالي الموظفين: ${num(342)}`,
          `• التقنية والمنتج: ${num(128)}`,
          `• المبيعات والتسويق: ${num(94)}`,
          `• العمليات والدعم: ${num(78)}`,
          `• الإدارة والمالية: ${num(42)}`,
          "",
          "نمو الفريق 18% عن العام الماضي. التوزيع صحّي ومتوازن — لا حاجة لتعديل عاجل.",
        ].join("\n");

      if (has("توظيف", "شواغر", "شاغر", "hiring", "وظائف"))
        return [
          "وضع التوظيف المفتوح حالياً:",
          "",
          `• الشواغر المعلنة: ${num(14)}`,
          `• المرشّحون في المراحل النهائية: ${num(9)}`,
          `• متوسط مدة التوظيف: ${num(28)} يوماً`,
          "",
          "أطول شاغر مفتوح هو «مهندس بيانات أول» منذ 41 يوماً. أقترح مراجعة نطاق الراتب لتسريع الإغلاق.",
        ].join("\n");

      if (has("إجاز", "اجاز", "vacation", "سياس"))
        return [
          "ملخّص سياسة الإجازات — باختصار:",
          "",
          `• إجازة سنوية مدفوعة: ${num(21)} يوم عمل`,
          `• إجازة مرضية: ${num(10)} أيام سنوياً`,
          `• إجازة اضطرارية: ${num(5)} أيام سنوياً`,
          "",
          "الطلب يُرفع عبر بوابة الموظف قبل 5 أيام عمل. لو احتجت الصياغة الرسمية الكاملة أرسلها لك فوراً.",
        ].join("\n");

      return "هذا فضاء الموارد البشرية. اسألني عن حجم الفريق، الشواغر المفتوحة، أو ملخّص السياسات الداخلية.";
    },
  },
];

/* --------------------------- Component --------------------------- */
export default function AtlasWorkspaceChat() {
  const [activeId, setActiveId] = useState<WorkspaceId>("marketing");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");

  // Each workspace owns an isolated message thread. Switching workspaces never
  // mixes threads — this is what prevents prompt contamination across contexts.
  const [threads, setThreads] = useState<Record<WorkspaceId, Message[]>>(() =>
    WORKSPACES.reduce(
      (acc, w) => {
        acc[w.id] = [{ id: `${w.id}-greet`, role: "assistant", text: w.greeting }];
        return acc;
      },
      {} as Record<WorkspaceId, Message[]>,
    ),
  );

  const active = useMemo(() => WORKSPACES.find((w) => w.id === activeId)!, [activeId]);
  const messages = threads[activeId];

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, activeId]);

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const wsId = activeId; // capture the context at send-time
      const ws = WORKSPACES.find((w) => w.id === wsId)!;

      setThreads((prev) => ({
        ...prev,
        [wsId]: [...prev[wsId], { id: `u-${Date.now()}`, role: "user", text }],
      }));
      setTyping(true);

      window.setTimeout(() => {
        // Reply is generated by THIS workspace's engine only — isolated context.
        setThreads((prev) => ({
          ...prev,
          [wsId]: [
            ...prev[wsId],
            { id: `a-${Date.now()}`, role: "assistant", text: ws.reply(text) },
          ],
        }));
        setTyping(false);
      }, 700);
    },
    [activeId],
  );

  return (
    <div dir="rtl" className="mx-auto flex w-full max-w-3xl flex-col font-sans">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight text-foreground">أطلس</div>
            <div className="text-[11px] text-muted-foreground">مستشارك الذكي داخل مساحة العمل</div>
          </div>
        </div>
        <div
          className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium sm:flex"
          style={{
            background: "color-mix(in oklab, var(--success) 12%, var(--background))",
            color: "var(--success)",
            borderColor: "color-mix(in oklab, var(--success) 25%, transparent)",
          }}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          سياق كل قسم معزول تماماً
        </div>
      </div>

      {/* Workspace switcher — selecting a context isolates the conversation */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="مساحات العمل">
        {WORKSPACES.map((w) => {
          const isActive = w.id === activeId;
          return (
            <button
              key={w.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(w.id)}
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition"
              style={
                isActive
                  ? { background: w.accent, color: "white", borderColor: w.accent }
                  : {
                      background: "var(--card)",
                      color: "var(--muted-foreground)",
                      borderColor: "var(--border)",
                    }
              }
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-lg"
                style={
                  isActive
                    ? { background: "color-mix(in oklab, white 22%, transparent)" }
                    : { background: `color-mix(in oklab, ${w.accent} 14%, transparent)`, color: w.accent }
                }
              >
                {w.icon}
              </span>
              {w.label}
            </button>
          );
        })}
      </div>

      {/* Chat surface */}
      <section
        className="mt-4 overflow-hidden rounded-3xl border bg-card"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* Active context banner */}
        <div
          className="flex items-center gap-2 border-b px-5 py-3 text-xs font-semibold"
          style={{
            background: `color-mix(in oklab, ${active.accent} 10%, var(--card))`,
            color: active.accent,
            borderColor: `color-mix(in oklab, ${active.accent} 20%, transparent)`,
          }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg text-white"
            style={{ background: active.accent }}
          >
            {active.icon}
          </span>
          <span>
            السياق الحالي: {active.label} — {active.tagline}
          </span>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="max-h-[440px] min-h-[320px] space-y-4 overflow-y-auto p-5"
          style={{ background: "var(--muted)" }}
        >
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} accent={active.accent} />
          ))}
          {typing && <Typing accent={active.accent} />}
        </div>

        {/* Context-aware quick prompts */}
        <div className="flex flex-wrap gap-2 border-t px-5 pt-4">
          {active.prompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border px-3 py-1.5 text-xs font-medium text-foreground transition hover:text-white"
              style={{ borderColor: "var(--border)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = active.accent;
                e.currentTarget.style.borderColor = active.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
            setInput("");
          }}
          className="m-5 mt-4 flex items-center gap-2 rounded-2xl border bg-background p-2 focus-within:border-primary"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault();
                send(input);
                setInput("");
              }
            }}
            placeholder={`اسأل أطلس في سياق ${active.label}...`}
            className="flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label={`رسالة إلى أطلس في مساحة ${active.label}`}
          />
          <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
            <CornerDownLeft className="h-3 w-3" />
            إرسال
          </span>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: active.accent }}
          >
            إرسال
            <Send className="h-4 w-4 -scale-x-100" />
          </button>
        </form>
      </section>

      {/* Trust note */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3" />
        كل محادثة تبقى داخل قسمها — أطلس لا يخلط بين سياقات الأقسام.
      </div>
    </div>
  );
}

/* --------------------------- Sub-parts --------------------------- */
function Bubble({ msg, accent }: { msg: Message; accent: string }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fade-in`}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: isUser ? "var(--gradient-slate)" : accent }}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className="max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={
          isUser
            ? { background: "var(--primary)", color: "var(--primary-foreground)" }
            : { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }
        }
      >
        {renderBold(msg.text)}
      </div>
    </div>
  );
}

function Typing({ accent }: { accent: string }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: accent }}
      >
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl border bg-card px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
