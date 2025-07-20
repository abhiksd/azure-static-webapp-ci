import React from 'react';
import { getBuildInfo } from '../utils/environment';
import './UserProfile.css';

function UserProfile() {
  const buildInfo = getBuildInfo();

  return (
    <div className="user-profile">
      <header className="profile-header">
        <h1>User Profile</h1>
      </header>

      <div className="profile-content">
        <section className="profile-section">
          <h2>User Information</h2>
          <div className="user-card">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <div className="user-name">Demo User</div>
              <div className="user-email">user@example.com</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2>Application Information</h2>
          <div className="app-info">
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">{buildInfo.version}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Build:</span>
              <span className="info-value">{buildInfo.buildId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Build Date:</span>
              <span className="info-value">{new Date(buildInfo.buildDate).toLocaleDateString()}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserProfile;