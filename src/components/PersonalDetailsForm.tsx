
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const PersonalDetailsForm = () => {
  const [formData, setFormData] = useState({
    profileFor: 'Friend',
    aboutMe: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered',
    age: '24 Years',
    height: '5.7',
    bodyType: 'Average Built',
    diet: 'Egalitarian',
    drink: 'No',
    smoke: 'No',
    language: 'Odia',
    anyDisability: ''
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Personal details have been updated successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="profileFor">Profile For:</Label>
            <Select value={formData.profileFor} onValueChange={(value) => handleInputChange('profileFor', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Self">Self</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Son">Son</SelectItem>
                <SelectItem value="Daughter">Daughter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="age">Age:*</Label>
            <Input
              id="age"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter age"
            />
          </div>

          <div>
            <Label htmlFor="height">Height:*</Label>
            <Select value={formData.height} onValueChange={(value) => handleInputChange('height', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5.0">5.0</SelectItem>
                <SelectItem value="5.1">5.1</SelectItem>
                <SelectItem value="5.2">5.2</SelectItem>
                <SelectItem value="5.3">5.3</SelectItem>
                <SelectItem value="5.4">5.4</SelectItem>
                <SelectItem value="5.5">5.5</SelectItem>
                <SelectItem value="5.6">5.6</SelectItem>
                <SelectItem value="5.7">5.7</SelectItem>
                <SelectItem value="5.8">5.8</SelectItem>
                <SelectItem value="5.9">5.9</SelectItem>
                <SelectItem value="6.0">6.0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bodyType">Body Type:</Label>
            <Select value={formData.bodyType} onValueChange={(value) => handleInputChange('bodyType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Slim">Slim</SelectItem>
                <SelectItem value="Average Built">Average Built</SelectItem>
                <SelectItem value="Athletic">Athletic</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="diet">Diet:*</Label>
            <Select value={formData.diet} onValueChange={(value) => handleInputChange('diet', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="Egalitarian">Egalitarian</SelectItem>
                <SelectItem value="Vegan">Vegan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="drink">Drink:*</Label>
            <Select value={formData.drink} onValueChange={(value) => handleInputChange('drink', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Occasionally">Occasionally</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="smoke">Smoke:*</Label>
            <Select value={formData.smoke} onValueChange={(value) => handleInputChange('smoke', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Occasionally">Occasionally</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language:</Label>
            <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Odia">Odia</SelectItem>
                <SelectItem value="Bengali">Bengali</SelectItem>
                <SelectItem value="Tamil">Tamil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="anyDisability">Any Disability:</Label>
            <Select value={formData.anyDisability} onValueChange={(value) => handleInputChange('anyDisability', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Physical">Physical</SelectItem>
                <SelectItem value="Visual">Visual</SelectItem>
                <SelectItem value="Hearing">Hearing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="aboutMe">About Me:*</Label>
          <Textarea
            id="aboutMe"
            value={formData.aboutMe}
            onChange={(e) => handleInputChange('aboutMe', e.target.value)}
            placeholder="Tell us about yourself..."
            className="min-h-[100px] mt-1"
          />
          <div className="text-sm text-gray-500 mt-1">
            Word Count: {formData.aboutMe.split(' ').length}, Recommended 190 words
          </div>
        </div>

        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalDetailsForm;
