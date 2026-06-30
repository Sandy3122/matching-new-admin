import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReligionAstroTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
}

const ReligionAstroTab: React.FC<ReligionAstroTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    religion: '',
    caste: '',
    subCaste: '',
    manglikStatus: '',
    rashi: '',
    timeOfBirth: '',
    birthPlace: '',
  });

  // Sync to current userProfile!
  useEffect(() => {
    if (userProfile) {
      setFormData({
        religion: userProfile.religion || '',
        caste: userProfile.caste || '',
        subCaste: userProfile.subCaste || '',
        manglikStatus: userProfile.manglikStatus || '',
        rashi: userProfile.rashi || '',
        timeOfBirth: userProfile.timeOfBirth || '',
        birthPlace: userProfile.birthPlace || '',
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserData(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Religion & Astro details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update Religion & Astro details",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  const religionOptions = dropdowns?.find((d: any) => d.id === 'religion')?.data || {};
  const casteOptions = dropdowns?.find((d: any) => d.id === 'caste')?.data || {};
  const manglikOptions = dropdowns?.find((d: any) => d.id === 'manglik')?.data || {};
  const rashiOptions = dropdowns?.find((d: any) => d.id === 'rashi')?.data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Religion & Astro:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Religion:*</Label>
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

          <div>
            <Label>Caste:*</Label>
            <Select
              value={formData.caste}
              onValueChange={(value) => setFormData({...formData, caste: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Caste" />
              </SelectTrigger>
              <SelectContent>
                {/* Preserve a previously-saved value that is not in the options list */}
                {formData.caste && !(formData.caste in casteOptions) && (
                  <SelectItem value={formData.caste}>{formData.caste}</SelectItem>
                )}
                {Object.entries(casteOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sub Caste:</Label>
            <Input
              value={formData.subCaste}
              onChange={(e) => setFormData({...formData, subCaste: e.target.value})}
              disabled={!canEdit}
              placeholder="Enter sub caste"
            />
          </div>

          <div>
            <Label>Manglik:*</Label>
            <Select 
              value={formData.manglikStatus} 
              onValueChange={(value) => setFormData({...formData, manglikStatus: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(manglikOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rashi:</Label>
            <Select 
              value={formData.rashi} 
              onValueChange={(value) => setFormData({...formData, rashi: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(rashiOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Time Of Birth:*</Label>
            <Input
              type="time"
              value={formData.timeOfBirth}
              onChange={(e) => setFormData({...formData, timeOfBirth: e.target.value})}
              disabled={!canEdit}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Birth Place:*</Label>
            <Input
              value={formData.birthPlace}
              onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
              disabled={!canEdit}
              placeholder="Enter birth place"
            />
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

export default ReligionAstroTab;
