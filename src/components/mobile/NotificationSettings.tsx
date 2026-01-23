import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bell,
  BellOff,
  Mail,
  Zap,
  Settings2,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';

export interface NotificationPreferences {
  weeklyDigest: boolean;
  softNudges: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  mutedCategories: string[];
}

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => void;
}

const categories = [
  { id: 'food', label: 'Food & Dining' },
  { id: 'transport', label: 'Transport' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'bills', label: 'Bills & Utilities' },
  { id: 'health', label: 'Health' },
];

const sensitivityOptions = [
  { 
    id: 'low' as const, 
    label: 'Only big changes', 
    description: 'Notify when spending is 75%+ above baseline',
    emoji: '🌙'
  },
  { 
    id: 'medium' as const, 
    label: 'Medium changes', 
    description: 'Notify when spending is 50%+ above baseline',
    emoji: '⚖️'
  },
  { 
    id: 'high' as const, 
    label: 'All changes', 
    description: 'Notify when spending is 25%+ above baseline',
    emoji: '🔔'
  },
];

export function NotificationSettings({ 
  isOpen, 
  onClose, 
  preferences, 
  onSave 
}: NotificationSettingsProps) {
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(preferences);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  const toggleCategory = (categoryId: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      mutedCategories: prev.mutedCategories.includes(categoryId)
        ? prev.mutedCategories.filter(c => c !== categoryId)
        : [...prev.mutedCategories, categoryId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Control how we share insights with you
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Weekly Digest */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Digest</p>
                <p className="text-xs text-muted-foreground">Monday morning summary</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.weeklyDigest}
              onCheckedChange={(checked) => 
                setLocalPrefs(prev => ({ ...prev, weeklyDigest: checked }))
              }
            />
          </div>

          {/* Soft Nudges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--warning))]/10">
                <Zap className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Soft Nudges</p>
                <p className="text-xs text-muted-foreground">Real-time pattern alerts</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.softNudges}
              onCheckedChange={(checked) => 
                setLocalPrefs(prev => ({ ...prev, softNudges: checked }))
              }
            />
          </div>

          {/* Sensitivity */}
          {localPrefs.softNudges && (
            <button
              onClick={() => setShowSensitivity(!showSensitivity)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/50 transition-colors hover:bg-muted animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Sensitivity</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {localPrefs.sensitivity === 'low' ? 'Only big changes' : 
                     localPrefs.sensitivity === 'high' ? 'All changes' : 'Medium changes'}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                showSensitivity && "rotate-90"
              )} />
            </button>
          )}

          {/* Sensitivity options */}
          {showSensitivity && (
            <div className="space-y-2 animate-fade-in pl-4">
              {sensitivityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setLocalPrefs(prev => ({ ...prev, sensitivity: option.id }))}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                    localPrefs.sensitivity === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {localPrefs.sensitivity === option.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Muted Categories */}
          {localPrefs.softNudges && (
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/50 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Muted Categories</p>
                  <p className="text-xs text-muted-foreground">
                    {localPrefs.mutedCategories.length === 0 
                      ? 'None muted' 
                      : `${localPrefs.mutedCategories.length} muted`}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                showCategories && "rotate-90"
              )} />
            </button>
          )}

          {/* Category options */}
          {showCategories && (
            <div className="grid grid-cols-2 gap-2 animate-fade-in pl-4">
              {categories.map((cat) => {
                const isMuted = localPrefs.mutedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border transition-all",
                      isMuted
                        ? "border-destructive/30 bg-destructive/10"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    {isMuted ? (
                      <BellOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      isMuted ? "text-destructive" : "text-foreground"
                    )}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              We'll never tell you to "spend less" or set limits. Notifications are about helping you 
              notice patterns relative to your own baseline, not judging your choices.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex gap-3 border-t border-border/50">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-2xl"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12 rounded-2xl"
            onClick={handleSave}
          >
            <Check className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
