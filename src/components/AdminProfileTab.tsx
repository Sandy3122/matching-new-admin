
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminProfile } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const AdminProfileTab: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: fetchAdminProfile,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
            Failed to fetch admin profile: {error instanceof Error ? error.message : "An unknown error occurred"}
            </AlertDescription>
        </Alert>
    );
  }

  const adminProfile = data?.user;

  if (!adminProfile) {
    return <Alert>
        <AlertTitle>No Profile Found</AlertTitle>
        <AlertDescription>
            Admin profile data could not be loaded.
        </AlertDescription>
    </Alert>;
  }
  
  const InfoField = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base text-gray-900">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Profile</CardTitle>
              <CardDescription>Your personal and employment details.</CardDescription>
            </div>
            {adminProfile.photoUrl && (
              <img src={adminProfile.photoUrl} alt="Admin" className="w-20 h-20 rounded-full object-cover" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <InfoField label="First Name" value={adminProfile.firstName} />
              <InfoField label="Last Name" value={adminProfile.lastName} />
              <InfoField label="Gender" value={adminProfile.gender} />
              <InfoField label="Date of Birth" value={new Date(adminProfile.dateOfBirth).toLocaleDateString()} />
              <InfoField label="Marital Status" value={adminProfile.maritalStatus} />
              <InfoField label="Email" value={adminProfile.email} />
              <InfoField label="Phone Number" value={adminProfile.phoneNumber} />
              <InfoField label="Emergency Phone" value={adminProfile.emergencyPhoneNumber} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Employment Details</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <InfoField label="Employee ID" value={adminProfile.employeeId} />
                <InfoField label="Designation" value={adminProfile.designation} />
                <InfoField label="Role" value={adminProfile.role} />
                <InfoField label="Joining Date" value={new Date(adminProfile.joiningDate).toLocaleDateString()} />
                <InfoField label="Account Status" value={<Badge variant={adminProfile.accountStatus === 'active' ? 'default' : 'destructive'} className={adminProfile.accountStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}>{adminProfile.accountStatus}</Badge>} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfileTab;
