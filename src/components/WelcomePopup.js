import React, { useState, useEffect } from 'react';
import './WelcomePopup.css';

const WelcomePopup = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="welcome-overlay" onClick={handleClose}></div>
      <div className="welcome-popup">
        <button className="welcome-close-button" onClick={handleClose}>✕</button>
        
        <div className="welcome-content">
          <div className="welcome-icon">🚀</div>
          <h2 className="welcome-title">Why Choose This Platform?</h2>
          <h3 className="welcome-subtitle">इस प्लेटफ़ॉर्म को क्यों चुनें?</h3>
          
          <div className="welcome-features">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <p className="feature-en">Auto Deploy to Netlify - Get your own live website instantly</p>
                <p className="feature-hi">नेटलिफाई पर ऑटो डिप्लॉय - तुरंत अपनी लाइव वेबसाइट पाएं</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔗</div>
              <div className="feature-text">
                <p className="feature-en">Share the link with anyone - Your deployed site in just a few seconds</p>
                <p className="feature-hi">लिंक किसी को भी भेजें - कुछ सेकंड में अपनी डिप्लॉय साइट पाएं</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <div className="feature-text">
                <p className="feature-en">AI Chat - Generate code with AI assistance</p>
                <p className="feature-hi">AI चैट - AI सहायता से कोड जनरेट करें</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💻</div>
              <div className="feature-text">
                <p className="feature-en">Full Code Editor - Build your projects easily</p>
                <p className="feature-hi">पूर्ण कोड एडिटर - अपने प्रोजेक्ट आसानी से बनाएं</p>
              </div>
            </div>
          </div>

          <button className="welcome-action-button" onClick={handleClose}>
            Get Started / शुरू करें
          </button>
        </div>
      </div>
    </>
  );
};

export default WelcomePopup;
