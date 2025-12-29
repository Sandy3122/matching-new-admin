import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Menu } from 'lucide-react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { fetchUserProfile, fetchDropdowns, fetchCurrentUser, fetchCountryDropdown, fetchUserImageList } from '@/lib/api';
import { getAuthToken } from '@/lib/api/config';
import LoginForm from '@/components/LoginForm';
import ImageModal from '@/components/ui/image-modal';

// Lazy load profile tabs to avoid circular dependencies
const ProfileAdminTab = React.lazy(() => import('@/components/profile/ProfileAdminTab'));
const ResetPinTab = React.lazy(() => import('@/components/profile/ResetPinTab'));
const ProfileInfoTab = React.lazy(() => import('@/components/profile/ProfileInfoTab'));
const MandatoryDetailsTab = React.lazy(() => import('@/components/profile/MandatoryDetailsTab'));
const PersonalDetailsTab = React.lazy(() => import('@/components/profile/PersonalDetailsTab'));
const KycDetailsTab = React.lazy(() => import('@/components/profile/KycDetailsTab'));
const AddressTab = React.lazy(() => import('@/components/profile/AddressTab'));
const FamilyDetailsTab = React.lazy(() => import('@/components/profile/FamilyDetailsTab'));
const EducationWorkTab = React.lazy(() => import('@/components/profile/EducationWorkTab'));
const ReligionAstroTab = React.lazy(() => import('@/components/profile/ReligionAstroTab'));
const GalleryPhotoTab = React.lazy(() => import('@/components/profile/GalleryPhotoTab'));
const UploadDocumentsTab = React.lazy(() => import('@/components/profile/UploadDocumentsTab'));
const PartnerPreferencesTab = React.lazy(() => import('@/components/profile/PartnerPreferencesTab'));
const DeleteProfileTab = React.lazy(() => import('@/components/profile/DeleteProfileTab'));

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile-admin");
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Add a small delay to prevent race conditions during authentication check
    const checkAuth = () => {
      try {
        const token = getAuthToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      }
    };

    // Small timeout to ensure proper initialization
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  const { data: userProfile, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: () => fetchUserProfile(id!),
    enabled: !!id && isAuthenticated,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: dropdowns } = useQuery({
    queryKey: ['dropdowns'],
    queryFn: fetchDropdowns,
    enabled: isAuthenticated,
    retry: 1,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    retry: 1,
  });

  const { data: countryData } = useQuery({
    queryKey: ['countryDropdown'],
    queryFn: fetchCountryDropdown,
    enabled: isAuthenticated,
    retry: 1,
  });

  const { data: userImages } = useQuery({
    queryKey: ['userImages', id],
    queryFn: () => fetchUserImageList(id!),
    enabled: !!id && isAuthenticated,
    retry: 1,
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Get profile image (last image in imgList) with safety checks
  const profileImage = userImages?.imgList?.[userImages.imgList.length - 1];
  const isProfileImageVerified = profileImage?.imgVerificationStatus === 'verified';

  // Handle any errors from queries
  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">Unable to load user profile. Please try again.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile-admin', label: 'Profile Admin' },
    { id: 'reset-pin', label: 'Reset Pin' },
    { id: 'profile-info', label: 'Profile Info' },
    { id: 'mandatory-details', label: 'Mandatory Details' },
    { id: 'personal-details', label: 'Personal Details' },
    { id: 'kyc-details', label: 'KYC Details' },
    { id: 'address', label: 'Address' },
    { id: 'family-details', label: 'Family Details' },
    { id: 'education-work', label: 'Education & Work' },
    { id: 'religion-astro', label: 'Religion & Astro' },
    { id: 'gallery-photo', label: 'Gallery Photo' },
    { id: 'upload-documents', label: 'Upload Documents' },
    { id: 'partner-preferences', label: 'Partner Preferences' },
    { id: 'delete-profile', label: 'Delete Profile' },
  ];

  const renderTabContent = () => {
    if (isUserLoading) {
      return <div className="p-4 md:p-6">Loading user profile...</div>;
    }

    if (!userProfile) {
      return <div className="p-4 md:p-6">User not found</div>;
    }

    const commonProps = {
      userProfile,
      dropdowns,
      currentUser,
      userId: id!,
      countryData,
      userImages,
    };

    const LoadingComponent = () => (
      <div className="p-4 md:p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );

    const TabComponent = ({ children }: { children: React.ReactNode }) => (
      <React.Suspense fallback={<LoadingComponent />}>
        {children}
      </React.Suspense>
    );

    switch (activeTab) {
      case 'profile-admin':
        return <TabComponent><ProfileAdminTab {...commonProps} /></TabComponent>;
      case 'reset-pin':
        return <TabComponent><ResetPinTab {...commonProps} /></TabComponent>;
      case 'profile-info':
        return <TabComponent><ProfileInfoTab {...commonProps} /></TabComponent>;
      case 'mandatory-details':
        return <TabComponent><MandatoryDetailsTab {...commonProps} /></TabComponent>;
      case 'personal-details':
        return <TabComponent><PersonalDetailsTab {...commonProps} /></TabComponent>;
      case 'kyc-details':
        return <TabComponent><KycDetailsTab {...commonProps} /></TabComponent>;
      case 'address':
        return <TabComponent><AddressTab {...commonProps} /></TabComponent>;
      case 'family-details':
        return <TabComponent><FamilyDetailsTab {...commonProps} /></TabComponent>;
      case 'education-work':
        return <TabComponent><EducationWorkTab {...commonProps} /></TabComponent>;
      case 'religion-astro':
        return <TabComponent><ReligionAstroTab {...commonProps} /></TabComponent>;
      case 'gallery-photo':
        return <TabComponent><GalleryPhotoTab {...commonProps} /></TabComponent>;
      case 'upload-documents':
        return <TabComponent><UploadDocumentsTab {...commonProps} /></TabComponent>;
      case 'partner-preferences':
        return <TabComponent><PartnerPreferencesTab {...commonProps} /></TabComponent>;
      case 'delete-profile':
        return <TabComponent><DeleteProfileTab {...commonProps} /></TabComponent>;
      default:
        return <div className="p-4 md:p-6">Tab not found</div>;
    }
  };

  const MobileTabMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="ml-2">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-gradient-to-b from-pink-500 to-pink-600 text-white">
        <div className="mt-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-700 text-white'
                  : 'hover:bg-pink-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with user info */}
          <div className="bg-white shadow-sm border-b">
            {/* Top navigation bar */}
            <div className="px-4 md:px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                  <MobileTabMenu />
                  <div className="text-sm">
                    <span className="text-gray-500 hidden sm:inline">Profile ID:</span>
                    <span className="sm:hidden text-gray-500">ID:</span>
                    <span className="ml-2 font-medium">{id}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* User profile header */}
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    if (isProfileImageVerified && profileImage?.imgUrl) {
                      setIsProfileImageModalOpen(true);
                    }
                  }}
                >
                  {isProfileImageVerified && profileImage?.imgUrl ? (
                    <img
                      src={profileImage.imgUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-700 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <div className="text-sm text-gray-500">Profile Id:</div>
                      <div className="font-medium">{userProfile?.customerId || id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Name:</div>
                      <div className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">KYC Status:</div>
                      <div className="font-medium">{userProfile?.kyc?.kycVerificationStatus || 'Pending'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Profile Status:</div>
                      <div className="font-medium">{userProfile?.accountVerificationStatus || 'Pending'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <main className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Horizontal scrollable tabs for all screen sizes */}
              <div className="bg-white border-b sticky top-0 z-10">
                <ScrollArea className="w-full">
                  <div className="flex space-x-0 px-4 md:px-6 py-0">
                    <TabsList className="h-12 bg-transparent border-none rounded-none space-x-0 p-0 flex-nowrap min-w-max">
                      {tabs.map((tab) => (
                        <TabsTrigger 
                          key={tab.id}
                          value={tab.id}
                          className="rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 text-xs md:text-sm font-medium hover:text-gray-700 hover:border-gray-300 data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:bg-pink-50 whitespace-nowrap transition-all duration-200 ease-in-out"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  <ScrollBar 
                    orientation="horizontal" 
                    className="h-2 bg-gray-100 rounded-full"
                  />
                </ScrollArea>
              </div>

              <TabsContent value={activeTab} className="p-4 md:p-6 m-0">
                {renderTabContent()}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Profile Image Modal */}
      {isProfileImageVerified && profileImage?.imgUrl && (
        <ImageModal
          isOpen={isProfileImageModalOpen}
          onClose={() => setIsProfileImageModalOpen(false)}
          imageUrl={profileImage.imgUrl}
          imageName="Profile Image"
          showStatusControls={false}
        />
      )}
    </SidebarProvider>
  );
};

export default UserProfile;
