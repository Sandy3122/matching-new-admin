import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PhoneInput from '@/components/ui/phone-input';
import PasswordInput from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { registerEmployee } from '@/lib/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const initialState = {
  firstName: '',
  lastName: '',
  gender: '',
  maritalStatus: '',
  dateOfBirth: '',
  email: '',
  phoneNumber: '',
  emergencyPhoneNumber: '',
  kycDocumentType: '',
  pin: '',
  confirmPin: '',
};

const EmployeeRegistrationTab: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialState);
  const [files, setFiles] = useState<{
    kycDocument: File | null;
    employeePhoto: File | null;
    employeeResume: File | null;
  }>({ kycDocument: null, employeePhoto: null, employeeResume: null });

  const update = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  const validateFile = (file: File, accept: string[]): string | null => {
    if (file.size > MAX_FILE_SIZE) return 'File must be 5MB or smaller';
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!accept.includes(ext)) return `Allowed types: ${accept.join(', ')}`;
    return null;
  };

  const handleFile = (key: keyof typeof files, accept: string[]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const err = validateFile(file, accept);
      if (err) {
        toast({ title: 'Invalid file', description: err, variant: 'destructive' });
        e.target.value = '';
        return;
      }
    }
    setFiles((p) => ({ ...p, [key]: file }));
  };

  const reset = () => {
    setFormData(initialState);
    setFiles({ kycDocument: null, employeePhoto: null, employeeResume: null });
  };

  const mutation = useMutation({
    mutationFn: registerEmployee,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Employee registered successfully' });
      reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to register employee',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phoneNumber.length !== 10) {
      toast({ title: 'Error', description: 'Phone number must be exactly 10 digits', variant: 'destructive' });
      return;
    }
    if (formData.emergencyPhoneNumber.length !== 10) {
      toast({ title: 'Error', description: 'Emergency phone number must be exactly 10 digits', variant: 'destructive' });
      return;
    }
    if (formData.phoneNumber === formData.emergencyPhoneNumber) {
      toast({ title: 'Error', description: 'Phone and emergency phone must differ', variant: 'destructive' });
      return;
    }
    if (formData.pin.length !== 4) {
      toast({ title: 'Error', description: 'PIN must be exactly 4 digits', variant: 'destructive' });
      return;
    }
    if (formData.pin !== formData.confirmPin) {
      toast({ title: 'Error', description: 'PIN and Confirm PIN do not match', variant: 'destructive' });
      return;
    }
    if (!files.kycDocument || !files.employeePhoto || !files.employeeResume) {
      toast({ title: 'Error', description: 'KYC document, photo and resume are all required', variant: 'destructive' });
      return;
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    fd.append('kycDocument', files.kycDocument);
    fd.append('employeePhoto', files.employeePhoto);
    fd.append('profilePic', files.employeePhoto);
    fd.append('employeeResume', files.employeeResume);

    mutation.mutate(fd);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name:</Label>
              <Input id="firstName" value={formData.firstName} onChange={(e) => update('firstName', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name:</Label>
              <Input id="lastName" value={formData.lastName} onChange={(e) => update('lastName', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Gender:</Label>
              <Select value={formData.gender} onValueChange={(v) => update('gender', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marital Status:</Label>
              <Select value={formData.maritalStatus} onValueChange={(v) => update('maritalStatus', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Marital Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="unmarried">Unmarried</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date Of Birth:</Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email:</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number (10 digits):</Label>
              <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(v) => update('phoneNumber', v)} required />
            </div>
            <div>
              <Label htmlFor="emergencyPhoneNumber">Emergency Phone (10 digits):</Label>
              <PhoneInput id="emergencyPhoneNumber" value={formData.emergencyPhoneNumber} onChange={(v) => update('emergencyPhoneNumber', v)} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>KYC Document Type:</Label>
              <Select value={formData.kycDocumentType} onValueChange={(v) => update('kycDocumentType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhar">Aadhar</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="driving">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pin">PIN (4 digits):</Label>
              <PasswordInput id="pin" value={formData.pin} onChange={(v) => update('pin', v)} required />
            </div>
            <div>
              <Label htmlFor="confirmPin">Confirm PIN (4 digits):</Label>
              <PasswordInput id="confirmPin" value={formData.confirmPin} onChange={(v) => update('confirmPin', v)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="kycDocument">KYC Document (PDF):</Label>
              <Input id="kycDocument" type="file" accept=".pdf" onChange={handleFile('kycDocument', ['pdf'])} required />
            </div>
            <div>
              <Label htmlFor="employeePhoto">Photo (JPEG/JPG/PNG):</Label>
              <Input id="employeePhoto" type="file" accept=".jpg,.jpeg,.png" onChange={handleFile('employeePhoto', ['jpg', 'jpeg', 'png'])} required />
            </div>
            <div>
              <Label htmlFor="employeeResume">Resume (PDF):</Label>
              <Input id="employeeResume" type="file" accept=".pdf" onChange={handleFile('employeeResume', ['pdf'])} required />
            </div>
          </div>

          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting...' : 'Register Employee'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeRegistrationTab;
