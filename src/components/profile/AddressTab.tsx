
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AddressTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
  countryData?: any;
}

const AddressTab: React.FC<AddressTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
  countryData,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    currentAddress: {
      country: '',
      state: '',
      city: '',
      town: '',
    },
    permanentAddress: {
      country: '',
      state: '',
      city: '',
      town: '',
    }
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        currentAddress: {
          country: userProfile.currentAddress?.currentCountry || '',
          state: userProfile.currentAddress?.currentState || '',
          city: userProfile.currentAddress?.currentCity || '',
          town: userProfile.currentAddress?.currentTown || '',
        },
        permanentAddress: {
          country: userProfile.permanentAddress?.permanentCountry || '',
          state: userProfile.permanentAddress?.permanentState || '',
          city: userProfile.permanentAddress?.permanentCity || '',
          town: userProfile.permanentAddress?.permanentTown || '',
        }
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserData(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Address details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update address details",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updateData = {
      currentAddress: {
        currentCountry: formData.currentAddress.country,
        currentState: formData.currentAddress.state,
        currentCity: formData.currentAddress.city,
        currentTown: formData.currentAddress.town,
      },
      permanentAddress: {
        permanentCountry: formData.permanentAddress.country,
        permanentState: formData.permanentAddress.state,
        permanentCity: formData.permanentAddress.city,
        permanentTown: formData.permanentAddress.town,
      }
    };
    
    updateMutation.mutate(updateData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  const getStatesForCountry = (country: string) => {
    return countryData?.[country] || {};
  };

  const getCitiesForState = (country: string, state: string) => {
    return countryData?.[country]?.[state] || {};
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Current Address:</h3>
            
            <div>
              <Label>Country:</Label>
              <Select 
                value={formData.currentAddress.country} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  currentAddress: {
                    ...formData.currentAddress, 
                    country: value,
                    state: '',
                    city: ''
                  }
                })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(countryData || {}).map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>State:</Label>
              <Select 
                value={formData.currentAddress.state} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  currentAddress: {
                    ...formData.currentAddress, 
                    state: value,
                    city: ''
                  }
                })}
                disabled={!canEdit || !formData.currentAddress.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(getStatesForCountry(formData.currentAddress.country)).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state.charAt(0).toUpperCase() + state.slice(1).replace(/([A-Z])/g, ' $1')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>City:</Label>
              <Select 
                value={formData.currentAddress.city} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  currentAddress: {...formData.currentAddress, city: value}
                })}
                disabled={!canEdit || !formData.currentAddress.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(getCitiesForState(formData.currentAddress.country, formData.currentAddress.state)).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Town:</Label>
              <Input
                value={formData.currentAddress.town}
                onChange={(e) => setFormData({
                  ...formData, 
                  currentAddress: {...formData.currentAddress, town: e.target.value}
                })}
                disabled={!canEdit}
                placeholder="Enter town"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Permanent Address:</h3>
            
            <div>
              <Label>Country:*</Label>
              <Select 
                value={formData.permanentAddress.country} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  permanentAddress: {
                    ...formData.permanentAddress, 
                    country: value,
                    state: '',
                    city: ''
                  }
                })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(countryData || {}).map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>State:*</Label>
              <Select 
                value={formData.permanentAddress.state} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  permanentAddress: {
                    ...formData.permanentAddress, 
                    state: value,
                    city: ''
                  }
                })}
                disabled={!canEdit || !formData.permanentAddress.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(getStatesForCountry(formData.permanentAddress.country)).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state.charAt(0).toUpperCase() + state.slice(1).replace(/([A-Z])/g, ' $1')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>City:*</Label>
              <Select 
                value={formData.permanentAddress.city} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  permanentAddress: {...formData.permanentAddress, city: value}
                })}
                disabled={!canEdit || !formData.permanentAddress.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(getCitiesForState(formData.permanentAddress.country, formData.permanentAddress.state)).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Town:</Label>
              <Input
                value={formData.permanentAddress.town}
                onChange={(e) => setFormData({
                  ...formData, 
                  permanentAddress: {...formData.permanentAddress, town: e.target.value}
                })}
                disabled={!canEdit}
                placeholder="Enter town"
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

export default AddressTab;
