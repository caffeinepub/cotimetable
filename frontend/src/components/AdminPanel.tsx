import React, { useState } from 'react';
import { Shield, AlertTriangle, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetSystem } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminPanel({ open, onClose }: AdminPanelProps) {
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const queryClient = useQueryClient();
  const resetSystem = useResetSystem();

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '161189') {
      setUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Incorrect passcode. Access denied.');
      setPasscode('');
    }
  };

  const handleReset = async () => {
    try {
      await resetSystem.mutateAsync('161189');
      queryClient.clear();
      setResetSuccess(true);
    } catch {
      // error handled by mutation state
    }
  };

  const handleClose = () => {
    setPasscode('');
    setPasscodeError('');
    setUnlocked(false);
    setResetSuccess(false);
    resetSystem.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="max-w-md border"
        style={{
          background: 'oklch(0.11 0.04 270 / 0.97)',
          backdropFilter: 'blur(24px)',
          borderColor: 'oklch(0.76 0.14 65 / 0.25)',
          boxShadow: '0 0 40px oklch(0.76 0.14 65 / 0.12), 0 8px 32px oklch(0 0 0 / 0.6)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'oklch(0.76 0.14 65 / 0.15)',
                border: '1px solid oklch(0.76 0.14 65 / 0.3)',
              }}
            >
              <Shield className="w-4 h-4" style={{ color: 'oklch(0.76 0.14 65)' }} />
            </div>
            <span style={{ color: 'oklch(0.84 0.14 88)' }}>Admin Panel</span>
          </DialogTitle>
          <DialogDescription style={{ color: 'oklch(0.65 0.06 270)' }}>
            Restricted access. Enter the admin passcode to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {resetSuccess ? (
            /* ── Success State ── */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'oklch(0.55 0.15 145 / 0.15)',
                  border: '1px solid oklch(0.55 0.15 145 / 0.4)',
                  boxShadow: '0 0 20px oklch(0.55 0.15 145 / 0.2)',
                }}
              >
                <CheckCircle2 className="w-7 h-7" style={{ color: 'oklch(0.65 0.15 145)' }} />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">System Reset Complete</p>
                <p className="text-sm" style={{ color: 'oklch(0.65 0.06 270)' }}>
                  All users, messages, and timetable data have been cleared. The app will now
                  behave as if freshly deployed.
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="mt-2 rounded-full px-6"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
                  color: 'oklch(0.12 0.03 270)',
                  border: 'none',
                }}
              >
                Close
              </Button>
            </div>
          ) : !unlocked ? (
            /* ── Passcode Entry ── */
            <form onSubmit={handlePasscodeSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="admin-passcode"
                  className="text-sm font-medium"
                  style={{ color: 'oklch(0.75 0.08 270)' }}
                >
                  <KeyRound className="w-3.5 h-3.5 inline mr-1.5" style={{ color: 'oklch(0.76 0.14 65)' }} />
                  Admin Passcode
                </Label>
                <Input
                  id="admin-passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError('');
                  }}
                  placeholder="Enter passcode..."
                  autoComplete="off"
                  className="rounded-lg"
                  style={{
                    background: 'oklch(0.16 0.04 270 / 0.8)',
                    borderColor: passcodeError
                      ? 'oklch(0.55 0.2 25 / 0.6)'
                      : 'oklch(0.76 0.14 65 / 0.2)',
                    color: 'oklch(0.9 0.03 270)',
                  }}
                />
                {passcodeError && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'oklch(0.65 0.2 25)' }}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {passcodeError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={!passcode}
                className="rounded-full font-medium"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
                  color: 'oklch(0.12 0.03 270)',
                  border: 'none',
                  opacity: !passcode ? 0.5 : 1,
                }}
              >
                Unlock Admin Panel
              </Button>
            </form>
          ) : (
            /* ── Admin Actions ── */
            <div className="flex flex-col gap-5">
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  background: 'oklch(0.55 0.2 25 / 0.08)',
                  border: '1px solid oklch(0.55 0.2 25 / 0.25)',
                }}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'oklch(0.72 0.18 45)' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'oklch(0.82 0.12 45)' }}>
                    Danger Zone
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.65 0.06 270)' }}>
                    Resetting the system will permanently delete <strong>all registered users</strong>,{' '}
                    <strong>all chat messages</strong>, and <strong>all timetable events</strong>.
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {resetSystem.isError && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'oklch(0.65 0.2 25)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Reset failed: {resetSystem.error instanceof Error ? resetSystem.error.message : 'Unknown error'}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 rounded-full"
                  style={{
                    borderColor: 'oklch(0.55 0.06 270 / 0.4)',
                    color: 'oklch(0.65 0.06 270)',
                    background: 'transparent',
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={resetSystem.isPending}
                  className="flex-1 rounded-full font-semibold gap-2"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.55 0.2 25) 0%, oklch(0.45 0.18 20) 100%)',
                    color: 'oklch(0.95 0.02 270)',
                    border: '1px solid oklch(0.55 0.2 25 / 0.4)',
                    boxShadow: '0 0 16px oklch(0.55 0.2 25 / 0.2)',
                  }}
                >
                  {resetSystem.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset All Data'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
