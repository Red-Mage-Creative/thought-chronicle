import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Sword, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { signInSchema, signUpSchema, getPasswordStrength, type SignInFormData, type SignUpFormData } from '@/utils/validation';
import { assessPasswordSecurity } from '@/utils/passwordSecurity';
import { toast } from 'sonner';
import { AppFooter } from '@/components/layout/AppFooter';

export const AuthPage = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  
  // Sign in form state
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState<Partial<SignInFormData>>({});
  
  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [signUpErrors, setSignUpErrors] = useState<Partial<SignUpFormData>>({});
  
  // Password security assessment
  const [passwordSecurity, setPasswordSecurity] = useState<any>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Debounced password security check
  useEffect(() => {
    if (signUpPassword.length < 8) {
      setPasswordSecurity(null);
      return;
    }

    setIsCheckingPassword(true);
    const timeoutId = setTimeout(async () => {
      try {
        const security = await assessPasswordSecurity(signUpPassword);
        setPasswordSecurity(security);
      } catch (error) {
        console.error('Password security check failed:', error);
      }
      setIsCheckingPassword(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [signUpPassword]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignInErrors({});

    // Validate form
    const result = signInSchema.safeParse({ emailOrUsername, password });
    if (!result.success) {
      const errors: Partial<SignInFormData> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof SignInFormData] = err.message;
        }
      });
      setSignInErrors(errors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(emailOrUsername, password);
    
    if (error) {
      setError(error.message || 'Failed to sign in');
    } else {
      toast.success('Successfully signed in!');
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignUpErrors({});

    // Validate form
    const result = signUpSchema.safeParse({ 
      email: signUpEmail, 
      password: signUpPassword, 
      username,
      displayName,
      accessCode
    });
    
    if (!result.success) {
      const errors: Partial<SignUpFormData> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof SignUpFormData] = err.message;
        }
      });
      setSignUpErrors(errors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, username, displayName, accessCode);
    
    if (error) {
      setError(error.message || 'Failed to sign up');
    } else {
      setError(null);
      toast.success('Account created successfully! Please check your email for verification.');
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setEmailOrUsername('');
    setPassword('');
    setSignUpEmail('');
    setSignUpPassword('');
    setUsername('');
    setDisplayName('');
    setAccessCode('');
    setError(null);
    setSignInErrors({});
    setSignUpErrors({});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sword className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Chronicle</h1>
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Access your adventure journal</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Authentication</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your campaigns and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" onValueChange={resetForm}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4 mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailOrUsername">Email or Username</Label>
                      <Input
                        id="emailOrUsername"
                        type="text"
                        placeholder="Enter your email or username"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        required
                      />
                      {signInErrors.emailOrUsername && (
                        <p className="text-sm text-destructive">{signInErrors.emailOrUsername}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {signInErrors.password && (
                        <p className="text-sm text-destructive">{signInErrors.password}</p>
                      )}
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                      />
                      {signUpErrors.email && (
                        <p className="text-sm text-destructive">{signUpErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                      {signUpErrors.username && (
                        <p className="text-sm text-destructive">{signUpErrors.username}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignUpPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordFocused && (
                        <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Password Protection</span>
                            <span className="text-xs text-muted-foreground">- powered by HaveIBeenPwned</span>
                          </div>
                          
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center space-x-2">
                              {signUpPassword.length >= 8 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={signUpPassword.length >= 8 ? "text-green-600" : "text-muted-foreground"}>
                                At least 8 characters
                              </span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {/[A-Z]/.test(signUpPassword) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={/[A-Z]/.test(signUpPassword) ? "text-green-600" : "text-muted-foreground"}>
                                One uppercase letter (A-Z)
                              </span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {/[a-z]/.test(signUpPassword) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={/[a-z]/.test(signUpPassword) ? "text-green-600" : "text-muted-foreground"}>
                                One lowercase letter (a-z)
                              </span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {/\d/.test(signUpPassword) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={/\d/.test(signUpPassword) ? "text-green-600" : "text-muted-foreground"}>
                                One number (0-9)
                              </span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {/[!@#$%^&*(),.?":{}|<>]/.test(signUpPassword) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(signUpPassword) ? "text-green-600" : "text-muted-foreground"}>
                                One special character (!@#$%^&*)
                              </span>
                            </li>
                          </ul>

                          {/* Breach checking status */}
                          {signUpPassword.length >= 8 && (
                            <div className="pt-2 border-t">
                              {isCheckingPassword ? (
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                                  <span className="text-xs">Checking against known breaches...</span>
                                </div>
                              ) : passwordSecurity ? (
                                passwordSecurity.breach.isBreached ? (
                                  <div className="flex items-center space-x-2 text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">Found in {passwordSecurity.breach.breachCount?.toLocaleString()} breaches</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm">Not found in known breaches</span>
                                  </div>
                                )
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                      {signUpErrors.password && (
                        <p className="text-sm text-destructive">{signUpErrors.password}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        type="text"
                        placeholder="Enter your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                      {signUpErrors.displayName && (
                        <p className="text-sm text-destructive">{signUpErrors.displayName}</p>
                      )}
                    </div>
                     <div className="space-y-2">
                       <Label htmlFor="access-code">Access Code</Label>
                       <Input
                         id="access-code"
                         type="text"
                         placeholder="Enter the access code (case insensitive)"
                         value={accessCode}
                         onChange={(e) => setAccessCode(e.target.value)}
                         required
                       />
                       <p className="text-xs text-muted-foreground">
                         Note: Access codes are not case sensitive and spaces are ignored
                       </p>
                       {signUpErrors.accessCode && (
                         <p className="text-sm text-destructive">{signUpErrors.accessCode}</p>
                       )}
                     </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default AuthPage;