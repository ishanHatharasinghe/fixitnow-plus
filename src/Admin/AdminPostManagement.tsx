/**
 * AdminPostManagement.tsx
 *
 * Drop into your Admin Dashboard wherever you render the post approval queue.
 *
 * KEY FIXES vs previous version:
 *  1. Uses postService.getAllPosts() which only uses orderBy (no where clause)
 *     → no composite Firestore index required.
 *  2. Timestamp → Date conversion is handled safely via toDate().
 *  3. All optimistic UI updates keep Date objects intact.
 *
 * Usage:  <AdminPostManagement />
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { postService } from "../services/postService";
import { adminService } from "../services/adminService";
import { notificationService } from "../services/notificationService";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  X,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PostStatus = "pending" | "approved" | "rejected" | "draft";

interface PostRow {
  id: string;
  title: string;
  category: string;
  location: string;
  ownerName: string;
  email: string;
  mobile: string;
  status: PostStatus;
  rejectionReason?: string;
  createdAt: Date;
  description?: string;
  checklist?: string[];
  pricingModel?: string;
  startingPrice?: string;
  inspectionFee?: string;
  specificCities?: string;
  travelDistance?: string;
  availableDays?: string[];
  timeFromHour?: string;
  timeFromAmPm?: string;
  timeToHour?: string;
  timeToAmPm?: string;
  clientMaterials?: string;
  emergency?: string;
  images?: string[];
  serviceProviderId?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Safely convert a Firestore Timestamp or any date-like value to JS Date */
function toDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: PostStatus }) => {
  const map: Record<PostStatus, { label: string; classes: string; Icon: React.FC<any> }> = {
    pending:  { label: "Pending",  classes: "bg-yellow-100 text-yellow-800", Icon: Clock },
    approved: { label: "Approved", classes: "bg-green-100 text-green-800",   Icon: CheckCircle },
    rejected: { label: "Rejected", classes: "bg-red-100 text-red-800",       Icon: XCircle },
    draft:    { label: "Draft",    classes: "bg-gray-100 text-gray-600",      Icon: Clock },
  };
  const { label, classes, Icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${classes}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ─── Post Details Modal ────────────────────────────────────────────────────────

const PostDetailsModal = ({
  post,
  onClose,
  onApprove,
  onReject,
  processing,
}: {
  post: PostRow;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processing: boolean;
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const rows = [
    { label: "Category",         value: post.category },
    { label: "Location",         value: post.location },
    { label: "Specific Cities",  value: post.specificCities || "—" },
    { label: "Travel Distance",  value: post.travelDistance || "—" },
    { label: "Pricing Model",    value: post.pricingModel || "—" },
    { label: "Starting Price",   value: post.startingPrice ? `LKR ${Number(post.startingPrice).toLocaleString()}` : "—" },
    { label: "Inspection Fee",   value: post.inspectionFee ? `LKR ${Number(post.inspectionFee).toLocaleString()}` : "—" },
    { label: "Client Materials", value: post.clientMaterials || "—" },
    { label: "Available Days",   value: post.availableDays?.join(", ") || "—" },
    { label: "Available Hours",  value: post.timeFromHour ? `${post.timeFromHour}:00 ${post.timeFromAmPm} – ${post.timeToHour}:00 ${post.timeToAmPm}` : "—" },
    { label: "Emergency",        value: post.emergency || "—" },
    { label: "Submitted",        value: toDate(post.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-xl leading-tight pr-8">{post.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-500">{post.location}</span>
              <StatusBadge status={post.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Provider info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#0072D1]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#0072D1]" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{post.ownerName}</p>
              <p className="text-xs text-gray-500">{post.email} · +94 {post.mobile}</p>
            </div>
          </div>

          {/* Description */}
          {post.description && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{post.description}</p>
            </div>
          )}

          {/* Checklist */}
          {post.checklist && post.checklist.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Included Services</p>
              <div className="flex flex-wrap gap-1.5">
                {post.checklist.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#0072D1]/10 text-[#0072D1] text-xs rounded-full font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {rows.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm text-gray-800 font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Rejection reason */}
          {post.status === "rejected" && post.rejectionReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{post.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Footer — actions only for pending posts */}
        {post.status === "pending" && (
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => onApprove(post.id)}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {processing ? "Processing…" : "Approve Post"}
            </button>
            <button
              onClick={() => onReject(post.id)}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {processing ? "Processing…" : "Reject Post"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminPostManagement: React.FC = () => {
  const { currentUser } = useAuth();

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PostStatus>("pending");
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // getAllPosts uses orderBy('createdAt') only — no composite index needed
      const all = await postService.getAllPosts();
      // Ensure every post has a proper JS Date (not a raw Timestamp)
      const normalised = all.map(p => ({
        ...p,
        createdAt: toDate(p.createdAt),
        updatedAt: toDate(p.updatedAt),
      }));
      setPosts(normalised as PostRow[]);
    } catch (err) {
      console.error("Error fetching posts for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // ── Approve ───────────────────────────────────────────────────────────────────

  const handleApprove = async (postId: string) => {
    if (processing) return;
    if (!window.confirm("Approve this post? It will become visible to all seekers.")) return;

    // Capture post data BEFORE any state mutation
    const targetPost = posts.find(p => p.id === postId);

    try {
      setProcessing(true);
      
      // Step 1: Update post status
      await postService.approvePost(postId);
      
      // Step 2: Log admin action (this also updates the post, but that's okay)
      if (currentUser) {
        await adminService.approvePost(
          postId,
          currentUser.uid,
          currentUser.displayName || "Admin"
        );
      }

      // Step 3: Update UI optimistically
      const update = (p: PostRow) =>
        p.id === postId ? { ...p, status: "approved" as PostStatus, rejectionReason: "" } : p;
      setPosts(prev => prev.map(update));
      setSelectedPost(prev => prev ? update(prev) : null);

      // Step 4: Send approval notification to the post owner
      if (targetPost?.serviceProviderId) {
        try {
          await notificationService.createApprovedNotification(
            targetPost.serviceProviderId,
            postId,
            targetPost.title
          );
          console.log(`✅ Approval notification sent to provider ${targetPost.serviceProviderId} for post "${targetPost.title}"`);
        } catch (notifErr) {
          // Non-critical — log but never block the admin action
          console.error("❌ Failed to send approval notification:", notifErr);
        }
      } else {
        console.warn("⚠️ Cannot send notification: serviceProviderId is missing from post");
      }

    } catch (err) {
      console.error("Error approving post:", err);
      alert("Failed to approve post. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────────

  const handleReject = async (postId: string) => {
    if (processing) return;

    const reason = window.prompt("Enter the rejection reason (required):");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    // Capture post data BEFORE any state mutation
    const targetPost = posts.find(p => p.id === postId);

    try {
      setProcessing(true);
      await postService.rejectPost(postId, reason.trim());

      if (currentUser) {
        await adminService.rejectPost(
          postId,
          currentUser.uid,
          currentUser.displayName || "Admin",
          reason.trim()
        );
      }

      const update = (p: PostRow) =>
        p.id === postId ? { ...p, status: "rejected" as PostStatus, rejectionReason: reason.trim() } : p;
      setPosts(prev => prev.map(update));
      setSelectedPost(prev => prev ? update(prev) : null);

      // Step 4: Send rejection notification to the post owner
      if (targetPost?.serviceProviderId) {
        try {
          await notificationService.createRejectedNotification(
            targetPost.serviceProviderId,
            postId,
            targetPost.title,
            reason.trim()
          );
          console.log(`✅ Rejection notification sent to provider ${targetPost.serviceProviderId} for post "${targetPost.title}"`);
        } catch (notifErr) {
          // Non-critical — log but never block the admin action
          console.error("❌ Failed to send rejection notification:", notifErr);
        }
      } else {
        console.warn("⚠️ Cannot send notification: serviceProviderId is missing from post");
      }

    } catch (err) {
      console.error("Error rejecting post:", err);
      alert("Failed to reject post. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────────

  const filteredPosts = posts.filter(post => {
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      post.title?.toLowerCase().includes(term) ||
      post.ownerName?.toLowerCase().includes(term) ||
      post.category?.toLowerCase().includes(term) ||
      post.location?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all:      posts.length,
    pending:  posts.filter(p => p.status === "pending").length,
    approved: posts.filter(p => p.status === "approved").length,
    rejected: posts.filter(p => p.status === "rejected").length,
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Post Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and moderate service provider listings</p>
        </div>
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#0072D1] hover:text-[#0072D1] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards — click to filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["all", "pending", "approved", "rejected"] as const).map(key => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              statusFilter === key
                ? "border-[#0072D1] bg-[#0072D1]/5"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <p className="text-2xl font-black text-gray-900">{counts[key]}</p>
            <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${
              key === "pending"  ? "text-yellow-600" :
              key === "approved" ? "text-green-600"  :
              key === "rejected" ? "text-red-600"    : "text-gray-500"
            }`}>
              {key === "all" ? "Total Posts" : key}
            </p>
          </button>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, provider, category…"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#0072D1] focus:shadow-[0_0_0_4px_rgba(0,114,209,0.08)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072D1]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0072D1]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertCircle className="w-10 h-10 mb-3 text-gray-300" />
            <p className="font-bold text-gray-600">No posts found</p>
            <p className="text-sm mt-1">
              {searchTerm
                ? "Try a different search term."
                : `No ${statusFilter === "all" ? "" : statusFilter + " "}posts yet.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Post</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Provider</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">

                    {/* Post */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 line-clamp-1">{post.title}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-gray-400">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs">{post.location}</span>
                      </div>
                      {post.status === "rejected" && post.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 line-clamp-1">
                          <span className="font-bold">Reason:</span> {post.rejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Provider */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="font-medium text-gray-800">{post.ownerName}</p>
                      <p className="text-xs text-gray-400">{post.email}</p>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="px-2.5 py-1 bg-[#0072D1]/10 text-[#0072D1] text-xs rounded-full font-medium">
                        {post.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">{toDate(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={post.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        {post.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(post.id)}
                              disabled={processing}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-bold disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(post.id)}
                              disabled={processing}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-bold disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
        />
      )}
    </div>
  );
};

export default AdminPostManagement;