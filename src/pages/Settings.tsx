import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Moon, Bell, Lock, Globe, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Settings() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: localStorage.getItem('notifications') !== 'false',
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    publicProfile: localStorage.getItem('publicProfile') !== 'false',
    dataCollection: localStorage.getItem('dataCollection') !== 'false',
    language: localStorage.getItem('language') || 'english',
    timezone: localStorage.getItem('timezone') || 'UTC',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savedMessage, setSavedMessage] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(settings.darkMode));
  }, [settings.darkMode]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, String(value));
    });
    setSavedMessage(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    // In production, this would call the auth API
    toast.success('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = async () => {
    toast.success('Account deletion requested. A confirmation email has been sent.');
  };

  const handleLogoutAllDevices = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and privacy</p>
      </div>

      {savedMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Save className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Settings Saved</AlertTitle>
          <AlertDescription className="text-green-700">All your changes have been saved successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Display Preferences */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-emerald-600" />
                Display Preferences
              </CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                </div>
                <Switch checked={settings.darkMode} onCheckedChange={(value) => handleSettingChange('darkMode', value)} />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Español</SelectItem>
                    <SelectItem value="french">Français</SelectItem>
                    <SelectItem value="hindi">हिन्दी</SelectItem>
                    <SelectItem value="telugu">తెలుగు</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                    <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                    <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                    <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                    <SelectItem value="IST">IST (Indian Standard Time)</SelectItem>
                    <SelectItem value="GMT">GMT (Greenwich Mean Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-600" />
                Notifications
              </CardTitle>
              <CardDescription>Choose when and how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications in the app</p>
                </div>
                <Switch checked={settings.notifications} onCheckedChange={(value) => handleSettingChange('notifications', value)} />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates and alerts</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                  disabled={!settings.notifications}
                />
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium mb-3">Notification Types</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="weather" defaultChecked className="rounded" />
                    <Label htmlFor="weather" className="font-normal">
                      Weather Alerts
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="irrigation" defaultChecked className="rounded" />
                    <Label htmlFor="irrigation" className="font-normal">
                      Irrigation Reminders
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="crop" defaultChecked className="rounded" />
                    <Label htmlFor="crop" className="font-normal">
                      Crop Health Updates
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="order" defaultChecked className="rounded" />
                    <Label htmlFor="order" className="font-normal">
                      Order Status Updates
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                Privacy & Data
              </CardTitle>
              <CardDescription>Control your privacy and data collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label className="text-base font-medium">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Allow others to view your farm profile</p>
                </div>
                <Switch
                  checked={settings.publicProfile}
                  onCheckedChange={(value) => handleSettingChange('publicProfile', value)}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <Label className="text-base font-medium">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app by sharing usage data</p>
                </div>
                <Switch
                  checked={settings.dataCollection}
                  onCheckedChange={(value) => handleSettingChange('dataCollection', value)}
                />
              </div>

              <div className="pt-2 space-y-2">
                <Button variant="outline" className="w-full">
                  View Privacy Policy
                </Button>
                <Button variant="outline" className="w-full">
                  Download My Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Enter your current password and a new password</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleChangePassword} className="w-full">
                      Update Password
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full" onClick={handleLogoutAllDevices}>
                Logout All Devices
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Danger Zone & Save */}
        <div className="space-y-6">
          {/* Save Button */}
          <Button onClick={handleSaveSettings} className="w-full gap-2" size="lg">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600">Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                    <DialogDescription>This action cannot be undone. All your data will be permanently deleted.</DialogDescription>
                  </DialogHeader>
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-700">Warning</AlertTitle>
                    <AlertDescription className="text-red-600">
                      Deleting your account will remove all your data permanently. This action cannot be reversed.
                    </AlertDescription>
                  </Alert>
                  <div className="py-4">
                    <p className="text-sm mb-4">
                      Type your username <strong>{profile?.username}</strong> to confirm:
                    </p>
                    <Input placeholder="Confirm by typing your username" />
                  </div>
                  <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
                    Permanently Delete My Account
                  </Button>
                </DialogContent>
              </Dialog>

              <p className="text-xs text-red-600 text-center">Be careful with these options</p>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm">App Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">Today</span>
              </div>
              <Button variant="ghost" className="w-full text-xs mt-2">
                Check for Updates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
