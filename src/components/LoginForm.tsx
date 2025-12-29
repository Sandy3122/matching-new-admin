
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/api';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginUser(phoneNumber, pin);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.name || 'User'}!`,
        });
        onLogin();
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your phone number and PIN.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="https://i.postimg.cc/W1qxgjkZ/logo.jpg"
              alt="MatchingJodi.Com logo"
              className="h-8 w-8 rounded-sm object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter your phone number and PIN to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="pin">4-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                pattern="[0-9]{4}"
                required
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember Me
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
