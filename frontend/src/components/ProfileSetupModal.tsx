import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Globe, Star } from 'lucide-react';
import { IANA_TIMEZONES, detectUserTimezone } from '../utils/timezones';
import { useRegister } from '../hooks/useQueries';
import { RegisterResult } from '../backend';

interface ProfileSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ open, onComplete }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState(detectUserTimezone);
  const [error, setError] = useState('');

  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }
    if (displayName.trim().length > 30) {
      setError('Display name must be 30 characters or fewer.');
      return;
    }
    if (!timezone) {
      setError('Please select a timezone.');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        displayName: displayName.trim(),
        timeZone: timezone,
      });

      // Both 'success' and 'alreadyRegistered' mean we can proceed
      if (result === RegisterResult.success || result === RegisterResult.alreadyRegistered) {
        onComplete();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: 'oklch(0.17 0.05 270 / 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid oklch(0.76 0.14 65 / 0.3)',
          boxShadow: '0 8px 40px oklch(0.08 0.04 270 / 0.8), 0 0 0 1px oklch(0.76 0.14 65 / 0.1)',
        }}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(0.76 0.14 65 / 0.15)', border: '1px solid oklch(0.76 0.14 65 / 0.3)' }}
            >
              <Star className="w-5 h-5" style={{ color: 'oklch(0.76 0.14 65)' }} />
            </div>
            <div>
              <DialogTitle className="font-display text-xl" style={{ color: 'oklch(0.84 0.14 88)' }}>
                Welcome to CoTimetable
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Set up your profile to begin your journey
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground font-medium">
              Display Name
            </Label>
            <Input
              id="displayName"
              placeholder="e.g. Priya, Alex..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-foreground placeholder:text-muted-foreground"
              style={{
                background: 'oklch(0.22 0.06 270)',
                border: '1px solid oklch(0.38 0.08 270)',
              }}
              autoFocus
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-foreground font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: 'oklch(0.76 0.14 65)' }} />
              Timezone
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger
                className="text-foreground"
                style={{
                  background: 'oklch(0.22 0.06 270)',
                  border: '1px solid oklch(0.38 0.08 270)',
                }}
              >
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: 'oklch(0.19 0.055 270)',
                  border: '1px solid oklch(0.38 0.08 270)',
                }}
              >
                <ScrollArea className="h-64">
                  {IANA_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz} className="text-foreground cursor-pointer">
                      {tz.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-detected:{' '}
              <span style={{ color: 'oklch(0.76 0.14 65)' }}>{detectUserTimezone()}</span>
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
              color: 'oklch(0.12 0.03 270)',
              border: '1px solid oklch(0.84 0.14 88 / 0.3)',
            }}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              'Begin Journey'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
