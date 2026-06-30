import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProfileInfoTabProps {
  userProfile: any;
  currentUser: any;
  userId: string;
}

const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({ 
  userProfile, 
  currentUser, 
  userId 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationStatus, setVerificationStatus] = useState('');

  // Ensure always in sync!
  useEffect(() => {
    if (userProfile) {
      setVerificationStatus(userProfile.accountVerificationStatus || 'pending');
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (status: string) => updateUserData(userId, {
      accountVerificationStatus: status,
      accountVerifiedBy: status === 'verified' ? 
        `${currentUser?.name}/${currentUser?.id}/${new Date().toLocaleString()}` : 
        ''
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile verification status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile verification status",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(verificationStatus);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  // accountCreatedBy is stored as `name/id/phone/datetime`.
  const createdParts = String(userProfile?.accountCreatedBy || '').split('/');
  const registeredByName = createdParts[0] || 'N/A';
  const registeredById = createdParts[1] || 'N/A';
  const createdDate =
    createdParts[3] ||
    (typeof userProfile?.accountCreatedDateAndTime === 'object'
      ? ''
      : userProfile?.accountCreatedDateAndTime) ||
    'N/A';
  // accountVerifiedBy is stored as `name/id/phone/datetime`.
  const verifiedParts = String(userProfile?.accountVerifiedBy || '').split('/');
  const verifiedDate = verifiedParts[3] || 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Profile ID:</Label>
            <Input 
              value={userProfile?.customerId || userId.replace('app', '')} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>

          <div>
            <Label>Profile Verification Status:</Label>
            <Select 
              value={verificationStatus} 
              onValueChange={setVerificationStatus}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Profile Registered By Id:</Label>
            <Input value={registeredById} readOnly className="bg-gray-50" />
          </div>

          <div>
            <Label>Profile Registered By:</Label>
            <Input value={registeredByName} readOnly className="bg-gray-50" />
          </div>

          <div>
            <Label>Profile Created Date:</Label>
            <Input value={createdDate} readOnly className="bg-gray-50" />
          </div>

          <div>
            <Label>Profile Verified Date:</Label>
            <Input value={verifiedDate} readOnly className="bg-gray-50" />
          </div>

          <div>
            <Label>Block Profile:</Label>
            <Input value={userProfile?.blockProfile || 'no'} readOnly className="bg-gray-50" />
          </div>

          <div>
            <Label>Hide Profile:</Label>
            <Input value={userProfile?.hideProfile || 'no'} readOnly className="bg-gray-50" />
          </div>

          <div>
            <Label>Last Login Date:</Label>
            <Input
              value={
                typeof userProfile?.lastLoginDateTime === 'object'
                  ? 'N/A'
                  : userProfile?.lastLoginDateTime || 'N/A'
              }
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label>Delete Profile:</Label>
            <Input value={userProfile?.deleteProfile || 'no'} readOnly className="bg-gray-50" />
          </div>

          <div className="md:col-span-2">
            <Label>Reason For Delete:</Label>
            <Input value={userProfile?.reasonForDelete || 'N/A'} readOnly className="bg-gray-50" />
          </div>
        </div>

        {canEdit && (
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileInfoTab;
