// src/renderer/pages/Settings/components/RoomTab.tsx
import React, { useState, useEffect } from 'react';
import { type RoomSettings } from '../../../api/system_config';

interface Props {
  settings: RoomSettings;
  onUpdate: (field: keyof RoomSettings, value: any) => void;
}

const RoomTab: React.FC<Props> = ({ settings, onUpdate }) => {
  const [maxOccupancyJson, setMaxOccupancyJson] = useState('');
  const [pricingRulesJson, setPricingRulesJson] = useState('');
  const [occupancyValid, setOccupancyValid] = useState(true);
  const [pricingValid, setPricingValid] = useState(true);

  // Sync JSON strings from props
  useEffect(() => {
    setMaxOccupancyJson(JSON.stringify(settings.max_occupancy_per_type || {}, null, 2));
    setPricingRulesJson(JSON.stringify(settings.default_pricing_rules || {}, null, 2));
  }, [settings.max_occupancy_per_type, settings.default_pricing_rules]);

  const handleOccupancyChange = (jsonStr: string) => {
    setMaxOccupancyJson(jsonStr);
    try {
      const parsed = JSON.parse(jsonStr);
      onUpdate('max_occupancy_per_type', parsed);
      setOccupancyValid(true);
    } catch {
      setOccupancyValid(false);
    }
  };

  const handlePricingChange = (jsonStr: string) => {
    setPricingRulesJson(jsonStr);
    try {
      const parsed = JSON.parse(jsonStr);
      onUpdate('default_pricing_rules', parsed);
      setPricingValid(true);
    } catch {
      setPricingValid(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[var(--text-primary)]">Room Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={settings.maintenance_mode || false}
              onChange={(e) => onUpdate('maintenance_mode', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                         checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                         focus:ring-1 focus:ring-[var(--primary-color)]/50"
            />
            Maintenance Mode (prevent new bookings)
          </label>
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Max Occupancy per Room Type (JSON)
            <span className="ml-2 text-xs text-[var(--text-tertiary)]">{'{"single":2,"double":4,"suite":6}'}</span>
          </label>
          <textarea
            value={maxOccupancyJson}
            onChange={(e) => handleOccupancyChange(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border 
                       ${!occupancyValid ? 'border-red-500/50' : 'border-[var(--border-color)]/20'}
                       text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:border-[var(--primary-color)]/50`}
          />
          {!occupancyValid && (
            <p className="mt-1 text-xs text-red-400">Invalid JSON format</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Default Pricing Rules (JSON)
            <span className="ml-2 text-xs text-[var(--text-tertiary)]">{'{"single":100,"double":150,"suite":250}'}</span>
          </label>
          <textarea
            value={pricingRulesJson}
            onChange={(e) => handlePricingChange(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border 
                       ${!pricingValid ? 'border-red-500/50' : 'border-[var(--border-color)]/20'}
                       text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:border-[var(--primary-color)]/50`}
          />
          {!pricingValid && (
            <p className="mt-1 text-xs text-red-400">Invalid JSON format</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomTab;