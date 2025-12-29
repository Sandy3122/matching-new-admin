import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PersonalDetailsTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
}

const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Always store form state with useState
  const [formData, setFormData] = useState({
    profileFor: '',
    aboutMe: '',
    age: '',
    height: '',
    bodyType: '',
    diet: '',
    drink: '',
    smoke: '',
    language: '',
    anyDisability: '',
  });

  // This effect ensures that when userProfile changes (from API fetch or after an update), the form syncs
  useEffect(() => {
    if (userProfile) {
      setFormData({
        profileFor: userProfile.profileFor || '',
        aboutMe: userProfile.aboutMeDescription || '',
        age: userProfile.age || '',
        height: userProfile.height || '',
        bodyType: userProfile.bodyType || '',
        diet: userProfile.diet || '',
        drink: userProfile.drink || '',
        smoke: userProfile.smoke || '',
        language: userProfile.languagesKnown || '',
        anyDisability: userProfile.anyDisability || '',
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserData(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personal details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update personal details",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updateData = {
      profileFor: formData.profileFor,
      aboutMeDescription: formData.aboutMe,
      age: formData.age,
      height: formData.height,
      bodyType: formData.bodyType,
      diet: formData.diet,
      drink: formData.drink,
      smoke: formData.smoke,
      languagesKnown: formData.language,
      anyDisability: formData.anyDisability,
    };
    updateMutation.mutate(updateData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  const profileForOptions = dropdowns?.find((d: any) => d.id === 'profileFor')?.data || {};
  const heightOptions = dropdowns?.find((d: any) => d.id === 'height')?.data || {};
  const bodyTypeOptions = dropdowns?.find((d: any) => d.id === 'bodyType')?.data || {};
  const dietOptions = dropdowns?.find((d: any) => d.id === 'diet')?.data || {};
  const drinkOptions = dropdowns?.find((d: any) => d.id === 'drink')?.data || {};
  const smokeOptions = dropdowns?.find((d: any) => d.id === 'smoke')?.data || {};
  const languageOptions = dropdowns?.find((d: any) => d.id === 'language')?.data || {};
  const disabilityOptions = dropdowns?.find((d: any) => d.id === 'anyDisability')?.data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Profile For:</Label>
            <Select 
              value={formData.profileFor} 
              onValueChange={(value) => setFormData({...formData, profileFor: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Profile For" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(profileForOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Diet:*</Label>
            <Select 
              value={formData.diet} 
              onValueChange={(value) => setFormData({...formData, diet: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Diet" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(dietOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>About Me:*</Label>
            <Textarea
              value={formData.aboutMe}
              onChange={(e) => setFormData({...formData, aboutMe: e.target.value})}
              disabled={!canEdit}
              placeholder="Write about yourself..."
              className="min-h-[100px]"
            />
            <div className="text-sm text-gray-500 mt-1">
              Word Count: {formData.aboutMe.split(' ').filter(word => word.length > 0).length}, 
              Recommended 190 words
            </div>
          </div>

          <div>
            <Label>Drink:*</Label>
            <Select 
              value={formData.drink} 
              onValueChange={(value) => setFormData({...formData, drink: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(drinkOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Age:*</Label>
            <Input
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              disabled={!canEdit}
              placeholder="24 Years"
            />
          </div>

          <div>
            <Label>Smoke:*</Label>
            <Select 
              value={formData.smoke} 
              onValueChange={(value) => setFormData({...formData, smoke: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(smokeOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Height:*</Label>
            <Select 
              value={formData.height} 
              onValueChange={(value) => setFormData({...formData, height: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Height" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(heightOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Language:</Label>
            <Select 
              value={formData.language} 
              onValueChange={(value) => setFormData({...formData, language: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languageOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Body Type:</Label>
            <Select 
              value={formData.bodyType} 
              onValueChange={(value) => setFormData({...formData, bodyType: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Body Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(bodyTypeOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Any Disability:</Label>
            <Select 
              value={formData.anyDisability} 
              onValueChange={(value) => setFormData({...formData, anyDisability: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(disabilityOptions).map(([key, value]) => (
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

export default PersonalDetailsTab;
