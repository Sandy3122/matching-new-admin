import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { HierarchicalMultiSelect } from '@/components/ui/hierarchical-multi-select';
import { updateUserData, fetchUserById } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PartnerPreferencesTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
  countryData: any;
}

const PartnerPreferencesTab: React.FC<PartnerPreferencesTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
  countryData,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    partnerEducationLevel: [] as string[],
    partnerWorkingWith: [] as string[],
    partnerAnnualIncome: '',
    partnerMinAge: '',
    partnerMaxAge: '',
    partnerMinHeight: '',
    partnerMaxHeight: '',
    partnerMaritalStatus: [] as string[],
    partnerReligion: [] as string[],
    partnerCaste: '',
    partnerSubCaste: '',
    partnerManglikStatus: '',
    partnerLanguage: [] as string[],
    partnerDiet: [] as string[],
    partnerDrink: '',
    partnerSmoke: '',
    partnerDisability: '',
    partnerCountry: [] as string[],
    partnerState: [] as string[],
    partnerCity: [] as string[],
  });

  // Fetch user gender to determine age range
  const { data: userGenderData } = useQuery({
    queryKey: ['userGender', userId],
    queryFn: () => fetchUserById(userId, 'gender'),
    enabled: !!userId,
  });

  const userGender = userGenderData?.data?.gender;

  useEffect(() => {
    if (userProfile?.partnerDetails) {
      const pd = userProfile.partnerDetails;
      setFormData({
        partnerEducationLevel: pd.partnerEducationLevel || [],
        partnerWorkingWith: pd.partnerWorkingWith || [],
        partnerAnnualIncome: pd.partnerAnnualIncome || '',
        partnerMinAge: pd.partnerMinAge || '',
        partnerMaxAge: pd.partnerMaxAge || '',
        partnerMinHeight: pd.partnerMinHeight || '',
        partnerMaxHeight: pd.partnerMaxHeight || '',
        partnerMaritalStatus: pd.partnerMaritalStatus || [],
        partnerReligion: pd.partnerReligion || [],
        partnerCaste: pd.partnerCaste || '',
        partnerSubCaste: pd.partnerSubCaste || '',
        partnerManglikStatus: pd.partnerManglikStatus || '',
        partnerLanguage: pd.partnerLanguage || [],
        partnerDiet: pd.partnerDiet || [],
        partnerDrink: pd.partnerDrink || '',
        partnerSmoke: pd.partnerSmoke || '',
        partnerDisability: pd.partnerDisability || '',
        partnerCountry: pd.partnerCountry || [],
        partnerState: pd.partnerState || [],
        partnerCity: pd.partnerCity || [],
      });
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      // Build partnerStatesAndCity object according to API format
      const partnerStatesAndCity: any = {};
      
      // Group states and cities by country
      formData.partnerCountry.forEach(country => {
        if (countryData[country]) {
          partnerStatesAndCity[country] = {};
          
          // Find states that belong to this country
          formData.partnerState.forEach(state => {
            if (countryData[country][state]) {
              partnerStatesAndCity[country][state] = [];
              
              // Find cities that belong to this state
              formData.partnerCity.forEach(city => {
                if (countryData[country][state][city]) {
                  partnerStatesAndCity[country][state].push(city);
                }
              });
            }
          });
        }
      });

      const partnerDetails = {
        ...data,
        partnerStatesAndCity
      };

      return updateUserData(userId, { partnerDetails });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Partner preferences updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update partner preferences",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  // Get dropdown options
  const educationOptions = dropdowns?.find((d: any) => d.id === 'heighestQualification')?.data || {};
  const workingWithOptions = dropdowns?.find((d: any) => d.id === 'workingWith')?.data || {};
  const incomeOptions = dropdowns?.find((d: any) => d.id === 'annualIncome')?.data || {};
  const ageOptions = dropdowns?.find((d: any) => d.id === 'age')?.data || {};
  const heightOptions = dropdowns?.find((d: any) => d.id === 'height')?.data || {};
  const maritalStatusOptions = dropdowns?.find((d: any) => d.id === 'maritalStatus')?.data || {};
  const religionOptions = dropdowns?.find((d: any) => d.id === 'religion')?.data || {};
  const manglikOptions = dropdowns?.find((d: any) => d.id === 'manglik')?.data || {};
  const languageOptions = dropdowns?.find((d: any) => d.id === 'language')?.data || {};
  const dietOptions = dropdowns?.find((d: any) => d.id === 'diet')?.data || {};
  const drinkOptions = dropdowns?.find((d: any) => d.id === 'drink')?.data || {};
  const smokeOptions = dropdowns?.find((d: any) => d.id === 'smoke')?.data || {};
  const disabilityOptions = dropdowns?.find((d: any) => d.id === 'anyDisability')?.data || {};

  // Filter age options based on gender
  const getMinAgeOptions = () => {
    const minAge = userGender === 'male' ? 21 : 18;
    return Object.entries(ageOptions).filter(([key]) => parseInt(key) >= minAge);
  };

  const getMaxAgeOptions = () => {
    if (!formData.partnerMinAge) return Object.entries(ageOptions);
    const minAge = parseInt(formData.partnerMinAge);
    return Object.entries(ageOptions).filter(([key]) => parseInt(key) >= minAge);
  };

  // Filter height options for max height based on min height
  const getMaxHeightOptions = () => {
    if (!formData.partnerMinHeight) return Object.entries(heightOptions);
    const minHeight = parseFloat(formData.partnerMinHeight);
    return Object.entries(heightOptions).filter(([key]) => parseFloat(key) >= minHeight);
  };

  // Get available countries as simple key-value pairs
  const getAvailableCountries = () => {
    if (!countryData) return {};
    const countries: Record<string, string> = {};
    Object.keys(countryData).forEach(country => {
      countries[country] = country;
    });
    return countries;
  };

  // Get available states based on selected countries
  const getAvailableStates = () => {
    if (!countryData || formData.partnerCountry.length === 0) return {};
    
    const states: Record<string, string> = {};
    formData.partnerCountry.forEach(country => {
      if (countryData[country]) {
        Object.entries(countryData[country]).forEach(([stateKey, stateName]) => {
          states[stateKey] = stateName as string;
        });
      }
    });
    return states;
  };

  // Get state label with country prefix
  const getStateLabel = (stateKey: string, options: Record<string, any>) => {
    for (const country of formData.partnerCountry) {
      if (countryData[country] && countryData[country][stateKey]) {
        const stateName = countryData[country][stateKey];
        return `${country} → ${stateName}`;
      }
    }
    return options[stateKey] || stateKey;
  };

  // Get available cities based on selected states
  const getAvailableCities = () => {
    if (!countryData || formData.partnerState.length === 0) return {};
    
    const cities: Record<string, string> = {};
    formData.partnerCountry.forEach(country => {
      if (countryData[country]) {
        formData.partnerState.forEach(state => {
          if (countryData[country][state]) {
            Object.entries(countryData[country][state]).forEach(([cityKey, cityName]) => {
              cities[cityKey] = cityName as string;
            });
          }
        });
      }
    });
    return cities;
  };

  // Get city label with country and state prefix
  const getCityLabel = (cityKey: string, options: Record<string, any>) => {
    for (const country of formData.partnerCountry) {
      if (countryData[country]) {
        for (const state of formData.partnerState) {
          if (countryData[country][state] && countryData[country][state][cityKey]) {
            const stateName = countryData[country][state];
            const cityName = countryData[country][state][cityKey];
            return `${country} → ${stateName} → ${cityName}`;
          }
        }
      }
    }
    return options[cityKey] || cityKey;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Education And Career Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Education And Career:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Education Level:*</Label>
              <MultiSelect
                options={educationOptions}
                value={formData.partnerEducationLevel}
                onChange={(value) => setFormData({...formData, partnerEducationLevel: value})}
                placeholder="Select education levels"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label>Working With:*</Label>
              <MultiSelect
                options={workingWithOptions}
                value={formData.partnerWorkingWith}
                onChange={(value) => setFormData({...formData, partnerWorkingWith: value})}
                placeholder="Select working with"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label>Annual Income:*</Label>
              <Select 
                value={formData.partnerAnnualIncome} 
                onValueChange={(value) => setFormData({...formData, partnerAnnualIncome: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select annual income" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(incomeOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div></div>

            <div>
              <Label>Age:</Label>
              <div className="text-sm text-gray-600 mb-2">Min Age:*</div>
              <Select 
                value={formData.partnerMinAge} 
                onValueChange={(value) => {
                  setFormData({...formData, partnerMinAge: value});
                  // Reset max age if it's less than new min age
                  if (formData.partnerMaxAge && parseInt(formData.partnerMaxAge) < parseInt(value)) {
                    setFormData(prev => ({...prev, partnerMinAge: value, partnerMaxAge: ''}));
                  }
                }}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select min age" />
                </SelectTrigger>
                <SelectContent>
                  {getMinAgeOptions().map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="invisible">Age</Label>
              <div className="text-sm text-gray-600 mb-2">Max Age:*</div>
              <Select 
                value={formData.partnerMaxAge} 
                onValueChange={(value) => setFormData({...formData, partnerMaxAge: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max age" />
                </SelectTrigger>
                <SelectContent>
                  {getMaxAgeOptions().map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Height:</Label>
              <div className="text-sm text-gray-600 mb-2">Min Height:</div>
              <Select 
                value={formData.partnerMinHeight} 
                onValueChange={(value) => {
                  setFormData({...formData, partnerMinHeight: value});
                  // Reset max height if it's less than new min height
                  if (formData.partnerMaxHeight && parseFloat(formData.partnerMaxHeight) < parseFloat(value)) {
                    setFormData(prev => ({...prev, partnerMinHeight: value, partnerMaxHeight: ''}));
                  }
                }}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select min height" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(heightOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="invisible">Height</Label>
              <div className="text-sm text-gray-600 mb-2">Max Height:</div>
              <Select 
                value={formData.partnerMaxHeight} 
                onValueChange={(value) => setFormData({...formData, partnerMaxHeight: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max height" />
                </SelectTrigger>
                <SelectContent>
                  {getMaxHeightOptions().map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Marital And Social Status Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Marital And Social Status:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Marital Status:*</Label>
              <MultiSelect
                options={maritalStatusOptions}
                value={formData.partnerMaritalStatus}
                onChange={(value) => setFormData({...formData, partnerMaritalStatus: value})}
                placeholder="Select marital status"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label>Religion:*</Label>
              <MultiSelect
                options={religionOptions}
                value={formData.partnerReligion}
                onChange={(value) => setFormData({...formData, partnerReligion: value})}
                placeholder="Select religion"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label>Caste:*</Label>
              <Input
                value={formData.partnerCaste}
                onChange={(e) => setFormData({...formData, partnerCaste: e.target.value})}
                disabled={!canEdit}
                placeholder="Enter caste"
              />
            </div>

            <div>
              <Label>Sub Caste:</Label>
              <Input
                value={formData.partnerSubCaste}
                onChange={(e) => setFormData({...formData, partnerSubCaste: e.target.value})}
                disabled={!canEdit}
                placeholder="Enter sub caste"
              />
            </div>

            <div>
              <Label>Manglik:</Label>
              <Select 
                value={formData.partnerManglikStatus} 
                onValueChange={(value) => setFormData({...formData, partnerManglikStatus: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manglik status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(manglikOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Language:</Label>
              <MultiSelect
                options={languageOptions}
                value={formData.partnerLanguage}
                onChange={(value) => setFormData({...formData, partnerLanguage: value})}
                placeholder="Select languages"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        {/* Health And Lifestyle Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Health And Lifestyle:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Diet:*</Label>
              <MultiSelect
                options={dietOptions}
                value={formData.partnerDiet}
                onChange={(value) => setFormData({...formData, partnerDiet: value})}
                placeholder="Select diet preferences"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label>Drink:*</Label>
              <Select 
                value={formData.partnerDrink} 
                onValueChange={(value) => setFormData({...formData, partnerDrink: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select drink preference" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(drinkOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Smoke:*</Label>
              <Select 
                value={formData.partnerSmoke} 
                onValueChange={(value) => setFormData({...formData, partnerSmoke: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select smoke preference" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(smokeOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Disability:</Label>
              <Select 
                value={formData.partnerDisability} 
                onValueChange={(value) => setFormData({...formData, partnerDisability: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select disability preference" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(disabilityOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Address:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Country:*</Label>
              <MultiSelect
                options={getAvailableCountries()}
                value={formData.partnerCountry}
                onChange={(value) => {
                  setFormData({
                    ...formData, 
                    partnerCountry: value,
                    partnerState: [], // Reset states when countries change
                    partnerCity: [] // Reset cities when countries change
                  });
                }}
                placeholder="Select countries"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label>State:*</Label>
              <HierarchicalMultiSelect
                options={getAvailableStates()}
                value={formData.partnerState}
                onChange={(value) => {
                  setFormData({
                    ...formData, 
                    partnerState: value,
                    partnerCity: [] // Reset cities when states change
                  });
                }}
                placeholder="Select states"
                disabled={!canEdit || formData.partnerCountry.length === 0}
                showHierarchicalLabels={true}
                getHierarchicalLabel={getStateLabel}
              />
            </div>

            <div>
              <Label>City:*</Label>
              <HierarchicalMultiSelect
                options={getAvailableCities()}
                value={formData.partnerCity}
                onChange={(value) => setFormData({...formData, partnerCity: value})}
                placeholder="Select cities"
                disabled={!canEdit || formData.partnerState.length === 0}
                showHierarchicalLabels={true}
                getHierarchicalLabel={getCityLabel}
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

export default PartnerPreferencesTab;
