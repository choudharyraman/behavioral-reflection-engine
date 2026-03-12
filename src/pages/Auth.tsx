import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

const emailSchema = z.string().trim().email({ message: 'Invalid email address' }).max(255);
const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters' }).max(72);
const nameSchema = z.string().trim().max(100).optional();
type AuthMode = 'signin' | 'signup' | 'forgot';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => { if (user && !loading) navigate('/'); }, [user, loading, navigate]);

  const validateInputs = (mode: AuthMode) => {
    try { emailSchema.parse(email); if (mode !== 'forgot') passwordSchema.parse(password); if (mode === 'signup') nameSchema.parse(fullName); return true; }
    catch (err) { if (err instanceof z.ZodError) toast.error(err.errors[0].message); return false; }
  };

  const handleSignIn = async (e: React.FormEvent) => { e.preventDefault(); if (!validateInputs('signin')) return; setIsSubmitting(true); const { error } = await signIn(email.trim(), password); setIsSubmitting(false); if (error) { toast.error(error.message.includes('Invalid login credentials') ? 'Invalid email or password' : error.message); } else { toast.success('Welcome back!'); navigate('/'); } };
  const handleSignUp = async (e: React.FormEvent) => { e.preventDefault(); if (!validateInputs('signup')) return; setIsSubmitting(true); const { error } = await signUp(email.trim(), password, fullName.trim() || undefined); setIsSubmitting(false); if (error) { toast.error(error.message.includes('already registered') ? 'This email is already registered. Try signing in instead.' : error.message); } else { toast.success('Account created! Welcome aboard.'); navigate('/'); } };
  const handleForgotPassword = async (e: React.FormEvent) => { e.preventDefault(); if (!validateInputs('forgot')) return; setIsSubmitting(true); const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth?mode=reset` }); setIsSubmitting(false); if (error) { toast.error(error.message); } else { setResetEmailSent(true); toast.success('Password reset email sent!'); } };
  const handleGoogleSignIn = async () => { setIsSubmitting(true); const { error } = await signInWithGoogle(); setIsSubmitting(false); if (error) toast.error('Google sign in failed.'); };
  const handleSubmit = (e: React.FormEvent) => { if (authMode === 'signup') handleSignUp(e); else if (authMode === 'forgot') handleForgotPassword(e); else handleSignIn(e); };

  const getTitle = () => { switch (authMode) { case 'signup': return 'Create Account'; case 'forgot': return 'Reset Password'; default: return 'Welcome Back'; } };
  const getSubtitle = () => { switch (authMode) { case 'signup': return 'Start your journey to smarter spending'; case 'forgot': return "Enter your email and we'll send you a reset link"; default: return 'Sign in to continue to SpendAI'; } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-2xl neu-raised animate-pulse" />
          <div className="h-2 w-32 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 safe-area-inset-top safe-area-inset-bottom">
        <div className="mx-auto w-full max-w-sm">
          
          {authMode === 'forgot' && (
            <button onClick={() => { setAuthMode('signin'); setResetEmailSent(false); }} className="absolute top-6 left-6 h-10 w-10 rounded-xl neu-button flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Neumorphic Card */}
          <div className="rounded-3xl p-8 neu-raised">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="neu-raised rounded-2xl p-2">
                  <img src={logoImage} alt="SpendAI Logo" className="h-16 w-16 rounded-xl" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{getTitle()}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{getSubtitle()}</p>
            </div>

            <div className="space-y-5">
              {authMode !== 'forgot' && (
                <>
                  <button type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}
                    className="w-full h-12 text-sm font-medium gap-3 rounded-xl neu-button flex items-center justify-center active:scale-[0.98] transition-transform">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center"><span className="bg-background px-4 text-xs text-muted-foreground">or continue with email</span></div>
                  </div>
                </>
              )}

              {authMode === 'forgot' && resetEmailSent ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl neu-raised mb-4"><Mail className="h-7 w-7 text-primary" /></div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Check your email</h3>
                  <p className="text-sm text-muted-foreground mb-5">We sent a reset link to <span className="font-medium text-primary">{email}</span></p>
                  <button onClick={() => { setAuthMode('signin'); setResetEmailSent(false); }} className="h-10 rounded-xl text-sm neu-button px-4">Back to Sign In</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {authMode === 'signup' && (
                    <div className="space-y-1.5 animate-fade-in">
                      <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</Label>
                      <div className="relative">
                        <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", focusedField === 'name' ? "text-primary" : "text-muted-foreground")}><User className="h-4 w-4" strokeWidth={2} /></div>
                        <Input id="name" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} className="h-11 pl-10 pr-4 text-sm rounded-xl border-0 neu-inset" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email Address</Label>
                    <div className="relative">
                      <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", focusedField === 'email' ? "text-primary" : "text-muted-foreground")}><Mail className="h-4 w-4" strokeWidth={2} /></div>
                      <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="h-11 pl-10 pr-4 text-sm rounded-xl border-0 neu-inset" required />
                    </div>
                  </div>
                  {authMode !== 'forgot' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</Label>
                        {authMode === 'signin' && <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs text-primary hover:underline font-medium">Forgot?</button>}
                      </div>
                      <div className="relative">
                        <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", focusedField === 'password' ? "text-primary" : "text-muted-foreground")}><Lock className="h-4 w-4" strokeWidth={2} /></div>
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className="h-11 pl-10 pr-12 text-sm rounded-xl border-0 neu-inset" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                        </button>
                      </div>
                      {authMode === 'signup' && <p className="text-xs text-muted-foreground">At least 6 characters</p>}
                    </div>
                  )}
                  <button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg active:scale-[0.98] transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> : <>{authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Send Reset Link' : 'Sign In'}<ArrowRight className="h-4 w-4" strokeWidth={2} /></>}
                  </button>
                </form>
              )}

              {authMode !== 'forgot' && (
                <div className="text-center pt-3">
                  <button type="button" onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {authMode === 'signup' ? <>Already have an account? <span className="font-semibold text-primary">Sign In</span></> : <>Don't have an account? <span className="font-semibold text-primary">Sign Up</span></>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Docs link */}
          <button onClick={() => navigate('/docs')} className="mx-auto mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <FileText className="h-4 w-4" strokeWidth={2} /> View Documentation
          </button>

          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to our <button className="text-foreground hover:text-primary hover:underline">Terms of Service</button> and <button className="text-foreground hover:text-primary hover:underline">Privacy Policy</button>
            </p>
            <p className="text-xs text-muted-foreground/60">Built by <span className="font-medium text-muted-foreground">Raman Choudhary</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
