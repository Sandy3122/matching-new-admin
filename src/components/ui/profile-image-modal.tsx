
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProfileImageModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
  userName?: string;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({ open, onClose, imageUrl, userName }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl w-full p-3 sm:p-4 md:p-6 rounded-lg mx-2 sm:mx-4">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-center text-base sm:text-lg md:text-xl">
            {userName ? `${userName}'s Profile Image` : "Profile Image"}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={userName || "Profile Image"}
                className="rounded-md object-contain w-full h-full"
                style={{ 
                  maxHeight: "70vh",
                  objectFit: "contain",
                  background: "#f3f4f6" 
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded-md text-gray-500 text-xs sm:text-sm md:text-base p-4 text-center">Failed to load image</div>';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md text-gray-500 text-xs sm:text-sm md:text-base p-4 text-center">
                No profile image available
              </div>
            )}
          </AspectRatio>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageModal;
