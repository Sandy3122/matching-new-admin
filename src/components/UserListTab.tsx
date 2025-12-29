
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedTable, ColumnDef } from '@/components/ui/advanced-table';
import { useState } from 'react';
import ProfileImageModal from "./ui/profile-image-modal";
import UserAvatar from './ui/user-avatar';
import { fetchAllUsersWithDetails } from '@/lib/api/users';

interface User {
  id: string;
  data: {
    customerId: string;
    firstName: string;
    lastName: string;
    registeredMobileNumber: string;
    email: string;
    gender?: string;
    accountVerificationStatus: string;
    accountCreatedBy?: string;
    accountCreatedDateAndTime?: any;
  };
  profileImage?: string | null;
  isProfileImageVerified?: boolean;
}

interface UserListTabProps {
  onViewProfile: (userId: string) => void;
}

const UserListTab: React.FC<UserListTabProps> = ({ onViewProfile }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [modalUserName, setModalUserName] = useState<string | undefined>(undefined);

  // Always fetch fresh data when this component mounts
  const { data: users, isLoading } = useQuery({
    queryKey: ['allUsersWithDetails'],
    queryFn: fetchAllUsersWithDetails,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
  });

  const handleProfileImageClick = (user: User, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (user.profileImage) {
      setModalUserName(`${user.data.firstName || 'N/A'} ${user.data.lastName || 'N/A'}`);
      setProfileImageUrl(user.profileImage);
      setModalOpen(true);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: 'Profile',
      accessorFn: (user) => `${user.data.firstName || ''} ${user.data.lastName || ''} ${user.data.customerId || ''}`,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div 
            onClick={(e) => handleProfileImageClick(row.original, e)}
            className="cursor-pointer"
          >
            <UserAvatar
              imageUrl={row.original.isProfileImageVerified ? row.original.profileImage : null}
              firstName={row.original.data.firstName || 'N'}
              lastName={row.original.data.lastName || 'A'}
              isVerified={row.original.isProfileImageVerified}
              size="md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {`${row.original.data.firstName || 'N/A'} ${row.original.data.lastName || 'N/A'}`}
            </span>
            <span className="text-sm font-medium text-pink-600">
              #{row.original.data.customerId || 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Gender',
      accessorFn: (user) => user.data.gender || 'N/A',
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span className="capitalize">{row.original.data.gender || 'N/A'}</span>
      ),
    },
    {
      header: 'Email',
      accessorFn: (user) => user.data.email || 'N/A',
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span>{row.original.data.email || 'N/A'}</span>
      ),
    },
    {
      header: 'Phone',
      accessorFn: (user) => user.data.registeredMobileNumber || 'N/A',
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span>{row.original.data.registeredMobileNumber || 'N/A'}</span>
      ),
    },
    {
      header: 'Verification Status',
      accessorFn: (user) => user.data.accountVerificationStatus || 'N/A',
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => {
        const status = row.original.data.accountVerificationStatus || 'N/A';
        if (status === 'N/A') {
          return <span className="text-gray-500">N/A</span>;
        }
        return (
          <Badge 
            variant={status === 'verified' ? 'default' : 'secondary'}
            className={
              status === 'verified' 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: 'Created By',
      accessorFn: (user) => user.data.accountCreatedBy?.split('/')[0] || 'N/A',
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span>{row.original.data.accountCreatedBy?.split('/')[0] || 'N/A'}</span>
      ),
    },
    {
      header: 'Actions',
      accessorFn: () => '',
      cell: ({ row }) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(row.original.id);
          }}
          size="sm"
          className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1"
        >
          View Profile
        </Button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    }
  ];

  const handleRowClick = (user: User) => {
    // Only trigger view profile on row click, not on avatar click
    if (onViewProfile) {
      onViewProfile(user.id);
    }
  };

  return (
    <>
      <AdvancedTable
        data={users || []}
        columns={columns}
        title="User Management"
        searchPlaceholder="Search users by name, customer ID, or email..."
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
        isLoading={isLoading}
      />
      <ProfileImageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        imageUrl={profileImageUrl}
        userName={modalUserName}
      />
    </>
  );
};

export default UserListTab;
