import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Mail, MapPin, Calendar, Sprout, Edit, Copy, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FarmType } from '@/types/types';

export default function Profile() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    username: profile?.username || '',
    location: profile?.location || '',
    farm_type: profile?.farm_type || ('both' as FarmType),
    gmail_id: profile?.gmail_id || '',
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    try {
      // In production, this would update the profile in Supabase
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const initials = profile.username
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const createdDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">View and manage your account information</p>
      </div>

      {/* Profile Header Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} />
                <AvatarFallback className="bg-emerald-600 text-white text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{profile.username}</h2>
                <p className="text-sm text-muted-foreground capitalize">{profile.farm_type} Farmer</p>
                <p className="text-xs text-slate-500 mt-1">Member since {createdDate}</p>
              </div>
            </div>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>Update your profile information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      placeholder="Your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmailId">Gmail Address</Label>
                    <Input
                      id="gmailId"
                      type="email"
                      value={editData.gmail_id}
                      onChange={(e) => setEditData({ ...editData, gmail_id: e.target.value })}
                      placeholder="your.email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmType">Farm Type</Label>
                    <Select value={editData.farm_type} onValueChange={(value) => setEditData({ ...editData, farm_type: value as FarmType })}>
                      <SelectTrigger id="farmType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rural">Rural Farming</SelectItem>
                        <SelectItem value="urban">Urban Farming</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Username</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium flex-1">{profile.username}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(profile.username || '', 'username')}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === 'username' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{profile.email || 'Not provided'}</span>
                </div>
                {profile.email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(profile.email || '', 'email')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'email' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Gmail Address</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-red-400" />
                  <span>{profile.gmail_id || 'Not provided'}</span>
                </div>
                {profile.gmail_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(profile.gmail_id || '', 'gmail')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'gmail' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Role</Label>
              <p className="text-sm font-medium capitalize">{profile.role || 'User'}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">User ID</Label>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate">{profile.id}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(profile.id, 'id')}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === 'id' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-600" />
              Farm Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Farm Type</Label>
              <div className="inline-block">
                <span className="text-sm font-medium capitalize px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                  {profile.farm_type.charAt(0).toUpperCase() + profile.farm_type.slice(1)} Farming
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <p className="text-sm font-medium">{profile.location || 'Not specified'}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <p className="text-sm font-medium">{createdDate}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Phone</Label>
              <p className="text-sm font-medium">{profile.phone || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Account Status</CardTitle>
          <CardDescription>Your current account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Verification</p>
              <p className="text-lg font-semibold">Email Pending</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-lg font-semibold">Today</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Subscription</p>
              <p className="text-lg font-semibold">Free Tier</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
