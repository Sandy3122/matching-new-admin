import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  UserPlus,
  Shield,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';

// Mock data for analytics
const userRegistrationData = [
  { month: 'Jan', users: 65, employees: 12 },
  { month: 'Feb', users: 59, employees: 15 },
  { month: 'Mar', users: 80, employees: 18 },
  { month: 'Apr', users: 81, employees: 22 },
  { month: 'May', users: 56, employees: 20 },
  { month: 'Jun', users: 95, employees: 25 },
];

const imageVerificationData = [
  { name: 'Verified', value: 245, color: '#10b981' },
  { name: 'Pending', value: 89, color: '#f59e0b' },
  { name: 'Rejected', value: 34, color: '#ef4444' },
];

const userActivityData = [
  { day: 'Mon', logins: 120, registrations: 15 },
  { day: 'Tue', logins: 140, registrations: 22 },
  { day: 'Wed', logins: 180, registrations: 18 },
  { day: 'Thu', logins: 160, registrations: 25 },
  { day: 'Fri', logins: 200, registrations: 30 },
  { day: 'Sat', logins: 90, registrations: 12 },
  { day: 'Sun', logins: 85, registrations: 8 },
];

const roleDistributionData = [
  { role: 'User', count: 1250, percentage: 85.6 },
  { role: 'Admin', count: 125, percentage: 8.6 },
  { role: 'Manager', count: 75, percentage: 5.1 },
  { role: 'Employee', count: 10, percentage: 0.7 },
];

const AnalyticsTab = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,460',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Sessions',
      value: '342',
      change: '+5.2%',
      trend: 'up',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'New Registrations',
      value: '89',
      change: '-2.1%',
      trend: 'down',
      icon: UserPlus,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Verifications',
      value: '23',
      change: '+8.7%',
      trend: 'up',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your platform's performance and user engagement</p>
        </div>
        <Badge variant="outline" className="w-fit">
          Real-time Data
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Monthly user and employee registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userRegistrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="Users" />
                <Bar dataKey="employees" fill="#10b981" name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Image Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Image Verification Status</CardTitle>
            <CardDescription>Current status of uploaded images</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={imageVerificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {imageVerificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Daily user logins and registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="logins"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Logins"
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Breakdown of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleDistributionData.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]
                    }} />
                    <span className="font-medium">{role.role}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{role.count}</span>
                    <Badge variant="secondary">{role.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Verified Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-gray-600">84.5% of total profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="h-4 w-4 text-red-500 mr-2" />
              Rejected Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-gray-600">6.1% of total profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 text-orange-500 mr-2" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">137</div>
            <p className="text-xs text-gray-600">9.4% of total profiles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;