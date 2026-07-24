import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  Upload,
  FileText,
  Trash2,
  X,
  FileCheck2,
  MessageSquareQuote,
  GraduationCap,
  Send,
  Sparkles,
  Lock,
  User,
  ChevronLeft,
  Search,
  Bell,
  Bot,
  Paperclip,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: AtlasDashboard,
});

type Doc = { id: string; name: string; size: string; tag: string; date: string };
type Message = { id: string; role: "user" | "assistant"; text: string };

const INITIAL_DOCS: Doc[] = [
  { id: "1", name: "عقد-توريد-الخدمات-2025.pdf", size: "1.4 MB", tag: "عقود", date: "منذ ساعتين" },
  { id: "2", name: "سياسة-الخصوصية-الداخلية.docx", size: "820 KB", tag: "سياسات", date: "أمس" },
  { id: "3", name: "تقرير-مبيعات-الربع-الثالث.pdf", size: "3.2 MB", tag: "مبيعات", date: "قبل 3 أيام" },
];

const TAGS = ["عقود", "سياسات", "مبيعات"] as const;

const QUICK_PROMPTS = [
  "لخّص لي عقد التوريد الأخير",
  "ما أهم بنود سياسة الخصوصية؟",
  "اكتب رد اعتذار لعميل",
  "قارن أرقام مبيعات الربع",
];

function AtlasDashboard() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <PageIntro />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <KnowledgeBase />
          </div>
          <div className="lg:col-span-8">
            <ActionCenter />
          </div>
          <div className="lg:col-span-12">
            <SmartChat />
          </div>
        </div>
        <TrustBadge />
      </main>
    </div>
  );
}

/* ---------------- Header ---------------- */
function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{ background: "color-mix(in oklab, var(--background) 80%, transparent)" }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight text-foreground">أطلس</div>
            <div className="text-[11px] text-muted-foreground">Atlas · موظف المعرفة الذكي</div>
          </div>
        </div>

        <div
          className="hidden items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium md:flex"
          style={{
            background: "color-mix(in oklab, var(--success) 10%, var(--background))",
            color: "var(--success)",
            borderColor: "color-mix(in oklab, var(--success) 25%, transparent)",
          }}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>بياناتك مشفرة ومحمية 100%</span>
          <span>🛡️</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:flex">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:flex">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <div className="flex items-center gap-3 rounded-full border bg-card py-1 pe-1 ps-3 shadow-sm">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-foreground">سارة الأحمد</div>
              <div className="text-[10px] text-muted-foreground">مدير المعرفة</div>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "var(--gradient-slate)" }}
            >
              س
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function PageIntro() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>لوحة التحكم</span>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        <span className="text-foreground">نظرة عامة</span>
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        أهلاً بك، سارة 👋
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        أطلس يتعلّم من مستندات شركتك ليساعدك على اتخاذ قرارات أسرع، صياغة ردود دقيقة، وتدريب فريقك — بأمانٍ تام ودون
        مشاركة بياناتك.
      </p>
    </div>
  );
}

/* ---------------- Section 1: Knowledge Base ---------------- */
function KnowledgeBase() {
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [activeTag, setActiveTag] = useState<string>("عقود");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      tag: activeTag,
      date: "الآن",
    }));
    setDocs((d) => [...arr, ...d]);
  }, [activeTag]);

  return (
    <Card>
      <CardHeader
        icon={<FileText className="h-5 w-5" />}
        title="قاعدة المعرفة"
        subtitle="ارفع مستنداتك ليتعلّم منها أطلس"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className="rounded-full border px-3 py-1 text-xs font-medium transition"
            style={
              activeTag === t
                ? {
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    borderColor: "var(--primary)",
                  }
                : { color: "var(--muted-foreground)" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition"
        style={{
          borderColor: dragOver ? "var(--primary)" : "var(--border)",
          background: dragOver ? "color-mix(in oklab, var(--primary) 6%, var(--background))" : "var(--muted)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full transition group-hover:scale-110"
          style={{ background: "var(--gradient-primary)", color: "white", boxShadow: "var(--shadow-glow)" }}
        >
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-sm font-semibold text-foreground">اسحب الملفات هنا أو انقر للرفع</div>
        <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX · حتى 25 ميجابايت</div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground">
            المستندات المرفوعة <span className="text-muted-foreground">({docs.length})</span>
          </div>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto pe-1">
          {docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} onDelete={() => setDocs((d) => d.filter((x) => x.id !== doc.id))} />
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm("هل أنت متأكد من حذف كل البيانات؟ لا يمكن التراجع.")) setDocs([]);
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:brightness-105"
        style={{
          borderColor: "color-mix(in oklab, var(--destructive) 30%, transparent)",
          color: "var(--destructive)",
          background: "color-mix(in oklab, var(--destructive) 6%, var(--background))",
        }}
      >
        <Trash2 className="h-4 w-4" />
        حذف جميع البيانات نهائياً
      </button>
    </Card>
  );
}

function DocRow({ doc, onDelete }: { doc: Doc; onDelete: () => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition hover:shadow-sm">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "color-mix(in oklab, var(--primary) 10%, var(--background))", color: "var(--primary)" }}
      >
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-foreground">{doc.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span
            className="rounded-full px-2 py-0.5"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            {doc.tag}
          </span>
          <span>{doc.size}</span>
          <span>·</span>
          <span>{doc.date}</span>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 transition group-hover:opacity-100"
        aria-label="حذف"
      >
        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

/* ---------------- Section 2: Action Center ---------------- */
function ActionCenter() {
  return (
    <Card>
      <CardHeader
        icon={<Zap className="h-5 w-5" />}
        title="مركز مهام موظف المعرفة"
        subtitle="اختر مهمة ودع أطلس ينجزها بذكاء"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          icon={<FileCheck2 className="h-5 w-5" />}
          title="استخراج الالتزامات من العقود"
          desc="حلّل عقودك واستخرج المواعيد، البنود الجزائية، والتزاماتك الرئيسية تلقائياً."
          badge="Contract Auditor"
          accent="oklch(0.55 0.16 255)"
        />
        <ActionCard
          icon={<MessageSquareQuote className="h-5 w-5" />}
          title="صياغة رد على عميل"
          desc="ردود احترافية بلمسة إنسانية، مبنية على سياساتك وسجل تعاملاتك السابقة."
          badge="Response Generator"
          accent="oklch(0.6 0.15 195)"
        />
        <ActionCard
          icon={<GraduationCap className="h-5 w-5" />}
          title="تدريب موظف جديد"
          desc="جلسة تدريبية تفاعلية بالعربية تعتمد على أدلة الشركة وأسئلتها الشائعة."
          badge="Interactive Onboarding"
          accent="oklch(0.6 0.15 155)"
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border bg-muted p-4">
        <Stat label="مستندات نشطة" value="128" />
        <Stat label="مهام هذا الأسبوع" value="47" />
        <Stat label="ساعات مُوفَّرة" value="212" />
      </div>
    </Card>
  );
}

function ActionCard({
  icon, title, desc, badge, accent,
}: { icon: React.ReactNode; title: string; desc: string; badge: string; accent: string }) {
  return (
    <button
      className="group relative flex h-full flex-col items-start rounded-xl border bg-card p-5 text-right transition hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-sm)", transition: "var(--transition-smooth)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-lg)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 70%, white))` }}
        >
          {icon}
        </div>
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          {badge}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-bold leading-snug text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      <div
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold transition group-hover:gap-2.5"
        style={{ color: accent }}
      >
        ابدأ المهمة
        <ChevronLeft className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

/* ---------------- Section 3: Smart Chat ---------------- */
function SmartChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "w",
      role: "assistant",
      text: "مرحباً سارة 👋 أنا أطلس، مساعدك الذكي. يمكنني تلخيص المستندات، صياغة الردود، ومقارنة الأرقام. جرّبي أحد الاقتراحات بالأسفل أو اكتبي طلبك.",
    },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text: t };
    const reply: Message = {
      id: `a${Date.now()}`,
      role: "assistant",
      text:
        "تمّ استلام طلبك. بناءً على مستنداتك في قاعدة المعرفة، إليك الملخص المقترح:\n\n• البند الأول: التزام تسليم شهري خلال 30 يوماً.\n• البند الثاني: غرامة تأخير 0.5% من قيمة العقد.\n• توصية أطلس: تفعيل تذكير قبل 5 أيام من الاستحقاق.",
    };
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  };

  return (
    <Card>
      <CardHeader
        icon={<Bot className="h-5 w-5" />}
        title="مُساعد العمل اليومي"
        subtitle="محادثة ذكية تفهم سياق شركتك"
        right={
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    style={{ background: "var(--success)" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--success)" }} />
            </span>
            متصل الآن
          </div>
        }
      />

      <div
        className="mb-4 max-h-[420px] min-h-[280px] space-y-4 overflow-y-auto rounded-xl border p-4"
        style={{ background: "var(--muted)" }}
      >
        {messages.map((m) => <ChatBubble key={m.id} msg={m} />)}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:border-primary"
      >
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل أطلس عن أي شيء يخص شركتك..."
          className="flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          إرسال
          <Send className="h-4 w-4 -scale-x-100" />
        </button>
      </form>
    </Card>
  );
}

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fade-in`}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{
          background: isUser ? "var(--gradient-slate)" : "var(--gradient-primary)",
        }}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line"
        style={
          isUser
            ? { background: "var(--primary)", color: "var(--primary-foreground)" }
            : { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }
        }
      >
        {msg.text}
      </div>
    </div>
  );
}

/* ---------------- Trust Badge ---------------- */
function TrustBadge() {
  return (
    <div
      className="mt-10 flex flex-col items-center gap-3 rounded-2xl border p-6 text-center sm:flex-row sm:text-right"
      style={{ background: "var(--gradient-slate)", color: "white", boxShadow: "var(--shadow-lg)" }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "color-mix(in oklab, white 15%, transparent)" }}
      >
        <Lock className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-center gap-2 text-sm font-bold sm:justify-start">
          <Shield className="h-4 w-4" />
          خصوصية مضمونة بالكامل
        </div>
        <p className="mt-1 text-xs leading-relaxed opacity-85">
          نضمن لك عدم استخدام بياناتك لتدريب نماذج الذكاء الاصطناعي نهائياً وفق اتفاقية الخصوصية.
        </p>
      </div>
      <div
        className="hidden gap-4 text-[11px] font-medium opacity-90 sm:flex"
      >
        <span>ISO 27001</span>
        <span>·</span>
        <span>GDPR</span>
        <span>·</span>
        <span>SOC 2</span>
      </div>
    </div>
  );
}

/* ---------------- Primitives ---------------- */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="h-full rounded-2xl border bg-card p-5 sm:p-6"
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      {children}
    </section>
  );
}

function CardHeader({
  icon, title, subtitle, right,
}: { icon: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "color-mix(in oklab, var(--primary) 10%, var(--background))",
            color: "var(--primary)",
          }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
