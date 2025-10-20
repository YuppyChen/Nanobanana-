import React from 'react';
import { CloseIcon, TrashIcon, ReuseIcon, ZoomInIcon } from './icons';
import { Asset } from '../types';

interface AssetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onPreviewAsset: (asset: Asset) => void;
}

const AssetCard: React.FC<{ asset: Asset; onSelect: () => void; onDelete: () => void; onPreview: () => void; }> = ({ asset, onSelect, onDelete, onPreview }) => {
    return (
        <div className="relative group aspect-square bg-gray-700 rounded-lg overflow-hidden">
            <img src={asset.imageDataUrl} alt={asset.prompt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex flex-col justify-end p-3">
                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
                    {asset.prompt}
                </p>
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <button
                        onClick={onPreview}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                        title="预览此资产"
                    >
                        <ZoomInIcon className="w-5 h-5" />
                    </button>
                     <button
                        onClick={onSelect}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white"
                        title="使用此资产"
                    >
                        <ReuseIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white"
                        title="删除此资产"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AssetLibraryModal: React.FC<AssetLibraryModalProps> = ({ isOpen, onClose, assets, onSelectAsset, onDeleteAsset, onPreviewAsset }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-gray-800 rounded-lg w-full max-w-5xl h-[90vh] flex flex-col border border-gray-700 shadow-xl">
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">资产库</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-grow p-4 overflow-y-auto">
                    {assets.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {assets.map((asset) => (
                                <AssetCard
                                    key={asset.id}
                                    asset={asset}
                                    onSelect={() => onSelectAsset(asset)}
                                    onDelete={() => onDeleteAsset(asset.id)}
                                    onPreview={() => onPreviewAsset(asset)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h0M5 11h0" />
                            </svg>
                            <p className="mt-4 text-xl">您的资产库是空的</p>
                            <p className="text-sm">生成的图像将显示在这里。</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AssetLibraryModal;