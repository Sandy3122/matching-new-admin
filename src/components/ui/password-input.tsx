
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value' | 'type'> {
  value: string;
  onChange: (value: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, className, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={handleChange}
        maxLength={4}
        placeholder="Enter 4-digit password"
        className={`pr-10 ${className}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default PasswordInput;
