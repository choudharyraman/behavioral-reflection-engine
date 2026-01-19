import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, X, ExternalLink } from 'lucide-react';

export function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-foreground">Your data stays private</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Behavioral insights are stored locally on your device. We only analyze your transaction data within the app—no personal messages, location, or browsing history.
          </p>
          <Button 
            variant="link" 
            className="mt-1 h-auto p-0 text-sm text-primary"
          >
            Learn how we protect your privacy
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
