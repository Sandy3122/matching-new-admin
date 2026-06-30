
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import UserListTab from './UserListTab';
import EmployeeListTab from './EmployeeListTab';
import EmployeeSearchTab from './EmployeeSearchTab';
import UserRegistrationTab from './UserRegistrationTab';
import UserPasswordResetTab from './UserPasswordResetTab';
import EmployeePasswordResetTab from './EmployeePasswordResetTab';
import ImageVerificationTab from './ImageVerificationTab';
import AccessRightsTab from './AccessRightsTab';
import AnalyticsTab from './AnalyticsTab';
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminProfileTab from './AdminProfileTab';
import PlanEnquiriesTab from './PlanEnquiriesTab';
import ReportedUsersTab from './ReportedUsersTab';
import EmployeeRegistrationTab from './EmployeeRegistrationTab';
import GeneratePdfsTab from './GeneratePdfsTab';
import NotificationSendTab from './notifications/NotificationSendTab';
import NotificationTopicsTab from './notifications/NotificationTopicsTab';
import NotificationCampaignsTab from './notifications/NotificationCampaignsTab';
import NotificationMonitoringTab from './notifications/NotificationMonitoringTab';
import NotificationEventLogsTab from './notifications/NotificationEventLogsTab';
import { useIsMobile } from "@/hooks/use-mobile";

// Persist the selected dashboard tab so a browser refresh — or navigating into
// a user profile and coming back — restores the same tab instead of resetting
// to the default Analytics view.
const ACTIVE_TAB_STORAGE_KEY = 'mj.admin.activeTab';

const getInitialActiveTab = (): string => {
  try {
    return localStorage.getItem(ACTIVE_TAB_STORAGE_KEY) || 'analytics';
  } catch {
    return 'analytics';
  }
};

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(getInitialActiveTab);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Handle tab change with fresh data loading
  const handleTabChange = (tabId: string) => {
    console.log('Changing tab to:', tabId);
    setActiveTab(tabId);
    // Remember the selected tab across refreshes and profile navigation.
    try {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tabId);
    } catch {
      // ignore storage failures (e.g. private mode)
    }
    // Close mobile sidebar when tab changes
    if (isMobile) {
      setSidebarMobileOpen(false);
    }
  };

  const renderContent = () => {
    // Add key prop to force re-render and fresh data fetch when tab changes
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsTab key="analytics" />;
      case 'user-profiles':
        return <UserListTab key="user-profiles" onViewProfile={handleViewProfile} />;
      case 'admin-profile':
        return <AdminProfileTab key="admin-profile" />;
      case 'access-rights':
        return <AccessRightsTab key="access-rights" />;
      case 'add-user':
        return <UserRegistrationTab key="add-user" />;
      case 'user-password-reset':
        return <UserPasswordResetTab key="user-password-reset" />;
      case 'image-verification':
        return <ImageVerificationTab key="image-verification" />;
      case 'employee-search':
        return <EmployeeSearchTab key="employee-search" />;
      case 'get-all-employees':
        return <EmployeeListTab key="get-all-employees" />;
      case 'employee-password-reset':
        return <EmployeePasswordResetTab key="employee-password-reset" />;
      case 'employee-registration':
        return <EmployeeRegistrationTab key="employee-registration" />;
      case 'plan-enquiries':
        return <PlanEnquiriesTab key="plan-enquiries" />;
      case 'reported-users':
        return <ReportedUsersTab key="reported-users" />;
      case 'generate-pdfs':
        return <GeneratePdfsTab key="generate-pdfs" />;
      case 'notification-send':
        return <NotificationSendTab key="notification-send" />;
      case 'notification-topics':
        return <NotificationTopicsTab key="notification-topics" />;
      case 'notification-campaigns':
        return <NotificationCampaignsTab key="notification-campaigns" />;
      case 'notification-monitoring':
        return <NotificationMonitoringTab key="notification-monitoring" />;
      case 'notification-event-logs':
        return <NotificationEventLogsTab key="notification-event-logs" />;
      default:
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  const handleOpenMenu = () => {
    setSidebarMobileOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden">
      <SidebarProvider>
        <div className="flex min-h-screen w-full max-w-full">
          {/* Sidebar */}
          <AppSidebar
            mobileOpen={sidebarMobileOpen}
            setMobileOpen={setSidebarMobileOpen}
            isMobile={isMobile}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-hidden">
            <TopBar
              onLogout={onLogout}
              onMenuClick={handleOpenMenu}
              isMobile={isMobile}
            />
            <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full max-w-full">
              <div className="w-full max-w-full min-w-0">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
