
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedTable, ColumnDef } from '@/components/ui/advanced-table';
import PasswordResetModal from '@/components/ui/password-reset-modal';
import { useToast } from '@/hooks/use-toast';
import { fetchAllEmployees, resetEmployeePassword } from '@/lib/api';
import LoadingSpinner from "./ui/loading-spinner";

interface Employee {
  id: string;
  data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: string;
    accountStatus: string;
    joiningDate: string;
  };
}

const EmployeePasswordResetTab: React.FC = () => {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingEmployeeId, setLoadingEmployeeId] = useState<string | null>(null);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['allEmployees'],
    queryFn: fetchAllEmployees,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ employeeId, password }: { employeeId: string; password: string }) => 
      resetEmployeePassword(employeeId, password),
    onMutate: ({ employeeId }) => {
      setLoadingEmployeeId(employeeId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee password reset successfully",
      });
      setIsModalOpen(false);
      setSelectedEmployee(null);
      setLoadingEmployeeId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset employee password",
        variant: "destructive",
      });
      setLoadingEmployeeId(null);
    },
  });

  const handleResetPassword = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleConfirmReset = (password: string) => {
    if (selectedEmployee) {
      resetPasswordMutation.mutate({ employeeId: selectedEmployee.data.employeeId, password });
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      header: 'Employee ID',
      accessorFn: (employee) => employee.data.employeeId,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span className="font-medium text-pink-600">{row.original.data.employeeId}</span>
      ),
    },
    {
      header: 'Name',
      accessorFn: (employee) => `${employee.data.firstName} ${employee.data.lastName}`,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span className="font-medium">{`${row.original.data.firstName} ${row.original.data.lastName}`}</span>
      ),
    },
    {
      header: 'Email',
      accessorFn: (employee) => employee.data.email,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Phone Number',
      accessorFn: (employee) => employee.data.phoneNumber,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Role',
      accessorFn: (employee) => employee.data.role,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <Badge 
          variant="outline"
          className={
            row.original.data.role === 'admin' 
              ? 'border-red-500 text-red-600 bg-red-50' 
              : 'border-blue-500 text-blue-600 bg-blue-50'
          }
        >
          {row.original.data.role}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessorFn: (employee) => employee.data.accountStatus,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <Badge 
          variant={row.original.data.accountStatus === 'active' ? 'default' : 'secondary'}
          className={
            row.original.data.accountStatus === 'active' 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }
        >
          {row.original.data.accountStatus}
        </Badge>
      ),
    },
    {
      header: 'Joining Date',
      accessorFn: (employee) => new Date(employee.data.joiningDate).toLocaleDateString(),
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
          disabled={loadingEmployeeId === row.original.data.employeeId}
          className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1"
          size="sm"
        >
          {loadingEmployeeId === row.original.data.employeeId ? 'Resetting...' : 'Reset Password'}
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
        data={employees || []}
        columns={columns}
        title="Reset Employee Passwords"
        searchPlaceholder="Search employees by name, ID, or email..."
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
        isLoading={isLoading}
      />

      {selectedEmployee && (
        <PasswordResetModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onConfirm={handleConfirmReset}
          isLoading={resetPasswordMutation.isPending}
          title="Reset Employee Password"
          description="Enter a new 4-digit password for this employee."
          userInfo={{
            name: `${selectedEmployee.data.firstName} ${selectedEmployee.data.lastName}`,
            phone: selectedEmployee.data.phoneNumber,
            id: selectedEmployee.data.employeeId,
          }}
        />
      )}
    </>
  );
};

export default EmployeePasswordResetTab;
