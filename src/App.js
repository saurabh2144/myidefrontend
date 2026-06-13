import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';
import Auth from './Auth';
import DeploymentPanel from './components/DeploymentPanel';
import WelcomePopup from './components/WelcomePopup';
import './App.css';
import Editor from "@monaco-editor/react";
import { API_BASE_URL, API_URL } from './config';


function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem("files");
    return savedFiles
      ? JSON.parse(savedFiles)
      : [
          {
            id: 1,
            filename: "index.html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Saurabh IDE</title>
  <link rel="stylesheet" href="index.css" />
</head>
<body>
  <div class="container">
    <h1 id="title">Hello Coder</h1>
    <p class="subtitle">Welcome to your coding playground</p>
    <p class="author">by Saurabh Singh</p>
    <button id="btn">Start Coding</button>
  </div>
  <script src="index.js"></script>
</body>
</html>`
          },
          {
            id: 2,
            filename: "index.css",
            content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  font-family: Inter, Arial, sans-serif;
}

.container {
  text-align: center;
  padding: 40px;
}


h1 {
  font-size: 3rem;
  margin-bottom: 15px;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  color: #cbd5e1;
}

.author {
  margin-top: 10px;
  color: #94a3b8;
}

button {
  margin-top: 30px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-3px);
  background: #2563eb;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.35);
}`
          },
          {
            id: 3,
            filename: "index.js",
            content: `const btn = document.getElementById("btn");
const title = document.getElementById("title");

btn.addEventListener("click", () => {
  title.textContent = "Happy Coding";
  btn.textContent = "Let's Build";
});`
          }
        ];
  });

  const [activeFileId, setActiveFileId] = useState(() => {
    const saved = localStorage.getItem("activeFileID");
    return saved ? Number(saved) : null;
  });
  
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [code, setCode] = useState("");
  const [showFiles, setShowFiles] = useState(true);
  const [showAI, setShowAI] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [aiMode, setAiMode] = useState('chat'); // 'chat' or 'generate'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingFileId, setPendingFileId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeploymentOptions, setShowDeploymentOptions] = useState(false);
  const [showConfirmDeploy, setShowConfirmDeploy] = useState(false);
  const [customProjectSlug, setCustomProjectSlug] = useState('');
  const [isPublished, setIsPublished] = useState(() => {
    return localStorage.getItem('isProjectPublished') === 'true';
  });
  const [savedProjectId, setSavedProjectId] = useState(() => {
    return localStorage.getItem('publishedProjectId') || null;
  });
  const [savedSiteId, setSavedSiteId] = useState(() => {
    return localStorage.getItem('publishedSiteId') || null;
  });
  const [showDeploymentPanel, setShowDeploymentPanel] = useState(false);
  const [mergedHtml, setMergedHtml] = useState('');
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [backendSites, setBackendSites] = useState([]);
  const [selectedBackendSite, setSelectedBackendSite] = useState(null);
  const [showBackendSitesList, setShowBackendSitesList] = useState(false);
  const [myDeployedSites, setMyDeployedSites] = useState(() => {
    const saved = localStorage.getItem('myDeployedSites');
    return saved ? JSON.parse(saved) : [];
  });
  const [deploymentType, setDeploymentType] = useState('netlify'); // 'netlify' or 'backend'
  const [nameValidationError, setNameValidationError] = useState('');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [showRedeployOptions, setShowRedeployOptions] = useState(false);

  const activeFile = files.find(file => file.id === activeFileId);

  const getActiveHtmlContent = () => {
    if (!activeFile) return '';
    return activeFileId === activeFile.id ? code : activeFile.content;
  };

  const getFileContent = (filename) => {
    const file = files.find(
      (f) => f.filename.toLowerCase() === filename.toLowerCase()
    );
    if (!file) return null;
    return file.id === activeFileId ? code : file.content;
  };

  // Set active file ID when files load
  useEffect(() => {
    if (files.length > 0 && activeFileId === null) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);

  // Save active file ID to localStorage
  useEffect(() => {
    if (activeFileId !== null) {
      localStorage.setItem("activeFileID", activeFileId);
    }
  }, [activeFileId]);

  // Update code when active file changes
  useEffect(() => {
    const activeFile = files.find(file => file.id === activeFileId);
    if (activeFile) {
      setCode(activeFile.content);
    } else if (files.length > 0) {
      setCode(files[0].content);
    } else {
      setCode("// Write your code here");
    }
  }, [files, activeFileId]);

  // Save files to localStorage
  useEffect(() => {
    localStorage.setItem("files", JSON.stringify(files));
    
    // Auto-save files to backend if user is logged in
    if (user?.id) {
      const saveToBackend = async () => {
        try {
          await axios.post(`${API_URL}/files/save`, {
            userId: user.id,
            files
          });
        } catch (error) {
          console.error('Failed to auto-save files:', error);
        }
      };
      
      // Debounce the save (save after 2 seconds of no changes)
      const timer = setTimeout(saveToBackend, 2000);
      return () => clearTimeout(timer);
    }
  }, [files, user]);

  // Track unsaved changes
  useEffect(() => {
    const activeFile = files.find(file => file.id === activeFileId);
    if (activeFile && code !== activeFile.content) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [code, files, activeFileId]);

  // Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, activeFileId]);

  // Handle Chat mode - just conversation, no code modification
  const handleChat = async () => {
    if (!prompt.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          text: 'Please enter a message!',
          mode: 'chat'
        }
      ]);
      return;
    }

    const userMessage = {
      type: 'user',
      text: prompt,
      mode: 'chat'
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    const requestPayload = {
      message: currentPrompt,
      mode: 'chat'
    };

    try {
      const response = await axios.post(
        `${API_URL}/chat`,
        requestPayload
      );

      const aiMessage = {
        type: 'ai',
        text: response.data.reply,
        mode: 'chat'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('❌ ERROR:', err);
      const errorMessage = {
        type: 'error',
        text: `Error: ${err.response?.data?.error || err.message}`,
        mode: 'chat'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Generate Code mode - improves/modifies current code
  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          text: 'Please enter a prompt for code generation!',
          mode: 'generate'
        }
      ]);
      return;
    }

    const userMessage = {
      type: 'user',
      text: prompt,
      mode: 'generate'
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    const requestPayload = {
      code: code,
      prompt: currentPrompt,
      mode: 'generate'
    };

    try {
      const response = await axios.post(
        `${API_URL}/generate-code`,
        requestPayload
      );

      const generatedCode = response.data.generatedCode;
      
      // Only update the code if it's not null/undefined
      if (generatedCode) {
        setCode(generatedCode);

        // Save the generated code to the current file
        setFiles(prev =>
          prev.map(file =>
            file.id === activeFileId
              ? { ...file, content: generatedCode }
              : file
          )
        );

        const aiMessage = {
          type: 'ai',
          text: 'Code generated/updated successfully!',
          mode: 'generate',
          code: generatedCode
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('No code generated');
      }
      
    } catch (err) {
      console.error('❌ ERROR:', err);
      const errorMessage = {
        type: 'error',
        text: `Error generating code: ${err.response?.data?.error || err.message}`,
        mode: 'generate'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Main submit handler based on selected mode
  const handleSubmit = () => {
    if (aiMode === 'chat') {
      handleChat();
    } else {
      handleGenerateCode();
    }
  };

  const createFile = () => {
    if (!newFileName.trim()) return;

    const newFile = {
      id: Date.now(),
      filename: newFileName,
      content: ""
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName("");
    setShowCreateInput(false);
  };

  const handleFileClick = (fileId) => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges && fileId !== activeFileId) {
      const confirmed = window.confirm(
        `You have unsaved changes in ${activeFile?.filename || 'current file'}. Do you want to save before switching?`
      );
      
      if (confirmed) {
        saveCurrentFile();
      }
    }

    const file = files.find(f => f.id === fileId);
    if (file) {
      setActiveFileId(fileId);
      setCode(file.content);
      setHasUnsavedChanges(false);
    }
  };

  const saveCurrentFile = () => {
    setFiles(prev =>
      prev.map(file =>
        file.id === activeFileId
          ? { ...file, content: code }
          : file
      )
    );
    setHasUnsavedChanges(false);
    // Show temporary success message
    const successMessage = {
      type: 'ai',
      text: 'File saved successfully!',
      mode: 'system'
    };
    setMessages((prev) => [...prev, successMessage]);
    setTimeout(() => {
      setMessages((prev) => prev.filter(msg => msg.text !== 'File saved successfully!'));
    }, 2000);
  };

  const deleteFile = (fileId) => {
    if (files.length === 1) {
      alert("Cannot delete the last file");
      return;
    }
    
    setFiles(prev => prev.filter(file => file.id !== fileId));
    
    if (activeFileId === fileId) {
      const remainingFiles = files.filter(file => file.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
      }
    }
  };

  const runHtml = () => {
    if (!activeFile) return;

    let finalHtml = getActiveHtmlContent();

    // Replace CSS files
    const cssMatches = [
      ...finalHtml.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi)
    ];

    cssMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const cssContent = getFileContent(fileName);

      if (cssContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<style>\n${cssContent}\n</style>`
        );
      }
    });

    // Replace JS files
    const jsMatches = [
      ...finalHtml.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi)
    ];

    jsMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const jsContent = getFileContent(fileName);

      if (jsContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<script>\n${jsContent}\n<\/script>`
        );
      }
    });

    // Create preview
    const blob = new Blob([finalHtml], { type: "text/html" });
    const previewUrl = URL.createObjectURL(blob);
    window.open(previewUrl, "_blank", "noopener,noreferrer");

    // Memory cleanup
    setTimeout(() => {
      URL.revokeObjectURL(previewUrl);
    }, 10000);
  };

  const publishProject = async () => {
    if (!activeFile?.filename?.toLowerCase().endsWith('.html')) {
      alert('Please select an HTML file to publish');
      return;
    }

    // If already published, directly redeploy
    if (isPublished && savedProjectId && savedSiteId) {
      handleDirectDeploy();
    } else {
      // First time - show deployment options modal
      setShowDeploymentOptions(true);
    }
  };

  // Fetch backend sites list - only show user's own sites
  const fetchBackendSites = async () => {
    try {
      // Get user's deployed sites from localStorage
      const saved = localStorage.getItem('myDeployedSites');
      const userSites = saved ? JSON.parse(saved) : [];
      setBackendSites(userSites);
    } catch (error) {
      console.error('Failed to fetch backend sites:', error);
      setBackendSites([]);
    }
  };

  // Save deployed site to localStorage
  const saveDeployedSite = (siteData) => {
    const saved = localStorage.getItem('myDeployedSites');
    let sites = saved ? JSON.parse(saved) : [];
    
    // Check if site already exists (update case)
    const existingIndex = sites.findIndex(s => s.slug === siteData.slug);
    if (existingIndex >= 0) {
      sites[existingIndex] = siteData;
    } else {
      sites.push(siteData);
    }
    
    localStorage.setItem('myDeployedSites', JSON.stringify(sites));
    setMyDeployedSites(sites);
  };

  // Generate merged HTML by embedding CSS and JS
  const generateMergedHtml = (htmlContent) => {
    let finalHtml = htmlContent;

    // Replace CSS files
    const cssMatches = [
      ...finalHtml.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi)
    ];

    cssMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const cssContent = getFileContent(fileName);

      if (cssContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<style>\n${cssContent}\n</style>`
        );
      }
    });

    // Replace JS files
    const jsMatches = [
      ...finalHtml.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi)
    ];

    jsMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const jsContent = getFileContent(fileName);

      if (jsContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<script>\n${jsContent}\n<\/script>`
        );
      }
    });

    return finalHtml;
  };

  const handleDirectDeploy = async () => {
    setShowDeploymentOptions(false);
    
    // If already published, directly update without asking
    if (isPublished && savedProjectId && savedSiteId) {
      setIsPublishing(true);
      
      try {
        const finalHtml = generateMergedHtml(getActiveHtmlContent());

        const payload = {
          mergedHtml: finalHtml,
          projectName: activeFile.filename.replace('.html', ''),
          customSlug: savedProjectId.toLowerCase(),
          projectId: savedProjectId,
          siteId: savedSiteId
        };

        const response = await axios.post(`${API_URL}/publish`, payload);

        if (response.data.success) {
          setPublishedUrl(response.data.url);
          setShowPublishModal(true);
          
          // Show success message
          alert('✅ Site redeployed successfully!');
        }

      } catch (error) {
        alert(`Failed to redeploy: ${error.response?.data?.error || error.message}`);
        console.error('Redeploy error:', error);
      } finally {
        setIsPublishing(false);
      }
    } else {
      // First time publish - ask for slug
      setNameValidationError(''); // Clear any previous errors
      setShowConfirmDeploy(true);
    }
  };

  // Handle backend deployment (new or update)
  const handleBackendDeploy = async () => {
    setShowDeploymentOptions(false);
    setDeploymentType('backend');
    
    // Fetch backend sites first
    await fetchBackendSites();
    setShowBackendSitesList(true);
  };

  const confirmBackendDeploy = async (isUpdate, siteSlug = null) => {
    const slugToUse = isUpdate ? siteSlug : customProjectSlug;
    
    if (!slugToUse || !slugToUse.trim()) {
      alert('Please enter a project name');
      return;
    }

    setShowBackendSitesList(false);
    setShowConfirmDeploy(false);
    setIsPublishing(true);
    setNameValidationError(''); // Clear any previous errors
    setIsCheckingName(true); // Show checking state

    try {
      const finalHtml = generateMergedHtml(getActiveHtmlContent());

      const payload = {
        mergedHtml: finalHtml,
        projectName: activeFile.filename.replace('.html', ''),
        customSlug: slugToUse.toLowerCase(),
        projectId: isUpdate ? slugToUse : null,
        deploymentType: 'backend'
      };

      const response = await axios.post(`${API_URL}/publish`, payload);

      if (response.data.success) {
        setPublishedUrl(response.data.url);
        setShowPublishModal(true);
        
        // Save to localStorage
        saveDeployedSite({
          slug: response.data.projectId,
          url: response.data.url,
          lastModified: new Date().toISOString()
        });
        
        alert(`✅ ${isUpdate ? 'Site updated' : 'Site published'} successfully on backend!`);
      }

    } catch (error) {
      if (error.response?.data?.nameTaken) {
        // Show error in modal instead of alert
        setNameValidationError(error.response.data.error);
        setShowConfirmDeploy(true); // Keep modal open
      } else {
        alert(`Failed to deploy: ${error.response?.data?.error || error.message}`);
      }
      console.error('Deploy error:', error);
    } finally {
      setIsPublishing(false);
      setIsCheckingName(false);
    }
  };

  const confirmAndDeploy = async () => {
    if (!customProjectSlug.trim()) {
      alert('Please enter a project name/slug');
      return;
    }

    // Validate slug (only alphanumeric, hyphens, underscores)
    const slugRegex = /^[a-z0-9-_]+$/i;
    if (!slugRegex.test(customProjectSlug)) {
      alert('Project name can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setShowConfirmDeploy(false);
    setIsPublishing(true);
    setNameValidationError(''); // Clear any previous errors
    setIsCheckingName(true); // Show checking state

    try {
      const finalHtml = generateMergedHtml(getActiveHtmlContent());

      // Send to backend with correct deployment type
      const payload = {
        mergedHtml: finalHtml,
        projectName: activeFile.filename.replace('.html', ''),
        customSlug: customProjectSlug.toLowerCase(),
        deploymentType: deploymentType // Use the state to determine type
      };

      const response = await axios.post(`${API_URL}/publish`, payload);

      if (response.data.success) {
        setPublishedUrl(response.data.url);
        setShowPublishModal(true);
        
        // Only save to persistent storage if it's Netlify
        if (deploymentType === 'netlify') {
          setIsPublished(true);
          setSavedProjectId(response.data.projectId);
          setSavedSiteId(response.data.siteId);
          
          // Save to localStorage for Netlify
          localStorage.setItem('isProjectPublished', 'true');
          localStorage.setItem('publishedProjectId', response.data.projectId);
          localStorage.setItem('publishedSiteId', response.data.siteId);
        } else if (deploymentType === 'backend') {
          // Save to backend sites list
          saveDeployedSite({
            slug: response.data.projectId,
            url: response.data.url,
            lastModified: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      // Check if name already taken
      if (error.response?.data?.nameTaken) {
        // Show error in modal instead of alert
        setNameValidationError(error.response.data.error);
        setShowConfirmDeploy(true); // Keep modal open
      } else {
        alert(`Failed to publish: ${error.response?.data?.error || error.message}`);
      }
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
      setIsCheckingName(false);
    }
  };

  const handleGitHubDeploy = () => {
    alert('GitHub CI/CD Pipeline feature coming soon!');
    setShowDeploymentOptions(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
    alert('URL copied to clipboard!');
  };

  const closePublishModal = () => {
    setShowPublishModal(false);
    setPublishedUrl(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const importOldFiles = async () => {
    if (!user?.id) {
      alert('Please login first to import files from your account');
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/files/${user.id}`);
      if (response.data.success && response.data.files.length > 0) {
        setFiles(response.data.files);
        localStorage.setItem("files", JSON.stringify(response.data.files));
        alert(`Successfully imported ${response.data.files.length} files from your account!`);
      } else {
        alert('No files found in your account');
      }
    } catch (error) {
      alert(`Failed to import files: ${error.message}`);
    }
  };

  const uploadFiles = async () => {
    if (!user?.id) {
      alert('Please login first to upload files');
      setShowAuthModal(true);
      return;
    }

    if (files.length === 0) {
      alert('No files to upload');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/files/save`, {
        userId: user.id,
        files
      });

      if (response.data.success) {
        alert(`Successfully uploaded ${response.data.filesCount} files to your account!`);
      }
    } catch (error) {
      alert(`Failed to upload files: ${error.message}`);
    }
  };

  // Remove Auth gate - allow users to work without login
  // if (!user) {
  //   return <Auth onLoginSuccess={setUser} theme={theme} />;
  // }

  const getLanguage = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "html":
        return "html";
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "json":
        return "json";
      case "ts":
        return "typescript";
      default:
        return "plaintext";
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  // Function to switch mode
  const switchMode = (mode) => {
    setAiMode(mode);
    
    let instructionText = '';
    if (mode === 'chat') {
      instructionText = 'Switched to Chat mode - Ask me anything about coding!';
    } else {
      instructionText = `Switched to Generate Code mode - Open the file you want to modify, then describe the changes you need!`;
    }
    
    const modeSwitchMessage = {
      type: 'system',
      text: instructionText,
      mode: 'system'
    };
    setMessages((prev) => [...prev, modeSwitchMessage]);
    
    // Auto-remove the system message after 4 seconds for generate mode (longer message)
    setTimeout(() => {
      setMessages((prev) => prev.filter(msg => msg.text !== instructionText));
    }, mode === 'generate' ? 4000 : 2000);
  };

  // Toggle AI panel function
  const toggleAIPanel = () => {
    setShowAI(prev => !prev);
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      width: '100vw'
    }}>
      {/* FILE EXPLORER */}
      {showFiles && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="sidebar-backdrop"
            onClick={() => setShowFiles(false)}
            style={{
              display: 'none',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998
            }}
          />
          
          <div className="file-sidebar" style={{
            width: '250px',
            minWidth: '250px',
            maxWidth: '250px',
            borderRight: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme === 'light' ? '#f5f5f5' : '#252525',
            flexShrink: 0
          }}>
            <div className="panel-header" style={{
              padding: '10px',
              borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>File Structure</h3>
                {/* Mobile close button */}
                <button
                  className="mobile-close-btn"
                  onClick={() => setShowFiles(false)}
                  style={{
                    display: 'none',
                    padding: '4px 8px',
                    fontSize: '14px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Close sidebar"
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
              {user ? (
                <>
                  <button
                    onClick={uploadFiles}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    title="Upload current files to your account"
                  >
                    Upload
                  </button>
                  <button
                    onClick={importOldFiles}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    title="Import files from your account"
                  >
                    Import
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    title={`Logout (${user.email})`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Login to backup your files"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          <div className="file-tree" style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              <div>src</div>
              <button
                onClick={() => setShowCreateInput(true)}
                className="add-file-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: theme === 'light' ? '#666' : '#aaa'
                }}
              >
                +
              </button>
            </div>

            {showCreateInput && (
              <input
                type="text"
                placeholder="File name..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createFile();
                  }
                }}
                onBlur={() => {
                  if (!newFileName.trim()) {
                    setShowCreateInput(false);
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                  backgroundColor: theme === 'light' ? 'white' : '#1e1e1e',
                  color: theme === 'light' ? '#333' : '#ddd'
                }}
              />
            )}

            <div style={{ paddingLeft: '18px' }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`file-item ${activeFileId === file.id ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '6px 5px',
                    backgroundColor: activeFileId === file.id ? (theme === 'light' ? '#e0e0e0' : '#404040') : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '2px'
                  }}
                >
                  <span 
                    onClick={() => handleFileClick(file.id)}
                    style={{ flex: 1, fontSize: '13px' }}
                  >
                    {file.filename}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'red',
                      fontSize: '12px',
                      padding: '0 5px'
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      )}

      {/* CODE EDITOR */}
      <div className="editor-panel" style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
        overflow: 'hidden'
      }}>
        <div className="panel-header" style={{
          padding: '10px',
          borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme === 'light' ? '#f9f9f9' : '#252525'
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <button
              className="toggle-btn"
              onClick={() => setShowFiles(!showFiles)}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '16px'
              }}
            >
              ☰
            </button>

            <button
              className="toggle-btn"
              onClick={toggleAIPanel}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '16px'
              }}
              title={showAI ? "Close AI Panel" : "Open AI Panel"}
            >
              AI
            </button>

            {!showDeploymentPanel && (
              <>
                <button
                  className="toggle-btn"
                  onClick={() => {
                    if (activeFile?.filename?.toLowerCase().endsWith('.html')) {
                      const merged = generateMergedHtml(getActiveHtmlContent());
                      setMergedHtml(merged);
                      setShowDeploymentPanel(!showDeploymentPanel);
                    } else {
                      alert('Please select an HTML file');
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                    backgroundColor: showDeploymentPanel ? (theme === 'light' ? '#e3f2fd' : '#1a3a52') : (theme === 'light' ? '#f0f0f0' : '#333'),
                    color: theme === 'light' ? '#333' : '#fff',
                    fontSize: '16px'
                  }}
                  title={showDeploymentPanel ? "Close Deployment" : "Deploy to Netlify"}
              >
                🚀
              </button>

                {/* Redeploy button - only show if user has deployed sites */}
                {(myDeployedSites.length > 0 || isPublished) && (
                  <button
                    className="toggle-btn"
                    onClick={() => {
                      setShowRedeployOptions(true);
                    }}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      border: `1px solid ${theme === 'light' ? '#d97706' : '#f59e0b'}`,
                      backgroundColor: theme === 'light' ? '#fef3c7' : '#78350f',
                      color: theme === 'light' ? '#92400e' : '#fbbf24',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Redeploy to existing site"
                  >
                    <span style={{ fontSize: '14px' }}>🔄</span>
                    <span className="redeploy-btn-text">Redeploy</span>
                  </button>
                )}
              </>
            )}

            <h3 style={{ margin: 0, fontSize: '16px' }}>Code Editor</h3>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={saveCurrentFile}
              style={{
                padding: '6px 12px',
                backgroundColor: hasUnsavedChanges ? '#FF9800' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: hasUnsavedChanges ? 'bold' : 'normal'
              }}
              title={hasUnsavedChanges ? 'Unsaved changes - Click to save or press Ctrl+S' : 'File saved'}
            >
              {hasUnsavedChanges ? 'Save*' : 'Save'}
            </button>
            <button
              onClick={runHtml}
              style={{
                padding: '6px 12px',
                backgroundColor: activeFile?.filename?.toLowerCase().endsWith(".html") ? '#2196F3' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: activeFile?.filename?.toLowerCase().endsWith(".html") ? 'pointer' : 'not-allowed',
                fontSize: '13px'
              }}
              disabled={!activeFile?.filename?.toLowerCase().endsWith(".html")}
            >
              Run
            </button>
            <button
              onClick={publishProject}
              style={{
                padding: '6px 12px',
                backgroundColor: activeFile?.filename?.toLowerCase().endsWith(".html") ? '#9C27B0' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: activeFile?.filename?.toLowerCase().endsWith(".html") && !isPublishing ? 'pointer' : 'not-allowed',
                fontSize: '13px'
              }}
              disabled={!activeFile?.filename?.toLowerCase().endsWith(".html") || isPublishing}
            >
              {isPublishing ? 'Deploying...' : isPublished ? 'Redeploy' : 'Publish'}
            </button>
            <ThemeToggle onThemeChange={setTheme} />
          </div>
        </div>

        <Editor
          height="calc(100vh - 60px)"
          language={getLanguage(activeFile?.filename)}
          theme={theme === "light" ? "vs-light" : "vs-dark"}
          value={code}
          onChange={(value) => {
            setCode(value || "");
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on'
          }}
        />
      </div>

      {/* AI PANEL - Fixed toggle functionality */}
      {showAI && (
        <div className="chat-panel" style={{
          width: '350px',
          minWidth: '350px',
          maxWidth: '350px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme === 'light' ? '#f9f9f9' : '#1e1e1e',
          borderLeft: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
          flexShrink: 0
        }}>
          <div className="panel-header" style={{
            padding: '12px',
            borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme === 'light' ? '#fff' : '#252525'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Saurabh AI Assistant</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearMessages}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: theme === 'light' ? '#666' : '#aaa'
                }}
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={toggleAIPanel}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: theme === 'light' ? '#666' : '#aaa',
                  padding: '0 4px'
                }}
                title="Close AI Panel"
              >
                x
              </button>
            </div>
          </div>

          {/* Mode Selector Toggle */}
          <div style={{
            display: 'flex',
            padding: '12px',
            gap: '12px',
            borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            backgroundColor: theme === 'light' ? '#fff' : '#252525'
          }}>
            <button
              onClick={() => switchMode('chat')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: aiMode === 'chat' 
                  ? (theme === 'light' ? '#2196F3' : '#1976D2')
                  : (theme === 'light' ? '#f0f0f0' : '#333'),
                color: aiMode === 'chat' 
                  ? 'white'
                  : (theme === 'light' ? '#666' : '#aaa'),
                border: `1px solid ${aiMode === 'chat' 
                  ? (theme === 'light' ? '#2196F3' : '#1976D2')
                  : (theme === 'light' ? '#ddd' : '#444')}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Chat Mode</span>
            </button>
            <button
              onClick={() => switchMode('generate')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: aiMode === 'generate' 
                  ? (theme === 'light' ? '#4CAF50' : '#388E3C')
                  : (theme === 'light' ? '#f0f0f0' : '#333'),
                color: aiMode === 'generate' 
                  ? 'white'
                  : (theme === 'light' ? '#666' : '#aaa'),
                border: `1px solid ${aiMode === 'generate' 
                  ? (theme === 'light' ? '#4CAF50' : '#388E3C')
                  : (theme === 'light' ? '#ddd' : '#444')}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Generate Mode</span>
            </button>
          </div>

          <div className="chat-messages" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 ? (
              <div className="empty-chat" style={{
                textAlign: 'center',
                color: theme === 'light' ? '#666' : '#aaa',
                padding: '30px 20px'
              }}>
                <p style={{ margin: '5px 0' }}>Hi! I'm Saurabh, your AI code assistant.</p>
                <p style={{ margin: '5px 0' }}>Select a mode and start interacting!</p>
                <hr style={{ margin: '15px 0', borderColor: theme === 'light' ? '#e0e0e0' : '#444' }} />
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>Chat Mode:</strong> Ask me anything about coding concepts!(iss mode me shirf chat hoga )
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>Generate Mode:</strong> Open a file first, then tell me what to change!(iss mode me code generate kar k dega AI)
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`message ${msg.type}`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.type === 'user' 
                      ? (theme === 'light' ? '#e3f2fd' : '#1e3a5f')
                      : msg.type === 'ai' 
                        ? (theme === 'light' ? '#f3e5f5' : '#4a148c')
                        : msg.type === 'system'
                          ? (theme === 'light' ? '#fff3e0' : '#4a2e1a')
                          : (theme === 'light' ? '#ffebee' : '#5c1a1a'),
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    boxShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="message-label" style={{
                    fontWeight: 'bold',
                    fontSize: '10px',
                    marginBottom: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: msg.type === 'system' ? (theme === 'light' ? '#e65100' : '#ffb74d') : 'inherit'
                  }}>
                    <span>
                      {msg.type === 'user' ? 'You' : msg.type === 'ai' ? 'Saurabh' : msg.type === 'system' ? 'System' : 'Error'}
                    </span>
                    {msg.mode && msg.mode !== 'system' && (
                      <span style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: msg.mode === 'chat' ? '#2196F3' : '#4CAF50',
                        color: 'white',
                        marginLeft: '8px'
                      }}>
                        {msg.mode === 'chat' ? 'Chat' : 'Generate'}
                      </span>
                    )}
                  </div>
                  <div className="message-text" style={{
                    fontSize: '12px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    color: theme === 'light' ? '#333' : '#eee'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="message ai" style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: theme === 'light' ? '#f3e5f5' : '#4a148c',
                alignSelf: 'flex-start',
                maxWidth: '85%'
              }}>
                <div className="message-label" style={{
                  fontWeight: 'bold',
                  fontSize: '10px',
                  marginBottom: '5px'
                }}>
                  Saurabh ({aiMode === 'chat' ? 'Chat Mode' : 'Generate Mode'})
                </div>
                <div className="message-text loading" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <span>Thinking</span>
                  <span>...</span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-section" style={{
            padding: '15px',
            borderTop: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            display: 'flex',
            gap: '10px',
            backgroundColor: theme === 'light' ? '#fff' : '#252525'
          }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={aiMode === 'chat' 
                ? "Ask me anything about coding..." 
                : "Describe what code you want me to generate..."}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && prompt.trim()) {
                  handleSubmit();
                }
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
                fontSize: '12px',
                backgroundColor: theme === 'light' ? 'white' : '#1e1e1e',
                color: theme === 'light' ? '#333' : '#ddd',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSubmit} 
              disabled={loading || !prompt.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: loading || !prompt.trim() 
                  ? '#ccc' 
                  : aiMode === 'chat' 
                    ? '#2196F3' 
                    : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Loading...' : aiMode === 'chat' ? 'Send' : 'Generate'}
            </button>
          </div>
        </div>
      )}
      
      {/* Deployment Options Modal */}
      {showDeploymentOptions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: 'auto'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '24px',
              textAlign: 'center'
            }}>
              Choose Deployment Method
            </h2>

            {/* Backend Server Deploy Option */}
            <div 
              onClick={handleBackendDeploy}
              style={{
                backgroundColor: theme === 'light' ? '#f8f9fa' : '#1e1e1e',
                border: `2px solid ${theme === 'light' ? '#e0e0e0' : '#444'}`,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4CAF50';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0fff4' : '#1a2f1a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === 'light' ? '#e0e0e0' : '#444';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : '#1e1e1e';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                READY ✓
              </div>
              <h3 style={{
                margin: '0 0 10px 0',
                color: '#4CAF50',
                fontSize: '18px'
              }}>
                🖥️ Deploy to Backend Server
              </h3>
              <p style={{
                margin: '0',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '13px',
                lineHeight: '1.6'
              }}>
                <strong>Features:</strong><br/>
                • Create multiple sites with custom slugs<br/>
                • Update existing sites anytime<br/>
                • Fast server-side rendering<br/>
                • No external dependencies<br/>
                • Full control over your deployments
              </p>
            </div>

            {/* Netlify Deploy Option */}
            <div 
              onClick={() => {
                setDeploymentType('netlify');
                handleDirectDeploy();
              }}
              style={{
                backgroundColor: theme === 'light' ? '#f8f9fa' : '#1e1e1e',
                border: `2px solid #667eea`,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f4ff' : '#1a2f5a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : '#1e1e1e';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#667eea',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                READY ✓
              </div>
              <h3 style={{
                margin: '0 0 10px 0',
                color: '#667eea',
                fontSize: '18px'
              }}>
                ☁️ Deploy to Netlify
              </h3>
              <p style={{
                margin: '0',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '13px',
                lineHeight: '1.6'
              }}>
                <strong>Features:</strong><br/>
                • One-time publish with custom domain<br/>
                • Global CDN distribution<br/>
                • Automatic HTTPS/SSL<br/>
                • Fast deployment (updates in seconds)<br/>
                • Professional hosting
              </p>
            </div>

            <button
              onClick={() => setShowDeploymentOptions(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                color: theme === 'light' ? '#333' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Redeploy Options Modal */}
      {showRedeployOptions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '22px',
              textAlign: 'center'
            }}>
              🔄 Redeploy Options
            </h2>
            
            <p style={{
              margin: '0 0 25px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Choose where you want to redeploy:
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Show message if nothing is deployed */}
              {myDeployedSites.length === 0 && !isPublished && (
                <p style={{
                  textAlign: 'center',
                  color: theme === 'light' ? '#999' : '#666',
                  fontSize: '14px',
                  padding: '20px'
                }}>
                  No deployed sites found. Please publish a site first.
                </p>
              )}

              {/* Backend Redeploy Option */}
              {myDeployedSites.length > 0 && (
                <div
                  onClick={async () => {
                    setShowRedeployOptions(false);
                    await fetchBackendSites();
                    setShowBackendSitesList(true);
                  }}
                  style={{
                    backgroundColor: theme === 'light' ? '#f0fff4' : '#1a2f1a',
                    border: '2px solid #4CAF50',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '36px',
                    marginBottom: '10px'
                  }}>
                    🖥️
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#4CAF50',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    Redeploy on Backend Server
                  </h3>
                  <p style={{
                    margin: 0,
                    color: theme === 'light' ? '#666' : '#aaa',
                    fontSize: '13px'
                  }}>
                    Update your existing backend sites
                  </p>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: theme === 'light' ? '#999' : '#666',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {myDeployedSites.length} site{myDeployedSites.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              )}

              {/* Netlify Redeploy Option */}
              {isPublished && savedSiteId && (
                <div
                  onClick={async () => {
                    setShowRedeployOptions(false);
                    // Directly trigger Netlify redeploy
                    setDeploymentType('netlify');
                    setCustomProjectSlug(savedProjectId);
                    await confirmAndDeploy();
                  }}
                  style={{
                    backgroundColor: theme === 'light' ? '#e3f2fd' : '#1a2a3a',
                    border: '2px solid #2196F3',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '36px',
                    marginBottom: '10px'
                  }}>
                    ☁️
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#2196F3',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    Redeploy on Netlify
                  </h3>
                  <p style={{
                    margin: 0,
                    color: theme === 'light' ? '#666' : '#aaa',
                    fontSize: '13px'
                  }}>
                    Update your Netlify site
                  </p>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: theme === 'light' ? '#999' : '#666',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    Site: {savedProjectId}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowRedeployOptions(false)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '20px',
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                color: theme === 'light' ? '#333' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Backend Sites List Modal */}
      {showBackendSitesList && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '22px'
            }}>
              Backend Deployment
            </h2>

            {/* New Site Option */}
            <div style={{
              backgroundColor: theme === 'light' ? '#f0fff4' : '#1a2f1a',
              border: '2px solid #4CAF50',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setShowBackendSitesList(false);
              setCustomProjectSlug('');
              setNameValidationError(''); // Clear any previous errors
              setDeploymentType('backend'); // Make sure it's backend
              setShowConfirmDeploy(true);
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>➕ Create New Site</h3>
              <p style={{ margin: 0, fontSize: '13px', color: theme === 'light' ? '#666' : '#aaa' }}>
                Deploy to a new custom URL
              </p>
            </div>

            {/* Existing Sites List */}
            {backendSites.length > 0 && (
              <>
                <h3 style={{
                  margin: '0 0 15px 0',
                  color: theme === 'light' ? '#666' : '#aaa',
                  fontSize: '14px'
                }}>
                  Or update an existing site:
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {backendSites.map((site) => (
                    <div
                      key={site.slug}
                      onClick={() => confirmBackendDeploy(true, site.slug)}
                      style={{
                        backgroundColor: theme === 'light' ? '#f8f9fa' : '#1e1e1e',
                        border: `1px solid ${theme === 'light' ? '#e0e0e0' : '#444'}`,
                        borderRadius: '6px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#4CAF50';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme === 'light' ? '#e0e0e0' : '#444';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        fontWeight: 'bold',
                        color: theme === 'light' ? '#333' : '#fff',
                        marginBottom: '5px'
                      }}>
                        {site.slug}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: theme === 'light' ? '#666' : '#aaa'
                      }}>
                        {site.url}
                      </div>
                      {site.lastModified && (
                        <div style={{
                          fontSize: '11px',
                          color: theme === 'light' ? '#999' : '#666',
                          marginTop: '5px'
                        }}>
                          Last updated: {new Date(site.lastModified).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => setShowBackendSitesList(false)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '20px',
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                color: theme === 'light' ? '#333' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Confirm Deploy Modal */}
      {showConfirmDeploy && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              margin: '0 0 15px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '22px',
              textAlign: 'center'
            }}>
              {isPublished ? 'Re-Publish Project' : 'Confirm Deployment'}
            </h2>
            <p style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '14px',
              lineHeight: '1.6',
              textAlign: 'center'
            }}>
              {isPublished 
                ? 'Update your existing project with the latest changes:' 
                : 'Enter a custom name for your project URL:'}
            </p>
            
            <div style={{
              marginBottom: '10px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                Project Name/Slug:
              </label>
              <input
                type="text"
                value={customProjectSlug}
                onChange={(e) => {
                  setCustomProjectSlug(e.target.value);
                  setNameValidationError(''); // Clear error on new input
                }}
                placeholder="my-awesome-project"
                readOnly={(isPublished && savedProjectId) || isCheckingName}
                disabled={isCheckingName}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${nameValidationError ? '#ef4444' : (theme === 'light' ? '#ddd' : '#444')}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: isCheckingName
                    ? (theme === 'light' ? '#fef3c7' : '#78350f')
                    : (isPublished && savedProjectId 
                      ? (theme === 'light' ? '#f5f5f5' : '#2a2a2a')
                      : (theme === 'light' ? '#fff' : '#1e1e1e')),
                  color: nameValidationError ? '#ef4444' : (theme === 'light' ? '#333' : '#ddd'),
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: (isPublished && savedProjectId) || isCheckingName ? 'not-allowed' : 'text',
                  transition: 'all 0.3s ease'
                }}
              />
              
              {/* Validation Error Message */}
              {nameValidationError && (
                <p style={{
                  margin: '8px 0 0 0',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  ⚠️ {nameValidationError}
                </p>
              )}
              
              {/* Checking Status */}
              {isCheckingName && !nameValidationError && (
                <p style={{
                  margin: '8px 0 0 0',
                  color: '#f59e0b',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  ⏳ Checking availability...
                </p>
              )}
              
              {/* Preview URL */}
              {!nameValidationError && !isCheckingName && (
                <p style={{
                  margin: '8px 0 0 0',
                  color: theme === 'light' ? '#999' : '#666',
                  fontSize: '12px'
                }}>
                  Preview: {API_BASE_URL}/{customProjectSlug || 'your-project-name'}
                </p>
              )}
            </div>

            <p style={{
              margin: '0 0 25px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '13px',
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {isPublished && savedProjectId ? (
                <>
                  <strong>Note:</strong> This will update your existing project at the same URL.
                </>
              ) : (
                <>
                  <strong>Note:</strong> Only letters, numbers, hyphens, and underscores are allowed.
                  <br/>
                  This will make your project publicly accessible.
                </>
              )}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  setShowConfirmDeploy(false);
                  setShowDeploymentOptions(true);
                  setCustomProjectSlug('');
                  setNameValidationError(''); // Clear errors
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                  color: theme === 'light' ? '#333' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAndDeploy}
                disabled={isCheckingName}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isCheckingName ? '#94a3b8' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCheckingName ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: isCheckingName ? 0.6 : 1
                }}
              >
                {isCheckingName ? 'Checking...' : (isPublished ? 'Update Project' : 'Yes, Deploy')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Full Screen Loader during Publishing */}
      {isPublishing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #9C27B0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: 'white',
            marginTop: '20px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Publishing your project...
          </p>
          <p style={{
            color: '#ccc',
            marginTop: '5px',
            fontSize: '14px'
          }}>
            Please wait, this may take a few moments
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {/* Deployment Panel - Bottom Drawer */}
      {showDeploymentPanel && (
        <DeploymentPanel 
          mergedHtml={mergedHtml}
          projectName={activeFile?.filename?.replace('.html', '') || 'Project'}
          onClose={() => setShowDeploymentPanel(false)}
          onDeploySuccess={(result) => {
            console.log('Deployment successful:', result);
            console.log('Setting publishedUrl to:', result.url);
            setPublishedUrl(result.url);
            setIsPublished(true);
            setSavedProjectId(result.projectId);
            localStorage.setItem('isProjectPublished', 'true');
            localStorage.setItem('publishedProjectId', result.projectId);
            setShowPublishModal(true);
          }}
        />
      )}
      

      {/* Auth Modal */}
      {showPublishModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '15px',
                color: '#4CAF50'
              }}>
                ✓
              </div>
              <h2 style={{
                margin: '0 0 10px 0',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '24px'
              }}>
                Successfully Published!
              </h2>
              <p style={{
                margin: 0,
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '14px'
              }}>
                Your project is now live on the web
              </p>
            </div>

            <div style={{
              backgroundColor: theme === 'light' ? '#f5f5f5' : '#1e1e1e',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="text"
                value={publishedUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: '10px',
                  border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
                  color: theme === 'light' ? '#333' : '#ddd',
                  outline: 'none'
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                Copy
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  window.open(publishedUrl, '_blank');
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Go Live
              </button>
              <button
                onClick={closePublishModal}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                  color: theme === 'light' ? '#333' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 10001
              }}
            >
              x
            </button>
            <Auth onLoginSuccess={handleLoginSuccess} theme={theme} />
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <WelcomePopup onClose={() => setShowWelcomePopup(false)} />
      )}
    </div>
  );
}

export default App;