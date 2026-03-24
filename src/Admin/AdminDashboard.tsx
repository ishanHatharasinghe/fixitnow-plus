import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  CheckSquare,
  ChevronDown,
  TrendingUp,
  Clock,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Loader,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Activity,
  Zap,
  RefreshCw,
  FileText,
  CalendarDays,
} from "lucide-react";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import AdminPostManagement from "./AdminPostManagement";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "overview" | "providers" | "customers" | "posts" | "approval";

export interface Post {
  id: string;
  title: string;
  category: string;
  specializations?: string;
  location: string;
  specificCities?: string;
  travelDistance?: string;
  pricingModel?: string;
  description?: string;
  keywords?: string;
  checklist: string[];
  clientMaterials: string;
  timeFromHour: string;
  timeFromAmPm: string;
  timeToHour: string;
  timeToAmPm: string;
  availableDays: string[];
  startingPrice?: string;
  inspectionFee?: string;
  emergency: string;
  ownerName: string;
  ownerAddress?: string;
  nic?: string;
  mobile: string;
  email: string;
  images: string[];
  pdf?: string;
  status: "pending" | "approved" | "rejected" | "draft";
  serviceProviderId: string;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── KEY FIX: bulletproof date converter ─────────────────────────────────────
// Handles: Firestore Timestamp, JS Date, ISO string, number (ms), null/undefined
function toDateSafe(value: any): Date {
  if (!value) return new Date(0);
  // Firestore Timestamp object
  if (typeof value?.toDate === "function") {
    try { return value.toDate(); } catch { return new Date(0); }
  }
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date(0) : value;
  // Firestore Timestamp stored as plain object { seconds, nanoseconds }
  if (typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  return new Date(0);
}

// ─── KEY FIX: fetch ALL users directly from Firestore ────────────────────────
// Bypasses userService which crashes on non-Timestamp createdAt values
async function fetchAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email || "",
      role: data.role || "",
      displayName: data.displayName || data.email || "",
      createdAt: toDateSafe(data.createdAt),
      updatedAt: toDateSafe(data.updatedAt),
      ...data,
    } as UserProfile;
  });
}

// ─── KEY FIX: fetch ALL posts directly — no orderBy to avoid index errors ────
async function fetchAllPosts(): Promise<Post[]> {
  const snap = await getDocs(collection(db, "posts"));
  const posts = snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: toDateSafe(data.createdAt),
      updatedAt: toDateSafe(data.updatedAt),
    } as Post;
  });
  // Sort newest-first client-side
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ─── CSV Export Utility ───────────────────────────────────────────────────────

function exportCSV(filename: string, headers: string[], rows: (string | number)[][][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map((cell) => escape(cell[0])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getMonthOptions(count = 12) {
  const now = new Date();
  const opts: { label: string; year: number; month: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return opts;
}

// ─── Month-picker + Export button ─────────────────────────────────────────────

const MonthExportButton = ({
  onExport,
  label = "Export",
}: {
  onExport: (year: number, month: number, label: string) => void;
  label?: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const options = useMemo(() => getMonthOptions(12), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#0072D1] hover:text-[#0072D1] bg-white transition-all"
      >
        <FileText className="w-3.5 h-3.5" />
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-[#0072D1]" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Select Month</span>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={`${opt.year}-${opt.month}`}
                onClick={() => {
                  onExport(opt.year, opt.month, opt.label);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-[#0072D1]/5 hover:text-[#0072D1] transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Animated counter hook ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── CHART 1: Interactive SVG area chart ─────────────────────────────────────

const PostsOverTimeChart = ({ posts }: { posts: Post[] }) => {
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; label: string; count: number;
  } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString("default", { month: "short" }), count: 0 });
    }
    posts.forEach((p) => {
      const d = toDateSafe(p.createdAt);
      const diff =
        (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diff >= 0 && diff <= 6) months[6 - diff].count++;
    });
    return months;
  }, [posts]);

  const w = 560; const h = 160; const pad = 32; const padBottom = 32;
  const pts = monthlyData.map((m) => m.count);
  const max = Math.max(...pts, 1);
  const xs = pts.map((_, i) => pad + (i * (w - pad * 2)) / (pts.length - 1));
  const ys = pts.map((p) => h - (p / max) * (h - 16));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = w / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    let closest = 0; let minDist = Infinity;
    xs.forEach((x, i) => { const d = Math.abs(x - mx); if (d < minDist) { minDist = d; closest = i; } });
    setHovered(closest);
    setTooltip({ x: xs[closest], y: ys[closest], label: monthlyData[closest].label, count: pts[closest] });
  };

  return (
    <div className="w-full relative select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h + padBottom}`}
        className="w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHovered(null); setTooltip(null); }}
      >
        <defs>
          <linearGradient id="areaGradLive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0072D1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0072D1" stopOpacity="0.01" />
          </linearGradient>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const gy = h - f * (h - 16);
          return (
            <g key={f}>
              <line x1={pad} y1={gy} x2={w - pad} y2={gy} stroke="#F1F5F9" strokeWidth="1" />
              <text x={pad - 6} y={gy + 4} fontSize="9" fill="#CBD5E1" textAnchor="end">
                {Math.round(f * max)}
              </text>
            </g>
          );
        })}
        {hovered !== null && (
          <line x1={xs[hovered]} y1={8} x2={xs[hovered]} y2={h} stroke="#0072D1"
            strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
        )}
        <path d={area} fill="url(#areaGradLive)" />
        {hovered !== null && hovered > 0 && (
          <line x1={xs[hovered - 1]} y1={ys[hovered - 1]} x2={xs[hovered]} y2={ys[hovered]}
            stroke="#FF5A00" strokeWidth="3" strokeLinecap="round" />
        )}
        <path d={line} fill="none" stroke="#0072D1" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r={hovered === i ? 8 : 4.5}
              fill={hovered === i ? "#FF5A00" : "#fff"}
              stroke={hovered === i ? "#FF5A00" : "#0072D1"}
              strokeWidth="2.5"
              filter={hovered === i ? "url(#dotGlow)" : undefined}
              style={{ transition: "r 0.15s, fill 0.15s, stroke 0.15s" }}
            />
          </g>
        ))}
        {monthlyData.map((m, i) => (
          <text key={i} x={xs[i]} y={h + padBottom - 6} fontSize="10"
            fill={hovered === i ? "#FF5A00" : "#9CA3AF"}
            textAnchor="middle" fontWeight={hovered === i ? "800" : "500"}
            style={{ transition: "fill 0.15s" }}>
            {m.label}
          </text>
        ))}
      </svg>
      {tooltip && (
        <div
          className="absolute z-10 pointer-events-none bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl"
          style={{
            left: `${(tooltip.x / w) * 100}%`,
            top: `${(tooltip.y / (h + padBottom)) * 100}%`,
            transform: "translate(-50%, -140%)",
            whiteSpace: "nowrap",
          }}
        >
          <span className="text-gray-400 font-medium mr-1">{tooltip.label}</span>
          <span className="text-[#FF5A00]">{tooltip.count}</span>
          <span className="text-gray-400 ml-1">post{tooltip.count !== 1 ? "s" : ""}</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// ─── CHART 2: Interactive donut ───────────────────────────────────────────────

const PostStatusDonut = ({
  pending, approved, rejected
}: { pending: number; approved: number; rejected: number }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = pending + approved + rejected;

  if (total === 0) return (
    <div className="flex items-center justify-center h-40 text-xs text-gray-400 font-medium">
      No post data yet
    </div>
  );

  const cx = 80; const cy = 80; const r = 56; const stroke = 20;
  const circ = 2 * Math.PI * r;

  const segments = [
    { label: "Approved", value: approved, color: "#0072D1", bg: "bg-blue-50", hbg: "#EFF6FF" },
    { label: "Pending",  value: pending,  color: "#FF5A00", bg: "bg-orange-50", hbg: "#FFF7ED" },
    { label: "Rejected", value: rejected, color: "#EF4444", bg: "bg-red-50", hbg: "#FEF2F2" },
  ];

  let offset = 0;
  const arcs = segments.map((seg, idx) => {
    const pct = seg.value / total;
    const dash = pct * circ;
    const arc = { ...seg, idx, pct, dash, offset };
    offset += dash;
    return arc;
  });

  const hoveredArc = hovered !== null ? arcs[hovered] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
          {arcs.map((arc, i) => (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={arc.color}
              strokeWidth={hovered === i ? stroke + 6 : stroke}
              strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
              strokeDashoffset={-arc.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
              style={{ transition: "stroke-width 0.2s, opacity 0.2s", cursor: "pointer", opacity: hovered !== null && hovered !== i ? 0.35 : 1 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <text x={cx} y={cy - 9} textAnchor="middle" fontSize="24" fontWeight="900"
            fill={hoveredArc ? hoveredArc.color : "#111827"}
            style={{ transition: "fill 0.2s" }}>
            {hoveredArc ? hoveredArc.value : total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9.5" fill="#9CA3AF" fontWeight="600">
            {hoveredArc ? hoveredArc.label.toUpperCase() : "TOTAL POSTS"}
          </text>
          {hoveredArc && (
            <text x={cx} y={cy + 25} textAnchor="middle" fontSize="9.5"
              fill={hoveredArc.color} fontWeight="800">
              {(hoveredArc.pct * 100).toFixed(1)}%
            </text>
          )}
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        {arcs.map((arc, i) => (
          <div
            key={arc.label}
            className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200"
            style={{ background: hovered === i ? arc.hbg : "transparent", border: `1.5px solid ${hovered === i ? arc.color + "35" : "transparent"}` }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: arc.color }} />
              <span className="text-xs font-semibold text-gray-600">{arc.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black" style={{ color: hovered === i ? arc.color : "#111827" }}>{arc.value}</span>
              <span className="text-[10px] text-gray-400 font-medium w-8 text-right">{(arc.pct * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── CHART 3: Interactive horizontal bar chart ────────────────────────────────

const TopCategoriesChart = ({ posts }: { posts: Post[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [posts]);

  if (categoryCounts.length === 0) return (
    <div className="flex items-center justify-center h-32 text-xs text-gray-400 font-medium">No category data yet</div>
  );

  const maxVal = categoryCounts[0][1];
  const colors = ["#0072D1", "#FF5A00", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];
  const lightBgs = ["#EFF6FF", "#FFF7ED", "#ECFDF5", "#F5F3FF", "#FFFBEB", "#FEF2F2"];

  return (
    <div className="space-y-2">
      {categoryCounts.map(([cat, count], i) => {
        const pct = (count / maxVal) * 100;
        const isHov = hovered === i;
        const short = cat.length > 22 ? cat.slice(0, 20) + "…" : cat;
        return (
          <div
            key={cat}
            className="rounded-xl px-2.5 py-2 transition-all duration-200 cursor-default"
            style={{ background: isHov ? lightBgs[i % lightBgs.length] : "transparent" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            title={cat}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold transition-colors duration-200" style={{ color: isHov ? colors[i % colors.length] : "#4B5563" }}>{short}</span>
              <span className="text-xs font-black transition-colors duration-200" style={{ color: isHov ? colors[i % colors.length] : "#111827" }}>{count}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%`, background: colors[i % colors.length], opacity: isHov ? 1 : 0.65, boxShadow: isHov ? `0 0 10px ${colors[i % colors.length]}55` : "none" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── CHART 4: Animated user split bar ────────────────────────────────────────

const UserRoleSplitBar = ({ providers, seekers }: { providers: number; seekers: number }) => {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 120); return () => clearTimeout(t); }, []);

  const total = providers + seekers;
  if (total === 0) return null;
  const provPct = (providers / total) * 100;
  const seekPct = (seekers / total) * 100;

  return (
    <div className="space-y-3">
      <div className="w-full h-6 rounded-full overflow-hidden bg-gray-100 flex">
        <div className="h-full bg-[#0072D1] flex items-center justify-center transition-all duration-700 ease-out" style={{ width: animated ? `${provPct}%` : "0%" }}>
          {provPct > 14 && <span className="text-[9px] text-white font-black">{provPct.toFixed(0)}%</span>}
        </div>
        <div className="h-full bg-[#FF5A00] flex items-center justify-center transition-all duration-700 ease-out" style={{ width: animated ? `${seekPct}%` : "0%" }}>
          {seekPct > 14 && <span className="text-[9px] text-white font-black">{seekPct.toFixed(0)}%</span>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0072D1]" />
            <span className="text-xs font-semibold text-gray-500">Providers</span>
            <span className="text-xs font-black text-gray-900">{providers}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A00]" />
            <span className="text-xs font-semibold text-gray-500">Seekers</span>
            <span className="text-xs font-black text-gray-900">{seekers}</span>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">{total} total</span>
      </div>
    </div>
  );
};

// ─── Animated Stat Card ───────────────────────────────────────────────────────

const StatCard = ({ label, rawValue, value, change, positive, icon: Icon, iconBg, accentColor }: any) => {
  const [hov, setHov] = useState(false);
  const animated = useCountUp(typeof rawValue === "number" ? rawValue : 0);

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm cursor-default overflow-hidden group"
      style={{ boxShadow: hov ? `0 8px 32px ${accentColor}20` : undefined, transform: hov ? "translateY(-3px)" : "translateY(0)", transition: "transform 0.25s, box-shadow 0.25s" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="absolute top-0 left-0 h-[3px] rounded-t-2xl transition-all duration-500" style={{ width: hov ? "100%" : "0%", background: accentColor }} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`} style={{ transform: hov ? "scale(1.1) rotate(-4deg)" : "scale(1)", transition: "transform 0.25s" }}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${positive ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 truncate">{label}</p>
      <p className="text-2xl md:text-3xl font-black text-gray-900" style={{ color: hov ? accentColor : undefined, transition: "color 0.25s" }}>
        {typeof rawValue === "number" ? animated.toLocaleString() : value}
      </p>
    </div>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const Badge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    PENDING:       "bg-orange-50 text-orange-500 border border-orange-200",
    APPROVED:      "bg-blue-50 text-blue-600 border border-blue-200",
    ACTIVE:        "bg-green-50 text-green-600 border border-green-200",
    VERIFIED:      "bg-teal-50 text-teal-600 border border-teal-200",
    "IN PROGRESS": "bg-gray-100 text-gray-600 border border-gray-200",
    REJECTED:      "bg-red-50 text-red-500 border border-red-200",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

const MiniStat = ({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-0.5 cursor-default transition-all duration-200"
      style={{ background: hov ? bg : "#F9FAFB", boxShadow: hov ? `0 2px 12px ${color}20` : "none" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span className="text-lg font-black transition-colors duration-200" style={{ color: hov ? color : "#111827" }}>{value}</span>
      <span className="text-[10px] text-gray-500 font-semibold leading-tight">{label}</span>
    </div>
  );
};

// ─── Overview Section ─────────────────────────────────────────────────────────

const Overview = ({
  totalUsers, totalProviders, totalSeekers,
  pendingPosts, approvedPosts, rejectedPosts,
  loading, posts, users, onRefresh,
}: {
  totalUsers: number; totalProviders: number; totalSeekers: number;
  pendingPosts: number; approvedPosts: number; rejectedPosts: number;
  loading: boolean; posts: Post[]; users: UserProfile[]; onRefresh: () => void;
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const doRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1100);
  };

  const handleOverviewExport = (year: number, month: number, monthLabel: string) => {
    const monthPosts = posts.filter((p) => {
      const d = toDateSafe(p.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const monthUsers = users.filter((u) => {
      const d = toDateSafe(u.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    exportCSV(
      `overview-summary-${year}-${String(month + 1).padStart(2, "0")}.csv`,
      ["Metric", "Value"],
      [
        [["Month"], [monthLabel]],
        [["Total Posts This Month"], [monthPosts.length]],
        [["Approved Posts"], [monthPosts.filter((p) => p.status === "approved").length]],
        [["Pending Posts"], [monthPosts.filter((p) => p.status === "pending").length]],
        [["Rejected Posts"], [monthPosts.filter((p) => p.status === "rejected").length]],
        [["New Users This Month"], [monthUsers.length]],
        [["New Service Providers"], [monthUsers.filter((u) => u.role === "service_provider").length]],
        [["New Customers"], [monthUsers.filter((u) => u.role === "seeker").length]],
      ]
    );
    if (monthPosts.length > 0) {
      exportCSV(
        `overview-posts-${year}-${String(month + 1).padStart(2, "0")}.csv`,
        ["Post ID", "Title", "Category", "Owner", "Location", "Status", "Submitted"],
        monthPosts.map((p) => [[p.id], [p.title || ""], [p.category || ""], [p.ownerName || ""], [p.location || ""], [p.status || ""], [toDateSafe(p.createdAt).toLocaleDateString()]])
      );
    }
    if (monthUsers.length > 0) {
      exportCSV(
        `overview-users-${year}-${String(month + 1).padStart(2, "0")}.csv`,
        ["User ID", "Name", "Email", "Role", "Joined"],
        monthUsers.map((u) => [[u.uid], [u.displayName || ""], [u.email], [u.role], [toDateSafe(u.createdAt).toLocaleDateString()]])
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl md:text-2xl font-black text-gray-900">Overview Dashboard</h1>
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
            </span>
          </div>
          <p className="text-sm text-gray-400 font-medium">Monitoring local service activity across the metropolitan area.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={doRefresh}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#0072D1] hover:text-[#0072D1] transition-all bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#0072D1] transition-colors bg-white">
            <Clock className="w-3.5 h-3.5" /> This Month
          </button>
          <MonthExportButton onExport={handleOverviewExport} label="Export Report" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Users"      rawValue={loading ? 0 : totalUsers}    value={loading ? "..." : totalUsers.toLocaleString()}    change="+12.5%" positive icon={Users}       iconBg="bg-blue-50 text-blue-500"   accentColor="#0072D1" />
        <StatCard label="Active Providers" rawValue={loading ? 0 : totalProviders} value={loading ? "..." : totalProviders.toLocaleString()} change="+3.2%"  positive icon={UserCheck}   iconBg="bg-orange-50 text-orange-500" accentColor="#FF5A00" />
        <StatCard label="Pending Requests" rawValue={loading ? 0 : pendingPosts}   value={loading ? "..." : pendingPosts.toLocaleString()}   change="+18%"   positive={false} icon={ClipboardList} iconBg="bg-red-50 text-red-500"     accentColor="#EF4444" />
        <StatCard label="Approved Posts"   rawValue={loading ? 0 : approvedPosts}  value={loading ? "..." : approvedPosts.toLocaleString()}  change="+24%"   positive icon={TrendingUp}  iconBg="bg-green-50 text-green-500"  accentColor="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0072D1]" />
                <h3 className="font-black text-gray-900 text-base">Post Submissions</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-0.5 ml-6">Monthly activity — hover a point to inspect</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0072D1] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0072D1]" /> Last 7 Months
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
          ) : (
            <PostsOverTimeChart posts={posts} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 text-[#FF5A00]" />
            <h3 className="font-black text-gray-900 text-base">Post Status</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-4 ml-6">Hover segments to inspect</p>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
          ) : (
            <PostStatusDonut pending={pendingPosts} approved={approvedPosts} rejected={rejectedPosts} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#0072D1]" />
            <h3 className="font-black text-gray-900 text-base">Top Categories</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-4 ml-6">Hover rows to highlight</p>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
          ) : (
            <TopCategoriesChart posts={posts} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#FF5A00]" />
            <h3 className="font-black text-gray-900 text-base">User Breakdown</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-4 ml-6">Providers vs seekers on platform</p>
          {loading ? (
            <div className="flex items-center justify-center py-6"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
          ) : (
            <>
              <UserRoleSplitBar providers={totalProviders} seekers={totalSeekers} />
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <MiniStat label="Providers"      value={totalProviders} color="#0072D1" bg="#EFF6FF" />
                <MiniStat label="Seekers"        value={totalSeekers}   color="#FF5A00" bg="#FFF7ED" />
                <MiniStat label="Pending Posts"  value={pendingPosts}   color="#EF4444" bg="#FEF2F2" />
                <MiniStat label="Approved Posts" value={approvedPosts}  color="#10B981" bg="#ECFDF5" />
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-green-500" />
            <h3 className="font-black text-gray-900 text-base">Recent Activities</h3>
          </div>
          <div className="space-y-2 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
            ) : (
              [
                { icon: Users,       bg: "bg-blue-100",   color: "text-blue-600",   dot: "#0072D1", text: `${totalUsers} total users registered`,           sub: "Platform total" },
                { icon: CheckCircle, bg: "bg-green-100",  color: "text-green-600",  dot: "#10B981", text: `${approvedPosts} posts approved`,                sub: "Live on platform" },
                { icon: AlertCircle, bg: "bg-orange-100", color: "text-orange-500", dot: "#FF5A00", text: `${pendingPosts} pending posts need review`,       sub: "Action required" },
                { icon: UserCheck,   bg: "bg-blue-50",    color: "text-blue-400",   dot: "#60A5FA", text: `${totalProviders} active service providers`,     sub: "Registered" },
              ].map((item, i) => <ActivityItem key={i} item={item} />)
            )}
          </div>
          <button className="mt-4 w-full border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-[#0072D1] hover:bg-blue-50 hover:border-[#0072D1] transition-all duration-200">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Activity Item ─────────────────────────────────────────────────────────────

const ActivityItem = ({ item }: { item: { icon: any; bg: string; color: string; dot: string; text: string; sub: string } }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 cursor-default"
      style={{ background: hov ? "#F8FAFC" : "transparent", borderLeft: hov ? `3px solid ${item.dot}` : "3px solid transparent" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${hov ? "scale-110" : ""}`}>
        <item.icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 leading-snug">{item.text}</p>
        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.sub}</p>
      </div>
    </div>
  );
};

// ─── Users Table ──────────────────────────────────────────────────────────────

const UsersSection = ({
  title, subtitle, roleFilter, statsCards, users, loading,
}: {
  title: string; subtitle: string;
  roleFilter: string;
  statsCards: { label: string; value: string; sub: string; subColor: string }[];
  users: UserProfile[]; loading: boolean;
}) => {
  const [search, setSearch] = useState("");
  const filteredUsers = users
    .filter((u) => u.role === roleFilter)
    .filter((u) => !search || (u.displayName || u.email || "").toLowerCase().includes(search.toLowerCase()));

  const sectionLabel = roleFilter === "service_provider" ? "service-providers" : "customers";
  const sectionName  = roleFilter === "service_provider" ? "Service Provider" : "Customer";

  const handleExport = (year: number, month: number, monthLabel: string) => {
    const roleUsers = users.filter((u) => u.role === roleFilter);
    const monthUsers = roleUsers.filter((u) => {
      const d = toDateSafe(u.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    exportCSV(
      `${sectionLabel}-summary-${year}-${String(month + 1).padStart(2, "0")}.csv`,
      ["Metric", "Value"],
      [
        [["Month"], [monthLabel]],
        [["New " + sectionName + "s This Month"], [monthUsers.length]],
        [["Total " + sectionName + "s (All Time)"], [roleUsers.length]],
      ]
    );
    if (monthUsers.length > 0) {
      exportCSV(
        `${sectionLabel}-detail-${year}-${String(month + 1).padStart(2, "0")}.csv`,
        ["User ID", "Name", "Email", "Role", "Joined"],
        monthUsers.map((u) => [[u.uid], [u.displayName || ""], [u.email], [u.role], [toDateSafe(u.createdAt).toLocaleDateString()]])
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">{title}</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">{subtitle}</p>
        </div>
        <MonthExportButton onExport={handleExport} label="Export" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-400 font-semibold mb-1">{s.label}</p>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className={`text-xs font-semibold mt-1 ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${roleFilter === "service_provider" ? "providers" : "seekers"}…`}
              className="flex-1 max-w-xs px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none focus:border-[#0072D1] transition-colors"
            />
            <p className="text-xs font-bold text-gray-400 hidden sm:block">{filteredUsers.length} found</p>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
          ) : (
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100">
                  {["NAME", "ROLE", "EMAIL", "JOIN DATE", "ACTIONS"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-black text-gray-400 tracking-widest uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400 font-medium">No {roleFilter === "service_provider" ? "service providers" : "customers"} found.</td></tr>
                ) : (
                  filteredUsers.map((u, i) => {
                    const initials = u.displayName
                      ? u.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                      : u.email.substring(0, 2).toUpperCase();
                    const joinDate = toDateSafe(u.createdAt).toLocaleDateString();
                    return (
                      <tr key={u.uid} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors group ${i === filteredUsers.length - 1 ? "border-0" : ""}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0072D1] to-blue-400 flex items-center justify-center text-white text-xs font-black flex-shrink-0 group-hover:scale-105 transition-transform">{initials}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{u.displayName || "User"}</p>
                              <p className="text-xs text-gray-400">{u.uid}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${u.role === "service_provider" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.role === "service_provider" ? "bg-blue-500" : "bg-gray-400"}`} />
                            {u.role === "service_provider" ? "Provider" : "Seeker"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 font-medium">{joinDate}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors"><MoreVertical className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
          ) : filteredUsers.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No {roleFilter === "service_provider" ? "service providers" : "customers"} found.</p>
          ) : (
            filteredUsers.map((u) => {
              const initials = u.displayName ? u.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase() : u.email.substring(0, 2).toUpperCase();
              const joinDate = toDateSafe(u.createdAt).toLocaleDateString();
              return (
                <div key={u.uid} className="p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0072D1] to-blue-400 flex items-center justify-center text-white text-xs font-black flex-shrink-0">{initials}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{u.displayName || "User"}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <button className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center"><MoreVertical className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${u.role === "service_provider" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                      <span className={`w-1 h-1 rounded-full ${u.role === "service_provider" ? "bg-blue-500" : "bg-gray-400"}`} />
                      {u.role === "service_provider" ? "Provider" : "Seeker"}
                    </span>
                    <p className="text-xs text-gray-500 font-medium">{joinDate}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium text-center sm:text-left">Showing {filteredUsers.length} of {filteredUsers.length}</p>
          <div className="flex items-center justify-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#0072D1] hover:text-[#0072D1] transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold bg-[#0072D1] text-white">1</button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#0072D1] hover:text-[#0072D1] transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Post Detail Modal ────────────────────────────────────────────────────────

const PostDetailModal = ({
  postId, postData, postStatus, onClose, onApprove, onDecline, viewOnly = false,
}: {
  postId: string; postData?: Post; postStatus: string;
  onClose: () => void; onApprove: () => void; onDecline: () => void; viewOnly?: boolean;
}) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [actionDone, setActionDone] = useState<"approved" | "declined" | null>(null);
  const p = postData;

  React.useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!p) return null;

  const infoRows = [
    { label: "Included Services Checklist",              value: p.checklist?.join(", ") || "N/A" },
    { label: "Requirement of Client Provided Materials", value: p.clientMaterials || "N/A" },
    { label: "Pricing Model",                            value: p.pricingModel || "N/A" },
    { label: "Starting Price",                           value: p.startingPrice ? `LKR ${p.startingPrice}` : "N/A" },
    { label: "Inspection Fee",                           value: p.inspectionFee ? `LKR ${p.inspectionFee}` : "N/A" },
    { label: "Specific Cities",                          value: p.specificCities || "N/A" },
    { label: "Maximum Travel Distance",                  value: p.travelDistance || "N/A" },
    { label: "Available Days",                           value: p.availableDays?.join(", ") || "N/A" },
    { label: "Available Hours",                          value: `${p.timeFromHour}:00 ${p.timeFromAmPm} – ${p.timeToHour}:00 ${p.timeToAmPm}` },
    { label: "Emergency Availability",                   value: p.emergency || "N/A" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border-2 border-[#0072D1]/25 flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-7 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 hidden sm:inline-block">Post Management</span>
            <span className="text-gray-300 text-xs hidden sm:inline-block">›</span>
            <span className="text-xs font-bold text-gray-400">{postId}</span>
            <Badge status={postStatus.toUpperCase()} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-5 md:p-7">
          <h2 className="font-black text-gray-900 text-lg md:text-xl leading-tight mb-1 pr-4">{p.title}</h2>
          <div className="flex items-center gap-1.5 text-gray-400 mb-5 sm:mb-6">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-xs font-medium">{p.location}</span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="w-full md:w-[52%] flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-5">
                <img src={p.images && p.images.length > 0 ? p.images[imgIdx] : "https://via.placeholder.com/400x300?text=No+Image"} alt={p.title} className="w-full h-48 md:h-64 object-cover" />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  {(p.images || []).map((_: any, i: number) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`rounded-full transition-all duration-200 ${i === imgIdx ? "bg-[#0072D1] w-5 h-2.5" : "bg-gray-400/70 w-2.5 h-2.5 hover:bg-gray-500"}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <h3 className="font-black text-gray-800 text-base">Details</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{p.description || "No description provided"}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                {infoRows.map(({ label, value }) => (
                  <p key={label} className="text-sm text-gray-800 leading-snug">
                    <span className="font-black block sm:inline">{label}: </span>
                    <span className="font-normal text-gray-600">{value}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-4 sm:px-5 md:px-7 py-4 border-t border-gray-100 bg-white">
          {viewOnly ? (
            <button onClick={onClose} className="w-full sm:w-auto px-8 py-2.5 rounded-full border-2 border-gray-300 text-gray-600 font-bold text-sm hover:border-[#0072D1] hover:text-[#0072D1] transition-all duration-200">Close</button>
          ) : actionDone === null ? (
            <>
              <button onClick={() => { setActionDone("declined"); onDecline(); }} className="relative overflow-hidden flex-1 sm:flex-none sm:w-36 bg-red-500 text-white font-bold py-3 rounded-full transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-md">
                <span className="relative z-10">Decline</span>
              </button>
              <button onClick={() => { setActionDone("approved"); onApprove(); }} className="relative overflow-hidden flex-1 sm:flex-none sm:w-36 bg-[#0072D1] text-white font-bold py-3 rounded-full transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-md">
                <span className="relative z-10">Approve</span>
              </button>
            </>
          ) : (
            <div className={`flex items-center justify-between w-full sm:w-auto gap-2 px-4 sm:px-5 py-2.5 rounded-2xl ${actionDone === "approved" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex items-center gap-2">
                {actionDone === "approved" ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <X className="w-5 h-5 text-red-500 flex-shrink-0" />}
                <p className={`text-[11px] sm:text-sm font-bold ${actionDone === "approved" ? "text-green-700" : "text-red-600"}`}>
                  {actionDone === "approved" ? "Post approved successfully!" : "Post has been declined."}
                </p>
              </div>
              <button onClick={onClose} className="ml-1 sm:ml-3 text-xs font-bold text-gray-400 hover:text-gray-700 underline transition-colors">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Posts Table ──────────────────────────────────────────────────────────────

const PostsTable = ({
  posts, onRowClick, clickableRows = false,
}: { posts: Post[]; onRowClick?: (id: string) => void; clickableRows?: boolean }) => (
  <>
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full whitespace-nowrap">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {["REQUEST ID", "SERVICE PROVIDER", "SERVICE TYPE", "DATE", "STATUS", "ACTIONS"].map((h) => (
              <th key={h} className="text-left text-[10px] font-black text-gray-400 tracking-widest uppercase px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((p: Post, i: number) => (
            <tr
              key={p.id}
              onClick={() => clickableRows && onRowClick?.(p.id)}
              className={`border-b border-gray-50 transition-colors ${i === posts.length - 1 ? "border-0" : ""} ${clickableRows ? "cursor-pointer hover:bg-blue-50/40" : "hover:bg-gray-50/50"}`}
            >
              <td className="px-5 py-4 text-sm font-bold text-gray-700">{p.id}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0072D1] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {p.ownerName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "SP"}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{p.ownerName || "Service Provider"}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />{p.category}
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-gray-500 font-medium">{toDateSafe(p.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-4"><Badge status={p.status.toUpperCase()} /></td>
              <td className="px-5 py-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  {p.status === "pending" && (
                    <button className="w-7 h-7 rounded-lg text-[#0072D1] border border-[#0072D1]/20 flex items-center justify-center hover:bg-blue-50 transition-colors"><CheckCircle className="w-3.5 h-3.5" /></button>
                  )}
                  <button className="w-7 h-7 rounded-lg text-gray-400 border border-gray-200 flex items-center justify-center hover:border-[#0072D1] hover:text-[#0072D1] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button className="w-7 h-7 rounded-lg text-gray-400 border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="md:hidden divide-y divide-gray-100">
      {posts.map((p: Post) => (
        <div key={p.id} onClick={() => clickableRows && onRowClick?.(p.id)} className={`p-4 ${clickableRows ? "cursor-pointer hover:bg-blue-50/40 active:bg-blue-50" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{p.id}</span>
            <Badge status={p.status.toUpperCase()} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#0072D1] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {p.ownerName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "SP"}
            </div>
            <span className="text-sm font-bold text-gray-900">{p.ownerName || "Service Provider"}</span>
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-xs text-gray-400">{p.category} · {toDateSafe(p.createdAt).toLocaleDateString()}</span>
            <div className="flex gap-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              {p.status === "pending" && <button className="h-8 rounded-lg text-[#0072D1] bg-blue-50/50 border border-[#0072D1]/20 flex items-center justify-center px-3"><CheckCircle className="w-4 h-4" /></button>}
              <button className="h-8 rounded-lg text-gray-500 border border-gray-200 flex items-center justify-center px-3"><Pencil className="w-4 h-4" /></button>
              <button className="h-8 rounded-lg text-red-400 border border-gray-200 flex items-center justify-center px-3"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {clickableRows && <p className="text-[10px] text-[#0072D1] font-semibold mt-3 text-center bg-blue-50/50 py-1.5 rounded-lg">Tap card to review details →</p>}
        </div>
      ))}
    </div>
  </>
);

// ─── Post Management Section ──────────────────────────────────────────────────

const PostManagement = ({ posts }: { posts: Post[] }) => {
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "in_progress">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalPosts = posts.length;
  const pendingCount = posts.filter((p) => p.status === "pending").length;
  const approvedCount = posts.filter((p) => p.status === "approved").length;
  const activeProviderCount = new Set(posts.filter((p) => p.status === "approved").map((p) => p.serviceProviderId)).size;

  const tabs = [
    { key: "all" as const,         label: "All Requests", count: totalPosts },
    { key: "pending" as const,     label: "Pending",      count: pendingCount },
    { key: "approved" as const,    label: "Approved",     count: approvedCount },
    { key: "in_progress" as const, label: "In Progress",  count: posts.filter((p) => p.status === "rejected").length },
  ];

  const visiblePosts =
    tab === "all"         ? posts :
    tab === "pending"     ? posts.filter((p) => p.status === "pending") :
    tab === "approved"    ? posts.filter((p) => p.status === "approved") :
                            posts.filter((p) => p.status === "rejected");

  const selectedPost = posts.find((p) => p.id === selectedId);

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Post Management</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Overview and control of active service requests across the platform.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex gap-0 border-b border-gray-100 overflow-x-auto px-2 scrollbar-hide">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${tab === t.key ? "text-[#0072D1] border-[#0072D1]" : "text-gray-500 border-transparent hover:text-[#0072D1]"}`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-[#0072D1] text-white" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-b border-gray-100">
            {[
              { label: "TOTAL POSTS",  value: totalPosts.toLocaleString(),          labelColor: "text-gray-500",  borderRight: true },
              { label: "PENDING",      value: pendingCount.toLocaleString(),         labelColor: "text-orange-500", borderRight: true },
              { label: "APPROVED",     value: approvedCount.toLocaleString(),        labelColor: "text-blue-600",  borderRight: true },
              { label: "ACTIVE PROS",  value: activeProviderCount.toLocaleString(),  labelColor: "text-green-600", accentLeft: true },
            ].map((s, i) => (
              <div key={i} className={`p-4 md:p-5 hover:bg-gray-50/70 transition-colors cursor-default ${s.borderRight ? "md:border-r border-gray-100" : ""} ${s.accentLeft ? "lg:border-l-4 lg:border-l-green-500" : ""} ${i % 2 === 0 ? "border-r border-gray-100 lg:border-r-0" : ""} ${i < 2 ? "border-b border-gray-100 lg:border-b-0" : ""}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${s.labelColor}`}>{s.label}</p>
                <p className="text-2xl md:text-3xl font-black text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
          {visiblePosts.length === 0 ? (
            <div className="py-16 text-center"><p className="text-sm text-gray-400 font-medium">No posts found.</p></div>
          ) : (
            <PostsTable posts={visiblePosts} onRowClick={(id) => setSelectedId(id)} clickableRows />
          )}
        </div>
      </div>
      {selectedId && selectedPost && (
        <PostDetailModal postId={selectedId} postData={selectedPost} postStatus={selectedPost.status} onClose={() => setSelectedId(null)} onApprove={() => {}} onDecline={() => {}} viewOnly={selectedPost.status !== "pending"} />
      )}
    </>
  );
};

// ─── Approval Section ─────────────────────────────────────────────────────────

const Approval = ({ posts, onPostsChange }: { posts: Post[]; onPostsChange: () => void }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pendingPosts = posts.filter((p) => p.status === "pending");
  const selectedPost = pendingPosts.find((p) => p.id === selectedId);

  const handleApprove = async () => {
    if (!selectedId) return;
    try {
      setActionLoading(true);
      await updateDoc(doc(db, "posts", selectedId), {
        status: "approved",
        rejectionReason: "",
        updatedAt: serverTimestamp(),
      });
      alert("Post approved successfully!");
      setSelectedId(null);
      onPostsChange();
    } catch { alert("Failed to approve post"); }
    finally { setActionLoading(false); }
  };

  const handleRejectConfirm = async () => {
    if (!pendingRejectId || !rejectionReason.trim()) { alert("Please provide a rejection reason"); return; }
    try {
      setActionLoading(true);
      await updateDoc(doc(db, "posts", pendingRejectId), {
        status: "rejected",
        rejectionReason,
        updatedAt: serverTimestamp(),
      });
      alert("Post rejected successfully!");
      setShowRejectModal(false); setRejectionReason(""); setPendingRejectId(null); setSelectedId(null);
      onPostsChange();
    } catch { alert("Failed to reject post"); }
    finally { setActionLoading(false); }
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Pending Approval</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Review and approve service provider posts before they go live.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {pendingPosts.length === 0 ? (
            <div className="py-16 text-center"><p className="text-sm text-gray-400 font-medium">No pending posts awaiting approval.</p></div>
          ) : (
            <PostsTable posts={pendingPosts} onRowClick={(id) => setSelectedId(id)} clickableRows />
          )}
        </div>
      </div>

      {selectedId && selectedPost && (
        <PostDetailModal postId={selectedId} postData={selectedPost} postStatus={selectedPost.status} onClose={() => setSelectedId(null)} onApprove={handleApprove} onDecline={() => { setPendingRejectId(selectedId); setShowRejectModal(true); }} />
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-md">
            <h3 className="text-lg font-black text-gray-900 mb-4">Reject Post</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this post. The provider will see this reason and can resubmit.</p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason..." className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 resize-none" rows={4} />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-bold">Cancel</button>
              <button onClick={handleRejectConfirm} disabled={!rejectionReason.trim() || actionLoading} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Root Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebar] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch in parallel — both use simple getDocs with no composite index
      const [fetchedUsers, fetchedPosts] = await Promise.all([
        fetchAllUsers(),
        fetchAllPosts(),
      ]);

      setUsers(fetchedUsers);
      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Failed to load dashboard data. Check Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalUsers     = users.length;
  const totalProviders = users.filter((u) => u.role === "service_provider").length;
  const totalSeekers   = users.filter((u) => u.role === "seeker").length;
  const pendingPosts   = posts.filter((p) => p.status === "pending").length;
  const approvedPosts  = posts.filter((p) => p.status === "approved").length;
  const rejectedPosts  = posts.filter((p) => p.status === "rejected").length;

  const navItems: { key: Section; label: string; icon: any; badge?: number }[] = [
    { key: "overview",  label: "Overview",         icon: LayoutDashboard },
    { key: "providers", label: "Service Providers", icon: UserCheck },
    { key: "customers", label: "Customers",         icon: Users },
    { key: "posts",     label: "Post Management",   icon: ClipboardList },
    { key: "approval",  label: "Approval",          icon: CheckSquare, badge: pendingPosts },
  ];

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm font-bold text-red-500 text-center max-w-md">{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-[#0072D1] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      );
    }

    switch (section) {
      case "overview":
        return (
          <Overview
            totalUsers={totalUsers} totalProviders={totalProviders} totalSeekers={totalSeekers}
            pendingPosts={pendingPosts} approvedPosts={approvedPosts} rejectedPosts={rejectedPosts}
            loading={loading} posts={posts} users={users} onRefresh={loadData}
          />
        );
      case "providers":
        return (
          <UsersSection
            title="Service Provider Management"
            subtitle="Audit and verify service providers on the platform."
            roleFilter="service_provider"
            users={users} loading={loading}
            statsCards={[
              { label: "Pending Verifications", value: pendingPosts.toString(),                       sub: "Requiring action",          subColor: "text-orange-500" },
              { label: "Active Providers",       value: totalProviders.toString(),                     sub: `+${Math.floor(totalProviders * 0.12)} this month`, subColor: "text-green-500" },
              { label: "Verified Providers",     value: Math.floor(totalProviders * 0.95).toString(), sub: "+5.1%",                     subColor: "text-green-500" },
              { label: "Approved Posts",         value: approvedPosts.toString(),                      sub: "Live on platform",          subColor: "text-gray-400" },
            ]}
          />
        );
      case "customers":
        return (
          <UsersSection
            title="Customer Management"
            subtitle="Manage and monitor service seekers on the platform."
            roleFilter="seeker"
            users={users} loading={loading}
            statsCards={[
              { label: "Total Customers",    value: totalSeekers.toString(),                    sub: "+8.3% this month", subColor: "text-green-500" },
              { label: "Active This Month",  value: Math.floor(totalSeekers * 0.38).toString(), sub: "+5.2%",            subColor: "text-green-500" },
              { label: "New Sign-ups",       value: Math.floor(totalSeekers * 0.05).toString(), sub: "Last 30 days",     subColor: "text-blue-500" },
              { label: "Avg. Session Time",  value: "6.4 min",                                  sub: "Goal: > 5 min",    subColor: "text-gray-400" },
            ]}
          />
        );
      case "posts":
        return <PostManagement posts={posts} />;
      case "approval":
        return <Approval posts={posts} onPostsChange={loadData} />;
    }
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}>
      {mobile && (
        <div className="flex items-center justify-between mb-6">
          
          <button onClick={() => setSidebar(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = section === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setSection(item.key); setSidebar(false); }}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 text-left group ${isActive ? "bg-[#FF5A00] text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full" />}
              <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${!isActive ? "group-hover:scale-110" : ""}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${isActive ? "bg-white/25 text-white" : "bg-[#FF5A00] text-white"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100 flex-shrink-0 z-20">
        
        <div className="flex items-center gap-2">
          {pendingPosts > 0 && (
            <span className="text-[10px] font-black bg-[#FF5A00] text-white px-2 py-0.5 rounded-full animate-pulse">
              {pendingPosts} pending
            </span>
          )}
          <button onClick={() => setSidebar(true)} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          {!loading && pendingPosts > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1.5 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {pendingPosts} post{pendingPosts !== 1 ? "s" : ""} awaiting review
            </div>
          )}
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebar(false)} />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-2xl"><SidebarContent mobile /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-5 md:py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;