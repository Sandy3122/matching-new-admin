
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const sidebarItems = [
  { id: 'profile-admin', label: 'Profile Admin', icon: '👤' },
  { id: 'reset-pin', label: 'Reset Pin', icon: '🔄' },
  { id: 'profile-info', label: 'Profile Info', icon: 'ℹ️' },
  { id: 'mandatory-details', label: 'Mandatory Details', icon: '📋' },
  { id: 'personal-details', label: 'Personal Details', icon: '👥' },
  { id: 'kyc-details', label: 'KYC Details', icon: '📄' },
  { id: 'address', label: 'Address', icon: '🏠' },
  { id: 'family-details', label: 'Family Details', icon: '👨‍👩‍👧‍👦' },
  { id: 'education-work', label: 'Education & Work', icon: '🎓' },
  { id: 'religion-astro', label: 'Religion & Astro', icon: '🕉️' },
  { id: 'gallery-photo', label: 'Gallery Photo', icon: '📸' },
  { id: 'upload-documents', label: 'Upload Documents', icon: '📁' },
  { id: 'partner-preferences', label: 'Partner Preferences', icon: '💕' },
  { id: 'delete-profile', label: 'Delete Profile', icon: '🗑️' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isCollapsed, onToggle }) => {
  return (
    <div className={cn(
      "bg-primary text-white transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">MJ</span>
              </div>
              <span className="font-semibold">Matching Jodi</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left hover:bg-primary/20 transition-colors",
                  activeTab === item.id ? "bg-primary/30 border-r-2 border-white" : "",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
