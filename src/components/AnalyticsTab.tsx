import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  UserCog,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Send,
  MousePointerClick,
} from 'lucide-react';
import { fetchAllUsers, fetchAllEmployees, fetchNotificationAnalytics } from '@/lib/api';
import LoadingSpinner from './ui/loading-spinner';

const STATUS_COLORS: Record<string, string> = {
  verified: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  unverified: '#6b7280',
};

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const parseMonth = (user: any): string | null => {
  const raw = user?.accountCreatedDateAndTime || user?.accountCreatedBy?.split('/')?.[3];
  if (!raw) return null;
  // Firestore timestamp object
  if (typeof raw === 'object' && raw?._seconds) {
    return new Date(raw._seconds * 1000).toLocaleString('en-US', { month: 'short', year: '2-digit' });
  }
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
  }
  return null;
};

const AnalyticsTab: React.FC = () => {
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['analyticsUsers'],
    queryFn: fetchAllUsers,
  });
  const { data: employees, isLoading: empLoading } = useQuery({
    queryKey: ['analyticsEmployees'],
    queryFn: fetchAllEmployees,
  });
  const { data: notif } = useQuery({
    queryKey: ['notificationAnalytics'],
    queryFn: () => fetchNotificationAnalytics(168),
    retry: 0,
  });

  const userMetrics = useMemo(() => {
    const list = (Array.isArray(users) ? users : []).map((u: any) => ({ id: u.id, ...(u.data || u) }));
    const total = list.length;
    let verified = 0;
    let pending = 0;
    let rejected = 0;
    const genders: Record<string, number> = {};
    const religions: Record<string, number> = {};
    const monthly: Record<string, number> = {};

    list.forEach((u: any) => {
      const status = (u.accountVerificationStatus || 'pending').toLowerCase();
      if (status === 'verified') verified += 1;
      else if (status === 'rejected') rejected += 1;
      else pending += 1;

      const gender = (u.gender || 'unknown').toLowerCase();
      genders[gender] = (genders[gender] || 0) + 1;

      const religion = (u.religion || 'unknown').toLowerCase();
      religions[religion] = (religions[religion] || 0) + 1;

      const month = parseMonth(u);
      if (month) monthly[month] = (monthly[month] || 0) + 1;
    });

    return {
      total,
      verified,
      pending,
      rejected,
      statusData: [
        { name: 'verified', value: verified, color: STATUS_COLORS.verified },
        { name: 'pending', value: pending, color: STATUS_COLORS.pending },
        { name: 'rejected', value: rejected, color: STATUS_COLORS.rejected },
      ].filter((d) => d.value > 0),
      genderData: Object.entries(genders).map(([name, value]) => ({ name, value })),
      religionData: Object.entries(religions)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
      monthlyData: Object.entries(monthly).map(([month, count]) => ({ month, users: count })),
    };
  }, [users]);

  const roleData = useMemo(() => {
    const list = (Array.isArray(employees) ? employees : []).map((e: any) => e.data || e);
    const roles: Record<string, number> = {};
    list.forEach((e: any) => {
      const role = e.role || 'unknown';
      roles[role] = (roles[role] || 0) + 1;
    });
    const total = list.length || 1;
    return Object.entries(roles).map(([role, count]) => ({
      role,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    }));
  }, [employees]);

  const notifMetrics = useMemo(() => {
    const d: any = notif || {};
    const sent = num(d.sent ?? d.totalSent);
    const total = num(d.total ?? d.totalSent ?? sent);
    const failed = num(d.failed ?? d.totalFailed);
    const opened = num(d.opened ?? d.totalOpened);
    const clicked = num(d.clicked ?? d.totalClicked);
    const ctr = sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0';
    return { total, sent, failed, opened, clicked, ctr, hasData: total + sent + failed > 0 };
  }, [notif]);

  if (usersLoading || empLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <LoadingSpinner size={48} />
        <span className="mt-3 text-pink-500">Loading analytics...</span>
      </div>
    );
  }

  const stats = [
    { title: 'Total Users', value: userMetrics.total.toLocaleString(), icon: Users, color: 'bg-blue-500' },
    { title: 'Verified Profiles', value: userMetrics.verified.toLocaleString(), icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Pending Verifications', value: userMetrics.pending.toLocaleString(), icon: Clock, color: 'bg-orange-500' },
    { title: 'Employees', value: (Array.isArray(employees) ? employees.length : 0).toLocaleString(), icon: UserCog, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Live platform metrics from your data</p>
        </div>
        <Badge variant="outline" className="w-fit">
          Real-time Data
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Users registered per month</CardDescription>
          </CardHeader>
          <CardContent>
            {userMetrics.monthlyData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No dated registration data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userMetrics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#db2777" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Verification Status</CardTitle>
            <CardDescription>Current verification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userMetrics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {userMetrics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Religion Distribution</CardTitle>
            <CardDescription>Top religions across users</CardDescription>
          </CardHeader>
          <CardContent>
            {userMetrics.religionData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userMetrics.religionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} className="capitalize" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Role Distribution</CardTitle>
            <CardDescription>Breakdown of employees by role</CardDescription>
          </CardHeader>
          <CardContent>
            {roleData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No employee data.</p>
            ) : (
              <div className="space-y-4">
                {roleData.map((role, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6] }}
                      />
                      <span className="font-medium capitalize">{role.role}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">{role.count}</span>
                      <Badge variant="secondary">{role.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notification analytics */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Bell className="h-5 w-5 text-pink-600" /> Notification Analytics (last 7 days)
        </h2>
        {!notifMetrics.hasData ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-gray-500">
              No notification analytics available for this period.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Send className="h-4 w-4" /> Sent
                </div>
                <div className="text-2xl font-bold">{notifMetrics.sent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" /> Failed
                </div>
                <div className="text-2xl font-bold text-red-600">{notifMetrics.failed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-gray-500 text-sm">Opened</div>
                <div className="text-2xl font-bold">{notifMetrics.opened}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MousePointerClick className="h-4 w-4" /> Clicked
                </div>
                <div className="text-2xl font-bold">{notifMetrics.clicked}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-gray-500 text-sm">CTR</div>
                <div className="text-2xl font-bold text-pink-600">{notifMetrics.ctr}%</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
