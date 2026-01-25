import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Wallet, 
  Target, 
  LogOut, 
  ChevronRight,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  Sparkles,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileScreenProps {
  onSignOut: () => void;
}

export function ProfileScreen({ onSignOut }: ProfileScreenProps) {
  const { profile, updateProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    currency: profile?.currency || 'INR',
    monthly_budget: profile?.monthly_budget || 0,
    savings_goal: profile?.savings_goal || 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const handleEditSubmit = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: editForm.full_name || null,
      phone: editForm.phone || null,
      currency: editForm.currency,
      monthly_budget: editForm.monthly_budget,
      savings_goal: editForm.savings_goal,
    });
    setIsSaving(false);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      setIsEditing(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const currencies = [
    { value: 'INR', label: '₹ INR', symbol: '₹' },
    { value: 'USD', label: '$ USD', symbol: '$' },
    { value: 'EUR', label: '€ EUR', symbol: '€' },
    { value: 'GBP', label: '£ GBP', symbol: '£' },
  ];

  const currentCurrency = currencies.find(c => c.value === (profile?.currency || 'INR'));

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-primary/10 shadow-xl">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">{displayName}</h2>
              <p className="text-sm text-muted-foreground truncate">{profile?.email || user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  Premium
                </span>
              </div>
            </div>
            <Sheet open={isEditing} onOpenChange={setIsEditing}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Edit Profile</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6 overflow-y-auto pb-8">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your name"
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={editForm.currency} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Monthly Budget</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currentCurrency?.symbol}
                      </span>
                      <Input
                        type="number"
                        value={editForm.monthly_budget}
                        onChange={(e) => setEditForm(prev => ({ ...prev, monthly_budget: Number(e.target.value) }))}
                        placeholder="50000"
                        className="h-12 pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Savings Goal</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currentCurrency?.symbol}
                      </span>
                      <Input
                        type="number"
                        value={editForm.savings_goal}
                        onChange={(e) => setEditForm(prev => ({ ...prev, savings_goal: Number(e.target.value) }))}
                        placeholder="10000"
                        className="h-12 pl-8"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 h-12"
                      onClick={handleEditSubmit}
                      disabled={isSaving}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Budget</p>
                <p className="text-lg font-bold text-foreground">
                  {currentCurrency?.symbol}{(profile?.monthly_budget || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Savings Goal</p>
                <p className="text-lg font-bold text-foreground">
                  {currentCurrency?.symbol}{(profile?.savings_goal || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Sections */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingItem
            icon={Moon}
            label="Dark Mode"
            action={
              <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
            }
          />
          <SettingItem
            icon={Bell}
            label="Notifications"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingItem
            icon={User}
            label="Personal Information"
            value={profile?.full_name || 'Not set'}
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
          <SettingItem
            icon={Mail}
            label="Email"
            value={profile?.email || user?.email || ''}
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
          <SettingItem
            icon={Phone}
            label="Phone"
            value={profile?.phone || 'Not set'}
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingItem
            icon={Shield}
            label="Privacy & Security"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
          <SettingItem
            icon={HelpCircle}
            label="Help Center"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button 
        variant="destructive" 
        className="w-full h-12 text-base font-medium"
        onClick={onSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}

function SettingItem({ 
  icon: Icon, 
  label, 
  value,
  action 
}: { 
  icon: React.ElementType; 
  label: string;
  value?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {value && (
          <p className="text-xs text-muted-foreground truncate">{value}</p>
        )}
      </div>
      {action}
    </div>
  );
}
