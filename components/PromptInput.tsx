
import React from 'react';
import { LightbulbIcon, SparklesIcon } from './icons';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerateInspiration: () => void;
  onOptimizePrompt: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerateInspiration, onOptimizePrompt, isLoading }) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="prompt-input" className="text-sm font-medium text-gray-300">您的提示词</label>
      <div className="relative">
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：一只浣熊侦探在雨中湿漉漉的城市里的电影镜头..."
          className="w-full h-32 p-3 pr-24 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          disabled={isLoading}
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={onGenerateInspiration}
            disabled={isLoading}
            className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full text-white disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            title="生成灵感"
          >
            <LightbulbIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onOptimizePrompt}
            disabled={isLoading || !prompt}
            className="p-2 bg-purple-500 hover:bg-purple-600 rounded-full text-white disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            title="优化提示词"
          >
            <SparklesIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
