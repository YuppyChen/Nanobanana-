import React from 'react';
import { CloseIcon } from './icons';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  prompt: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageSrc, prompt }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white bg-black bg-opacity-50 rounded-full z-10"
          aria-label="Close image preview"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <img
          src={imageSrc}
          alt={prompt}
          className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
        />

      </div>
    </div>
  );
};

export default ImagePreviewModal;
