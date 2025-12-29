import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { resetUserPassword } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ResetPinTabProps {
  userProfile: any;
  currentUser: any;
  userId: string;
}

const ResetPinTab: React.FC<ResetPinTabProps> = ({
  userProfile,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const [newPin, setNewPin] = useState('');

  const resetPinMutation = useMutation({
    mutationFn: (pin: string) => resetUserPassword(userId, pin),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "PIN reset successfully",
      });
      setNewPin('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset PIN",
        variant: "destructive",
      });
    },
  });

  const handleResetPin = () => {
    if (newPin.length !== 4) {
      toast({
        title: "Error",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }
    resetPinMutation.mutate(newPin);
  };

  const canResetPin = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset PIN</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>User Phone Number</Label>
            <Input 
              value={userProfile?.registeredMobileNumber || 'N/A'} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>

          <div>
            <Label>New PIN (4 digits)</Label>
            <PasswordInput
              value={newPin}
              onChange={setNewPin}
              disabled={!canResetPin}
            />
          </div>

          {canResetPin && (
            <Button 
              onClick={handleResetPin}
              disabled={resetPinMutation.isPending || newPin.length !== 4}
              className="bg-primary hover:bg-primary/90"
            >
              {resetPinMutation.isPending ? 'Resetting...' : 'Reset PIN'}
            </Button>
          )}

          {!canResetPin && (
            <p className="text-sm text-gray-500">
              You don't have permission to reset PIN
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResetPinTab;
