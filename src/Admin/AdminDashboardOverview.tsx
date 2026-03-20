import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Home,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText,
  UserCheck,
  Building2,
} from "lucide-react";
import RefreshButton from "../../components/RefreshButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getUserStatistics,
  getPostStatistics,
  getPostsByStatus,
  getAllUsers,
} from "../../firebase/dbService";
import AdminLayout from "./AdminLayout";
import { getDisplayName } from "../../utils/profileUtils";

const COLORS = ["#3ABBD0", "#263D5D", "#8B5CF6", "#F59E0B"];

const AdminDashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    boardingOwners: 0,
    boardingFinders: 0,
    admins: 0,
  });
  const [postStats, setPostStats] = useState({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    declinedPosts: 0,
  });
  const [topPosts, setTopPosts] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [users, posts, recentPosts, allUsers] = await Promise.all([
        getUserStatistics(),
        getPostStatistics(),
        getPostsByStatus("approved"),
        getAllUsers(),
      ]);

      setUserStats(users);
      setPostStats(posts);

      // Get top 3 recent posts
      const sortedPosts = recentPosts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setTopPosts(sortedPosts);

      // Get top 3 users with most posts
      const userPostCounts = {};
      recentPosts.forEach((post) => {
        if (post.ownerId) {
          userPostCounts[post.ownerId] =
            (userPostCounts[post.ownerId] || 0) + 1;
        }
      });

      const topUsersList = Object.entries(userPostCounts)
        .map(([userId, count]) => {
          const user = allUsers.find((u) => u.id === userId);
          return {
            id: userId,
            name: getDisplayName(user, "Unknown User"),
            email: user?.email || "",
            postCount: count,
            rating: user?.rating || 4.5,
          };
        })
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 3);

      setTopUsers(topUsersList);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Mock data for trending chart
  const trendingData = [
    { name: "Jan", users: 800, posts: 150 },
    { name: "Feb", users: 1200, posts: 220 },
    { name: "Mar", users: 1600, posts: 310 },
    { name: "Apr", users: 2000, posts: 400 },
    { name: "May", users: 2400, posts: 450 },
    { name: "Jun", users: 2800, posts: 520 },
    { name: "Jul", users: 3200, posts: 650 },
  ];

  const userDistributionData = [
    { name: "Boarding Owners", value: userStats.boardingOwners },
    { name: "Boarding Finders", value: userStats.boardingFinders },
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend, link }) => (
    <Link
      to={link}
      className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-[#3ABBD0]/30 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-[#263D5D]">{value}</h3>
        </div>
        <div
          className={`w-12 h-12 ${color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-500">{trend}</span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </Link>
  );

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
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={refreshing}
            title="Refresh dashboard data"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Users"
          value={userStats.totalUsers}
          icon={Users}
          color="bg-[#3ABBD0]"
          trend="+12%"
          link="/admin/users"
        />
        <StatCard
          title="Total Posts"
          value={postStats.approvedPosts + postStats.pendingPosts}
          icon={Home}
          color="bg-purple-500"
          trend="+8%"
          link="/admin/pending-posts"
        />
        <StatCard
          title="Pending Posts"
          value={postStats.pendingPosts}
          icon={Clock}
          color="bg-amber-500"
          trend={postStats.pendingPosts > 0 ? "Needs review" : "All clear"}
          link="/admin/pending-posts"
        />
        <StatCard
          title="Boarding Owners"
          value={userStats.boardingOwners}
          icon={Building2}
          color="bg-blue-500"
          trend="+5%"
          link="/admin/users"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trending Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#263D5D] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3ABBD0"
                strokeWidth={3}
                dot={{ fill: "#3ABBD0", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke="#263D5D"
                strokeWidth={3}
                dot={{ fill: "#263D5D", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#263D5D] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Posts and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Posts */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#263D5D] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Trending Posts
          </h2>
          <div className="space-y-4">
            {topPosts.length > 0 ? (
              topPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3ABBD0] to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#263D5D] truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {post.location} • Rs. {post.rent?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No trending posts yet
              </p>
            )}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#263D5D] mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Top Users
          </h2>
          <div className="space-y-4">
            {topUsers.length > 0 ? (
              topUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#263D5D] to-gray-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#263D5D] truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.postCount} posts
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-semibold text-[#263D5D]">
                      {user.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No user data available
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardOverview;
