import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Building2,
  UserCheck,
  Search,
  Filter,
  Mail,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  ArrowLeft,
  ArrowRight,
  X,
  Shield,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  UserX,
  UserCheck as UserCheckIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Globe,
  IdCard,
  Camera,
  Grid3X3,
  List,
} from "lucide-react";
import RefreshButton from "../../components/RefreshButton";
import {
  getAllUsers,
  getUserStatistics,
  deleteUser,
  updateUserDetails,
  getPostsByOwner,
  updateUserRole,
  toggleUserStatus,
} from "../../firebase/dbService";
import { listImagesInFolder } from "../../firebase/storageService";
import AdminLayout from "./AdminLayout";
import Modal from "../../components/Modal";
import {
  getInitials,
  getDisplayName,
  getProfileImageUrl,
  hasProfileImage,
} from "../../utils/profileUtils";

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    boardingOwners: 0,
    boardingFinders: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    role: "",
  });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "info",
    title: "",
    message: "",
    onClose: null,
  });

  // Enhanced modal states
  const [currentModalView, setCurrentModalView] = useState("details"); // "details", "posts", "id-documents"
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [idDocuments, setIdDocuments] = useState([]);
  const [loadingIdDocs, setLoadingIdDocs] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageSet, setCurrentImageSet] = useState([]);
  const [imageModalTitle, setImageModalTitle] = useState("");
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [breadcrumbHistory, setBreadcrumbHistory] = useState([]);
  const [userAccountStatus, setUserAccountStatus] = useState("active");
  const [loadingStatusChange, setLoadingStatusChange] = useState(false);

  // Helper function to show alert modal
  const showAlert = (type, title, message, onClose = null) => {
    setAlertConfig({ type, title, message, onClose });
    setShowAlertModal(true);
  };

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [allUsers, userStats] = await Promise.all([
        getAllUsers(),
        getUserStatistics(),
      ]);
      setUsers(allUsers);
      setStats(userStats);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers(true);
  };

  // Enhanced modal helper functions
  const fetchUserPosts = async (userId) => {
    try {
      setLoadingPosts(true);
      const posts = await getPostsByOwner(userId);
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      showAlert("error", "Error", "Failed to fetch user posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch user posts count when user details modal opens
  const fetchUserPostsCount = async (userId) => {
    try {
      const posts = await getPostsByOwner(userId);
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts count:", error);
      // Don't show alert for this as it's just for count display
    }
  };

  const fetchIdDocuments = async (userId) => {
    try {
      setLoadingIdDocs(true);
      setIdDocuments([]); // Clear previous documents
      
      const idDocs = await listImagesInFolder(`id-documents/${userId}`);
      
      if (idDocs.length === 0) {
        showAlert("info", "No ID Documents", "No ID verification documents found for this user");
        setIdDocuments([]);
        return;
      }
      
      // Categorize documents by type
      const categorizedDocs = idDocs.map(doc => {
        const name = doc.name.toLowerCase();
        let category = 'ID Document';
        let type = 'other';
        
        if (name.includes('front')) {
          category = 'ID Front';
          type = 'front';
        } else if (name.includes('back')) {
          category = 'ID Back';
          type = 'back';
        } else if (name.includes('passport')) {
          category = 'Passport';
          type = 'passport';
        } else if (name.includes('license')) {
          category = 'Driver License';
          type = 'license';
        }
        
        return {
          ...doc,
          category,
          type,
          displayName: category
        };
      });
      
      setIdDocuments(categorizedDocs);
      
      // Show success message with document count
      showAlert("success", "ID Documents Loaded", `Found ${categorizedDocs.length} ID verification document(s)`);
      
    } catch (error) {
      console.error("Error fetching ID documents:", error);
      
      // More specific error handling
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        showAlert("info", "No ID Documents", "No ID verification documents found for this user");
      } else if (error.message.includes('permission')) {
        showAlert("error", "Access Denied", "You don't have permission to view ID documents");
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        showAlert("error", "Network Error", "Failed to load ID documents due to network issues. Please try again.");
      } else {
        showAlert("error", "Error", `Failed to fetch ID documents: ${error.message}`);
      }
      
      setIdDocuments([]);
    } finally {
      setLoadingIdDocs(false);
    }
  };

  const navigateToView = (view) => {
    setBreadcrumbHistory([...breadcrumbHistory, { view: currentModalView, title: "User Details" }]);
    setCurrentModalView(view);
    
    if (view === "posts" && selectedUser) {
      fetchUserPosts(selectedUser.id);
    } else if (view === "id-documents" && selectedUser) {
      fetchIdDocuments(selectedUser.id);
    }
  };

  const navigateBack = () => {
    if (breadcrumbHistory.length > 0) {
      const previous = breadcrumbHistory[breadcrumbHistory.length - 1];
      setBreadcrumbHistory(breadcrumbHistory.slice(0, -1));
      setCurrentModalView(previous.view);
    } else {
      setCurrentModalView("details");
    }
  };

  const openImageModal = (images, title, startIndex = 0) => {
    setCurrentImageSet(images);
    setImageModalTitle(title);
    setSelectedImageIndex(startIndex);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setShowImageModal(true);
  };

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev + 1) % currentImageSet.length);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, [currentImageSet.length]);

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev - 1 + currentImageSet.length) % currentImageSet.length);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, [currentImageSet.length]);

  const handleZoomIn = useCallback(() => {
    setImageZoom(prev => Math.min(prev * 1.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setImageZoom(prev => Math.max(prev / 1.5, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, []);

  const handleImageMouseDown = (e) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleImageMouseMove = (e) => {
    if (isDragging && imageZoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleImageMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (!showImageModal) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
      case 'Escape':
        setShowImageModal(false);
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case '0':
        e.preventDefault();
        handleResetZoom();
        break;
      default:
        break;
    }
  }, [showImageModal, prevImage, nextImage, handleZoomIn, handleZoomOut, handleResetZoom]);

  const handleRoleChange = async (newRole) => {
    if (!selectedUser) return;
    
    try {
      setLoadingStatusChange(true);
      await updateUserRole(selectedUser.id, newRole);
      
      // Update user in list
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...u, role: newRole, userType: newRole } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Update selected user
      setSelectedUser({ ...selectedUser, role: newRole, userType: newRole });
      
      // Update stats based on role change
      const oldRole = selectedUser.role || selectedUser.userType;
      const isBecomingAdmin = newRole === "admin" && oldRole !== "admin";
      const isLeavingAdmin = oldRole === "admin" && newRole !== "admin";
      
      if (isBecomingAdmin) {
        // User is becoming admin - remove from total count and appropriate category
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: prevStats.totalUsers - 1,
          admins: prevStats.admins + 1,
          // Decrease the appropriate category (only if they were not already admin)
          boardingOwners: (oldRole === "boarding_owner" || selectedUser.userType === "boarding_owner") && oldRole !== "admin" ? prevStats.boardingOwners - 1 : prevStats.boardingOwners,
          boardingFinders: (oldRole === "boarding_finder" || selectedUser.userType === "boarding_finder") && oldRole !== "admin" ? prevStats.boardingFinders - 1 : prevStats.boardingFinders,
        }));
      } else if (isLeavingAdmin) {
        // User is leaving admin role - add to total count and appropriate category
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: prevStats.totalUsers + 1,
          admins: prevStats.admins - 1,
          // Increase the appropriate category
          boardingOwners: newRole === "boarding_owner" ? prevStats.boardingOwners + 1 : prevStats.boardingOwners,
          boardingFinders: newRole === "boarding_finder" ? prevStats.boardingFinders + 1 : prevStats.boardingFinders,
        }));
      } else {
        // Role change between non-admin roles - update specific categories
        setStats(prevStats => ({
          ...prevStats,
          boardingOwners: 
            (oldRole === "boarding_owner" || selectedUser.userType === "boarding_owner") && newRole !== "boarding_owner" ? prevStats.boardingOwners - 1 :
            (oldRole !== "boarding_owner" && selectedUser.userType !== "boarding_owner") && newRole === "boarding_owner" ? prevStats.boardingOwners + 1 :
            prevStats.boardingOwners,
          boardingFinders:
            (oldRole === "boarding_finder" || selectedUser.userType === "boarding_finder") && newRole !== "boarding_finder" ? prevStats.boardingFinders - 1 :
            (oldRole !== "boarding_finder" && selectedUser.userType !== "boarding_finder") && newRole === "boarding_finder" ? prevStats.boardingFinders + 1 :
            prevStats.boardingFinders,
        }));
      }
      
      showAlert("success", "Role Updated", `User role changed to ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      showAlert("error", "Update Failed", "Failed to update user role");
    } finally {
      setLoadingStatusChange(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    
    try {
      setLoadingStatusChange(true);
      const newStatus = userAccountStatus === "active" ? "inactive" : "active";
      await toggleUserStatus(selectedUser.id, newStatus === "active");
      
      setUserAccountStatus(newStatus);
      showAlert("success", "Status Updated", `User account ${newStatus}`);
    } catch (error) {
      console.error("Error updating user status:", error);
      showAlert("error", "Update Failed", "Failed to update user status");
    } finally {
      setLoadingStatusChange(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  // Keyboard event listener for image modal
  useEffect(() => {
    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showImageModal, handleKeyDown]);

  useEffect(() => {
    if (users.length > 0) {
      let filtered = [...users];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (user) =>
            getDisplayName(user)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Type filter
      if (filterType !== "all") {
        filtered = filtered.filter(
          (user) => user.role === filterType || user.userType === filterType
        );
      }

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "recent":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "name":
            return getDisplayName(a).localeCompare(getDisplayName(b));
          default:
            return 0;
        }
      });

      setFilteredUsers(filtered);
    }
  }, [users, searchTerm, filterType, sortBy]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeletingUserId(selectedUser.id);
      setShowDeleteModal(false);

      // Show progress alert
      showAlert(
        "info",
        "Deleting User",
        "Comprehensive user deletion in progress. This may take a moment..."
      );

      // Call comprehensive deletion function
      const deletionResults = await deleteUser(selectedUser.id);

      // Check deletion results and show appropriate feedback
      const successCount = [
        deletionResults.userDocument,
        deletionResults.profileImages,
        deletionResults.idDocuments,
        deletionResults.userPosts,
        deletionResults.authAccount
      ].filter(Boolean).length;

      const totalOperations = 5;
      const hasErrors = deletionResults.errors.length > 0;

      if (successCount === totalOperations && !hasErrors) {
        // Complete success
        showAlert(
          "success",
          "User Deleted Successfully",
          `User "${getDisplayName(selectedUser)}" has been completely removed from the system. All associated data including profile images, ID documents, posts, and authentication account have been deleted.`
        );
      } else if (successCount > 0) {
        // Partial success
        const errorDetails = deletionResults.errors.length > 0 
          ? `\n\nSome operations failed:\n${deletionResults.errors.slice(0, 3).join('\n')}${deletionResults.errors.length > 3 ? `\n... and ${deletionResults.errors.length - 3} more errors` : ''}`
          : '';
        
        showAlert(
          "warning",
          "User Partially Deleted",
          `User "${getDisplayName(selectedUser)}" has been partially deleted. ${successCount}/${totalOperations} operations completed successfully.${errorDetails}`
        );
      } else {
        // Complete failure
        throw new Error("All deletion operations failed");
      }

      // Remove user from list only if user document was successfully deleted
      if (deletionResults.userDocument) {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
        setFilteredUsers(filteredUsers.filter((u) => u.id !== selectedUser.id));

        // Update stats
        setStats({
          ...stats,
          // Only decrement totalUsers if the deleted user is not an admin
          totalUsers: selectedUser.role !== "admin" ? stats.totalUsers - 1 : stats.totalUsers,
          boardingOwners:
            selectedUser.role !== "admin" && (selectedUser.role === "boarding_owner" ||
            selectedUser.userType === "boarding_owner")
              ? stats.boardingOwners - 1
              : stats.boardingOwners,
          boardingFinders:
            selectedUser.role !== "admin" && (selectedUser.role === "boarding_finder" ||
            selectedUser.userType === "boarding_finder")
              ? stats.boardingFinders - 1
              : stats.boardingFinders,
          // Update admin count if an admin was deleted
          admins: selectedUser.role === "admin" ? stats.admins - 1 : stats.admins,
        });
      }

    } catch (error) {
      console.error("Error deleting user:", error);
      showAlert(
        "error",
        "Delete Failed",
        `Failed to delete user "${getDisplayName(selectedUser)}". ${error.message}`
      );
    } finally {
      setDeletingUserId(null);
      setSelectedUser(null);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      dateOfBirth: user.dateOfBirth || "",
      role: user.role || user.userType || "boarding_finder",
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setEditingUserId(selectedUser.id);

      await updateUserDetails(selectedUser.id, editFormData);

      // Update user in list
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...u, ...editFormData } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        dateOfBirth: "",
        role: "",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      showAlert(
        "error",
        "Update Failed",
        "Failed to update user. Please try again."
      );
    } finally {
      setEditingUserId(null);
    }
  };

  // Reset enhanced modal state when closing
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setCurrentModalView("details");
    setBreadcrumbHistory([]);
    setUserPosts([]);
    setIdDocuments([]);
    setSelectedUser(null);
    setUserAccountStatus("active");
  };


  const getUserTypeLabel = (user) => {
    const role = user.role || user.userType || "boarding_finder";
    if (role === "admin") return "Admin";
    if (role === "boarding_owner") return "Boarding Owner";
    return "Boarding Finder";
  };

  const getUserTypeBadgeColor = (user) => {
    const role = user.role || user.userType || "boarding_finder";
    if (role === "admin") return "bg-purple-100 text-purple-700";
    if (role === "boarding_owner") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
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
              Users Management
            </h1>
            <p className="text-gray-600">Manage and monitor platform users</p>
          </div>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={refreshing}
            title="Refresh users data"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#3ABBD0]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Users</p>
              <h3 className="text-3xl font-bold text-[#263D5D]">
                {stats.totalUsers}
              </h3>
            </div>
            <div className="w-12 h-12 bg-[#3ABBD0]/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#3ABBD0]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-300/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Boarding Owners</p>
              <h3 className="text-3xl font-bold text-[#263D5D]">
                {stats.boardingOwners}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-300/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Boarding Finders</p>
              <h3 className="text-3xl font-bold text-[#263D5D]">
                {stats.boardingFinders}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative lg:w-56">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="boarding_owner">Boarding Owners</option>
              <option value="boarding_finder">Boarding Finders</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent appearance-none bg-white"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Users Found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== "all"
              ? "No users match your filters"
              : "No users registered yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3ABBD0] to-cyan-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {hasProfileImage(user) ? (
                            <img
                              src={getProfileImageUrl(user)}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            getInitials(user.firstName, user.lastName) || "?"
                          )}
                        </div>
                        <div className="font-semibold text-[#263D5D]">
                          {getDisplayName(user, "Unknown User")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getUserTypeBadgeColor(
                          user
                        )}`}
                      >
                        {getUserTypeLabel(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                            fetchUserPostsCount(user.id);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={editingUserId === user.id}
                          className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit User"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            disabled={deletingUserId === user.id}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#3ABBD0] to-cyan-400 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                      {hasProfileImage(user) ? (
                        <img
                          src={getProfileImageUrl(user)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(user.firstName, user.lastName) || "?"
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-[#263D5D]">
                        {getDisplayName(user, "Unknown User")}
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getUserTypeBadgeColor(
                          user
                        )}`}
                      >
                        {getUserTypeLabel(user)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetailsModal(true);
                      fetchUserPostsCount(user.id);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    disabled={editingUserId === user.id}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {user.role !== "admin" && (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      disabled={deletingUserId === user.id}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Comprehensive User Deletion"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 className="font-semibold text-red-800">Warning: This action is irreversible</h4>
            </div>
            <p className="text-sm text-red-700">
              This will permanently delete the user and ALL associated data from the system.
            </p>
          </div>

          {selectedUser && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-[#263D5D] mb-2">
                User: {getDisplayName(selectedUser)}
              </h4>
              <p className="text-sm text-gray-600 mb-3">{selectedUser.email}</p>
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-800 text-sm">The following data will be deleted:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    User document from Firestore
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Profile images from Firebase Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    ID verification documents (front & back)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    All user posts and associated images
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Firebase Authentication account
                  </li>
                </ul>
              </div>
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
              onClick={handleDeleteUser}
              disabled={deletingUserId === selectedUser?.id}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {deletingUserId === selectedUser?.id ? "Deleting..." : "Delete User Completely"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Enhanced User Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        title={
          <div className="flex items-center gap-3">
            {currentModalView !== "details" && (
              <button
                onClick={navigateBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-[#263D5D]">
                {currentModalView === "details" && "User Details"}
                {currentModalView === "posts" && "User Posts"}
                {currentModalView === "id-documents" && "ID Documents"}
              </h2>
              {breadcrumbHistory.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <span>User Details</span>
                  {breadcrumbHistory.map((item, index) => (
                    <span key={index} className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      {item.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Details View */}
            {currentModalView === "details" && (
              <>
                {/* User Header */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#3ABBD0] to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                    {hasProfileImage(selectedUser) ? (
                      <img
                        src={getProfileImageUrl(selectedUser)}
                        alt="Profile"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          const images = [{ url: getProfileImageUrl(selectedUser), name: "Profile Image" }];
                          openImageModal(images, "Profile Image");
                        }}
                      />
                    ) : (
                      getInitials(selectedUser.firstName, selectedUser.lastName) || "?"
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-[#263D5D]">
                        {getDisplayName(selectedUser, "Unknown User")}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getUserTypeBadgeColor(
                          selectedUser
                        )}`}
                      >
                        {getUserTypeLabel(selectedUser)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          userAccountStatus === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {userAccountStatus === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-600">User ID: {selectedUser.id}</p>
                  </div>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-[#263D5D] font-medium">{selectedUser.email}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <p className="text-[#263D5D] font-medium">
                      {selectedUser.phoneNumber || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </label>
                    <p className="text-[#263D5D] font-medium">
                      {selectedUser.dateOfBirth || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Join Date
                    </label>
                    <p className="text-[#263D5D] font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <p className="text-[#263D5D] font-medium">
                      {selectedUser.address || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  <button
                    onClick={() => navigateToView("posts")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Posts ({userPosts.length || 0})
                  </button>

                  <button
                    onClick={() => navigateToView("id-documents")}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-colors"
                  >
                    <IdCard className="w-4 h-4" />
                    View ID Documents
                  </button>

                  <button
                    onClick={() => handleEditUser(selectedUser)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-semibold hover:bg-green-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit User
                  </button>

                  {/* Role Change Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedUser.role || selectedUser.userType || "boarding_finder"}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      disabled={loadingStatusChange}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent appearance-none bg-white pr-8"
                    >
                      <option value="boarding_finder">Boarding Finder</option>
                      <option value="boarding_owner">Boarding Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Shield className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Status Toggle */}
                  <button
                    onClick={handleStatusToggle}
                    disabled={loadingStatusChange}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                      userAccountStatus === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {userAccountStatus === "active" ? (
                      <>
                        <UserX className="w-4 h-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheckIcon className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* User Posts View */}
            {currentModalView === "posts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[#263D5D]">
                    User Posts ({userPosts.length})
                  </h3>
                </div>

                {loadingPosts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ABBD0]"></div>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No posts found for this user</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPosts.map((post) => (
                      <div key={post.id} className="bg-gray-50 rounded-xl p-4 border">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-[#263D5D] line-clamp-2">
                            {post.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              post.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : post.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{post.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{post.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {post.imageUrls && post.imageUrls.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {post.imageUrls.slice(0, 3).map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Post image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              const images = post.imageUrls.map((url, imageIndex) => ({
                                url,
                                name: `Post Image ${imageIndex + 1}`
                              }));
                              openImageModal(images, post.title, index);
                            }}
                              />
                            ))}
                            {post.imageUrls.length > 3 && (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                +{post.imageUrls.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ID Documents View */}
            {currentModalView === "id-documents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#263D5D]">
                      ID Verification Documents
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {idDocuments.length > 0 ? `${idDocuments.length} document(s) found` : 'No documents available'}
                    </p>
                  </div>
                  {idDocuments.length > 0 && (
                    <button
                      onClick={() => {
                        const images = idDocuments.map((d) => ({
                          url: d.url,
                          name: d.displayName || d.name
                        }));
                        openImageModal(images, "All ID Documents", 0);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3ABBD0] text-white rounded-xl font-semibold hover:bg-[#3ABBD0]/90 transition-colors"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      View All
                    </button>
                  )}
                </div>

                {loadingIdDocs ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ABBD0]"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-[#3ABBD0]/20"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading ID documents...</p>
                    <p className="text-sm text-gray-500 mt-1">Fetching verification images from storage</p>
                  </div>
                ) : idDocuments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IdCard className="w-10 h-10 text-gray-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No ID Documents Found</h4>
                    <p className="text-gray-500">This user hasn't uploaded any ID verification documents yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Document Categories */}
                    {(() => {
                      const categories = {};
                      idDocuments.forEach(doc => {
                        if (!categories[doc.type]) {
                          categories[doc.type] = [];
                        }
                        categories[doc.type].push(doc);
                      });

                      return Object.entries(categories).map(([type, docs]) => (
                        <div key={type} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#3ABBD0]/10 rounded-full flex items-center justify-center">
                              {type === 'front' && <IdCard className="w-4 h-4 text-[#3ABBD0]" />}
                              {type === 'back' && <IdCard className="w-4 h-4 text-[#3ABBD0]" />}
                              {type === 'passport' && <IdCard className="w-4 h-4 text-[#3ABBD0]" />}
                              {type === 'license' && <IdCard className="w-4 h-4 text-[#3ABBD0]" />}
                              {type === 'other' && <IdCard className="w-4 h-4 text-[#3ABBD0]" />}
                            </div>
                            <h4 className="text-lg font-semibold text-[#263D5D]">
                              {docs[0].category}
                              {docs.length > 1 && ` (${docs.length})`}
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {docs.map((doc, index) => (
                              <div key={`${type}-${index}`} className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-[#3ABBD0]/30 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      type === 'front' ? 'bg-green-500' :
                                      type === 'back' ? 'bg-blue-500' :
                                      type === 'passport' ? 'bg-purple-500' :
                                      type === 'license' ? 'bg-orange-500' :
                                      'bg-gray-500'
                                    }`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                      {doc.displayName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => window.open(doc.url, '_blank')}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="Open in new tab"
                                    >
                                      <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = doc.url;
                                        link.download = doc.name;
                                        link.click();
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="Download"
                                    >
                                      <Download className="w-4 h-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="relative group">
                                  <img
                                    src={doc.url}
                                    alt={doc.displayName}
                                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300"
                                    onClick={() => {
                                      const images = idDocuments.map((d) => ({
                                        url: d.url,
                                        name: d.displayName || d.name
                                      }));
                                      openImageModal(images, "ID Documents", idDocuments.indexOf(doc));
                                    }}
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDEwMEgxMDBWNzVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMDAgMTI1TDc1IDEwMEgxMDBWMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5JbWFnZSBFcnJvcjwvdGV4dD4KPC9zdmc+';
                                      e.target.alt = 'Image failed to load';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                  </div>
                                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Click to view
                                  </div>
                                </div>

                                <div className="mt-3 text-xs text-gray-500 truncate" title={doc.name}>
                                  {doc.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                First Name
              </label>
              <input
                type="text"
                value={editFormData.firstName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    firstName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Last Name
              </label>
              <input
                type="text"
                value={editFormData.lastName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, lastName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={editFormData.phoneNumber}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={editFormData.dateOfBirth}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    dateOfBirth: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Role</label>
              <select
                value={editFormData.role}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, role: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
              >
                <option value="boarding_finder">Boarding Finder</option>
                <option value="boarding_owner">Boarding Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 mb-1 block">
                Address
              </label>
              <textarea
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3ABBD0] focus:border-transparent"
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={editingUserId === selectedUser?.id}
              className="flex-1 px-4 py-3 bg-[#3ABBD0] hover:bg-[#3ABBD0]/90 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {editingUserId === selectedUser?.id
                ? "Updating..."
                : "Update User"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Image Gallery Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setImageZoom(1);
          setImagePosition({ x: 0, y: 0 });
        }}
        title={
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xl font-bold text-[#263D5D]">{imageModalTitle}</h2>
              {currentImageSet.length > 1 && (
                <p className="text-sm text-gray-500">
                  {selectedImageIndex + 1} of {currentImageSet.length}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={imageZoom <= 0.5}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Zoom Out (-)"
              >
                <span className="text-lg font-bold">-</span>
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={imageZoom >= 5}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Zoom In (+)"
              >
                <span className="text-lg font-bold">+</span>
              </button>
              <button
                onClick={handleResetZoom}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Reset Zoom (0)"
              >
                Reset
              </button>
            </div>
          </div>
        }
        size="xl"
        showCloseButton={true}
      >
        {currentImageSet.length > 0 && (
          <div className="space-y-4">
            {/* Main Image Display with Zoom */}
            <div 
              className="relative bg-gray-100 rounded-xl overflow-hidden"
              style={{ height: '300px', }}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                onMouseDown={handleImageMouseDown}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                onMouseLeave={handleImageMouseUp}
                onWheel={handleImageWheel}
                style={{ cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <img
                  src={currentImageSet[selectedImageIndex]?.url}
                  alt={currentImageSet[selectedImageIndex]?.name || "Image"}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                    transformOrigin: 'center center'
                  }}
                  draggable={false}
                />
              </div>
              
              {/* Navigation Arrows */}
              {currentImageSet.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                    title="Previous Image (←)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                    title="Next Image (→)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Zoom Controls Overlay */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <span>Zoom: {Math.round(imageZoom * 100)}%</span>
                  {imageZoom > 1 && (
                    <span className="text-xs opacity-75">
                      (Drag to pan)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {currentImageSet.length > 1 && (
              <div className="space-y-3">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Navigation</h4>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 max-h-20">
                  {currentImageSet.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setImageZoom(1);
                        setImagePosition({ x: 0, y: 0 });
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? "border-[#3ABBD0] ring-2 ring-[#3ABBD0]/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentImageSet[selectedImageIndex]?.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Use arrow keys to navigate, +/- to zoom, 0 to reset, Esc to close
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => window.open(currentImageSet[selectedImageIndex]?.url, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3ABBD0] text-white rounded-lg hover:bg-[#3ABBD0]/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentImageSet[selectedImageIndex]?.url;
                    link.download = currentImageSet[selectedImageIndex]?.name || 'image';
                    link.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
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
    </AdminLayout>
  );
};

export default AdminUsers;
