import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import { fetchAllEmployees, updateEmployeeStatus, updateEmployeeRole, fetchSpecificDropdown } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from "./ui/loading-spinner";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Shield,
  Hash,
  FileText
} from 'lucide-react';

interface Employee {
  id: string;
  data: {
    firstName: string;
    lastName: string;
    gender: string;
    maritalStatus: string;
    dateOfBirth: string;
    accountCreatedDateTime: string;
    employeeId: string;
    email: string;
    phoneNumber: string;
    emergencyPhoneNumber: string;
    kycDocumentType: string;
    designation: string;
    joiningDate: string;
    photoUrl: string;
    resumeUrl: string;
    kycDocumentUrl: string;
    role: string;
    accountStatus: string;
  };
}

const EmployeeListTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['allEmployees'],
    queryFn: fetchAllEmployees,
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['accessRoles'],
    queryFn: () => fetchSpecificDropdown('accessRoles'),
  });

  const roles = rolesData?.data || rolesData || {};
  console.log('Roles data:', rolesData);

  const statusMutation = useMutation({
    mutationFn: ({ employeeId, status }: { employeeId: string; status: string }) =>
      updateEmployeeStatus(employeeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEmployees'] });
      toast({
        title: "Success",
        description: "Employee status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update employee status",
        variant: "destructive",
      });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ employeeId, role }: { employeeId: string; role: string }) =>
      updateEmployeeRole(employeeId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEmployees'] });
      toast({
        title: "Success",
        description: "Employee role updated successfully",
      });
    },
    onError: (error) => {
      console.error('Role update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update employee role",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (employeeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    console.log('Changing status for employee:', employeeId, 'from', currentStatus, 'to', newStatus);
    statusMutation.mutate({ employeeId, status: newStatus });
  };

  const handleRoleChange = (employeeId: string, newRole: string) => {
    console.log('Changing role for employee:', employeeId, 'to', newRole);
    roleMutation.mutate({ employeeId, role: newRole });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-300';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'user': return 'bg-green-100 text-green-700 border-green-300';
      case 'superAdmin': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'employee': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'thirdPartyAgent': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      header: 'Employee',
      accessorFn: (item) => `${item.data.firstName} ${item.data.lastName}`,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={item.data.photoUrl} alt={`${item.data.firstName} ${item.data.lastName}`} />
              <AvatarFallback className="bg-pink-100 text-pink-600 text-sm font-semibold">
                {item.data.firstName.charAt(0)}{item.data.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">
                {item.data.firstName} {item.data.lastName}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Hash className="w-3 h-3 mr-1" />
                {item.data.employeeId}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact',
      accessorFn: (item) => item.data.email,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="space-y-1">
            <div className="text-sm flex items-center">
              <Mail className="w-3 h-3 mr-1 text-gray-400" />
              {item.data.email}
            </div>
            <div className="text-sm flex items-center">
              <Phone className="w-3 h-3 mr-1 text-gray-400" />
              {item.data.phoneNumber}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Designation',
      accessorFn: (item) => item.data.designation,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => <div className="text-sm capitalize">{row.original.data.designation}</div>,
    },
    {
      header: 'Joining Date',
      accessorFn: (item) => item.data.joiningDate,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="text-sm flex items-center">
          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
          {formatDate(row.original.data.joiningDate)}
        </div>
      ),
    },
    {
      header: 'Role',
      accessorFn: (item) => item.data.role,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="space-y-2">
            <Badge className={getRoleBadgeColor(item.data.role)}>
              <Shield className="w-3 h-3 mr-1" />
              {roles && typeof roles[item.data.role] === 'string' ? roles[item.data.role] : item.data.role}
            </Badge>
            <Select
              value={item.data.role}
              onValueChange={(value) => handleRoleChange(item.data.employeeId, value)}
              disabled={rolesLoading || roleMutation.isPending}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                {roles && Object.entries(roles).map(([key, value]) => (
                  key !== 'selectRole' && (
                    <SelectItem key={key} value={key} className="text-xs">
                      {typeof value === 'string' ? value : key}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorFn: (item) => item.data.accountStatus,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="space-y-2">
            <Badge className={item.data.accountStatus === 'active' 
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-red-100 text-red-700 border-red-300'
            }>
              {item.data.accountStatus}
            </Badge>
            <div className="flex items-center space-x-2">
              <Switch
                checked={item.data.accountStatus === 'active'}
                onCheckedChange={() => handleStatusChange(item.data.employeeId, item.data.accountStatus)}
                className="scale-75"
                disabled={statusMutation.isPending}
              />
              <span className="text-xs text-gray-500">
                {item.data.accountStatus === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessorFn: () => '',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex space-x-1">
            {item.data.resumeUrl && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(item.data.resumeUrl, '_blank')}
                className="text-pink-600 border-pink-300 hover:bg-pink-50 text-xs h-7 px-2"
              >
                <FileText className="w-3 h-3 mr-1" />
                Resume
              </Button>
            )}
            {item.data.kycDocumentUrl && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(item.data.kycDocumentUrl, '_blank')}
                className="text-pink-600 border-pink-300 hover:bg-pink-50 text-xs h-7 px-2"
              >
                <FileText className="w-3 h-3 mr-1" />
                KYC
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <LoadingSpinner size={48} />
        <span className="mt-3 text-pink-500">Loading employees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedTable
        data={employees || []}
        columns={columns}
        title="All Employees"
        searchPlaceholder="Search employees..."
        isLoading={isLoading}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
      />
    </div>
  );
};

export default EmployeeListTab;
