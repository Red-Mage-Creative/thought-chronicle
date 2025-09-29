import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your privacy and data security are fundamental to how we build and operate Chronicle.
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Information We Collect
          </CardTitle>
          <CardDescription>
            We collect minimal data necessary to provide our services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Account Information</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Email address for authentication and account recovery</li>
              <li>Username and display name for identification</li>
              <li>Password (encrypted and never stored in plain text)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Content Data</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Your thoughts, notes, and entities created in Chronicle</li>
              <li>Tags and categories you assign to your content</li>
              <li>Timestamps and metadata for synchronization</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Technical Information</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Browser type and version for compatibility</li>
              <li>Device information for responsive design</li>
              <li>Usage analytics to improve the application (anonymized)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            How We Use Your Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li><strong>Service Delivery:</strong> To provide, maintain, and improve Chronicle's functionality</li>
            <li><strong>Authentication:</strong> To verify your identity and secure your account</li>
            <li><strong>Synchronization:</strong> To sync your data across devices and sessions</li>
            <li><strong>Communication:</strong> To send important updates about the service (rarely)</li>
            <li><strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
            <li><strong>Security:</strong> To detect and prevent unauthorized access or abuse</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Storage & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Encryption</h4>
            <p className="text-sm text-muted-foreground">
              All data is encrypted in transit using HTTPS/TLS and at rest using AES-256 encryption. 
              Passwords are hashed using industry-standard bcrypt with salt.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Data Location</h4>
            <p className="text-sm text-muted-foreground">
              Your data is stored securely on Supabase infrastructure with redundant backups. 
              We do not sell, rent, or share your personal data with third parties.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Local Storage</h4>
            <p className="text-sm text-muted-foreground">
              Chronicle uses local browser storage for offline functionality and performance optimization. 
              This data remains on your device and can be cleared via browser settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li><strong>Access:</strong> Request a copy of all data associated with your account</li>
            <li><strong>Correction:</strong> Update or correct any inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request permanent deletion of your account and associated data</li>
            <li><strong>Export:</strong> Download your content data in a portable format</li>
            <li><strong>Opt-out:</strong> Disable analytics and non-essential data collection</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chronicle uses minimal cookies for essential functionality. You can manage your cookie preferences 
            on our <a href="/cookie-controls" className="text-primary hover:underline">Cookie Controls</a> page.
          </p>
          <div>
            <h4 className="font-semibold mb-2">Essential Cookies</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Authentication tokens to keep you signed in</li>
              <li>Session management for security</li>
              <li>User preferences and settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Questions or Concerns?</h3>
            <p className="text-sm text-muted-foreground">
              If you have any questions about this Privacy Policy or how we handle your data, 
              please contact us through the application or visit our support resources.
            </p>
            <p className="text-xs text-muted-foreground">
              This policy may be updated periodically. We will notify users of significant changes 
              through the application or via email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}