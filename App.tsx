import React, { useState, useCallback, useEffect } from 'react';
import PromptInput from './components/PromptInput';
import ImageUploader from './components/ImageUploader';
import AspectRatioSelector from './components/AspectRatioSelector';
import ImageDisplay from './components/ImageDisplay';
import SettingsModal from './components/SettingsModal';
import ImageEditorModal from './components/ImageEditorModal';
import AssetLibraryModal from './components/AssetLibraryModal';
import ImagePreviewModal from './components/ImagePreviewModal';
import { SparklesIcon, CogIcon, CollectionIcon } from './components/icons';
import { AspectRatio, Asset } from './types';
import { generateInspirationPrompt, optimizePrompt, textToImage, imageToImage } from './services/geminiService';
import { getAllAssets, addAsset, deleteAsset } from './services/dbService';


export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [imageToPreview, setImageToPreview] = useState<{ src: string; prompt: string } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setUserApiKey(savedKey);
    }
    
    getAllAssets()
      .then(setAssets)
      .catch(e => {
        console.error("无法从 IndexedDB 加载资产库：", e);
        setError("无法加载您的资产库。请刷新页面或清除浏览器数据后重试。");
        setAssets([]);
      });

  }, []);

  const handleSaveApiKey = (key: string) => {
    const trimmedKey = key.trim();
    setUserApiKey(trimmedKey);
    if (trimmedKey) {
        localStorage.setItem('gemini_api_key', trimmedKey);
    } else {
        localStorage.removeItem('gemini_api_key');
    }
  };

  const handleServiceCall = useCallback(async <T,>(
    serviceFunc: () => Promise<T>, 
    onSuccess: (result: T) => void,
    options?: { clearsImage?: boolean }
  ) => {
    setIsLoading(true);
    setError(null);
    if (options?.clearsImage !== false) {
      setGeneratedImage(null);
    }
    
    try {
      const result = await serviceFunc();
      onSuccess(result);
    } catch (e: any) {
      console.error(e);
      setError(e.message || '发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateInspiration = useCallback(() => {
    handleServiceCall(() => generateInspirationPrompt(userApiKey), (newPrompt) => setPrompt(newPrompt), { clearsImage: false });
  }, [handleServiceCall, userApiKey]);

  const handleOptimizePrompt = useCallback(() => {
    handleServiceCall(() => optimizePrompt(prompt, userApiKey), (newPrompt) => setPrompt(newPrompt), { clearsImage: false });
  }, [prompt, handleServiceCall, userApiKey]);

  const handleGenerateImage = useCallback(() => {
    if (!prompt.trim()) {
        setError("提示词不能为空。");
        return;
    }
    const generationFunc = uploadedImage
      ? () => imageToImage(prompt, uploadedImage, userApiKey)
      : () => textToImage(prompt, aspectRatio, userApiKey);
    
    handleServiceCall(generationFunc, (newImage) => {
      setGeneratedImage(newImage);
      // Save to asset library
      const assetData = {
        prompt: prompt,
        imageDataUrl: newImage
      };
      addAsset(assetData)
        .then((newAssetWithId) => {
            setAssets(prevAssets => [newAssetWithId, ...prevAssets]);
        })
        .catch(e => {
            console.error("无法保存资产到 IndexedDB：", e);
            setError("图像已生成，但无法保存到您的资产库。可能是存储空间不足。");
        });
    });
  }, [prompt, uploadedImage, aspectRatio, handleServiceCall, userApiKey]);
  
  const handleImageUpload = (image: { dataUrl: string; mimeType: string }) => {
    setUploadedImage(image);
    setGeneratedImage(null);
    setError(null);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
  };

  const handleOpenEditor = (image: string) => {
    setImageToEdit(image);
  };

  const handleCloseEditor = () => {
    setImageToEdit(null);
  };
  
  const handleOpenPreview = (imageSrc: string) => {
    setImageToPreview({ src: imageSrc, prompt: prompt });
  };

  const handleOpenAssetPreview = (asset: Asset) => {
    setImageToPreview({ src: asset.imageDataUrl, prompt: asset.prompt });
  };

  const handleClosePreview = () => {
    setImageToPreview(null);
  };


  const handleSaveEdits = (editedImageDataUrl: string, mimeType: string) => {
    setUploadedImage({
      dataUrl: editedImageDataUrl,
      mimeType: mimeType
    });
    setGeneratedImage(null);
    setImageToEdit(null);
    setPrompt('');
    setError(null);
  };

  const handleSelectAsset = (asset: Asset) => {
    setPrompt(asset.prompt);
    // Naively extract mime type. Default to image/png if not available.
    const mimeType = asset.imageDataUrl.match(/data:(.*);/)?.[1] || 'image/png';
    setUploadedImage({ dataUrl: asset.imageDataUrl, mimeType });
    setGeneratedImage(null);
    setIsAssetLibraryOpen(false);
  };

  const handleDeleteAsset = (assetId: string) => {
     deleteAsset(assetId)
        .then(() => {
            setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
        })
        .catch(e => {
            console.error("无法从 IndexedDB 删除资产：", e);
            setError("无法删除资产。请重试。");
        });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="relative text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Nanobanana 图像工作室
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            使用 Nanobanana 将您的想法变为现实。
          </p>
           <div className="absolute top-0 right-0 flex items-center gap-2">
             <button
                onClick={() => setIsAssetLibraryOpen(true)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                title="资产库"
              >
                <CollectionIcon className="w-6 h-6" />
              </button>
             <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                title="设置"
              >
                <CogIcon className="w-6 h-6" />
              </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6 p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
            <PromptInput 
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerateInspiration={handleGenerateInspiration}
              onOptimizePrompt={handleOptimizePrompt}
              isLoading={isLoading}
            />

            <ImageUploader 
              uploadedImage={uploadedImage}
              onImageUpload={handleImageUpload}
              onClearImage={handleClearImage}
              isLoading={isLoading}
            />
            
            <AspectRatioSelector 
              selectedRatio={aspectRatio}
              onSelectRatio={setAspectRatio}
              isDisabled={!!uploadedImage || isLoading}
            />

            <button
              onClick={handleGenerateImage}
              disabled={isLoading || !prompt}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/30"
            >
              <SparklesIcon className="w-5 h-5" />
              {isLoading ? '生成中...' : (uploadedImage ? '图生图' : '文生图')}
            </button>
          </div>
          
          <div className="min-h-[400px] lg:min-h-0">
             <ImageDisplay
                generatedImage={generatedImage}
                isLoading={isLoading}
                error={error}
                onEdit={handleOpenEditor}
                onPreview={handleOpenPreview}
            />
          </div>
        </main>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={userApiKey}
      />
      {imageToEdit && (
        <ImageEditorModal
          isOpen={!!imageToEdit}
          onClose={handleCloseEditor}
          onSave={handleSaveEdits}
          imageSrc={imageToEdit}
        />
      )}
       <AssetLibraryModal
        isOpen={isAssetLibraryOpen}
        onClose={() => setIsAssetLibraryOpen(false)}
        assets={assets}
        onSelectAsset={handleSelectAsset}
        onDeleteAsset={handleDeleteAsset}
        onPreviewAsset={handleOpenAssetPreview}
      />
      {imageToPreview && (
        <ImagePreviewModal
          isOpen={!!imageToPreview}
          onClose={handleClosePreview}
          imageSrc={imageToPreview.src}
          prompt={imageToPreview.prompt}
        />
      )}
    </div>
  );
}