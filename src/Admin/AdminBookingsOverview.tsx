/**
 * AdminBookingsOverview.tsx
 * 
 * A read-only overview of all bookings in the system.
 * This component is STRICTLY ADDITIVE - it does not modify any existing functionality.
 * 
 * Features:
 * - Overview metrics (Total, Pending, Approved, Completed, Declined, Cancelled)
 * - Interactive charts (Bookings over time, Status distribution)
 * - Recent bookings table with filtering
 * - Export functionality by month
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  ChevronDown,
  BarChart2,
  Activity,
  Loader,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "pending" | "approved" | "declined" | "completed" | "cancelled";

interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  customerName: string;
  customerContact: string;
  address: string;
  homeLocation: string;
  bookingDate: Date;
  status: BookingStatus;
  createdByRole: "seeker" | "service_provider" | "admin";
  createdAt: Date;
  updatedAt: Date;
  cancellationReason?: string;
  cancelledBy?: "customer" | "provider" | "admin";
  declinedReason?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateSafe(value: any): Date {
  if (!value) return new Date(0);
  if (typeof value?.toDate === "function") {
    try { return value.toDate(); } catch { return new Date(0); }
  }
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date(0) : value;
  if (typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  return new Date(0);
}

async function fetchAllBookings(): Promise<Booking[]> {
  const snap = await getDocs(collection(db, "bookings"));
  const bookings = snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      customerId: data.customerId || "",
      providerId: data.providerId || "",
      customerName: data.customerName || "",
      customerContact: data.customerContact || "",
      address: data.address || "",
      homeLocation: data.homeLocation || "",
      bookingDate: toDateSafe(data.bookingDate),
      status: data.status || "pending",
      createdByRole: data.createdByRole || "seeker",
      createdAt: toDateSafe(data.createdAt),
      updatedAt: toDateSafe(data.updatedAt),
      cancellationReason: data.cancellationReason || "",
      cancelledBy: data.cancelledBy || undefined,
      declinedReason: data.declinedReason || "",
    } as Booking;
  });
  return bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
  const ref = useRef<HTMLDivElement>(null);
  
  const options = useMemo(() => {
    const now = new Date();
    const opts: { label: string; year: number; month: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push({
        label: d.toLocaleString("default", { month: "long", year: "numeric" }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return opts;
  }, []);

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
            <Calendar className="w-3.5 h-3.5 text-[#0072D1]" />
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

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
    PENDING:    "bg-orange-50 text-orange-500 border border-orange-200",
    APPROVED:   "bg-blue-50 text-blue-600 border border-blue-200",
    COMPLETED:  "bg-green-50 text-green-600 border border-green-200",
    DECLINED:   "bg-red-50 text-red-500 border border-red-200",
    CANCELLED:  "bg-gray-50 text-gray-500 border border-gray-200",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

// ─── Bookings Over Time Chart ────────────────────────────────────────────────

const BookingsOverTimeChart = ({ bookings }: { bookings: Booking[] }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; count: number } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString("default", { month: "short" }), count: 0 });
    }
    bookings.forEach((b) => {
      const d = toDateSafe(b.createdAt);
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diff >= 0 && diff <= 6) months[6 - diff].count++;
    });
    return months;
  }, [bookings]);

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
          <linearGradient id="areaGradBookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF5A00" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FF5A00" stopOpacity="0.01" />
          </linearGradient>
          <filter id="dotGlowBookings">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const gy = h - f * (h - 16);
          return (
            <g key={f}>
              <line x1={pad} y1={gy} x2={w - pad} y2={gy} stroke="#F1F5F9" strokeWidth="1" />
              <text x={pad - 6} y={gy + 4} fontSize="9" fill="#CBD5E1" textAnchor="end">{Math.round(f * max)}</text>
            </g>
          );
        })}
        {hovered !== null && (
          <line x1={xs[hovered]} y1={8} x2={xs[hovered]} y2={h} stroke="#FF5A00" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
        )}
        <path d={area} fill="url(#areaGradBookings)" />
        <path d={line} fill="none" stroke="#FF5A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r={hovered === i ? 8 : 4.5}
              fill={hovered === i ? "#FF5A00" : "#fff"}
              stroke={hovered === i ? "#FF5A00" : "#FF5A00"}
              strokeWidth="2.5"
              filter={hovered === i ? "url(#dotGlowBookings)" : undefined}
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
          <span className="text-gray-400 ml-1">booking{tooltip.count !== 1 ? "s" : ""}</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// ─── Status Distribution Donut ────────────────────────────────────────────────

const BookingStatusDonut = ({ bookings }: { bookings: Booking[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, approved: 0, completed: 0, declined: 0, cancelled: 0 };
    bookings.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return counts;
  }, [bookings]);

  const total = bookings.length;
  if (total === 0) return (
    <div className="flex items-center justify-center h-40 text-xs text-gray-400 font-medium">No booking data yet</div>
  );

  const cx = 80; const cy = 80; const r = 56; const stroke = 20;
  const circ = 2 * Math.PI * r;

  const segments = [
    { label: "Completed", value: statusCounts.completed, color: "#10B981", bg: "bg-green-50", hbg: "#ECFDF5" },
    { label: "Approved", value: statusCounts.approved, color: "#0072D1", bg: "bg-blue-50", hbg: "#EFF6FF" },
    { label: "Pending", value: statusCounts.pending, color: "#FF5A00", bg: "bg-orange-50", hbg: "#FFF7ED" },
    { label: "Declined", value: statusCounts.declined, color: "#EF4444", bg: "bg-red-50", hbg: "#FEF2F2" },
    { label: "Cancelled", value: statusCounts.cancelled, color: "#6B7280", bg: "bg-gray-50", hbg: "#F9FAFB" },
  ];

  let offset = 0;
  const arcs = segments.map((seg, i) => {
    const pct = seg.value / total;
    const dash = pct * circ;
    const arc = { ...seg, idx: i, pct, dash, offset };
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
            {hoveredArc ? hoveredArc.label.toUpperCase() : "TOTAL BOOKINGS"}
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

// ─── Recent Bookings Table ────────────────────────────────────────────────────

const RecentBookingsTable = ({ bookings }: { bookings: Booking[] }) => {
  const recent = bookings.slice(0, 10);
  
  if (recent.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-gray-400 font-medium">
        No recent bookings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {recent.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{booking.id.slice(0, 8)}...</td>
              <td className="px-4 py-3 font-medium text-gray-900">{booking.customerName}</td>
              <td className="px-4 py-3 text-gray-600">{booking.homeLocation}</td>
              <td className="px-4 py-3 text-gray-500">{toDateSafe(booking.bookingDate).toLocaleDateString()}</td>
              <td className="px-4 py-3"><Badge status={booking.status.toUpperCase()} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminBookingsOverview: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllBookings();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const doRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1100);
  };

  useEffect(() => { loadData(); }, []);

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const declinedCount = bookings.filter((b) => b.status === "declined").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  const handleExport = (year: number, month: number, monthLabel: string) => {
    const monthBookings = bookings.filter((b) => {
      const d = toDateSafe(b.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const headers = ["Booking ID", "Customer", "Provider", "Service Location", "Booking Date", "Status", "Created"];
    const rows = monthBookings.map((b) => [
      b.id,
      b.customerName,
      b.providerId.slice(0, 8) + "...",
      b.homeLocation,
      toDateSafe(b.bookingDate).toLocaleDateString(),
      b.status.toUpperCase(),
      toDateSafe(b.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${year}-${String(month + 1).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl md:text-2xl font-black text-gray-900">Bookings Overview</h1>
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
            </span>
          </div>
          <p className="text-sm text-gray-400 font-medium">Monitor all service bookings across the platform.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={doRefresh}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#0072D1] hover:text-[#0072D1] transition-all bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <MonthExportButton onExport={handleExport} label="Export Report" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Total Bookings" rawValue={loading ? 0 : totalBookings} value={loading ? "..." : totalBookings.toLocaleString()} change="+15%" positive icon={Calendar} iconBg="bg-blue-50 text-blue-500" accentColor="#0072D1" />
        <StatCard label="Pending" rawValue={loading ? 0 : pendingCount} value={loading ? "..." : pendingCount.toLocaleString()} change="+8%" positive={false} icon={Clock} iconBg="bg-orange-50 text-orange-500" accentColor="#FF5A00" />
        <StatCard label="Approved" rawValue={loading ? 0 : approvedCount} value={loading ? "..." : approvedCount.toLocaleString()} change="+12%" positive icon={CheckCircle} iconBg="bg-indigo-50 text-indigo-500" accentColor="#6366F1" />
        <StatCard label="Completed" rawValue={loading ? 0 : completedCount} value={loading ? "..." : completedCount.toLocaleString()} change="+20%" positive icon={TrendingUp} iconBg="bg-green-50 text-green-500" accentColor="#10B981" />
        <StatCard label="Declined/Cancelled" rawValue={loading ? 0 : declinedCount + cancelledCount} value={loading ? "..." : (declinedCount + cancelledCount).toLocaleString()} change="-5%" positive icon={XCircle} iconBg="bg-red-50 text-red-500" accentColor="#EF4444" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF5A00]" />
                <h3 className="font-black text-gray-900 text-base">Bookings Over Time</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-0.5 ml-6">Monthly booking activity — hover a point to inspect</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5A00] bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" /> Last 7 Months
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader className="w-6 h-6 text-[#FF5A00] animate-spin" /></div>
          ) : (
            <BookingsOverTimeChart bookings={bookings} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 text-[#0072D1]" />
            <h3 className="font-black text-gray-900 text-base">Booking Status Distribution</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-4 ml-6">Hover segments to inspect</p>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
          ) : (
            <BookingStatusDonut bookings={bookings} />
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-[#0072D1]" />
          <h3 className="font-black text-gray-900 text-base">Recent Bookings</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader className="w-6 h-6 text-[#0072D1] animate-spin" /></div>
        ) : (
          <RecentBookingsTable bookings={bookings} />
        )}
      </div>
    </div>
  );
};

export default AdminBookingsOverview;