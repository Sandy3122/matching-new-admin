import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Crop, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
  showSkip?: boolean;
  onSkip?: () => void;
}

const OUTPUT_WIDTH = 450;
const OUTPUT_HEIGHT = 500;

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.src = url;
  });

const getRadianAngle = (degree: number) => (degree * Math.PI) / 180;

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

/**
 * Produces a cropped image scaled to the required 450x500 output, honouring the
 * current rotation. Returns a Blob (or null on failure).
 */
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  mimeType: string
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the crop region.
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return null;
  cropCanvas.width = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;
  cropCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Scale to the fixed output size (legacy parity: 450x500).
  const outCanvas = document.createElement('canvas');
  outCanvas.width = OUTPUT_WIDTH;
  outCanvas.height = OUTPUT_HEIGHT;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return null;
  outCtx.fillStyle = '#ffffff';
  outCtx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  outCtx.drawImage(cropCanvas, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const outputType = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  return new Promise((resolve) => outCanvas.toBlob((blob) => resolve(blob), outputType, 0.92));
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = OUTPUT_WIDTH / OUTPUT_HEIGHT,
  showSkip = false,
  onSkip,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(imageFile);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } else {
      setImageSrc('');
    }
  }, [imageFile]);

  const onCropChange = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels || !imageFile) return;
    try {
      setIsProcessing(true);
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation, imageFile.type);
      if (blob) {
        const croppedFile = new File([blob], imageFile.name, {
          type: blob.type || imageFile.type,
          lastModified: Date.now(),
        });
        onCropComplete(croppedFile);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, imageFile, onCropComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Crop className="w-5 h-5 shrink-0" />
            <span>Crop Profile Image ({OUTPUT_WIDTH}×{OUTPUT_HEIGHT})</span>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Crop canvas */}
          <div
            className="relative w-full rounded-lg bg-neutral-900 overflow-hidden"
            style={{ height: 'clamp(240px, 48vh, 440px)' }}
          >
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropChange}
                showGrid
                restrictPosition={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/70">
                Loading image…
              </div>
            )}
          </div>

          {/* Zoom control */}
          <div className="flex items-center gap-3">
            <ZoomOut
              className="w-5 h-5 text-gray-500 shrink-0 cursor-pointer"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
            />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={(v) => setZoom(v[0])}
              className="flex-1"
              aria-label="Zoom"
            />
            <ZoomIn
              className="w-5 h-5 text-gray-500 shrink-0 cursor-pointer"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
            />
            <span className="text-xs font-medium text-gray-600 w-12 text-right tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotate + hint */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <RotateCw className="w-4 h-4" />
              Rotate
            </Button>
            <p className="text-xs text-gray-500">Drag to reposition · pinch / slider to zoom</p>
          </div>
        </div>

        {/* Pinned footer — always visible */}
        <div className="shrink-0 border-t bg-white p-3 sm:p-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto sm:px-6">
            Cancel
          </Button>
          {showSkip && onSkip && (
            <Button variant="secondary" onClick={onSkip} className="w-full sm:w-auto sm:px-6">
              Skip Crop
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !croppedAreaPixels}
            className="w-full sm:w-auto sm:px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
          >
            <Crop className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing…' : 'Crop & Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
