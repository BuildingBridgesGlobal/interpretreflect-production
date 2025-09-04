import React, { useState } from 'react';

interface BodyCheckInResultsProps {
  onClose: () => void;
  onSave?: (data: any) => void;
  onCheckInAgain?: () => void;
}

type LevelOption = 'low' | 'medium' | 'high';

export const BodyCheckInResults: React.FC<BodyCheckInResultsProps> = ({ 
  onClose, 
  onSave,
  onCheckInAgain 
}) => {
  const [tension, setTension] = useState<LevelOption>('medium');
  const [energy, setEnergy] = useState<LevelOption>('medium');
  const [comfort, setComfort] = useState<LevelOption>('medium');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSave = () => {
    const data = {
      tension,
      energy,
      comfort,
      areasOfTension: selectedAreas,
      timestamp: new Date().toISOString()
    };
    if (onSave) onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-xl font-normal text-gray-700 mb-2">
              How's your body feeling?
            </h2>
          </div>

          {/* Tension Level */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Tension Level</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setTension('low')}
                className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${
                  tension === 'low'
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: tension === 'low' ? '#5C7F4F' : undefined,
                }}
              >
                Holding a lot
              </button>
              <button
                onClick={() => setTension('high')}
                className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${
                  tension === 'high'
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: tension === 'high' ? '#5C7F4F' : undefined,
                }}
              >
                Released
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Most people feel some release after checking in
            </p>
          </div>

          {/* Energy Level */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Energy Level</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEnergy('low')}
                className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${
                  energy === 'low'
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: energy === 'low' ? '#5C7F4F' : undefined,
                }}
              >
                Depleted
              </button>
              <button
                onClick={() => setEnergy('high')}
                className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${
                  energy === 'high'
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: energy === 'high' ? '#5C7F4F' : undefined,
                }}
              >
                Restored
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Even noticing can bring energy back
            </p>
          </div>

          {/* Overall Comfort */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Overall Comfort</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setComfort('low')}
                className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${
                  comfort === 'low'
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: comfort === 'low' ? '#5C7F4F' : undefined,
                }}
              >
                Tight
              </button>
              <button
                onClick={() => setComfort('high')}
                className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${
                  comfort === 'high'
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: comfort === 'high' ? '#5C7F4F' : undefined,
                }}
              >
                Easeful
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Every bit of ease helps
            </p>
          </div>

          {/* Areas of tension */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Where did you notice tension?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Head or jaw',
                'Shoulders or neck',
                'Back',
                'Hands or arms',
                'Feeling pretty clear'
              ].map(area => (
                <button
                  key={area}
                  onClick={() => handleAreaToggle(area)}
                  className={`p-3 rounded-xl text-center transition-all text-sm font-medium ${
                    selectedAreas.includes(area)
                      ? 'text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: selectedAreas.includes(area) ? '#7A9B6E' : undefined,
                    gridColumn: area === 'Feeling pretty clear' ? 'span 2' : undefined
                  }}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 text-white rounded-xl transition-all text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: '#5C7F4F' }}
            >
              Save This Check-In
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};