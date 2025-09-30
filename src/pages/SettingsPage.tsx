import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Database } from 'lucide-react';
import { DefaultAttributesConfig } from '@/components/settings/DefaultAttributesConfig';

const SettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and application preferences.
        </p>
      </div>

      <Tabs defaultValue="attributes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Default Attributes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Profile settings coming soon. This section will allow you to update your display name,
                avatar, and other personal preferences.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes">
          <DefaultAttributesConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;