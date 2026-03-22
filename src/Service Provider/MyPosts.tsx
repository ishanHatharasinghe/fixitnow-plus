import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { postService } from "../services/postService";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  EyeOff
} from "lucide-react";

const MyPosts: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showResubmitModal, setShowResubmitModal] = useState<string | null>(null);
  useEffect(() => {
    const fetchPosts = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userPosts = await postService.getPostsByServiceProvider(currentUser.uid);
        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await postService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'draft': return <EyeOff className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Resubmit modal component
  const ResubmitModal = () => {
    const rejectedPost = posts.find(p => p.id === showResubmitModal);
    if (!rejectedPost) return null;

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResubmitModal(null)} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-md">
        <button
          onClick={() => setShowResubmitModal(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">Rejection Reason</h3>
          
          {rejectedPost.rejectionReason ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">{rejectedPost.rejectionReason}</p>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">Your post was rejected. Please review and make necessary changes before resubmitting.</p>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowResubmitModal(null);
                navigate(`/add-post/${rejectedPost.id}`);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0072D1] text-white rounded-lg hover:bg-black transition-colors font-bold"
            >
              <Edit3 className="w-4 h-4" />
              Edit & Resubmit
            </button>
            <button
              onClick={() => setShowResubmitModal(null)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="h-48 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">My Posts</h1>
              <p className="text-gray-600 mt-1">Manage your service listings</p>
            </div>
            <button
              onClick={() => navigate('/add-post')}
              className="relative overflow-hidden flex items-center gap-3 px-6 py-3 rounded-xl
                border-2 border-[#0072D1] bg-white text-[#0072D1] font-bold
                transition-all duration-300 hover:bg-black hover:text-white hover:border-black
                hover:scale-105 group shadow-lg"
            >
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add New Post</span>
              <div
                className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                group-hover:translate-x-full transition-transform duration-700 rounded-xl"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#0072D1] focus:shadow-[0_0_0_4px_rgba(0,114,209,0.08)]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#0072D1] focus:shadow-[0_0_0_4px_rgba(0,114,209,0.08)]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#0072D1] focus:shadow-[0_0_0_4px_rgba(0,114,209,0.08)]"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="category">Category</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 border-2 border-gray-100 rounded-xl hover:border-[#0072D1] transition-colors"
                title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                <Filter className={`w-5 h-5 ${sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>

            {/* Count */}
            <div className="flex items-center justify-end text-gray-600">
              <span>{filteredAndSortedPosts.length} post{filteredAndSortedPosts.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredAndSortedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria."
                : "You haven't created any posts yet. Start by adding your first service listing!"}
            </p>
            <button
              onClick={() => navigate('/add-post')}
              className="bg-[#0072D1] text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-video bg-gray-100">
                  {post.images && post.images.length > 0 ? (
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(post.status)}`}>
                      {getStatusIcon(post.status)}
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-black text-gray-900 text-lg leading-tight mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.category}</span>
                    </div>
                  </div>

                  {post.startingPrice && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                      <DollarSign className="w-4 h-4" />
                      <span>From LKR {Number(post.startingPrice).toLocaleString()}</span>
                    </div>
                  )}

                  {post.status === 'rejected' && post.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-bold text-red-600 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-600">{post.rejectionReason}</p>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {post.description || "No description provided"}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResubmitModal(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {post.status === 'rejected' ? (
                      <button
                        onClick={() => navigate(`/add-post/${post.id}`)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FF5A00] text-white rounded-lg hover:bg-black transition-colors text-sm font-bold"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit & Resubmit
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/add-post/${post.id}`)}
                        disabled={post.status === 'approved'}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0072D1] text-white rounded-lg hover:bg-black transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resubmit Modal */}
      {showResubmitModal && <ResubmitModal />}
    </div>
  );
};

export default MyPosts;