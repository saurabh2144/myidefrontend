/**
 * Deployment Service
 * Handles project deployment to Netlify via backend API
 */

import { API_URL } from '../config';

export class DeploymentService {
  /**
   * Deploy a project to Netlify
   * @param {string} mergedHtml - The complete HTML content to deploy
   * @param {string} projectName - The project name
   * @param {string} customSlug - The custom slug/URL slug for the project
   * @param {string} projectId - Optional project ID for updates
   * @returns {Promise<Object>} Deployment result with URL
   */
  static async deployProject(mergedHtml, projectName, customSlug, projectId = null) {
    try {
      const response = await fetch(`${API_URL}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mergedHtml,
          projectName,
          customSlug,
          projectId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deployment failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  }

  /**
   * Get all deployments
   * @returns {Promise<Object>} Object with all deployments
   */
  static async getDeployments() {
    try {
      const response = await fetch(`${API_URL}/deployments`);

      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }

      const result = await response.json();
      return result.deployments || {};
    } catch (error) {
      console.error('Error fetching deployments:', error);
      throw error;
    }
  }

  /**
   * Get deployment status for a specific project
   * @param {string} slug - The project slug
   * @returns {Promise<Object>} Deployment information
   */
  static async getDeploymentStatus(slug) {
    try {
      const response = await fetch(`${API_URL}/deployments/${slug}`);

      if (!response.ok) {
        throw new Error('Deployment not found');
      }

      const result = await response.json();
      return result.deployment;
    } catch (error) {
      console.error('Error fetching deployment status:', error);
      throw error;
    }
  }

  /**
   * Copy URL to clipboard
   * @param {string} url - The URL to copy
   */
  static async copyToClipboard(url) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Open deployed URL in new tab
   * @param {string} url - The URL to open
   */
  static openInNewTab(url) {
    window.open(url, '_blank');
  }

  /**
   * Format deployment info for display
   * @param {Object} deployment - Deployment object
   * @returns {Object} Formatted deployment info
   */
  static formatDeployment(deployment) {
    const url = deployment.netlifyUrl || deployment.localUrl;
    const type = deployment.netlifyUrl ? 'Netlify' : 'Local';
    
    return {
      url,
      type,
      deployedAt: new Date(deployment.deployedAt).toLocaleString(),
      isNetlify: !!deployment.netlifyUrl,
      projectName: deployment.projectName || deployment.customSlug,
    };
  }
}

export default DeploymentService;
