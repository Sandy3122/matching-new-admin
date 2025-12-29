
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface MandatoryDetailsTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
}

const MandatoryDetailsTab: React.FC<MandatoryDetailsTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    dateOfBirth: '',
    maritalStatus: '',
    noOfChild: '',
    livingWithChild: '',
    religion: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        gender: userProfile.gender || '',
        email: userProfile.email || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        maritalStatus: userProfile.maritalStatus || '',
        noOfChild: userProfile.noOfChild || '',
        livingWithChild: userProfile.livingWithChild || '',
        religion: userProfile.religion || '',
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserData(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Mandatory details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update mandatory details",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  const genderOptions = dropdowns?.find((d: any) => d.id === 'gender')?.data || {};
  const maritalStatusOptions = dropdowns?.find((d: any) => d.id === 'maritalStatus')?.data || {};
  const livingWithChildOptions = dropdowns?.find((d: any) => d.id === 'livingWithChild')?.data || {};
  const religionOptions = dropdowns?.find((d: any) => d.id === 'religion')?.data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>First Name:*</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              disabled={!canEdit}
              placeholder="Enter first name"
            />
          </div>

          <div>
            <Label>Last Name:*</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              disabled={!canEdit}
              placeholder="Enter last name"
            />
          </div>

          <div>
            <Label>Gender:*</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData({...formData, gender: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(genderOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Email Id:</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!canEdit}
              placeholder="Enter email"
            />
          </div>

          <div>
            <Label>Date Of Birth:*</Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              disabled={!canEdit}
            />
          </div>

          <div>
            <Label>Marital Status:*</Label>
            <Select 
              value={formData.maritalStatus} 
              onValueChange={(value) => setFormData({...formData, maritalStatus: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Marital Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(maritalStatusOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>No Of Child:</Label>
            <Input
              type="number"
              value={formData.noOfChild}
              onChange={(e) => setFormData({...formData, noOfChild: e.target.value})}
              disabled={!canEdit}
              placeholder="Number of children"
            />
          </div>

          <div>
            <Label>Living With Child:</Label>
            <Select 
              value={formData.livingWithChild} 
              onValueChange={(value) => setFormData({...formData, livingWithChild: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(livingWithChildOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Religion:</Label>
            <Select 
              value={formData.religion} 
              onValueChange={(value) => setFormData({...formData, religion: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Religion" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(religionOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default MandatoryDetailsTab;
