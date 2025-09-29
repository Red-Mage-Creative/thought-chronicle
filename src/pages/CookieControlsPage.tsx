import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cookie, Shield, BarChart3, Cog, Info } from "lucide-react";
import { toast } from "sonner";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export default function CookieControlsPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    functional: false,
    marketing: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('chronicle-cookie-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...preferences, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved cookie preferences');
      }
    }
  }, []);

  const handlePreferenceChange = (category: keyof CookiePreferences, enabled: boolean) => {
    if (category === 'essential') return; // Cannot disable essential cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    localStorage.setItem('chronicle-cookie-preferences', JSON.stringify(preferences));
    setHasChanges(false);
    toast.success('Cookie preferences saved successfully');
    
    // Apply preferences immediately
    if (!preferences.analytics) {
      // Disable analytics tracking
      localStorage.removeItem('chronicle-analytics-enabled');
    } else {
      localStorage.setItem('chronicle-analytics-enabled', 'true');
    }
  };

  const acceptAll = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: false, // Keep marketing disabled by default
    };
    setPreferences(allEnabled);
    localStorage.setItem('chronicle-cookie-preferences', JSON.stringify(allEnabled));
    setHasChanges(false);
    toast.success('All cookie categories enabled');
  };

  const rejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem('chronicle-cookie-preferences', JSON.stringify(essentialOnly));
    setHasChanges(false);
    toast.success('Non-essential cookies disabled');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Cookie className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Cookie Controls</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your cookie preferences and control how Chronicle uses cookies to enhance your experience.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Essential cookies are required for Chronicle to function properly and cannot be disabled. 
          You can control optional cookies to customize your experience while maintaining your privacy.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Essential Cookies
            </CardTitle>
            <CardDescription>
              Required for basic functionality - these cannot be disabled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Authentication & Security</p>
                <p className="text-xs text-muted-foreground">
                  Session tokens, login state, and security features
                </p>
              </div>
              <Switch checked={preferences.essential} disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Application State</p>
                <p className="text-xs text-muted-foreground">
                  User preferences, offline data, and application settings
                </p>
              </div>
              <Switch checked={preferences.essential} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Analytics Cookies
            </CardTitle>
            <CardDescription>
              Help us understand how you use Chronicle to improve the experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Usage Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Anonymous data about feature usage and performance (no personal information)
                </p>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Error Reporting</p>
                <p className="text-xs text-muted-foreground">
                  Automatic error reporting to help us fix bugs (no user data included)
                </p>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog className="h-5 w-5 text-purple-600" />
              Functional Cookies
            </CardTitle>
            <CardDescription>
              Enhanced features and personalized experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Enhanced UI Features</p>
                <p className="text-xs text-muted-foreground">
                  Remember your preferred themes, layouts, and interface customizations
                </p>
              </div>
              <Switch 
                checked={preferences.functional} 
                onCheckedChange={(checked) => handlePreferenceChange('functional', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Advanced Features</p>
                <p className="text-xs text-muted-foreground">
                  Enable enhanced search, smart suggestions, and workflow optimizations
                </p>
              </div>
              <Switch 
                checked={preferences.functional} 
                onCheckedChange={(checked) => handlePreferenceChange('functional', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-orange-600" />
              Marketing Cookies
            </CardTitle>
            <CardDescription>
              Currently not used - Chronicle focuses on functionality over marketing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Marketing & Advertising</p>
                <p className="text-xs text-muted-foreground">
                  Not currently implemented - Chronicle does not use marketing cookies
                </p>
              </div>
              <Switch 
                checked={preferences.marketing} 
                disabled
                onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={rejectAll} variant="outline">
          Reject Non-Essential
        </Button>
        <Button onClick={acceptAll} variant="secondary">
          Accept All
        </Button>
        <Button onClick={savePreferences} disabled={!hasChanges}>
          Save Preferences
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cookies are small text files stored on your device that help websites remember your 
            preferences and provide personalized experiences. Chronicle uses cookies responsibly 
            and transparently.
          </p>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Your Rights</h4>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>You can change these preferences at any time by returning to this page</li>
              <li>Disabling cookies may affect some features but won't break core functionality</li>
              <li>You can also manage cookies through your browser settings</li>
              <li>Chronicle will respect your choices and only use cookies as you've configured</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}