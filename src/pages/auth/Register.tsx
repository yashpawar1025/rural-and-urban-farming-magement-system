import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { FarmType } from '@/types/types';
import { isSupabaseConfigured } from '@/db/supabase';
import { AlertCircle, Eye, EyeOff, CheckCircle2, Sprout } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gmailId, setGmailId] = useState('');
  const [farmType, setFarmType] = useState<FarmType>('both');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirmPassword?: string; gmailId?: string; farmType?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const { signUpWithUsername } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) return 'Username is required';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      return 'Username: 3-20 alphanumeric characters and underscores only';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateGmailId = (value: string): string | undefined => {
    if (value && !/^[a-zA-Z0-9._%-]+@gmail\.com$/.test(value)) {
      return 'Please enter a valid Gmail address (e.g., user@gmail.com)';
    }
    return undefined;
  };

  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd)) {
      setPasswordStrength('strong');
    } else if (pwd.length >= 8 && (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd))) {
      setPasswordStrength('medium');
    } else if (pwd.length >= 6) {
      setPasswordStrength('weak');
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const gmailError = validateGmailId(gmailId);
    if (gmailError) newErrors.gmailId = gmailError;

    if (!farmType) newErrors.farmType = 'Farm type is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    const { error } = await signUpWithUsername(username, password, farmType, gmailId || undefined);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Registration failed');
      setErrors({ username: error.message });
    } else {
      toast.success('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">SmartFarm</h1>
              <p className="text-xs text-slate-500">Farming OS</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm mt-2">Urban & Rural Farming Management</p>
        </div>

        {!isSupabaseConfigured && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Demo mode active. Create any account locally.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join SmartFarm to manage your farming operations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="3-20 characters, alphanumeric + underscore"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  className={errors.username ? 'border-red-500 focus:ring-red-500' : ''}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-xs text-red-600">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      checkPasswordStrength(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
                {passwordStrength && (
                  <div className="flex gap-1 mt-2">
                    <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-slate-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'strong' || passwordStrength === 'medium' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'weak' ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmailId" className="text-sm font-medium">Gmail Address (Optional)</Label>
                <Input
                  id="gmailId"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={gmailId}
                  onChange={(e) => {
                    setGmailId(e.target.value);
                    if (errors.gmailId) setErrors({ ...errors, gmailId: undefined });
                  }}
                  className={errors.gmailId ? 'border-red-500 focus:ring-red-500' : ''}
                  disabled={loading}
                />
                {errors.gmailId && (
                  <p className="text-xs text-red-600">{errors.gmailId}</p>
                )}
                <p className="text-xs text-slate-500">Add your Gmail to receive farming updates and notifications</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    className={errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                )}
                {password && confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmType" className="text-sm font-medium">Farm Type</Label>
                <Select value={farmType} onValueChange={(value) => setFarmType(value as FarmType)}>
                  <SelectTrigger id="farmType" className={errors.farmType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select farm type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rural">
                      <span>🌾 Rural Farming</span>
                    </SelectItem>
                    <SelectItem value="urban">
                      <span>🏙️ Urban Farming</span>
                    </SelectItem>
                    <SelectItem value="both">
                      <span>🔄 Both</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.farmType && (
                  <p className="text-xs text-red-600">{errors.farmType}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-700 transition">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Your data is secure and private
        </p>
      </div>
    </div>
  );
}
