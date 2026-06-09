import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '@/db/supabase';
import { AlertCircle, Eye, EyeOff, Sprout, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gmailId, setGmailId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [useGmail, setUseGmail] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; gmailId?: string }>({});
  const { signInWithUsername } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/rural/dashboard';

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (useGmail) {
      if (!gmailId.trim()) {
        newErrors.gmailId = 'Gmail address is required';
      } else if (!/^[a-zA-Z0-9._%-]+@gmail\.com$/.test(gmailId)) {
        newErrors.gmailId = 'Please enter a valid Gmail address';
      }
    } else {
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      }
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    let loginUsername = username;
    if (useGmail) {
      // Extract username from Gmail address
      loginUsername = gmailId.split('@')[0];
    }
    
    const { error } = await signInWithUsername(loginUsername, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      if (useGmail) {
        setErrors({ gmailId: 'Gmail or password incorrect' });
      } else {
        setErrors({ password: 'Invalid username or password' });
      }
    } else {
      toast.success('Login successful!');
      navigate(from, { replace: true });
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
              Demo mode active. Use any username and password to log in locally.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your farming dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login Method Toggle */}
              <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setUseGmail(false);
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    !useGmail ? 'bg-white text-emerald-600 shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Username
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseGmail(true);
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition flex items-center justify-center gap-1 ${
                    useGmail ? 'bg-white text-emerald-600 shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Gmail
                </button>
              </div>

              {/* Username/Password Login */}
              {!useGmail && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errors.username) setErrors({ ...errors, username: undefined });
                      }}
                      className={errors.username ? 'border-red-500 focus:ring-red-500' : ''}
                      disabled={loading}
                    />
                    {errors.username && (
                      <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                        required
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
                      <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                    )}
                  </div>
                </>
              )}

              {/* Gmail Login */}
              {useGmail && (
                <div className="space-y-2">
                  <Label htmlFor="gmailId" className="text-sm font-medium">Gmail Address</Label>
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
                    <p className="text-xs text-red-600 mt-1">{errors.gmailId}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">Password will be sent to your Gmail</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : useGmail ? 'Send Login Link' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 space-y-3 text-center text-sm">
              <Link to="#" className="block text-slate-500 hover:text-emerald-600 transition">
                Forgot password?
              </Link>
              <div>
                Don't have an account?{' '}
                <Link to="/register" className="text-emerald-600 font-medium hover:text-emerald-700 transition">
                  Register here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Protected by secure authentication
        </p>
      </div>
    </div>
  );
}
