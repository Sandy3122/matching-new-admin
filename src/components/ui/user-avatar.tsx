
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  imageUrl?: string | null;
  firstName: string;
  lastName: string;
  isVerified?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  firstName,
  lastName,
  isVerified = false,
  onClick,
  size = 'md'
}) => {
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  return (
    <Avatar 
      className={`${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity hover:ring-2 hover:ring-pink-300' : ''}`}
      onClick={onClick}
    >
      {isVerified && imageUrl ? (
        <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
