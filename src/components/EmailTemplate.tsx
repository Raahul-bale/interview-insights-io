
import React from 'react';

interface EmailTemplateProps {
  userName?: string;
  confirmationUrl: string;
  siteName: string;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({ 
  userName, 
  confirmationUrl, 
  siteName = "Interview Insights" 
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email - {siteName}</title>
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .container {
              background-color: #ffffff;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #f3f4f6;
              padding-bottom: 20px;
            }
            .logo {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 20px;
            }
            .logo-icon {
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin: 0 0 16px 0;
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
              margin: 0 0 30px 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #374151;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 25px;
              line-height: 1.7;
            }
            .verification-box {
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              border: 2px solid #d1d5db;
              border-radius: 12px;
              padding: 25px;
              margin: 30px 0;
              text-align: center;
            }
            .verification-title {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 15px;
            }
            .verification-text {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            .cta-container {
              text-align: center;
              margin: 35px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              padding: 18px 36px;
              border-radius: 10px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
              min-height: 56px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.5);
            }
            .alternative {
              margin-top: 25px;
              padding: 20px;
              background-color: #fef3c7;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            .alternative-title {
              font-weight: 600;
              color: #92400e;
              margin-bottom: 8px;
            }
            .alternative-text {
              font-size: 14px;
              color: #a16207;
              word-break: break-all;
            }
            .footer {
              margin-top: 40px;
              padding-top: 25px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
            }
            .footer-text {
              font-size: 14px;
              color: #9ca3af;
              margin-bottom: 15px;
            }
            .footer-links {
              font-size: 14px;
            }
            .footer-links a {
              color: #667eea;
              text-decoration: none;
              margin: 0 10px;
            }
            .security-note {
              background-color: #dbeafe;
              border: 1px solid #3b82f6;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .security-note-title {
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .security-note-text {
              font-size: 14px;
              color: #1e3a8a;
              line-height: 1.5;
            }
            .features-list {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .features-list h4 {
              color: #1f2937;
              font-weight: 600;
              margin-bottom: 15px;
            }
            .features-list ul {
              color: #4b5563;
              padding-left: 20px;
              margin: 0;
            }
            .features-list li {
              margin-bottom: 8px;
              line-height: 1.5;
            }
            @media (max-width: 600px) {
              body { 
                padding: 15px; 
              }
              .container { 
                padding: 25px 20px; 
              }
              .title { 
                font-size: 24px; 
              }
              .cta-button { 
                padding: 16px 32px; 
                font-size: 15px;
                min-height: 52px;
                width: 100%;
                max-width: 280px;
              }
              .logo-text {
                font-size: 20px;
              }
              .logo-icon {
                width: 40px;
                height: 40px;
                font-size: 16px;
              }
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">
              <div className="logo-icon">II</div>
              <div className="logo-text">{siteName}</div>
            </div>
            <h1 className="title">Verify Your Email Address</h1>
            <p className="subtitle">Complete your account setup to get started</p>
          </div>

          <div className="content">
            <p className="greeting">
              {userName ? `Hello ${userName},` : 'Hello!'}
            </p>
            
            <p className="message">
              Thank you for joining <strong>{siteName}</strong>! We're excited to help you ace your upcoming interviews 
              with AI-powered preparation tools, real interview experiences, and a supportive community.
            </p>

            <div className="verification-box">
              <div className="verification-title">🔐 Email Verification Required</div>
              <div className="verification-text">
                To ensure the security of your account and access all features, please verify your email address by clicking the button below.
              </div>
            </div>

            <div className="cta-container">
              <a href={confirmationUrl} className="cta-button">
                ✅ Verify Email & Sign In Automatically
              </a>
            </div>

            <div className="alternative">
              <div className="alternative-title">🔗 Alternative Link</div>
              <div className="alternative-text">
                If the button doesn't work, copy and paste this link into your browser: <br />
                <strong>{confirmationUrl}</strong>
              </div>
            </div>

            <div className="security-note">
              <div className="security-note-title">
                🛡️ Security & Privacy Information
              </div>
              <div className="security-note-text">
                • This verification link will expire in 24 hours for your security<br />
                • After verification, you'll be automatically signed in to your account<br />
                • You'll be redirected to the home page to start exploring<br />
                • If you didn't create this account, you can safely ignore this email
              </div>
            </div>

            <div className="features-list">
              <h4>🚀 What's waiting for you after verification:</h4>
              <ul>
                <li><strong>Real Interview Experiences:</strong> Browse thousands of authentic interview stories</li>
                <li><strong>AI Interview Preparation:</strong> Get personalized prep advice and practice</li>
                <li><strong>Community Connections:</strong> Chat with experience authors and other candidates</li>
                <li><strong>Resume ATS Optimization:</strong> Make your resume ATS-friendly</li>
                <li><strong>Share Your Journey:</strong> Help others by sharing your own experiences</li>
              </ul>
            </div>
          </div>

          <div className="footer">
            <p className="footer-text">
              <strong>Need help?</strong> Contact us at <a href="mailto:support@interviewinsights.com">support@interviewinsights.com</a>
            </p>
            <div className="footer-links">
              <span>© 2024 {siteName}</span>
              <span> | </span>
              <a href="#">Privacy Policy</a>
              <span> | </span>
              <a href="#">Terms of Service</a>
              <span> | </span>
              <a href="#">Unsubscribe</a>
            </div>
            <p className="footer-text" style={{ marginTop: '15px', fontSize: '12px' }}>
              This email was sent from a trusted source. Adding us to your contacts helps ensure delivery to your primary inbox.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default EmailTemplate;
