
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
        <title>Welcome to {siteName}</title>
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
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
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
            .cta-container {
              text-align: center;
              margin: 35px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
              transition: all 0.3s ease;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.5);
            }
            .alternative {
              margin-top: 25px;
              padding: 20px;
              background-color: #f3f4f6;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .alternative-title {
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
            }
            .alternative-text {
              font-size: 14px;
              color: #6b7280;
              word-break: break-all;
            }
            .footer {
              margin-top: 40px;
              padding-top: 25px;
              border-top: 1px solid #e5e7eb;
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
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
            .security-note-title {
              font-weight: 600;
              color: #92400e;
              margin-bottom: 5px;
            }
            .security-note-text {
              font-size: 14px;
              color: #a16207;
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .container { padding: 25px; }
              .title { font-size: 24px; }
              .cta-button { padding: 14px 28px; font-size: 15px; }
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
            <h1 className="title">Welcome to {siteName}!</h1>
            <p className="subtitle">Complete your account setup to start your interview prep journey</p>
          </div>

          <div className="content">
            <p className="greeting">
              {userName ? `Hi ${userName},` : 'Hello!'}
            </p>
            
            <p className="message">
              Thank you for joining <strong>{siteName}</strong>! We're excited to help you ace your upcoming interviews 
              with AI-powered preparation tools, real interview experiences, and a supportive community.
            </p>

            <p className="message">
              To get started and access all features, please confirm your email address by clicking the button below:
            </p>

            <div className="cta-container">
              <a href={confirmationUrl} className="cta-button">
                Verify Email & Get Started
              </a>
            </div>

            <div className="alternative">
              <div className="alternative-title">Can't click the button?</div>
              <div className="alternative-text">
                Copy and paste this link into your browser: <br />
                {confirmationUrl}
              </div>
            </div>

            <div className="security-note">
              <div className="security-note-title">🔒 Security Note</div>
              <div className="security-note-text">
                This verification link will expire in 24 hours for your security. 
                If you didn't create an account with us, you can safely ignore this email.
              </div>
            </div>

            <p className="message">
              Once verified, you'll be able to:
            </p>
            <ul style={{ color: '#4b5563', paddingLeft: '20px', marginBottom: '20px' }}>
              <li>Share and discover real interview experiences</li>
              <li>Get AI-powered interview preparation</li>
              <li>Connect with our interview prep community</li>
              <li>Access personalized study recommendations</li>
            </ul>
          </div>

          <div className="footer">
            <p className="footer-text">
              Need help? Contact us at support@interviewinsights.com
            </p>
            <div className="footer-links">
              <span>© 2024 {siteName} | </span>
              <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy Policy</a>
              <span> | </span>
              <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default EmailTemplate;
