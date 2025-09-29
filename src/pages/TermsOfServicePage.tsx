import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollText, Shield, AlertTriangle, Users } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ScrollText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Please read these terms carefully before using Chronicle for your TTRPG adventures.
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            By accessing and using Chronicle, you accept and agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service. These terms apply to all 
            visitors, users, and others who access or use the service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Service Description
          </CardTitle>
          <CardDescription>
            Chronicle is a TTRPG note-taking and organization tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What Chronicle Provides</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>A digital platform for organizing TTRPG thoughts, entities, and campaign notes</li>
              <li>Cross-device synchronization of your content</li>
              <li>Collaborative features for sharing with gaming groups</li>
              <li>Tools for categorizing and searching your campaign content</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Service Availability</h4>
            <p className="text-sm text-muted-foreground">
              We strive to maintain high availability but do not guarantee uninterrupted access. 
              Service may be temporarily unavailable due to maintenance, updates, or unforeseen circumstances.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Account Security</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use a strong, unique password for your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Take responsibility for all activities under your account</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Content Guidelines</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Only upload content you own or have permission to use</li>
              <li>Do not share content that is illegal, harmful, or violates others' rights</li>
              <li>Respect intellectual property rights of game systems and content creators</li>
              <li>Use appropriate content warnings for mature themes in your campaigns</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Acceptable Use</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Use Chronicle only for lawful purposes related to TTRPG activities</li>
              <li>Do not attempt to hack, compromise, or reverse engineer the service</li>
              <li>Do not use automated tools to access or scrape the service</li>
              <li>Respect other users and maintain a positive community environment</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Intellectual Property
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Your Content</h4>
            <p className="text-sm text-muted-foreground">
              You retain ownership of all content you create in Chronicle. We do not claim ownership 
              of your campaign notes, characters, or other creative works. You grant us a limited 
              license to store, process, and display your content solely to provide the service.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Our Service</h4>
            <p className="text-sm text-muted-foreground">
              Chronicle's software, design, and functionality are protected by intellectual property laws. 
              You may not copy, modify, distribute, or create derivative works without explicit permission.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Third-Party Content</h4>
            <p className="text-sm text-muted-foreground">
              Respect the intellectual property rights of game systems, publishers, and content creators. 
              Only reference copyrighted material in accordance with fair use guidelines.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Limitations & Disclaimers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Service "As Is"</h4>
            <p className="text-sm text-muted-foreground">
              Chronicle is provided "as is" without warranties of any kind. We do not guarantee 
              that the service will be error-free, secure, or continuously available.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Data Backup</h4>
            <p className="text-sm text-muted-foreground">
              While we implement robust backup systems, we recommend you maintain your own copies 
              of important campaign content. We are not liable for data loss, though we will make 
              reasonable efforts for recovery.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Limitation of Liability</h4>
            <p className="text-sm text-muted-foreground">
              Our liability is limited to the maximum extent permitted by law. We are not responsible 
              for indirect, incidental, or consequential damages arising from use of the service.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Account Termination</h4>
            <p className="text-sm text-muted-foreground">
              You may terminate your account at any time through the application settings. 
              We may terminate accounts that violate these terms or pose security risks.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Data Retention</h4>
            <p className="text-sm text-muted-foreground">
              Upon termination, we will delete your account and associated data within 30 days, 
              except where required by law to retain certain information for longer periods.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Contact & Changes</h3>
            <p className="text-sm text-muted-foreground">
              We may update these terms periodically to reflect changes in our service or legal requirements. 
              Significant changes will be communicated through the application.
            </p>
            <p className="text-sm text-muted-foreground">
              For questions about these terms, please contact us through the application support features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}