import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, Phone, Wallet, Target, LogOut, ChevronRight, Bell, Moon, Shield, HelpCircle, Sparkles, Edit3, Check, X, Download, FileText, MessageCircle, ExternalLink, Link2, CreditCard, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileScreenProps { onSignOut: () => void; }

export function ProfileScreen({ onSignOut }: ProfileScreenProps) {
  const { profile, updateProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '', currency: profile?.currency || 'INR', monthly_budget: profile?.monthly_budget || 0, savings_goal: profile?.savings_goal || 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const handleEditSubmit = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({ full_name: editForm.full_name || null, phone: editForm.phone || null, currency: editForm.currency, monthly_budget: editForm.monthly_budget, savings_goal: editForm.savings_goal });
    setIsSaving(false);
    if (error) { toast.error('Failed to update profile'); } else { toast.success('Profile updated!'); setIsEditing(false); }
  };

  const toggleDarkMode = () => { const newMode = !isDark; setIsDark(newMode); document.documentElement.classList.toggle('dark', newMode); localStorage.setItem('theme', newMode ? 'dark' : 'light'); };
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const currencies = [{ value: 'INR', label: '₹ INR', symbol: '₹' }, { value: 'USD', label: '$ USD', symbol: '$' }, { value: 'EUR', label: '€ EUR', symbol: '€' }, { value: 'GBP', label: '£ GBP', symbol: '£' }];
  const currentCurrency = currencies.find(c => c.value === (profile?.currency || 'INR'));

  return (
    <div className="space-y-5 px-5 pb-24 max-w-2xl mx-auto">
      {/* Profile Header - Neumorphic */}
      <div className="rounded-2xl p-6 neu-raised">
        <div className="flex items-center gap-4">
          <div className="neu-raised rounded-full p-1">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">{displayName}</h2>
            <p className="text-sm text-muted-foreground truncate font-medium">{profile?.email || user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> Premium
              </span>
            </div>
          </div>
          <Sheet open={isEditing} onOpenChange={setIsEditing}>
            <SheetTrigger asChild>
              <button className="rounded-xl h-11 w-11 neu-button flex items-center justify-center"><Edit3 className="h-5 w-5" strokeWidth={2} /></button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] bg-background">
              <SheetHeader><SheetTitle className="text-xl font-bold">Edit Profile</SheetTitle></SheetHeader>
              <div className="space-y-6 mt-6 overflow-y-auto pb-8">
                <div className="space-y-2"><Label className="text-sm font-semibold">Full Name</Label><Input value={editForm.full_name} onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Enter your name" className="h-12 rounded-xl border-0 neu-inset" /></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Phone Number</Label><Input value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 98765 43210" className="h-12 rounded-xl border-0 neu-inset" /></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Currency</Label>
                  <Select value={editForm.currency} onValueChange={(value) => setEditForm(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="h-12 rounded-xl border-0 neu-inset"><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{currencies.map((currency) => (<SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Monthly Budget</Label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currentCurrency?.symbol}</span><Input type="number" value={editForm.monthly_budget} onChange={(e) => setEditForm(prev => ({ ...prev, monthly_budget: Number(e.target.value) }))} placeholder="50000" className="h-12 pl-9 rounded-xl border-0 neu-inset" /></div></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Savings Goal</Label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currentCurrency?.symbol}</span><Input type="number" value={editForm.savings_goal} onChange={(e) => setEditForm(prev => ({ ...prev, savings_goal: Number(e.target.value) }))} placeholder="10000" className="h-12 pl-9 rounded-xl border-0 neu-inset" /></div></div>
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 h-12 rounded-xl font-semibold neu-button flex items-center justify-center gap-2" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /> Cancel</button>
                  <Button className="flex-1 h-12 rounded-xl font-semibold" onClick={handleEditSubmit} disabled={isSaving}><Check className="h-4 w-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 neu-raised">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl neu-inset-sm flex items-center justify-center"><Wallet className="h-6 w-6 text-primary" strokeWidth={2} /></div>
            <div><p className="text-xs text-muted-foreground font-semibold">Monthly Budget</p><p className="text-xl font-bold text-foreground">{currentCurrency?.symbol}{(profile?.monthly_budget || 0).toLocaleString()}</p></div>
          </div>
        </div>
        <div className="rounded-2xl p-5 neu-raised">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl neu-inset-sm flex items-center justify-center"><Target className="h-6 w-6 text-[hsl(var(--success))]" strokeWidth={2} /></div>
            <div><p className="text-xs text-muted-foreground font-semibold">Savings Goal</p><p className="text-xl font-bold text-foreground">{currentCurrency?.symbol}{(profile?.savings_goal || 0).toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="rounded-2xl neu-raised">
        <div className="px-5 pt-5 pb-2"><p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Preferences</p></div>
        <div className="px-2 pb-2">
          <SettingItem icon={Moon} label="Dark Mode" action={<Switch checked={isDark} onCheckedChange={toggleDarkMode} />} />
          <SettingItem icon={Bell} label="Notifications" action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} />
        </div>
      </div>

      <div className="rounded-2xl neu-raised">
        <div className="px-5 pt-5 pb-2"><p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Account</p></div>
        <div className="px-2 pb-2">
          <SettingItem icon={User} label="Personal Information" value={profile?.full_name || 'Not set'} action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} />
          <SettingItem icon={Mail} label="Email" value={profile?.email || user?.email || ''} action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} />
          <SettingItem icon={Phone} label="Phone" value={profile?.phone || 'Not set'} action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} />
        </div>
      </div>

      <div className="rounded-2xl neu-raised">
        <div className="px-5 pt-5 pb-2"><p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Data & Privacy</p></div>
        <div className="px-2 pb-2">
          <SettingItem icon={Download} label="Export My Data" value="Download all your transactions" action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} onClick={() => toast.info('Export feature coming soon!')} />
          <SettingItem icon={FileText} label="Spending Report" value="Generate monthly summary" action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} onClick={() => toast.info('Reports coming soon!')} />
          <SettingItem icon={Shield} label="Privacy & Security" action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} />
        </div>
      </div>

      <div className="rounded-2xl neu-raised">
        <div className="px-5 pt-5 pb-2"><p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Connected Accounts</p></div>
        <div className="px-2 pb-2">
          <SettingItem icon={Link2} label="Link Bank Account" value="Connect for automatic tracking" action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} onClick={() => toast.info('Bank linking coming soon!')} />
          <SettingItem icon={CreditCard} label="Payment Methods" value="Manage cards & UPI" action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} onClick={() => toast.info('Payment methods coming soon!')} />
        </div>
      </div>

      <div className="rounded-2xl neu-raised">
        <div className="px-5 pt-5 pb-2"><p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Support</p></div>
        <div className="px-2 pb-2">
          <SettingItem icon={HelpCircle} label="Help Center" value="FAQs & tutorials" action={<ExternalLink className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} />
          <SettingItem icon={MessageCircle} label="Contact Support" value="We typically reply within 24h" action={<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />} onClick={() => toast.info('Support chat coming soon!')} />
        </div>
      </div>

      <div className="rounded-2xl neu-raised border-l-4 border-destructive">
        <div className="px-5 pt-5 pb-2"><p className="text-sm font-bold text-destructive uppercase tracking-wider">Danger Zone</p></div>
        <div className="px-2 pb-2">
          <SettingItem icon={Trash2} label="Delete Account" value="Permanently remove all data" action={<ChevronRight className="h-5 w-5 text-destructive" strokeWidth={2} />} onClick={() => toast.error('Please contact support to delete your account')} destructive />
        </div>
      </div>

      <button onClick={onSignOut} className="w-full h-14 text-base font-bold rounded-2xl bg-destructive text-destructive-foreground flex items-center justify-center gap-2">
        <LogOut className="h-5 w-5" strokeWidth={2} /> Sign Out
      </button>

      <p className="text-center text-sm text-muted-foreground/60 pb-4 font-medium">
        Built by <span className="font-bold text-muted-foreground">Raman Choudhary</span>
      </p>
    </div>
  );
}

function SettingItem({ icon: Icon, label, value, action, onClick, destructive = false }: { icon: React.ElementType; label: string; value?: string; action?: React.ReactNode; onClick?: () => void; destructive?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer", destructive ? "hover:bg-destructive/10" : "hover:bg-background/50")} onClick={onClick}>
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 neu-inset-sm")}>
        <Icon className={cn("h-5 w-5", destructive ? "text-destructive" : "text-muted-foreground")} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", destructive ? "text-destructive" : "text-foreground")}>{label}</p>
        {value && <p className="text-xs text-muted-foreground truncate font-medium">{value}</p>}
      </div>
      {action}
    </div>
  );
}
