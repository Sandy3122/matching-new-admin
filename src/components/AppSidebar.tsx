
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  User,
  Users,
  Search,
  Settings,
  Shield,
  FileText,
  Camera,
  UserPlus,
  BarChart3,
  Send,
  Megaphone,
  Tags,
  Activity,
  ScrollText,
  CreditCard,
  ShieldAlert,
  FileDown,
} from "lucide-react";

// Profile sections for individual user profiles
const profileSections = [
  { id: "profile-admin", title: "Profile Admin", icon: Shield },
  { id: "reset-pin", title: "Reset PIN", icon: Settings },
  { id: "profile-info", title: "Profile Info", icon: FileText },
  { id: "mandatory-details", title: "Mandatory Details", icon: User },
  { id: "personal-details", title: "Personal Details", icon: User },
  { id: "kyc-details", title: "KYC Details", icon: FileText },
  { id: "address", title: "Address", icon: FileText },
  { id: "family-details", title: "Family Details", icon: Users },
  { id: "education-work", title: "Education & Work", icon: FileText },
  { id: "religion-astro", title: "Religion & Astro", icon: FileText },
  { id: "gallery-photo", title: "Gallery Photo", icon: Camera },
  { id: "partner-preferences", title: "Partner Preferences", icon: User },
];

// Dashboard sidebar items
const sidebarGroups = [
  {
    label: "Analytics",
    items: [
      { id: "analytics", title: "Analytics Dashboard", icon: BarChart3 },
    ]
  },
  {
    label: "Admin Profile",
    items: [
      { id: "admin-profile", title: "Admin Profile", icon: User },
      { id: "access-rights", title: "Access Rights", icon: Shield },
    ]
  },
  {
    label: "User Management",
    items: [
      { id: "add-user", title: "Add User", icon: UserPlus },
      { id: "user-password-reset", title: "User Password Reset", icon: Settings },
      { id: "user-profiles", title: "User Profiles", icon: Users },
      { id: "image-verification", title: "Image Verification", icon: Camera },
      { id: "plan-enquiries", title: "Plan Enquiries", icon: CreditCard },
      { id: "reported-users", title: "Reported Users", icon: ShieldAlert },
      { id: "generate-pdfs", title: "Generate PDFs", icon: FileDown },
    ]
  },
  {
    label: "Employee Management",
    items: [
      { id: "employee-search", title: "Employee Search", icon: Search },
      { id: "get-all-employees", title: "Get all employees", icon: Users },
      { id: "employee-registration", title: "Employee Registration", icon: UserPlus },
      { id: "employee-password-reset", title: "Employee Password Reset", icon: Settings },
    ]
  },
  {
    label: "Notifications",
    items: [
      { id: "notification-send", title: "Send", icon: Send },
      { id: "notification-topics", title: "Topics", icon: Tags },
      { id: "notification-campaigns", title: "Campaigns", icon: Megaphone },
      { id: "notification-monitoring", title: "Monitoring", icon: Activity },
      { id: "notification-event-logs", title: "Event Logs", icon: ScrollText },
    ]
  }
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
  activeTab: string;
  onTabChange: (id: string) => void;
}

const SidebarMenuItems = ({ activeTab, onTabChange, isProfilePage, isMobile, setMobileOpen }: {
  activeTab: string;
  onTabChange: (id: string) => void;
  isProfilePage: boolean;
  isMobile?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) => {
  const handleItemClick = (id: string) => {
    console.log('Menu item clicked:', id);
    onTabChange(id);
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  if (isProfilePage) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-white/80 font-medium text-xs uppercase tracking-wider px-2">
          Profile Sections
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {profileSections.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeTab === item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="text-white hover:bg-pink-600 data-[active=true]:bg-pink-700 data-[active=true]:text-white w-full justify-start px-2 py-2"
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      {sidebarGroups.map((group, groupIndex) => (
        <SidebarGroup key={groupIndex}>
          <SidebarGroupLabel className="text-white/80 font-medium text-xs uppercase tracking-wider px-2">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="text-white hover:bg-pink-600 data-[active=true]:bg-pink-700 data-[active=true]:text-white w-full justify-start px-2 py-2"
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-sm">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
};

export function AppSidebar({
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
  activeTab,
  onTabChange,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();

  // Check if we're on a profile page
  const isProfilePage = location.pathname.startsWith('/profile/');

  console.log('AppSidebar render:', { isMobile, mobileOpen, activeTab });

  // For mobile screens (below md), render as Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent 
          side="left" 
          className="w-72 sm:w-80 p-0 bg-gradient-to-b from-pink-500 to-pink-600 border-pink-400 z-50"
        >
          <div className="flex h-full flex-col">
            <div className="p-4 border-b border-pink-400">
              <div className="flex items-center gap-2">
                <img
                  src="https://i.postimg.cc/W1qxgjkZ/logo.jpg"
                  alt="MatchingJodi.Com logo"
                  className="h-6 w-6 rounded-sm object-cover"
                />
                <h2 className="text-white font-semibold text-lg">MatchingJodi.Com</h2>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <SidebarMenuItems
                activeTab={activeTab}
                onTabChange={onTabChange}
                isProfilePage={isProfilePage}
                isMobile={isMobile}
                setMobileOpen={setMobileOpen}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop screens (md and up), render as regular Sidebar
  return (
    <Sidebar
      className={`bg-gradient-to-b from-pink-500 to-pink-600 ${
        state === "collapsed" ? "w-16" : "w-64"
      } hidden md:flex`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end text-white hover:bg-pink-600" />
      <div className="p-3  py-3 border-b border-pink-400">
        <div className="flex items-center gap-2">
          <img
            src="https://i.postimg.cc/W1qxgjkZ/logo.jpg"
            alt="MatchingJodi.Com logo"
            className="h-6 w-6 rounded-sm object-cover"
          />
          {state !== "collapsed" && (
            <h2 className="text-white font-semibold text-lg">MatchingJodi.Com</h2>
          )}
        </div>
      </div>
      <SidebarContent className="bg-gradient-to-b from-pink-500 to-pink-600">
        <SidebarMenuItems
          activeTab={activeTab}
          onTabChange={onTabChange}
          isProfilePage={isProfilePage}
          isMobile={false}
        />
      </SidebarContent>
    </Sidebar>
  );
}
