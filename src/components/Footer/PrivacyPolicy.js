import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">Privacy Policy</h1>
          <p className="text-muted mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-4">
            <h3>1. Information We Collect</h3>
            <p>When you use Personal Finance Manager, we collect the following information:</p>
            <ul>
              <li><strong>Transaction Data:</strong> Income and expense details you enter</li>
              <li><strong>Budget Information:</strong> Budget limits you set for different categories</li>
              <li><strong>Account Information:</strong> Email address and display name (if you create an account)</li>
              <li><strong>Usage Data:</strong> How you interact with the application</li>
            </ul>
          </section>
          
          <section className="mb-4">
            <h3>2. How We Use Your Information</h3>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide and maintain the finance tracking service</li>
              <li>Generate financial reports and insights</li>
              <li>Improve application performance and user experience</li>
              <li>Send important updates about your account (if applicable)</li>
              <li>Ensure the security of your data</li>
            </ul>
          </section>
          
          <section className="mb-4">
            <h3>3. Data Storage & Security</h3>
            <p>Your financial data is stored securely:</p>
            <ul>
              <li><strong>Guest Mode:</strong> Data is stored locally in your browser</li>
              <li><strong>Registered Users:</strong> Data is stored securely in Firebase</li>
              <li>All data transmission is encrypted using HTTPS</li>
              <li>We implement industry-standard security measures</li>
            </ul>
          </section>
          
          <section className="mb-4">
            <h3>4. Data Sharing</h3>
            <p>We do not sell, trade, or rent your personal financial information to third parties. We may share anonymized, aggregated data for analytical purposes.</p>
          </section>
          
          <section className="mb-4">
            <h3>5. Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your transaction data</li>
              <li>Opt-out of data collection</li>
            </ul>
          </section>
          
          <section className="mb-4">
            <h3>6. Cookies</h3>
            <p>We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.</p>
          </section>
          
          <section className="mb-4">
            <h3>7. Contact Us</h3>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p><strong>Email:</strong> privacy@financemanager.app</p>
          </section>
          
          <div className="mt-5 pt-3 border-top">
            <p className="small text-muted">
              This Privacy Policy may be updated periodically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}