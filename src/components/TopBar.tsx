
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { fetchCurrentUser } from '@/lib/api';

interface TopBarProps {
  onLogout: () => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout, onMenuClick, isMobile }) => {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    retry: 0,
    staleTime: 1000 * 60 * 5,
  });

  const displayName =
    currentUser?.name ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    'Admin User';
  const displayId = currentUser?.id || currentUser?.employeeId || currentUser?.adminId || '';

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <div className="bg-white shadow-sm border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-40 w-full">
      <div className="flex items-center justify-between w-full">
        {/* Mobile menu button - visible on screens below md */}
        <div className="flex-shrink-0 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10"
            onClick={handleMenuClick}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-pink-500" />
          </Button>
        </div>
        
        {/* Empty spacer to push content to the right */}
        <div className="flex-1"></div>
        
        {/* User Info - always positioned at top right corner */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
          {/* User details - hidden on very small screens, visible on sm and up */}
          <div className="text-right hidden sm:block">
            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24 sm:max-w-32 md:max-w-none">
              {displayName}
            </div>
            {displayId && (
              <div className="text-xs text-gray-500 truncate max-w-24 sm:max-w-32 md:max-w-none">
                {displayId}
              </div>
            )}
          </div>
          
          {/* User avatar and logout button */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-base md:text-lg">👤</span>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
