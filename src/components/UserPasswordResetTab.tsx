
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedTable, ColumnDef } from '@/components/ui/advanced-table';
import PasswordResetModal from '@/components/ui/password-reset-modal';
import { useToast } from '@/hooks/use-toast';
import { fetchAllUsers, resetUserPassword } from '@/lib/api';

interface User {
  id: string;
  data: {
    customerId: string;
    firstName: string;
    lastName: string;
    registeredMobileNumber: string;
    email: string;
    accountCreatedBy?: string;
    accountCreatedDateAndTime?: any;
  };
}

const UserPasswordResetTab: React.FC = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: fetchAllUsers,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) => 
      resetUserPassword(userId, password),
    onMutate: ({ userId }) => {
      setLoadingUserId(userId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset successfully",
      });
      setIsModalOpen(false);
      setSelectedUser(null);
      setLoadingUserId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
      setLoadingUserId(null);
    },
  });

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleConfirmReset = (password: string) => {
    if (selectedUser) {
      resetPasswordMutation.mutate({ userId: selectedUser.id, password });
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: 'User ID',
      accessorFn: (user) => user.id,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span className="font-medium text-pink-600">{row.original.id}</span>
      ),
    },
    {
      header: 'Customer ID',
      accessorFn: (user) => user.data.customerId,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Name',
      accessorFn: (user) => `${user.data.firstName} ${user.data.lastName}`,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span className="font-medium">{`${row.original.data.firstName} ${row.original.data.lastName}`}</span>
      ),
    },
    {
      header: 'Phone Number',
      accessorFn: (user) => user.data.registeredMobileNumber,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Email',
      accessorFn: (user) => user.data.email,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Registered By',
      accessorFn: (user) => user.data.accountCreatedBy?.split('/')[0] || 'N/A',
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Created Date',
      accessorFn: (user) => {
        const dateStr = user.data.accountCreatedBy?.split('/')[3];
        return dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
      },
      enableSorting: true,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    },
    {
      header: 'Reset Password',
      accessorFn: () => '',
      cell: ({ row }) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleResetPassword(row.original);
          }}
          disabled={loadingUserId === row.original.id}
          className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1"
          size="sm"
        >
          {loadingUserId === row.original.id ? 'Resetting...' : 'Reset Password'}
        </Button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    },
  ];

  return (
    <>
      <AdvancedTable
        data={users || []}
        columns={columns}
        title="Reset User Passwords"
        searchPlaceholder="Search users by name, ID, or email..."
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
        isLoading={isLoading}
      />

      {selectedUser && (
        <PasswordResetModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onConfirm={handleConfirmReset}
          isLoading={resetPasswordMutation.isPending}
          title="Reset User Password"
          description="Enter a new 4-digit password for this user."
          userInfo={{
            name: `${selectedUser.data.firstName} ${selectedUser.data.lastName}`,
            phone: selectedUser.data.registeredMobileNumber,
            id: selectedUser.id,
          }}
        />
      )}
    </>
  );
};

export default UserPasswordResetTab;
