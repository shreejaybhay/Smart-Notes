"use client";

import { ArrowLeft, Brain } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-foreground/80 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to SmartNotes
        </Link>

        {/* Header */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">SmartNotes</span>
        </div>

        <Card className="max-w-4xl mx-auto border-border">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              <p className="text-foreground/90">
                At SmartNotes, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-foreground mt-4">2.1 Personal Data</h3>
              <p className="text-foreground/90">
                We may collect personally identifiable information, such as:
              </p>
              <ul className="list-disc pl-6 text-foreground/90">
                <li>Email address</li>
                <li>First and last name</li>
                <li>Usage data and analytics</li>
                <li>Device information</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">2.2 User Content</h3>
              <p className="text-foreground/90">
                We collect and store the notes, documents, and other content you create, upload, or store while using SmartNotes. This content is primarily stored to provide you with our service.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p className="text-foreground/90">
                We may use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc pl-6 text-foreground/90">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information, such as updates, security alerts, and support messages</li>
                <li>Respond to customer service requests and support needs</li>
                <li>Personalize your experience and deliver content relevant to your interests</li>
                <li>Monitor usage patterns and analyze trends to improve service functionality and user experience</li>
              </ul>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">4. AI Processing and Data Analysis</h2>
              <p className="text-foreground/90">
                SmartNotes uses artificial intelligence to enhance your note-taking experience. This involves:
              </p>
              <ul className="list-disc pl-6 text-foreground/90">
                <li>Processing your notes to create connections, suggestions, and organization</li>
                <li>Analyzing patterns in your content to provide personalized features</li>
                <li>Using machine learning to improve our AI systems</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                We implement strict data protection measures to ensure your content is processed securely. You can control AI features through your account settings.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">5. Data Sharing and Disclosure</h2>
              <p className="text-foreground/90">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 text-foreground/90">
                <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors or agents who perform services for us.</li>
                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition.</li>
                <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
              </ul>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">6. Data Security</h2>
              <p className="text-foreground/90">
                We use administrative, technical, and physical security measures to protect your personal information. While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.
              </p>
              <p className="text-foreground/90 mt-4">
                Your data is encrypted both in transit and at rest. We regularly review our information collection, storage, and processing practices to guard against unauthorized access.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">7. Your Data Rights</h2>
              <p className="text-foreground/90">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-foreground/90">
                <li>The right to access personal information we hold about you</li>
                <li>The right to request correction of inaccurate data</li>
                <li>The right to request deletion of your data</li>
                <li>The right to restrict or object to our processing of your data</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">8. Children's Privacy</h2>
              <p className="text-foreground/90">
                Our Service is not directed to anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">9. Changes to This Privacy Policy</h2>
              <p className="text-foreground/90">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
              <p className="text-foreground/90">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-foreground/90 mt-2">
                Email: privacy@smartnotes.example.com<br />
                Address: 123 Note Avenue, Suite 456, San Francisco, CA 94107
              </p>
            </div>

            <div className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                By using SmartNotes, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}