import React, { useState, useEffect } from 'react';
import DeploymentService from '../services/DeploymentService';
import './DeploymentPanel.css';

const DeploymentPanel = ({ mergedHtml, projectName, onDeploySuccess, onClose }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentDeployments, setRecentDeployments] = useState([]);
  const [customSlug, setCustomSlug] = useState('');
  
  // Auto-generate slug from project name (simpler, without timestamp)
  const autoSlug = `${projectName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'project'}`.substring(0, 30);

  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    try {
      const deployments = await DeploymentService.getDeployments();
      setRecentDeployments(Object.values(deployments).slice(-5).reverse());
    } catch (err) {
      console.error('Failed to load deployments:', err);
    }
  };

  const handleDeploy = async () => {
    if (!mergedHtml) {
      setError('No HTML content to deploy');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setDeploymentResult(null);

    try {
      const result = await DeploymentService.deployProject(
        mergedHtml,
        projectName,
        customSlug || autoSlug
      );

      setDeploymentResult(result);
      onDeploySuccess?.(result);
      
      // Reload deployments list
      await loadDeployments();
    } catch (err) {
      setError(err.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyUrl = async (url) => {
    const success = await DeploymentService.copyToClipboard(url);
    if (success) {
      alert('URL copied to clipboard!');
    }
  };

  const handleOpenUrl = (url) => {
    DeploymentService.openInNewTab(url);
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <>
      <div className="deployment-overlay"></div>
      <div className="deployment-panel">
        <div className="deployment-container">
          <div className="deployment-header">
            <h2>☁️ Deploy to Netlify</h2>
            <button className="close-button" onClick={handleClose}>✕</button>
          </div>

        {/* Deployment Form */}
        <div className="deployment-form">
          <div className="form-group">
            <label>Custom URL (optional)</label>
            <input
              type="text"
              className="slug-input"
              placeholder={autoSlug}
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              disabled={isDeploying}
            />
            <small>Leave empty to use auto-generated URL</small>
          </div>

          <div className="url-preview" style={{
            padding: '10px',
            backgroundColor: '#f0f4ff',
            borderRadius: '6px',
            border: '1px solid #667eea',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#667eea',
            wordBreak: 'break-all'
          }}>
            <strong>{customSlug || autoSlug}</strong>.netlify.app
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button
            onClick={handleDeploy}
            disabled={isDeploying || !mergedHtml}
            className="deploy-button"
          >
            {isDeploying ? 'Deploying...' : 'Deploy to Netlify'}
          </button>
        </div>

        {/* Deployment Result */}
        {deploymentResult && (
          <div className="deployment-result">
            <div className="success-message">
              ✅ {deploymentResult.message}
            </div>

            <div className="result-details">
              <div className="url-section">
                <label>Live URL:</label>
                <div className="url-display">
                  <input
                    type="text"
                    value={deploymentResult.url}
                    readOnly
                    className="url-input"
                  />
                  <button
                    onClick={() => handleCopyUrl(deploymentResult.url)}
                    className="copy-button"
                    title="Copy URL"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => handleOpenUrl(deploymentResult.url)}
                    className="open-button"
                    title="Open in new tab"
                  >
                    🔗 Open
                  </button>
                </div>
              </div>

              {deploymentResult.netlifyInfo && (
                <div className="netlify-info">
                  <p><strong>Platform:</strong> Netlify</p>
                  <p><strong>Site ID:</strong> {deploymentResult.netlifyInfo.siteId}</p>
                  <p><strong>Deployment ID:</strong> {deploymentResult.netlifyInfo.deploymentId}</p>
                </div>
              )}

              {deploymentResult.deploymentType === 'local' && (
                <div className="local-info">
                  <p><strong>⚠️ Platform:</strong> Local Server (Netlify not configured)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Deployments */}
        {recentDeployments.length > 0 && (
          <div className="recent-deployments">
            <h3>📚 Recent Deployments</h3>
            <div className="deployments-list">
              {recentDeployments.map((deployment, index) => {
                const formatted = DeploymentService.formatDeployment(deployment);
                return (
                  <div key={index} className="deployment-item">
                    <div className="deployment-header">
                      <h4>{formatted.projectName}</h4>
                      <span className={`badge ${formatted.isNetlify ? 'netlify' : 'local'}`}>
                        {formatted.type}
                      </span>
                    </div>
                    <p className="deployment-time">{formatted.deployedAt}</p>
                    <div className="deployment-url">
                      <input
                        type="text"
                        value={formatted.url}
                        readOnly
                        className="url-input"
                      />
                      <button
                        onClick={() => handleCopyUrl(formatted.url)}
                        className="copy-button"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleOpenUrl(formatted.url)}
                        className="open-button"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default DeploymentPanel;
