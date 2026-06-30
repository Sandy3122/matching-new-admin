import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PhoneInput from '@/components/ui/phone-input';
import PasswordInput from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { registerUser, fetchDropdowns } from '@/lib/api';

const UserRegistrationTab: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    profileFor: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    maritalStatus: '',
    religion: '',
    noOfChild: '',
    livingWithChild: '',
    pin: '',
    confirmPin: '',
  });

  const { data: dropdowns } = useQuery({
    queryKey: ['dropdowns'],
    queryFn: fetchDropdowns,
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User registered successfully",
      });
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        profileFor: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        maritalStatus: '',
        religion: '',
        noOfChild: '',
        livingWithChild: '',
        pin: '',
        confirmPin: '',
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.phoneNumber.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.pin.length !== 4) {
      toast({
        title: "Error",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      toast({
        title: "Error",
        description: "PIN and Confirm PIN do not match",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name:</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name:</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Gender:</Label>
              <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profile For:</Label>
              <Select value={formData.profileFor} onValueChange={(value) => updateFormData('profileFor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="son">Son</SelectItem>
                  <SelectItem value="daughter">Daughter</SelectItem>
                  <SelectItem value="brother">Brother</SelectItem>
                  <SelectItem value="sister">Sister</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="relative">Relative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email:</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number (10 digits):</Label>
              <PhoneInput
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(value) => updateFormData('phoneNumber', value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date Of Birth:</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Marital Status:</Label>
              <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData('maritalStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Marital Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neverMarried">Never Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widow">Widow</SelectItem>
                  <SelectItem value="awaitingDivorce">Awaiting Divorce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Religion:</Label>
              <Select value={formData.religion} onValueChange={(value) => updateFormData('religion', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hindu">Hindu</SelectItem>
                  <SelectItem value="muslim">Muslim</SelectItem>
                  <SelectItem value="christian">Christian</SelectItem>
                  <SelectItem value="sikh">Sikh</SelectItem>
                  <SelectItem value="buddhist">Buddhist</SelectItem>
                  <SelectItem value="jain">Jain</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="noOfChild">No Of Child:</Label>
              <Input
                id="noOfChild"
                value={formData.noOfChild}
                onChange={(e) => updateFormData('noOfChild', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Living With Child:</Label>
              <Select value={formData.livingWithChild} onValueChange={(value) => updateFormData('livingWithChild', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pin">PIN/Password (4 digits):</Label>
              <PasswordInput
                id="pin"
                value={formData.pin}
                onChange={(value) => updateFormData('pin', value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPin">Confirm PIN/Password (4 digits):</Label>
              <PasswordInput
                id="confirmPin"
                value={formData.confirmPin}
                onChange={(value) => updateFormData('confirmPin', value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserRegistrationTab;
