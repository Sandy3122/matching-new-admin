
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ProfileInfoForm = () => {
  const [formData, setFormData] = useState({
    profileId: '0550553',
    profileVerificationStatus: 'Pending',
    profileRegisteredById: 'E8829770',
    profileRegisteredBy: 'Dishant Negi',
    profileCreatedDate: '10/25/2024 10:19 AM',
    profileVerifiedDate: 'null',
    blockProfile: 'null',
    hideProfile: 'null',
    lastLoginDate: 'null',
    deleteProfile: 'null',
    reasonForDelete: 'null'
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Profile information has been updated successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="profileId">Profile ID:</Label>
            <Input
              id="profileId"
              value={formData.profileId}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="profileVerificationStatus">Profile Verification Status:</Label>
            <Select 
              value={formData.profileVerificationStatus} 
              onValueChange={(value) => handleInputChange('profileVerificationStatus', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="profileRegisteredById">Profile Registered By Id:</Label>
            <Input
              id="profileRegisteredById"
              value={formData.profileRegisteredById}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="profileRegisteredBy">Profile Registered By:</Label>
            <Input
              id="profileRegisteredBy"
              value={formData.profileRegisteredBy}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="profileCreatedDate">Profile Created Date:</Label>
            <Input
              id="profileCreatedDate"
              value={formData.profileCreatedDate}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="profileVerifiedDate">Profile Verified Date:</Label>
            <Input
              id="profileVerifiedDate"
              value={formData.profileVerifiedDate}
              onChange={(e) => handleInputChange('profileVerifiedDate', e.target.value)}
              placeholder="Not verified yet"
            />
          </div>

          <div>
            <Label htmlFor="blockProfile">Block Profile:</Label>
            <Input
              id="blockProfile"
              value={formData.blockProfile}
              onChange={(e) => handleInputChange('blockProfile', e.target.value)}
              placeholder="Not blocked"
            />
          </div>

          <div>
            <Label htmlFor="hideProfile">Hide Profile:</Label>
            <Input
              id="hideProfile"
              value={formData.hideProfile}
              onChange={(e) => handleInputChange('hideProfile', e.target.value)}
              placeholder="Not hidden"
            />
          </div>

          <div>
            <Label htmlFor="lastLoginDate">Last Login Date:</Label>
            <Input
              id="lastLoginDate"
              value={formData.lastLoginDate}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="deleteProfile">Delete Profile:</Label>
            <Input
              id="deleteProfile"
              value={formData.deleteProfile}
              onChange={(e) => handleInputChange('deleteProfile', e.target.value)}
              placeholder="Not deleted"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="reasonForDelete">Reason For Delete:</Label>
            <Input
              id="reasonForDelete"
              value={formData.reasonForDelete}
              onChange={(e) => handleInputChange('reasonForDelete', e.target.value)}
              placeholder="No reason specified"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoForm;
