
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { fetchDropdowns, fetchSpecificDropdown, fetchAccessRights, deleteAccessRight, updateAccessRightStatus, AccessRight } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
} from "@/components/ui/alert-dialog";

interface RoutePermissions {
  [key: string]: ('read' | 'write')[];
}

const AccessRightsTab: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AccessRight | null>(null);
  const [newRole, setNewRole] = useState({
    role: '',
    status: 'active' as 'active' | 'inactive',
    routes: {} as RoutePermissions,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dropdowns for roles and routes
  const { data: dropdowns } = useQuery({
    queryKey: ['dropdowns'],
    queryFn: fetchDropdowns,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['accessRoles'],
    queryFn: () => fetchSpecificDropdown('accessRoles'),
  });

  const { data: routesData } = useQuery({
    queryKey: ['routes'],
    queryFn: () => fetchSpecificDropdown('routes'),
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteAccessRight,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Role access rights deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['accessRights'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateAccessRightStatus,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Status updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['accessRights'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const { data: accessRights = [], isLoading: isLoadingAccessRights } = useQuery({
    queryKey: ['accessRights'],
    queryFn: fetchAccessRights,
  });

  const availableRoutes = routesData?.allRoutes || [
    '/employee-search', '/getall-employees', '/profile', '/addEmployee',
    '/access-rights', '/getall-appUsers', '/getUserById/:documentId',
    '/getImageList', '/updateImageStatus', '/user-registration',
    '/deleteUserProfile/:documentId', '/getall-userProfiles',
    '/reset-userPassword', '/allUsersImageVerification', '/logout',
    '/user-profile', '/userKyc', '/uploadUserDocs', '/profileAdmin',
    '/profileGallery', '/employee-login', '/userAddress',
    '/deleteUserProfile', '/religionAndAstro', '/educationAndWorkDetails',
    '/userFamilyDetails', '/personalDetails', '/mandatoryDetails',
    '/profileInfo', '/resetPassword', '/reset-employeePassword'
  ];

  const availableRoles = Object.keys(rolesData || {}).filter(key => key !== 'selectRole');

  const handleAddRole = () => {
    toast({
      title: 'Not Implemented',
      description: 'API for adding new roles is not available.',
      variant: 'destructive',
    });
  };

  const handleEditRole = (role: AccessRight) => {
    setSelectedRole(role);
    setNewRole({
      role: role.role,
      status: role.status,
      routes: {}
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
    toast({
      title: 'Not Implemented',
      description: 'API for updating role permissions is not available.',
      variant: 'destructive',
    });
  };

  const handleDeleteRole = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: string) => {
    const role = Array.isArray(accessRights) ? accessRights.find(r => r.id === id) : undefined;
    if (role) {
      statusMutation.mutate({ id, status: role.status === 'active' ? 'inactive' : 'active' });
    }
  };

  const handlePermissionToggle = (route: string, permission: 'read' | 'write', checked: boolean) => {
    setNewRole(prev => {
      const newRoutes = { ...prev.routes };
      let currentPermissions = newRoutes[route] ? [...newRoutes[route]] : [];
  
      if (checked) {
        if (!currentPermissions.includes(permission)) {
          currentPermissions.push(permission);
        }
      } else {
        currentPermissions = currentPermissions.filter(p => p !== permission);
      }
  
      if (currentPermissions.length > 0) {
        newRoutes[route] = currentPermissions;
      } else {
        delete newRoutes[route];
      }
      
      return { ...prev, routes: newRoutes };
    });
  };

  const columns: ColumnDef<AccessRight>[] = [
    {
      id: 's.no',
      header: 'S.No',
      cell: ({ row }) => <span>{row.index + 1}</span>,
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      accessorFn: (item) => item.role,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Badge variant="secondary" className="capitalize">
            {rolesData && typeof rolesData[item.role] === 'string' ? rolesData[item.role] : item.role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      accessorFn: (item) => item.status,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={item.status === 'active'}
              onCheckedChange={() => handleToggleStatus(item.id)}
              disabled={statusMutation.isPending}
              className="data-[state=checked]:bg-pink-600"
            />
            <Badge
              className={item.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {item.status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'routeName',
      header: 'Accessed Routes',
      accessorFn: (item) => item.routeName?.join(', ') || '',
      enableSorting: false,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => {
        const item = row.original;
        const routes = item.routeName || [];
        if (routes.length === 0) {
          return <span className="text-xs text-gray-500">No access</span>;
        }
        return (
          <ScrollArea className="h-24 w-full">
            <div className="space-y-1">
              {routes.map((route) => (
                <div key={route} className="flex items-center justify-between text-xs pr-2">
                  <span className="font-mono text-gray-600 truncate">{route}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        );
      },
    },
    {
      accessorKey: 'timeStamp',
      header: 'Created Date',
      accessorFn: (item) => item.timeStamp ? new Date(item.timeStamp).toLocaleDateString() : 'N/A',
      enableSorting: true,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditRole(item)}
              className="hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="hover:bg-red-600"
                  disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this role's access rights. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteRole(item.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    },
  ];

  const RoleFormDialog = ({ 
    isOpen, 
    onOpenChange, 
    title, 
    onSubmit 
  }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onSubmit: () => void;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-pink-600">{title}</DialogTitle>
          <DialogDescription>
            Configure role access rights and permissions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newRole.role} onValueChange={(value) => setNewRole(prev => ({ ...prev, role: value }))} disabled={title.includes('Edit')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem 
                      key={role} 
                      value={role} 
                      disabled={Array.isArray(accessRights) ? accessRights.some(ar => ar.role === role && ar.id !== selectedRole?.id) : false}
                    >
                      {rolesData && typeof rolesData[role] === 'string' ? rolesData[role] : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={newRole.status === 'active'}
                  onCheckedChange={(checked) => 
                    setNewRole(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))
                  }
                />
                <Label htmlFor="status" className="text-sm">
                  {newRole.status === 'active' ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Access Routes</Label>
            <ScrollArea className="h-60 w-full border rounded-md p-2">
              <div className="space-y-1">
                {availableRoutes.map((route) => (
                   <div key={route} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    <Label htmlFor={`${route}-read`} className="text-sm font-mono flex-1 truncate">
                      {route}
                    </Label>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${route}-read`}
                          checked={!!newRole.routes[route]?.includes('read')}
                          onCheckedChange={(checked) => handlePermissionToggle(route, 'read', checked as boolean)}
                        />
                        <Label htmlFor={`${route}-read`} className="text-sm font-medium text-gray-600">Read</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${route}-write`}
                          checked={!!newRole.routes[route]?.includes('write')}
                          onCheckedChange={(checked) => handlePermissionToggle(route, 'write', checked as boolean)}
                        />
                        <Label htmlFor={`${route}-write`} className="text-sm font-medium text-gray-600">Write</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {title.includes('Add') ? 'Add Role' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div>
      <EnhancedTable
        columns={columns}
        data={Array.isArray(accessRights) ? accessRights : []}
        title="Access Rights Management"
        searchPlaceholder="Search by role, status, or routes..."
        isLoading={isLoadingAccessRights}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
        headerActions={
          <Button 
            className="bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => {
              setNewRole({ role: '', status: 'active', routes: {} });
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role Rights
          </Button>
        }
      />

      <RoleFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Role Rights"
        onSubmit={handleAddRole}
      />

      <RoleFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Role Rights"
        onSubmit={handleUpdateRole}
      />
    </div>
  );
};

export default AccessRightsTab;
