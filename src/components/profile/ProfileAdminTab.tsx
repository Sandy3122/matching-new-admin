import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProfileAdminTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
}

const ProfileAdminTab: React.FC<ProfileAdminTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    blockProfile: userProfile?.blockProfile || 'no',
    hideProfile: userProfile?.hideProfile || 'no',
    deleteProfile: userProfile?.deleteProfile || 'no',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        blockProfile: userProfile?.blockProfile || 'no',
        hideProfile: userProfile?.hideProfile || 'no',
        deleteProfile: userProfile?.deleteProfile || 'no',
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserData(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile admin settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile admin settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Profile ID</Label>
            <Input value={userId} readOnly className="bg-gray-50" />
          </div>
          
          <div>
            <Label>Profile Registered By</Label>
            <Input 
              value={userProfile?.accountCreatedBy || 'N/A'} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Block Profile</Label>
            <Select 
              value={formData.blockProfile} 
              onValueChange={(value) => setFormData({...formData, blockProfile: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hide Profile</Label>
            <Select 
              value={formData.hideProfile} 
              onValueChange={(value) => setFormData({...formData, hideProfile: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Delete Profile</Label>
            <Select 
              value={formData.deleteProfile} 
              onValueChange={(value) => setFormData({...formData, deleteProfile: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {canEdit && (
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAdminTab;
