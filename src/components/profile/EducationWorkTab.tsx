
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface EducationWorkTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
}

const EducationWorkTab: React.FC<EducationWorkTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    educationLevel: '',
    educationField: '',
    workingWith: '',
    designation: '',
    annualIncome: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        educationLevel: userProfile.educationLevel || '',
        educationField: userProfile.educationField || '',
        workingWith: userProfile.workingWith || '',
        designation: userProfile.designation || '',
        annualIncome: userProfile.annualIncome || '',
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserData(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Education & Work details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update Education & Work details",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  const educationLevelOptions = dropdowns?.find((d: any) => d.id === 'heighestQualification')?.data || {};
  const educationFieldOptions = dropdowns?.find((d: any) => d.id === 'educationField')?.data || {};
  const workingWithOptions = dropdowns?.find((d: any) => d.id === 'workingWith')?.data || {};
  const annualIncomeOptions = dropdowns?.find((d: any) => d.id === 'annualIncome')?.data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Education Details:</h3>
            
            <div>
              <Label>Education Level:*</Label>
              <Select 
                value={formData.educationLevel} 
                onValueChange={(value) => setFormData({...formData, educationLevel: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Education Level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(educationLevelOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Education Field:</Label>
              <Select 
                value={formData.educationField} 
                onValueChange={(value) => setFormData({...formData, educationField: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Education Field" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(educationFieldOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Work Details:</h3>
            
            <div>
              <Label>Working With:*</Label>
              <Select 
                value={formData.workingWith} 
                onValueChange={(value) => setFormData({...formData, workingWith: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Working With" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(workingWithOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Designation:</Label>
              <Input
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                disabled={!canEdit}
                placeholder="Enter designation"
              />
            </div>

            <div>
              <Label>Annual Income:*</Label>
              <Select 
                value={formData.annualIncome} 
                onValueChange={(value) => setFormData({...formData, annualIncome: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Annual Income" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(annualIncomeOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

export default EducationWorkTab;
