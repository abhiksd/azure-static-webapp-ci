import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { trackUserInteraction } from '../utils/analytics';
import './Settings.css';

function Settings() {
  const { settings, actions } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
    trackUserInteraction('change', 'setting', { setting: key, value });
  };

  const handleSave = () => {
    actions.updateSettings(localSettings);
    setHasChanges(false);
    trackUserInteraction('click', 'save_settings');
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    trackUserInteraction('click', 'reset_settings');
  };

  return (
    <div className="settings">
      <header className="settings-header">
        <h1>Settings</h1>
        <div className="settings-actions">
          {hasChanges && (
            <>
              <button onClick={handleReset} className="reset-button">
                Reset
              </button>
              <button onClick={handleSave} className="save-button">
                Save Changes
              </button>
            </>
          )}
        </div>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label className="setting-label">
              <span>Theme</span>
              <select
                value={localSettings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={localSettings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="setting-checkbox"
              />
              <span>Enable notifications</span>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Auto-refresh</h2>
          <div className="setting-item">
            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={localSettings.autoRefresh}
                onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                className="setting-checkbox"
              />
              <span>Enable auto-refresh</span>
            </label>
          </div>
          
          {localSettings.autoRefresh && (
            <div className="setting-item">
              <label className="setting-label">
                <span>Refresh interval</span>
                <select
                  value={localSettings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', Number(e.target.value))}
                  className="setting-select"
                >
                  <option value={15000}>15 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                </select>
              </label>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Settings;