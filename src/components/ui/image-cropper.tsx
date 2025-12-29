
import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Crop, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
  showSkip?: boolean;
  onSkip?: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = 450 / 500,
  showSkip = false,
  onSkip
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setScale(1);
        setRotation(0);
        setCropPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const cropArea = cropAreaRef.current;
    if (!cropArea) return;

    const parentRect = cropArea.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Constrain to parent bounds
    const maxX = parentRect.width - cropArea.offsetWidth;
    const maxY = parentRect.height - cropArea.offsetHeight;

    setCropPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = useCallback(() => {
    if (!imageRef.current || !canvasRef.current || !imageFile || !cropAreaRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    const cropArea = cropAreaRef.current;

    if (!ctx) return;

    // Set canvas dimensions to the desired output size
    canvas.width = 450;
    canvas.height = 500;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get crop area dimensions and position
    const cropRect = cropArea.getBoundingClientRect();
    const parentRect = cropArea.parentElement?.getBoundingClientRect();
    
    if (!parentRect) return;

    // Calculate the crop region relative to the original image
    const scaleX = image.naturalWidth / parentRect.width;
    const scaleY = image.naturalHeight / parentRect.height;
    
    const sourceX = cropPosition.x * scaleX;
    const sourceY = cropPosition.y * scaleY;
    const sourceWidth = cropRect.width * scaleX;
    const sourceHeight = cropRect.height * scaleY;

    // Save context for transformations
    ctx.save();

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Restore context
    ctx.restore();

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
          lastModified: Date.now(),
        });
        onCropComplete(croppedFile);
      }
    }, imageFile.type);
  }, [imageFile, aspectRatio, scale, rotation, cropPosition, onCropComplete]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 -m-6 mb-4 rounded-t-lg">
          <DialogTitle className="flex items-center space-x-2 text-lg">
            <Crop className="w-5 h-5" />
            <span>Crop Profile Image (450×500)</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Control Panel */}
          <div className="flex justify-center items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <Button
              onClick={handleZoomOut}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <ZoomOut className="w-4 h-4" />
              <span>Zoom Out</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Scale:</span>
              <span className="text-sm bg-white px-2 py-1 rounded">
                {Math.round(scale * 100)}%
              </span>
            </div>
            
            <Button
              onClick={handleZoomIn}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <ZoomIn className="w-4 h-4" />
              <span>Zoom In</span>
            </Button>
            
            <div className="w-px h-8 bg-gray-300" />
            
            <Button
              onClick={handleRotate}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RotateCw className="w-4 h-4" />
              <span>Rotate</span>
            </Button>

            <div className="w-px h-8 bg-gray-300" />

            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Move className="w-4 h-4" />
              <span>Drag crop area to reposition</span>
            </div>
          </div>

          {/* Preview Area */}
          {imageSrc && (
            <div className="flex justify-center">
              <div className="relative bg-gray-100 rounded-lg p-4 shadow-inner">
                <div 
                  className="relative mx-auto max-w-2xl bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  style={{ width: '600px', height: '400px' }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Original"
                    className="w-full h-full object-contain"
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      transition: isDragging ? 'none' : 'transform 0.2s ease'
                    }}
                    draggable={false}
                  />
                  
                  {/* Draggable Crop Area */}
                  <div
                    ref={cropAreaRef}
                    className="absolute border-2 border-pink-500 bg-pink-500 bg-opacity-10 cursor-move"
                    style={{
                      left: `${cropPosition.x}px`,
                      top: `${cropPosition.y}px`,
                      width: `${400 * aspectRatio}px`,
                      height: '400px',
                      minWidth: '200px',
                      minHeight: '220px'
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    {/* Crop area corners */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-pink-500 border border-white rounded-full"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 border border-white rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-500 border border-white rounded-full"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-pink-500 border border-white rounded-full"></div>
                    
                    {/* Center drag handle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Move className="w-6 h-6 text-pink-600 bg-white rounded-full p-1 shadow-md" />
                    </div>
                    
                    {/* Crop area label */}
                    <div className="absolute -top-8 left-0 text-sm font-medium text-pink-600 bg-white px-2 py-1 rounded shadow">
                      450×500
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-sm text-gray-600 mt-3">
                  Drag the pink crop area to select the region you want to crop. Use controls above to zoom and rotate.
                </p>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="px-6">
              Cancel
            </Button>
            {showSkip && onSkip && (
              <Button variant="secondary" onClick={onSkip} className="px-6">
                Skip Crop
              </Button>
            )}
            <Button 
              onClick={handleCrop}
              className="px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
            >
              <Crop className="w-4 h-4 mr-2" />
              Crop & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
