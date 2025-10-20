import React, { useState, useRef } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import { CloseIcon, DownloadIcon } from './icons';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string, mimeType: string) => void;
  imageSrc: string;
}

// Utility to apply edits and return a data URL
function getEditedImage(
    image: HTMLImageElement,
    crop: PixelCrop,
    rotation: number,
    brightness: number,
    contrast: number
): { dataUrl: string; mimeType: string } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const rads = rotation * (Math.PI / 180);

    const sin = Math.abs(Math.sin(rads));
    const cos = Math.abs(Math.cos(rads));
    const newWidth = crop.width * cos + crop.height * sin;
    const newHeight = crop.width * sin + crop.height * cos;

    canvas.width = Math.round(newWidth);
    canvas.height = Math.round(newHeight);
    
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rads);
    ctx.translate(-crop.width / 2, -crop.height / 2);

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
    );
    
    const mimeType = 'image/png';
    return { dataUrl: canvas.toDataURL(mimeType), mimeType };
}


const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, onSave, imageSrc }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop({
      ...initialCrop,
      x: (width * initialCrop.x) / 100,
      y: (height * initialCrop.y) / 100,
      width: (width * initialCrop.width) / 100,
      height: (height * initialCrop.height) / 100,
      unit: 'px'
    });
  }

  const handleEdit = (action: 'save' | 'download') => {
    if (!completedCrop || !imgRef.current) {
        return;
    }
    const { dataUrl, mimeType } = getEditedImage(
        imgRef.current,
        completedCrop,
        rotation,
        brightness,
        contrast
    );

    if (action === 'save') {
        onSave(dataUrl, mimeType);
    } else if (action === 'download') {
        const link = document.createElement('a');
        link.download = `edited-image.png`;
        link.href = dataUrl;
        link.click();
    }
  };
  
  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    if(imgRef.current) {
      onImageLoad({ currentTarget: imgRef.current } as React.SyntheticEvent<HTMLImageElement>);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">编辑图像</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
          <div className="flex-grow flex items-center justify-center bg-black bg-opacity-20 rounded-md overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageSrc}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  maxHeight: '60vh',
                }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>
          
          <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-200">调整</h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="rotation" className="text-sm text-gray-400">旋转: {rotation}°</label>
              <input type="range" id="rotation" min="-180" max="180" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="brightness" className="text-sm text-gray-400">亮度: {brightness}%</label>
              <input type="range" id="brightness" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contrast" className="text-sm text-gray-400">对比度: {contrast}%</label>
              <input type="range" id="contrast" min="0" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
            <button
              onClick={handleReset}
              className="w-full mt-2 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
              重置调整
            </button>
          </aside>
        </main>
        
        <footer className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-gray-700">
            <button
              onClick={() => handleEdit('download')}
              className="py-2 px-4 flex items-center gap-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
              <DownloadIcon className="w-5 h-5"/>
              下载
            </button>
            <button
              onClick={() => handleEdit('save')}
              className="py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              用作图生图输入
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ImageEditorModal;
