
import React from 'react';
import { Input } from '@/components/ui/input';

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 10 digits
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(numericValue);
  };

  return (
    <Input
      {...props}
      type="tel"
      value={value}
      onChange={handleChange}
      maxLength={10}
      placeholder="Enter 10-digit phone number"
    />
  );
};

export default PhoneInput;
