import React from 'react';
import { AspectRatio } from '../types';

const RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9"];

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onSelectRatio: (ratio: AspectRatio) => void;
  isDisabled: boolean;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onSelectRatio, isDisabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">宽高比</label>
      <div className="grid grid-cols-5 gap-2">
        {RATIOS.map((ratio) => (
          <button
            key={ratio}
            onClick={() => onSelectRatio(ratio)}
            disabled={isDisabled}
            className={`py-2 px-3 text-sm rounded-md transition-colors ${
              selectedRatio === ratio
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-gray-700 hover:bg-gray-600'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {ratio}
          </button>
        ))}
      </div>
       {isDisabled && <p className="text-xs text-gray-400 mt-1">图生图模式下无法选择宽高比。</p>}
    </div>
  );
};

export default AspectRatioSelector;