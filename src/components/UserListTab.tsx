
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedTable, ColumnDef } from '@/components/ui/advanced-table';
import { useState } from 'react';
import ProfileImageModal from "./ui/profile-image-modal";
import UserAvatar from './ui/user-avatar';
import { fetchAllUsersWithDetails } from '@/lib/api/users';
import { flushCache } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cache the (expensive, N+1) users-with-images fetch so reopening the
  // "User Profiles" tab does NOT re-hit the API every time. Data is treated as
  // fresh for 5 minutes, kept in cache for 10, and quietly refreshed every
  // 5 minutes while the tab is open. Use the Refresh button for an on-demand
  // update, or Hard Reset to also flush the server-side cache.
  const {
    data: users,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['allUsersWithDetails'],
    queryFn: fetchAllUsersWithDetails,
    staleTime: 5 * 60 * 1000, // 5 minutes — no refetch on tab reopen within this window
    gcTime: 10 * 60 * 1000, // keep cached data for 10 minutes
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes while viewing
    refetchOnWindowFocus: false, // rely on staleTime + interval instead of focus refetches
  });

  const flushMutation = useMutation({
    mutationFn: flushCache,
    onSuccess: () => {
      toast({ title: 'Cache cleared', description: 'Server cache flushed. Reloading data...' });
      queryClient.invalidateQueries({ queryKey: ['allUsersWithDetails'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to flush cache',
        variant: 'destructive',
      });
    },
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
        headerActions={
          <div className="flex items-center gap-2 flex-wrap">
            {dataUpdatedAt > 0 && (
              <span className="hidden md:inline text-xs text-gray-400 whitespace-nowrap">
                Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Reload the latest data"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-orange-600 border-orange-300 hover:bg-orange-50"
                disabled={flushMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${flushMutation.isPending ? 'animate-spin' : ''}`} />
                Hard Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear server cache?</AlertDialogTitle>
                <AlertDialogDescription>
                  This flushes the server-side Redis cache and forces fresh data on the next load.
                  Use this if listings look stale.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => flushMutation.mutate()}
                >
                  Hard Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        }
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
