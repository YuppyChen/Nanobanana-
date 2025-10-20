
import React, { useRef } from 'react';
import { CloseIcon } from './icons';

interface ImageUploaderProps {
  uploadedImage: { dataUrl: string; mimeType: string } | null;
  onImageUpload: (image: { dataUrl: string; mimeType: string }) => void;
  onClearImage: () => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ uploadedImage, onImageUpload, onClearImage, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({
          dataUrl: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAreaClick = () => {
    if (!uploadedImage) {
        fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">图像输入 (用于图生图)</label>
        <div 
            onClick={handleAreaClick}
            className={`relative w-full h-40 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 transition-colors ${!uploadedImage && !isLoading ? 'cursor-pointer hover:border-purple-500 hover:text-gray-300' : ''}`}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
            />
            {uploadedImage ? (
                <>
                    <img src={uploadedImage.dataUrl} alt="Upload preview" className="object-contain h-full w-full rounded-md" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onClearImage(); }}
                        disabled={isLoading}
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 transition-opacity"
                        title="移除图片"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <span>点击或拖拽上传图片</span>
            )}
        </div>
    </div>
  );
};

export default ImageUploader;
