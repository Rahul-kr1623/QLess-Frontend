import { Clock, QrCode, LogOut, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import QLessLogo from '@/components/QLessLogo';
import { toast } from 'sonner';

const UPI_ID = 'rahulkr23082006@oksbi';

const PendingActivation = () => {
  const { signOut, user } = useAuth();

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied to clipboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center gap-3">
          <QLessLogo />
        </div>

        <div className="glass-card p-8 space-y-6 text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium mx-auto">
            <Clock size={16} />
            Pending Activation
          </div>

          <h2 className="text-xl font-bold text-foreground">
            Your account is created!
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Please scan the QR code below to pay the subscription fee. 
            Once paid, the Admin will activate your dashboard within{' '}
            <strong className="text-foreground">1 hour</strong>.
          </p>

          {/* Real QR Code - SIZE INCREASED HERE */}
          <div className="flex flex-col items-center gap-5">
            <div className="w-64 sm:w-72 h-auto rounded-xl border-2 border-border bg-white overflow-hidden flex items-center justify-center p-1 shadow-sm">
              <img 
                src="/qr-code.png" 
                alt="Pay with UPI" 
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* UPI ID */}
            <div className="flex items-center gap-2">
              <code className="px-3 py-1.5 rounded-md bg-card border border-border text-sm font-mono text-foreground">
                {UPI_ID}
              </code>
              <button
                onClick={copyUpi}
                className="h-8 w-8 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
            Logged in as <strong className="text-foreground">{user?.email}</strong>. 
            This page will update automatically once the admin activates your account. 
            You can keep this tab open.
          </div>

          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingActivation;