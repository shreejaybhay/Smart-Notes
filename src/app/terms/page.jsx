"use client";

import { ArrowLeft, Brain } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              <p className="text-foreground/90">
                Welcome to SmartNotes. These Terms of Service govern your use of our website and services. By accessing or using SmartNotes, you agree to be bound by these Terms.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">2. Definitions</h2>
              <p className="text-foreground/90">
                <strong>"Service"</strong> refers to the SmartNotes application, website, and all content and services made available through SmartNotes.
              </p>
              <p className="text-foreground/90">
                <strong>"User"</strong> refers to individuals who access or use the Service, whether registered or not.
              </p>
              <p className="text-foreground/90">
                <strong>"Account"</strong> refers to the personal account created by a User to access and use the Service.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">3. Account Registration</h2>
              <p className="text-foreground/90">
                To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p className="text-foreground/90">
                You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">4. User Content</h2>
              <p className="text-foreground/90">
                Our Service allows you to create, upload, store, and share content, including notes, documents, and other materials ("User Content"). You retain all rights to your User Content.
              </p>
              <p className="text-foreground/90">
                By uploading User Content, you grant SmartNotes a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content solely for the purpose of providing the Service to you.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">5. Acceptable Use</h2>
              <p className="text-foreground/90">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 text-foreground/90">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Upload or transmit viruses, malware, or other harmful code</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Engage in unauthorized data collection or mining</li>
                <li>Impersonate any person or entity</li>
              </ul>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">6. AI Features and Data Processing</h2>
              <p className="text-foreground/90">
                SmartNotes uses artificial intelligence to enhance your note-taking experience. By using our AI features, you understand that:
              </p>
              <ul className="list-disc pl-6 text-foreground/90">
                <li>Your content may be processed by our AI systems to provide features like connections, suggestions, and organization</li>
                <li>We may use anonymized data to improve our AI systems</li>
                <li>You can control AI features through your account settings</li>
              </ul>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">7. Termination</h2>
              <p className="text-foreground/90">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
              <p className="text-foreground/90">
                Upon termination, your right to use the Service will immediately cease. You may request a copy of your User Content within 30 days of termination.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
              <p className="text-foreground/90">
                To the maximum extent permitted by law, SmartNotes shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">9. Changes to Terms</h2>
              <p className="text-foreground/90">
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on the Service and updating the "Last updated" date.
              </p>
              <p className="text-foreground/90">
                Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
              </p>

              <Separator className="my-4" />

              <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
              <p className="text-foreground/90">
                If you have any questions about these Terms, please contact us at support@smartnotes.example.com.
              </p>
            </div>

            <div className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                By using SmartNotes, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}