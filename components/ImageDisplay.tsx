import React, { useState, useEffect } from 'react';
import { EditIcon, ZoomInIcon } from './icons';

interface ImageDisplayProps {
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onEdit: (image: string) => void;
  onPreview: (imageSrc: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
        <svg className="animate-spin h-12 w-12 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">正在生成您的杰作...</p>
    </div>
);


const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.586-.586a2 2 0 012.828 0L20 12M4 16l16 0" />
        </svg>
        <p className="text-xl">您生成的图像将显示在此处</p>
    </div>
);


const ImageDisplay: React.FC<ImageDisplayProps> = ({ generatedImage, isLoading, error, onEdit, onPreview }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (generatedImage) {
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = generatedImage;
    } else {
      setDimensions(null);
    }
  }, [generatedImage]);

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center p-4 border border-gray-700">
        {isLoading ? (
            <LoadingSpinner />
        ) : error ? (
            <div className="text-center text-red-400">
                <h3 className="text-lg font-semibold">发生错误</h3>
                <p className="text-sm">{error}</p>
            </div>
        ) : generatedImage ? (
            <div className="relative flex flex-col items-center justify-center gap-2 h-full w-full">
              <img 
                src={generatedImage} 
                alt="Generated art" 
                className="object-contain max-w-full max-h-[calc(100%-2rem)] rounded-md"
              />
              {dimensions && (
                <p className="text-sm text-gray-400" aria-live="polite">
                  {dimensions.width} x {dimensions.height}
                </p>
              )}
               <div className="absolute top-2 right-2 flex gap-2">
                 <button 
                    onClick={() => onPreview(generatedImage)}
                    className="p-2 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 transition-opacity"
                    title="放大图像"
                  >
                    <ZoomInIcon className="w-5 h-5" />
                  </button>
                 <button 
                    onClick={() => onEdit(generatedImage)}
                    className="p-2 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 transition-opacity"
                    title="编辑图像"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
              </div>
            </div>
        ) : (
            <Placeholder />
        )}
    </div>
  );
};

export default ImageDisplay;