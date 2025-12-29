
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface FamilyDetailsTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
}

const FamilyDetailsTab: React.FC<FamilyDetailsTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    primaryGuardian: {
      relation: '',
      name: '',
      phoneNumber: '',
      occupation: '',
    },
    secondaryGuardian: {
      relation: '',
      name: '',
      phoneNumber: '',
      occupation: '',
    },
    noOfBrothers: '',
    noOfSisters: '',
    marriedBrothers: '',
    marriedSisters: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        primaryGuardian: {
          relation: userProfile.primaryGuardian?.primaryGuardianRelation || '',
          name: userProfile.primaryGuardian?.primaryGuardianName || '',
          phoneNumber: userProfile.primaryGuardian?.primaryGuardianPhoneNumber || '',
          occupation: userProfile.primaryGuardian?.primaryGuardianOccupation || '',
        },
        secondaryGuardian: {
          relation: userProfile.secondaryGuardian?.secondaryGuardianRelation || '',
          name: userProfile.secondaryGuardian?.secondaryGuardianName || '',
          phoneNumber: userProfile.secondaryGuardian?.secondaryGuardianPhoneNumber || '',
          occupation: userProfile.secondaryGuardian?.secondaryGuardianOccupation || '',
        },
        noOfBrothers: userProfile.noOfBrothers || '',
        noOfSisters: userProfile.noOfSisters || '',
        marriedBrothers: userProfile.noOfBrothersMarried || '',
        marriedSisters: userProfile.noOfSistersMarried || '',
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserData(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Family details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update family details",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updateData = {
      primaryGuardian: {
        primaryGuardianRelation: formData.primaryGuardian.relation,
        primaryGuardianName: formData.primaryGuardian.name,
        primaryGuardianPhoneNumber: formData.primaryGuardian.phoneNumber,
        primaryGuardianOccupation: formData.primaryGuardian.occupation,
      },
      secondaryGuardian: {
        secondaryGuardianRelation: formData.secondaryGuardian.relation,
        secondaryGuardianName: formData.secondaryGuardian.name,
        secondaryGuardianPhoneNumber: formData.secondaryGuardian.phoneNumber,
        secondaryGuardianOccupation: formData.secondaryGuardian.occupation,
      },
      noOfBrothers: formData.noOfBrothers,
      noOfSisters: formData.noOfSisters,
      noOfBrothersMarried: formData.marriedBrothers,
      noOfSistersMarried: formData.marriedSisters,
    };
    
    updateMutation.mutate(updateData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';
  const relationOptions = dropdowns?.find((d: any) => d.id === 'relation')?.data || {};
  const workingWithOptions = dropdowns?.find((d: any) => d.id === 'workingWith')?.data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Guardian 1 (Primary):</h3>
            
            <div>
              <Label>Relation:</Label>
              <Select 
                value={formData.primaryGuardian.relation} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  primaryGuardian: {...formData.primaryGuardian, relation: value}
                })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Relation" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(relationOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Name:*</Label>
              <Input
                value={formData.primaryGuardian.name}
                onChange={(e) => setFormData({
                  ...formData, 
                  primaryGuardian: {...formData.primaryGuardian, name: e.target.value}
                })}
                disabled={!canEdit}
                placeholder="Enter guardian name"
              />
            </div>

            <div>
              <Label>Phone Number:</Label>
              <Input
                value={formData.primaryGuardian.phoneNumber}
                onChange={(e) => setFormData({
                  ...formData, 
                  primaryGuardian: {...formData.primaryGuardian, phoneNumber: e.target.value}
                })}
                disabled={!canEdit}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label>Occupation:*</Label>
              <Select 
                value={formData.primaryGuardian.occupation} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  primaryGuardian: {...formData.primaryGuardian, occupation: value}
                })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Occupation" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(workingWithOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Guardian 2 (Secondary):</h3>
            
            <div>
              <Label>Relation:</Label>
              <Select 
                value={formData.secondaryGuardian.relation} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  secondaryGuardian: {...formData.secondaryGuardian, relation: value}
                })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Relation" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(relationOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Name:*</Label>
              <Input
                value={formData.secondaryGuardian.name}
                onChange={(e) => setFormData({
                  ...formData, 
                  secondaryGuardian: {...formData.secondaryGuardian, name: e.target.value}
                })}
                disabled={!canEdit}
                placeholder="Enter guardian name"
              />
            </div>

            <div>
              <Label>Phone Number:</Label>
              <Input
                value={formData.secondaryGuardian.phoneNumber}
                onChange={(e) => setFormData({
                  ...formData, 
                  secondaryGuardian: {...formData.secondaryGuardian, phoneNumber: e.target.value}
                })}
                disabled={!canEdit}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label>Occupation:*</Label>
              <Select 
                value={formData.secondaryGuardian.occupation} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  secondaryGuardian: {...formData.secondaryGuardian, occupation: value}
                })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Occupation" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(workingWithOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-6">Siblings:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <Label>No Of Brothers:*</Label>
              <Input
                type="number"
                value={formData.noOfBrothers}
                onChange={(e) => setFormData({...formData, noOfBrothers: e.target.value})}
                disabled={!canEdit}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Married Brothers:*</Label>
              <Input
                type="number"
                value={formData.marriedBrothers}
                onChange={(e) => setFormData({...formData, marriedBrothers: e.target.value})}
                disabled={!canEdit}
                placeholder="0"
              />
            </div>

            <div>
              <Label>No Of Sisters:*</Label>
              <Input
                type="number"
                value={formData.noOfSisters}
                onChange={(e) => setFormData({...formData, noOfSisters: e.target.value})}
                disabled={!canEdit}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Married Sister:*</Label>
              <Input
                type="number"
                value={formData.marriedSisters}
                onChange={(e) => setFormData({...formData, marriedSisters: e.target.value})}
                disabled={!canEdit}
                placeholder="0"
              />
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

export default FamilyDetailsTab;
