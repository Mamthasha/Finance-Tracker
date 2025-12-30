import React from "react";

export default function TermsOfService() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">Terms of Service</h1>
          <p className="text-muted mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-4">
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using Personal Finance Manager, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>
          
          <section className="mb-4">
            <h3>2. Description of Service</h3>
            <p>Personal Finance Manager is a web application that helps users track income, expenses, and manage budgets. The service is provided "as is" without any warranties.</p>
          </section>
          
          <section className="mb-4">
            <h3>3. User Accounts</h3>
            <ul>
              <li>You can use the application in guest mode without registration</li>
              <li>Registered accounts provide cloud backup of your data</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must be at least 18 years old to create an account</li>
            </ul>
          </section>
          
          <section className="mb-4">
            <h3>4. User Responsibilities</h3>
            <p>As a user, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Use the service for personal financial management only</li>
              <li>Not use the service for any illegal purposes</li>
              <li>Not attempt to disrupt or interfere with the service</li>
              <li>Back up important financial data regularly</li>
            </ul>
          </section>
          
          <section className="mb-4">
            <h3>5. Data Ownership</h3>
            <p>You retain ownership of all financial data you enter into the application. We only process this data to provide you with the service.</p>
          </section>
          
          <section className="mb-4">
            <h3>6. Service Availability</h3>
            <p>We strive to maintain 24/7 service availability but do not guarantee uninterrupted access. We may perform maintenance that temporarily limits availability.</p>
          </section>
          
          <section className="mb-4">
            <h3>7. Limitation of Liability</h3>
            <p>Personal Finance Manager is provided for informational purposes only. We are not financial advisors and do not provide financial advice. You are solely responsible for your financial decisions.</p>
          </section>
          
          <section className="mb-4">
            <h3>8. Termination</h3>
            <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.</p>
          </section>
          
          <section className="mb-4">
            <h3>9. Changes to Terms</h3>
            <p>We may update these Terms of Service from time to time. We will notify users of any material changes by updating the "Last Updated" date at the top of this page.</p>
          </section>
          
          <section className="mb-4">
            <h3>10. Governing Law</h3>
            <p>These Terms shall be governed by the laws of [Your Country/State], without regard to its conflict of law provisions.</p>
          </section>
          
          <section className="mb-4">
            <h3>11. Contact Information</h3>
            <p>For questions about these Terms of Service, please contact:</p>
            <p><strong>Email:</strong> legal@financemanager.app</p>
          </section>
          
          <div className="mt-5 pt-3 border-top">
            <p className="small text-muted">
              By using Personal Finance Manager, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}