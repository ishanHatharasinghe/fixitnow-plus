import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Calendar,
  Search,
  Filter,
  Home,
  User,
  Edit,
  Trash2,
  X,
  Save,
  Eye,
} from "lucide-react";
import RefreshButton from "../../components/RefreshButton";
import {
  getPostsByStatus,
  updatePost,
  deletePost,
} from "../../firebase/dbService";
import AdminLayout from "./AdminLayout";
import Modal from "../../components/Modal";

const CATEGORIES = [
  "Single Rooms",
  "Double Rooms",
  "Boarding Houses",
  "Hostels",
  "Sharing Rooms",
  "Annexes",
  "Houses",
  "Apartments",
  "Single Bedrooms",
];

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Trincomalee",
  "Batticaloa",
  "Ampara",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

const AdminApprovedPosts = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "info",
    title: "",
    message: "",
    onClose: null,
  });

  // Helper function to show alert modal
  const showAlert = (type, title, message, onClose = null) => {
    setAlertConfig({ type, title, message, onClose });
    setShowAlertModal(true);
  };

  const fetchApprovedPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const approvedPosts = await getPostsByStatus("approved");
      setPosts(approvedPosts);
      setFilteredPosts(approvedPosts);
    } catch (error) {
      console.error("Error fetching approved posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchApprovedPosts(true);
  };

  const filterPosts = useCallback(() => {
    let filtered = [...posts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((post) => post.category === filterCategory);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, filterCategory]);

  useEffect(() => {
    fetchApprovedPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [filterPosts]);

  const handleEdit = (post) => {
    setSelectedPost(post);
    setEditFormData({
      title: post.title || "",
      category: post.category || "",
      location: post.location || "",
      description: post.description || "",
      rent: post.rent || "",
      forWhom: post.forWhom || "",
      email: post.email || "",
      mobile: post.mobile || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const handleViewPost = (post) => {
    setSelectedPostForModal(post);
    setCurrentImageIndex(0);
    setShowPostModal(true);
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPostForModal(null);
    setCurrentImageIndex(0);
  };

  const goToPreviousImage = () => {
    if (
      selectedPostForModal &&
      selectedPostForModal.imageUrls &&
      currentImageIndex > 0
    ) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToNextImage = () => {
    if (
      selectedPostForModal &&
      selectedPostForModal.imageUrls &&
      currentImageIndex < selectedPostForModal.imageUrls.length - 1
    ) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return;

    try {
      setProcessingId(selectedPost.id);
      setShowEditModal(false);

      // Update post in Firestore
      await updatePost(selectedPost.id, {
        title: editFormData.title,
        category: editFormData.category,
        location: editFormData.location,
        description: editFormData.description,
        rent: Number(editFormData.rent),
        forWhom: editFormData.forWhom,
        email: editFormData.email,
        mobile: editFormData.mobile,
      });

      // Update local state
      const updatedPosts = posts.map((post) =>
        post.id === selectedPost.id
          ? { ...post, ...editFormData, rent: Number(editFormData.rent) }
          : post
      );
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
    } catch (error) {
      console.error("Error updating post:", error);
      showAlert(
        "error",
        "Update Failed",
        "Failed to update post. Please try again."
      );
    } finally {
      setProcessingId(null);
      setSelectedPost(null);
      setEditFormData({});
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPost) return;

    try {
      setProcessingId(selectedPost.id);
      setShowDeleteModal(false);

      await deletePost(selectedPost.id);

      // Remove post from list
      setPosts(posts.filter((p) => p.id !== selectedPost.id));
      setFilteredPosts(filteredPosts.filter((p) => p.id !== selectedPost.id));
    } catch (error) {
      console.error("Error deleting post:", error);
      showAlert(
        "error",
        "Delete Failed",
        "Failed to delete post. Please try again."
      );
    } finally {
      setProcessingId(null);
      setSelectedPost(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3ABBD0]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-montserrat font-bold text-[#263D5D] mb-2">
              Approved Posts Management
            </h1>
            <p className="text-gray-600">
              View, edit, and manage all approved posts on the platform
            </p>
          </div>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={refreshing}
            title="Refresh approved posts"
          />
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Total Approved Posts</p>
            <h3 className="text-4xl font-bold">{posts.length}</h3>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Home className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative lg:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPosts.length} of {posts.length} approved posts
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Approved Posts
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory !== "all"
              ? "No posts match your filters"
              : "No approved posts yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center flex-shrink-0">
                  {post.imageUrls && post.imageUrls.length > 0 ? (
                    <img
                      src={post.imageUrls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home className="w-16 h-16 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#263D5D] mb-2">
                        {post.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{post.location}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{post.ownerName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[#263D5D] font-bold text-lg">
                          <span>Rs. {post.rent?.toLocaleString()}</span>
                          <span className="text-sm font-normal text-gray-500">
                            / month
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3">
                      <button
                        onClick={() => handleViewPost(post)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleEdit(post)}
                        disabled={processingId === post.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="w-5 h-5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(post)}
                        disabled={processingId === post.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Post"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={editFormData.title || ""}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="Enter post title"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                Category *
              </label>
              <select
                name="category"
                value={editFormData.category || ""}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                Location *
              </label>
              <select
                name="location"
                value={editFormData.location || ""}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select location</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {/* For Whom */}
            <div>
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                For Whom *
              </label>
              <select
                name="forWhom"
                value={editFormData.forWhom || ""}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select</option>
                <option value="Students">Students</option>
                <option value="Families">Families</option>
                <option value="Professionals">Professionals</option>
              </select>
            </div>

            {/* Rent */}
            <div>
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                Rent (Rs.) *
              </label>
              <input
                type="number"
                name="rent"
                value={editFormData.rent || ""}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="Enter monthly rent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={editFormData.description || ""}
                onChange={handleEditFormChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent resize-none"
                placeholder="Enter property description"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                name="email"
                value={editFormData.email || ""}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="owner@example.com"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-[#263D5D] mb-2">
                Mobile Number *
              </label>
              <input
                type="text"
                name="mobile"
                value={editFormData.mobile || ""}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="771234567"
                maxLength={9}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-4 py-3 bg-[#3ABBD0] hover:bg-[#2BA9C1] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this post? This action cannot be
            undone and will permanently remove the post from the platform.
          </p>

          {selectedPost && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-semibold text-[#263D5D] mb-1">
                {selectedPost.title}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedPost.location} • Rs.{" "}
                {selectedPost.rent?.toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
            >
              Delete Post
            </button>
          </div>
        </div>
      </Modal>

      {/* Alert Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          if (alertConfig.onClose) {
            alertConfig.onClose();
          }
        }}
        title={alertConfig.title}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                alertConfig.type === "error"
                  ? "bg-red-100"
                  : alertConfig.type === "warning"
                  ? "bg-yellow-100"
                  : alertConfig.type === "success"
                  ? "bg-green-100"
                  : "bg-blue-100"
              }`}
            >
              {alertConfig.type === "error" && (
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {alertConfig.type === "warning" && (
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              )}
              {alertConfig.type === "success" && (
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {alertConfig.type === "info" && (
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-gray-700 whitespace-pre-line">
                {alertConfig.message}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setShowAlertModal(false);
                if (alertConfig.onClose) {
                  alertConfig.onClose();
                }
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                alertConfig.type === "error"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : alertConfig.type === "warning"
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : alertConfig.type === "success"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Post Details Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={closePostModal}
        title="Post Details"
        size="lg"
      >
        {selectedPostForModal && (
          <div className="space-y-6" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {/* Post Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#263D5D] mb-2">
                  {selectedPostForModal.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedPostForModal.location}</span>
                  <span className="text-gray-400">•</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {selectedPostForModal.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Owner: {selectedPostForModal.ownerName}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#263D5D]">
                  Rs. {selectedPostForModal.rent?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>

            {/* Image Gallery */}
            {selectedPostForModal.imageUrls &&
              selectedPostForModal.imageUrls.length > 0 && (
                <div className="relative">
                  <div className="relative h-48 bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={selectedPostForModal.imageUrls[currentImageIndex]}
                      alt={selectedPostForModal.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='16'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                      }}
                    />

                    {/* Image Navigation Arrows */}
                    {selectedPostForModal.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={goToPreviousImage}
                          disabled={currentImageIndex === 0}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-5 h-5 text-[#263D5D]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={goToNextImage}
                          disabled={
                            currentImageIndex ===
                            selectedPostForModal.imageUrls.length - 1
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-5 h-5 text-[#263D5D]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          {currentImageIndex + 1} /{" "}
                          {selectedPostForModal.imageUrls.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            {/* Post Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#263D5D] mb-2">
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedPostForModal.description}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-[#263D5D] mb-2">
                  Property Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-[#3ABBD0]" />
                    <span className="text-gray-700">
                      Category: {selectedPostForModal.category}
                    </span>
                  </div>
                  {selectedPostForModal.forWhom && (
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-[#3ABBD0]" />
                      <span className="text-gray-700">
                        For: {selectedPostForModal.forWhom}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-[#263D5D] mb-2">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  {selectedPostForModal.email && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#3ABBD0]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={`mailto:${selectedPostForModal.email}`}
                        className="text-[#3ABBD0] hover:underline"
                      >
                        {selectedPostForModal.email}
                      </a>
                    </div>
                  )}
                  {selectedPostForModal.mobile && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#3ABBD0]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.949.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={`tel:+94${selectedPostForModal.mobile}`}
                        className="text-[#3ABBD0] hover:underline"
                      >
                        +94 {selectedPostForModal.mobile}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-[#263D5D] mb-2">
                  Submission Details
                </h4>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Created:{" "}
                    {new Date(
                      selectedPostForModal.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
                {selectedPostForModal.editedAt && (
                  <div className="flex items-center gap-2 text-orange-600 mt-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>
                      Edited:{" "}
                      {new Date(
                        selectedPostForModal.editedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={closePostModal}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closePostModal();
                  handleEdit(selectedPostForModal);
                }}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
              >
                Edit Post
              </button>
              <button
                onClick={() => {
                  closePostModal();
                  handleDelete(selectedPostForModal);
                }}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                Delete Post
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminApprovedPosts;
