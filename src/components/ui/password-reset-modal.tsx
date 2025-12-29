
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
  isLoading?: boolean;
  title: string;
  description: string;
  userInfo: {
    name: string;
    phone: string;
    id: string;
  };
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title,
  description,
  userInfo,
}) => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (value: string) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setNewPassword(numericValue);
  };

  const handleConfirmPasswordChange = (value: string) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setConfirmPassword(numericValue);
  };

  const handleSubmit = () => {
    if (newPassword.length !== 4) {
      toast({
        title: "Error",
        description: "Password must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    onConfirm(newPassword);
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">User Details</Label>
            <div className="p-3 bg-gray-50 rounded-md space-y-1">
              <p className="text-sm"><span className="font-medium">Name:</span> {userInfo.name}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {userInfo.phone}</p>
              <p className="text-sm"><span className="font-medium">ID:</span> {userInfo.id}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password (4 digits)</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter 4-digit password"
                maxLength={4}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password (4 digits)</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Confirm 4-digit password"
                maxLength={4}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || newPassword.length !== 4 || confirmPassword.length !== 4}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetModal;
