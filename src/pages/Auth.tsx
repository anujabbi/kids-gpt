import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Users, User, Mail } from 'lucide-react';

const Auth = () => {
  const { user, profile, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [familyCode, setFamilyCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  console.log('Auth page state:', { user: !!user, profile: profile ? { role: profile.role } : null, loading });

  // Redirect if already authenticated - check both user and loading state
  useEffect(() => {
    if (!loading && user && profile) {
      console.log('User authenticated, redirecting based on role:', profile.role);
      // Redirect based on user role
      if (profile.role === 'parent') {
        navigate('/parent-dashboard', { replace: true });
      } else {
        // Children go to the default chat experience
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // If user exists but we're still on auth page, let useEffect handle redirect
  if (user && profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg">Redirecting...</div>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('Attempting sign in...');
    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Sign in error:', error);
      toast.error(error.message);
      setIsSubmitting(false);
    } else {
      console.log('Sign in successful, waiting for auth state update...');
      toast.success('Signed in successfully!');
      // Don't set loading to false here - let the auth context handle the redirect
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'child' && !familyCode.trim()) {
      toast.error('Family code is required for children');
      return;
    }
    
    setIsSubmitting(true);
    
    const metadata = {
      full_name: fullName,
      role: role,
      ...(role === 'child' && { family_code: familyCode.trim().toUpperCase() })
    };
    
    const { error } = await signUp(email, password, metadata);
    
    if (error) {
      if (error.message.includes('family_code')) {
        toast.error('Invalid family code. Please check with your parent.');
      } else {
        toast.error(error.message);
      }
      setIsSubmitting(false);
    } else {
      // Show success message with email confirmation instructions
      const accountType = role === 'parent' ? 'Parent' : 'Child';
      toast.success(`${accountType} account created successfully! Please check your email and click the confirmation link before signing in.`);
      
      // Show email confirmation message
      setSignupEmail(email);
      setShowEmailConfirmation(true);
      setIsSubmitting(false);
    }
  };

  // Show email confirmation screen
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to <strong>{signupEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email and click the confirmation link to activate your account. 
              You'll be redirected back to sign in once confirmed.
            </p>
            <p className="text-xs text-muted-foreground">
              Don't see the email? Check your spam folder or{' '}
              <button 
                onClick={() => setShowEmailConfirmation(false)}
                className="text-primary hover:underline"
              >
                try signing up again
              </button>
            </p>
            <Button
              variant="outline"
              onClick={() => setShowEmailConfirmation(false)}
              className="w-full"
            >
              Back to Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">KidsGPT</CardTitle>
          <CardDescription>Welcome! Please sign in or create an account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#8b5cf6] hover:bg-[#8b5cf6]/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>I am a:</Label>
                  <RadioGroup value={role} onValueChange={(value: 'parent' | 'child') => setRole(value)} disabled={isSubmitting}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="parent" id="parent" />
                      <Label htmlFor="parent" className="flex items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4" />
                        Parent/Guardian
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="child" id="child" />
                      <Label htmlFor="child" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Child
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {role === 'child' && (
                  <div className="space-y-2">
                    <Label htmlFor="family-code">Family Code</Label>
                    <Input
                      id="family-code"
                      type="text"
                      placeholder="Enter your family code"
                      value={familyCode}
                      onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ask your parent for the 6-character family code
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#8b5cf6] hover:bg-[#8b5cf6]/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Sign Up'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you'll receive a confirmation email that you'll need to verify before you can sign in.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
