import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  CheckSquare,
  ChevronDown,
  TrendingUp,
  Clock,
  Download,
  Eye,
  Settings,
  Shield,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "overview" | "providers" | "customers" | "posts" | "approval";
type Tab = "all" | "pending" | "approved" | "progress";

// ─── Sample data ──────────────────────────────────────────────────────────────

const USERS = [
  {
    id: 1,
    name: "Marcus Thorne",
    email: "marcus.t@example.com",
    role: "Provider",
    status: "PENDING",
    date: "Oct 24, 2023",
    avatar: "MT"
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    email: "s.jenkins@webmail.com",
    role: "Seeker",
    status: "ACTIVE",
    date: "Oct 21, 2023",
    avatar: "SJ"
  },
  {
    id: 3,
    name: "David Chen",
    email: "d.chen@services.io",
    role: "Provider",
    status: "VERIFIED",
    date: "Sep 15, 2023",
    avatar: "DC"
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    email: "elena.rod@provider.com",
    role: "Provider",
    status: "PENDING",
    date: "Oct 25, 2023",
    avatar: "ER"
  }
];

const POSTS = [
  {
    id: "#SR-9021",
    customer: "Alex Johnson",
    initials: "AJ",
    color: "bg-blue-500",
    service: "Plumber",
    date: "Oct 24, 2023",
    status: "PENDING"
  },
  {
    id: "#SR-9022",
    customer: "Maria Garcia",
    initials: "MG",
    color: "bg-purple-500",
    service: "Electrician",
    date: "Oct 23, 2023",
    status: "APPROVED"
  },
  {
    id: "#SR-9023",
    customer: "James Smith",
    initials: "JS",
    color: "bg-green-500",
    service: "HVAC",
    date: "Oct 22, 2023",
    status: "IN PROGRESS"
  },
  {
    id: "#SR-9024",
    customer: "Linda Chen",
    initials: "LC",
    color: "bg-orange-500",
    service: "Carpenter",
    date: "Oct 21, 2023",
    status: "PENDING"
  }
];

const ACTIVITIES = [
  {
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    title: "New Provider applied for Plumber role",
    time: "2 minutes ago"
  },
  {
    icon: CheckCircle,
    color: "bg-green-100 text-green-600",
    title: "Booking Completed – ID #48291",
    time: "15 minutes ago"
  },
  {
    icon: AlertCircle,
    color: "bg-red-100 text-red-500",
    title: "Urgent Request for HVAC Repair",
    time: "45 minutes ago"
  },
  {
    icon: CheckSquare,
    color: "bg-yellow-100 text-yellow-600",
    title: "5-Star Review for Maria Garcia",
    time: "1 hour ago"
  }
];

// ─── Mini chart (SVG area chart) ──────────────────────────────────────────────

const BookingChart = () => {
  const pts = [20, 35, 28, 55, 48, 70, 62, 85, 75, 90, 78, 88];
  const w = 600,
    h = 180,
    pad = 20;
  const max = Math.max(...pts);
  const xs = pts.map((_, i) => pad + (i * (w - pad * 2)) / (pts.length - 1));
  const ys = pts.map((p) => h - pad - (p / max) * (h - pad * 2));
  const line = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`)
    .join(" ");
  const area = `${line} L${xs[xs.length - 1]},${h - pad} L${xs[0]},${
    h - pad
  } Z`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return (
    <svg
      viewBox={`0 0 ${w} ${h + 20}`}
      className="w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0072D1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0072D1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path
        d={line}
        fill="none"
        stroke="#0072D1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {months.map((m, i) => (
        <text
          key={m}
          x={pad + (i * (w - pad * 2)) / 6}
          y={h + 16}
          fontSize="11"
          fill="#9CA3AF"
          textAnchor="middle"
        >
          {m}
        </text>
      ))}
    </svg>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  change,
  positive,
  icon: Icon,
  iconBg
}: any) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}
      >
        <Icon className="w-5 h-5" />
      </div>
      {change && (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            positive ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
          }`}
        >
          {change}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-2xl md:text-3xl font-black text-gray-900">{value}</p>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const Badge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    PENDING: "bg-orange-50 text-orange-500 border border-orange-200",
    APPROVED: "bg-blue-50 text-blue-600 border border-blue-200",
    ACTIVE: "bg-green-50 text-green-600 border border-green-200",
    VERIFIED: "bg-teal-50 text-teal-600 border border-teal-200",
    "IN PROGRESS": "bg-gray-100 text-gray-600 border border-gray-200"
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
        map[status] || "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
};

// ─── Overview Section ─────────────────────────────────────────────────────────

const Overview = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-gray-900">
          Overview Dashboard
        </h1>
        <p className="text-sm text-gray-400 font-medium mt-0.5">
          Monitoring local service activity across the metropolitan area.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#0072D1] transition-colors bg-white">
          <Clock className="w-3.5 h-3.5" /> This Month
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#0072D1] transition-colors bg-white">
          <Download className="w-3.5 h-3.5" /> Export Data
        </button>
      </div>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard
        label="Total Users"
        value="24,512"
        change="+12.5%"
        positive
        icon={Users}
        iconBg="bg-blue-50 text-blue-500"
      />
      <StatCard
        label="Active Providers"
        value="1,842"
        change="+3.2%"
        positive
        icon={UserCheck}
        iconBg="bg-orange-50 text-orange-500"
      />
      <StatCard
        label="Pending Requests"
        value="48"
        change="+18%"
        positive={false}
        icon={ClipboardList}
        iconBg="bg-red-50 text-red-500"
      />
      <StatCard
        label="Total Revenue"
        value="$142.8k"
        change="+24%"
        positive
        icon={TrendingUp}
        iconBg="bg-green-50 text-green-500"
      />
    </div>

    {/* Chart + Activities */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-black text-gray-900 text-base">
              Booking Trends
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Monthly service volume analysis
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl">
            Last 7 Months
          </span>
        </div>
        <BookingChart />
      </div>

      {/* Recent activities */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
        <h3 className="font-black text-gray-900 text-base mb-4">
          Recent Activities
        </h3>
        <div className="space-y-4 flex-1">
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-xl ${a.color} flex items-center justify-center flex-shrink-0`}
              >
                <a.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 leading-snug">
                  {a.title}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {a.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-[#0072D1] hover:bg-blue-50 transition-colors">
          View All Logs
        </button>
      </div>
    </div>
  </div>
);

// ─── Users Table (used by Service Providers & Customers) ─────────────────────

const UsersSection = ({
  title,
  subtitle,
  roleFilter, // "Provider" | "Seeker"
  statsCards,
  totalCount
}: {
  title: string;
  subtitle: string;
  roleFilter: "Provider" | "Seeker";
  statsCards: { label: string; value: string; sub: string; subColor: string }[];
  totalCount: string;
}) => {
  // Filter USERS to only the relevant role
  const filteredUsers = USERS.filter((u) => u.role === roleFilter);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">
            {title}
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-gray-300 bg-white transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5A00] text-white text-xs font-bold hover:bg-black transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>
      </div>

      {/* Mini stats (passed per section) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((s, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
          >
            <p className="text-xs text-gray-400 font-semibold mb-1">
              {s.label}
            </p>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className={`text-xs font-semibold mt-1 ${s.subColor}`}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500">
            {filteredUsers.length}{" "}
            {roleFilter === "Provider" ? "providers" : "seekers"} found
          </p>
          <div className="flex items-center gap-2">
            {["Status: All", "Verification: Any"].map((f) => (
              <button
                key={f}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:border-[#0072D1] bg-white transition-colors"
              >
                {f} <ChevronDown className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["NAME", "ROLE", "STATUS", "JOIN DATE", "ACTIONS"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-black text-gray-400 tracking-widest uppercase px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-gray-400 font-medium"
                  >
                    No{" "}
                    {roleFilter === "Provider"
                      ? "service providers"
                      : "customers"}{" "}
                    found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                      i === filteredUsers.length - 1 ? "border-0" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0072D1] to-blue-400 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {u.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit
                        ${
                          u.role === "Provider"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.role === "Provider"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={u.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                      {u.date}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {u.status === "PENDING" && (
                          <button className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-100 transition-colors">
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u.status === "ACTIVE" && (
                          <button className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u.status === "VERIFIED" && (
                          <button className="w-8 h-8 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center hover:bg-teal-100 transition-colors">
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">
              No {roleFilter === "Provider" ? "service providers" : "customers"}{" "}
              found.
            </p>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0072D1] to-blue-400 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {u.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={u.status} />
                  <button className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">
            Showing 1 to {filteredUsers.length} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#0072D1] hover:text-[#0072D1] transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors
                ${
                  p === 1
                    ? "bg-[#0072D1] text-white"
                    : "border border-gray-200 text-gray-600 hover:border-[#0072D1]"
                }`}
              >
                {p}
              </button>
            ))}
            <span className="text-gray-400 text-xs px-1">...</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#0072D1] hover:text-[#0072D1] transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Post detail data (extra fields shown in the detail view) ─────────────────

const POST_DETAILS: Record<
  string,
  {
    title: string;
    location: string;
    description: string;
    includedServices: string;
    clientMaterials: string;
    pricingModel: string;
    startingPrice: string;
    inspectionFee: string;
    specificCities: string;
    travelDistance: string;
    availableDays: string;
    availableHours: string;
    emergency: string;
    images: string[];
  }
> = {
  "#SR-9021": {
    title: "Expert House Plumber – Fast Leak Repairs",
    location: "Western Province",
    description:
      "Professional plumber with 10 years of experience. Specializing in home plumbing, leak repairs, PVC pipe installations, and water pump setups.",
    includedServices:
      "Tap repairs, drain cleaning, water tank installation, pipe routing, commode fitting",
    clientMaterials: "Yes",
    pricingModel: "Upon Inspection",
    startingPrice: "LKR 1,500",
    inspectionFee: "LKR 1,000",
    specificCities: "Moratuwa, Panadura, Ratmalana",
    travelDistance: "15 km",
    availableDays:
      "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
    availableHours: "07:00 AM – 07:00 PM",
    emergency: "Yes",
    images: Array(5).fill(
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=700&q=80"
    )
  },
  "#SR-9022": {
    title: "Certified Electrician – Wiring & Repairs",
    location: "Central Province",
    description:
      "Experienced electrician offering wiring, rewiring, fault detection and repair services for homes and businesses.",
    includedServices:
      "Wiring, fuse box upgrades, fault detection, socket installation",
    clientMaterials: "No",
    pricingModel: "Fixed Price",
    startingPrice: "LKR 2,000",
    inspectionFee: "LKR 500",
    specificCities: "Kandy, Matale",
    travelDistance: "10 km",
    availableDays: "Monday, Tuesday, Wednesday, Thursday, Friday",
    availableHours: "08:00 AM – 06:00 PM",
    emergency: "No",
    images: Array(5).fill(
      "https://images.unsplash.com/photo-1621905251189-08b45249f55b?w=700&q=80"
    )
  },
  "#SR-9023": {
    title: "HVAC Technician – AC Installation & Service",
    location: "Southern Province",
    description:
      "Qualified HVAC specialist with expertise in installation, servicing, and repair of all air conditioning brands.",
    includedServices:
      "AC installation, gas refilling, filter cleaning, duct repair",
    clientMaterials: "No",
    pricingModel: "Hourly Rate",
    startingPrice: "LKR 3,500",
    inspectionFee: "LKR 1,500",
    specificCities: "Galle, Matara",
    travelDistance: "20 km",
    availableDays: "Monday, Wednesday, Friday, Saturday",
    availableHours: "09:00 AM – 05:00 PM",
    emergency: "Yes",
    images: Array(5).fill(
      "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=700&q=80"
    )
  },
  "#SR-9024": {
    title: "Skilled Carpenter – Custom Woodwork",
    location: "Northern Province",
    description:
      "Expert carpenter specializing in custom furniture, cabinetry, and structural woodwork for residential projects.",
    includedServices:
      "Furniture making, cabinet installation, door fitting, wood repairs",
    clientMaterials: "Yes",
    pricingModel: "Negotiable",
    startingPrice: "LKR 5,000",
    inspectionFee: "LKR 0",
    specificCities: "Jaffna, Vavuniya",
    travelDistance: "25 km",
    availableDays: "Tuesday, Thursday, Saturday, Sunday",
    availableHours: "07:30 AM – 04:30 PM",
    emergency: "No",
    images: Array(5).fill(
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=700&q=80"
    )
  }
};

// ─── Post Detail Modal Popup ──────────────────────────────────────────────────

const PostDetailModal = ({
  postId,
  postStatus,
  onClose,
  onApprove,
  onDecline,
  viewOnly = false
}: {
  postId: string;
  postStatus: string;
  onClose: () => void;
  onApprove: () => void;
  onDecline: () => void;
  viewOnly?: boolean;
}) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [actionDone, setActionDone] = useState<"approved" | "declined" | null>(
    null
  );

  const d = POST_DETAILS[postId];

  // Lock body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!d) return null;

  const infoRows = [
    { label: "Included Services Checklist", value: d.includedServices },
    {
      label: "Requirement of Client Provided Materials",
      value: d.clientMaterials
    },
    { label: "Pricing Model", value: d.pricingModel },
    { label: "Starting Price", value: d.startingPrice },
    { label: "Inspection Fee", value: d.inspectionFee },
    { label: "Specific Cities", value: d.specificCities },
    { label: "Maximum Travel Distance", value: d.travelDistance },
    { label: "Available Days", value: d.availableDays },
    { label: "Available Hours", value: d.availableHours },
    { label: "Emergency Availability", value: d.emergency }
  ];

  const handleApprove = () => {
    setActionDone("approved");
    onApprove();
  };
  const handleDecline = () => {
    setActionDone("declined");
    onDecline();
  };

  return (
    // Full-screen backdrop
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6">
      {/* Dimmed overlay — click to close */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border-2 border-[#0072D1]/25
        flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500">
              Post Management
            </span>
            <span className="text-gray-300 text-xs">›</span>
            <span className="text-xs font-bold text-gray-400">{postId}</span>
            <Badge status={postStatus} />
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-500
              flex items-center justify-center text-gray-500 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 p-5 md:p-7">
          {/* Title + location */}
          <h2 className="font-black text-gray-900 text-lg md:text-xl leading-tight mb-1 pr-4">
            {d.title}
          </h2>
          <div className="flex items-center gap-1.5 text-gray-400 mb-6">
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-xs font-medium">{d.location}</span>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* LEFT: image carousel + description */}
            <div className="w-full md:w-[52%] flex-shrink-0">
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-5">
                <img
                  src={d.images[imgIdx]}
                  alt={d.title}
                  className="w-full h-48 md:h-64 object-cover"
                />
                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  {d.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`rounded-full transition-all duration-200 ${
                        i === imgIdx
                          ? "bg-[#0072D1] w-5 h-2.5"
                          : "bg-gray-400/70 w-2.5 h-2.5 hover:bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Details heading + description */}
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <h3 className="font-black text-gray-800 text-base">Details</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {d.description}
              </p>
            </div>

            {/* RIGHT: info rows */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                {infoRows.map(({ label, value }) => (
                  <p key={label} className="text-sm text-gray-800 leading-snug">
                    <span className="font-black">{label}: </span>
                    <span className="font-normal text-gray-600">{value}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky footer: action buttons ── */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-5 md:px-7 py-4 border-t border-gray-100 bg-white">
          {viewOnly ? (
            // View-only mode (Approval section) — just a close button
            <button
              onClick={onClose}
              className="relative overflow-hidden px-8 py-2.5 rounded-full border-2 border-gray-300
                text-gray-600 font-bold text-sm hover:border-[#0072D1] hover:text-[#0072D1]
                transition-all duration-200"
            >
              Close
            </button>
          ) : actionDone === null ? (
            <>
              <button
                onClick={handleDecline}
                className="relative overflow-hidden w-36 bg-red-500 text-white font-bold py-3 rounded-full
                  transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-md"
              >
                <span className="relative z-10">Decline</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700 rounded-full"
                />
              </button>
              <button
                onClick={handleApprove}
                className="relative overflow-hidden w-36 bg-[#0072D1] text-white font-bold py-3 rounded-full
                  transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-md"
              >
                <span className="relative z-10">Approve</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700 rounded-full"
                />
              </button>
            </>
          ) : (
            <div
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl
              ${
                actionDone === "approved"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {actionDone === "approved" ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <p
                className={`text-sm font-bold ${
                  actionDone === "approved" ? "text-green-700" : "text-red-600"
                }`}
              >
                {actionDone === "approved"
                  ? "Post approved successfully!"
                  : "Post has been declined."}
              </p>
              <button
                onClick={onClose}
                className="ml-3 text-xs font-bold text-gray-400 hover:text-gray-700 underline transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Shared posts table (used by PostManagement and Approval) ─────────────────

const PostsTable = ({
  posts,
  onRowClick,
  clickableRows = false
}: {
  posts: typeof POSTS;
  onRowClick?: (id: string) => void;
  clickableRows?: boolean;
}) => (
  <>
    {/* Desktop table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {[
              "REQUEST ID",
              "CUSTOMER",
              "SERVICE TYPE",
              "DATE",
              "STATUS",
              "ACTIONS"
            ].map((h) => (
              <th
                key={h}
                className="text-left text-[10px] font-black text-gray-400 tracking-widest uppercase px-5 py-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((p, i) => (
            <tr
              key={p.id}
              onClick={() => clickableRows && onRowClick?.(p.id)}
              className={`border-b border-gray-50 transition-colors ${
                i === posts.length - 1 ? "border-0" : ""
              }
                ${
                  clickableRows
                    ? "cursor-pointer hover:bg-blue-50/40 hover:border-[#0072D1]/10"
                    : "hover:bg-gray-50/50"
                }`}
            >
              <td className="px-5 py-4 text-sm font-bold text-gray-700">
                {p.id}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full ${p.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}
                  >
                    {p.initials}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {p.customer}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {p.service}
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-gray-500 font-medium">
                {p.date}
              </td>
              <td className="px-5 py-4">
                <Badge status={p.status} />
              </td>
              <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  {p.status === "PENDING" && (
                    <button className="w-7 h-7 rounded-lg text-[#0072D1] border border-[#0072D1]/20 flex items-center justify-center hover:bg-blue-50 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button className="w-7 h-7 rounded-lg text-gray-400 border border-gray-200 flex items-center justify-center hover:border-[#0072D1] hover:text-[#0072D1] transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-lg text-gray-400 border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile list */}
    <div className="md:hidden divide-y divide-gray-100">
      {posts.map((p) => (
        <div
          key={p.id}
          onClick={() => clickableRows && onRowClick?.(p.id)}
          className={`p-4 ${
            clickableRows
              ? "cursor-pointer hover:bg-blue-50/40 active:bg-blue-50"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{p.id}</span>
            <Badge status={p.status} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-7 h-7 rounded-full ${p.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}
            >
              {p.initials}
            </div>
            <span className="text-sm font-bold text-gray-900">
              {p.customer}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {p.service} · {p.date}
            </span>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {p.status === "PENDING" && (
                <button className="w-7 h-7 rounded-lg text-[#0072D1] border border-[#0072D1]/20 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              )}
              <button className="w-7 h-7 rounded-lg text-gray-400 border border-gray-200 flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-lg text-gray-400 border border-gray-200 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {clickableRows && (
            <p className="text-[10px] text-[#0072D1] font-semibold mt-2">
              Tap to review →
            </p>
          )}
        </div>
      ))}
    </div>
  </>
);

// ─── Post Management Section ──────────────────────────────────────────────────

const PostManagement = () => {
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All Requests", count: 124 },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "progress", label: "In Progress" }
  ];

  // Post Management only shows unapproved posts (PENDING + IN PROGRESS)
  const unapproved = POSTS.filter((p) => p.status !== "APPROVED");

  const visiblePosts =
    tab === "all"
      ? unapproved
      : tab === "pending"
      ? unapproved.filter((p) => p.status === "PENDING")
      : tab === "approved"
      ? unapproved.filter((p) => p.status === "APPROVED")
      : unapproved.filter((p) => p.status === "IN PROGRESS");

  const selectedPost = unapproved.find((p) => p.id === selectedId);

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">
              Post Management
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">
              Overview and control of active service requests across the
              platform.
            </p>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Tab bar */}
          <div className="flex gap-0 border-b border-gray-100 overflow-x-auto px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                }}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2
                  ${
                    tab === t.key
                      ? "text-[#0072D1] border-[#0072D1]"
                      : "text-gray-500 border-transparent hover:text-[#0072D1]"
                  }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                    ${
                      tab === t.key
                        ? "bg-[#0072D1] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 4 mini-stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-b border-gray-100">
            {[
              {
                label: "TOTAL POSTS",
                value: "1,284",
                labelColor: "text-gray-500",
                borderRight: true
              },
              {
                label: "PENDING",
                value: "18",
                labelColor: "text-orange-500",
                borderRight: true
              },
              {
                label: "APPROVED",
                value: "54",
                labelColor: "text-blue-600",
                borderRight: true
              },
              {
                label: "ACTIVE PROS",
                value: "32",
                labelColor: "text-green-600",
                borderRight: false,
                accentLeft: true
              }
            ].map((s, i) => (
              <div
                key={i}
                className={`p-4 md:p-5 ${
                  s.borderRight ? "border-r border-gray-100" : ""
                } ${s.accentLeft ? "border-l-4 border-l-green-500" : ""}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${s.labelColor}`}
                >
                  {s.label}
                </p>
                <p className="text-2xl md:text-3xl font-black text-gray-900">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Clickable table — click row to open popup */}
          <PostsTable
            posts={visiblePosts}
            onRowClick={(id) => setSelectedId(id)}
            clickableRows
          />
        </div>
      </div>

      {/* Popup modal — rendered at root level so it covers full screen */}
      {selectedId && selectedPost && (
        <PostDetailModal
          postId={selectedId}
          postStatus={selectedPost.status}
          onClose={() => setSelectedId(null)}
          onApprove={() => {}}
          onDecline={() => {}}
        />
      )}
    </>
  );
};

// ─── Approval Section ─────────────────────────────────────────────────────────

const Approval = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Only show approved posts
  const approvedPosts = POSTS.filter((p) => p.status === "APPROVED");
  const selectedPost = approvedPosts.find((p) => p.id === selectedId);

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">
              Approved Posts
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">
              Overview and control of approved service requests across the
              platform.
            </p>
          </div>
        </div>

        {/* Table — approved posts only, clickable to view details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {approvedPosts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400 font-medium">
                No approved posts yet.
              </p>
            </div>
          ) : (
            <PostsTable
              posts={approvedPosts}
              onRowClick={(id) => setSelectedId(id)}
              clickableRows
            />
          )}
        </div>
      </div>

      {/* View-only popup — no Approve/Decline buttons */}
      {selectedId && selectedPost && (
        <PostDetailModal
          postId={selectedId}
          postStatus={selectedPost.status}
          onClose={() => setSelectedId(null)}
          onApprove={() => {}}
          onDecline={() => {}}
          viewOnly
        />
      )}
    </>
  );
};

// ─── Root Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebar] = useState(false);

  const navItems: { key: Section; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "providers", label: "Service Providers", icon: UserCheck },
    { key: "customers", label: "Customers", icon: Users },
    { key: "posts", label: "Post Management", icon: ClipboardList },
    { key: "approval", label: "Approval", icon: CheckSquare }
  ];

  const renderContent = () => {
    switch (section) {
      case "overview":
        return <Overview />;
      case "providers":
        return (
          <UsersSection
            title="Service Provider Management"
            subtitle="Audit and verify service providers on the platform."
            roleFilter="Provider"
            totalCount="1,240 providers"
            statsCards={[
              {
                label: "Pending Verifications",
                value: "42",
                sub: "! 8 High Priority",
                subColor: "text-orange-500"
              },
              {
                label: "Active Providers",
                value: "1,240",
                sub: "+12% this month",
                subColor: "text-green-500"
              },
              {
                label: "Verified Providers",
                value: "1,180",
                sub: "+5.1%",
                subColor: "text-green-500"
              },
              {
                label: "Avg. Verification Time",
                value: "4.2 hrs",
                sub: "Goal: < 6.0 hrs",
                subColor: "text-gray-400"
              }
            ]}
          />
        );
      case "customers":
        return (
          <UsersSection
            title="Customer Management"
            subtitle="Manage and monitor service seekers on the platform."
            roleFilter="Seeker"
            totalCount="8,432 customers"
            statsCards={[
              {
                label: "Total Customers",
                value: "8,432",
                sub: "+8.3% this month",
                subColor: "text-green-500"
              },
              {
                label: "Active This Month",
                value: "3,210",
                sub: "+5.2%",
                subColor: "text-green-500"
              },
              {
                label: "New Sign-ups",
                value: "412",
                sub: "Last 30 days",
                subColor: "text-blue-500"
              },
              {
                label: "Avg. Session Time",
                value: "6.4 min",
                sub: "Goal: > 5 min",
                subColor: "text-gray-400"
              }
            ]}
          />
        );
      case "posts":
        return <PostManagement />;
      case "approval":
        return <Approval />;
    }
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}>
      {mobile && (
        <div className="flex items-center justify-between mb-6">
          <span className="font-rostex text-xl font-black text-[#0072D1]">
            FixIt<span className="text-[#FF5A00]">Now</span>
          </span>
          <button
            onClick={() => setSidebar(false)}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setSection(item.key);
              setSidebar(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 text-left
              ${
                section === item.key
                  ? "bg-[#FF5A00] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
      <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 transition-colors">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebar(false)}
          />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5 md:py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
