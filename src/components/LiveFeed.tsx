import { UserCheck } from 'lucide-react';
import { Attendee } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const LiveFeed = ({ recentCheckins }: { recentCheckins: Attendee[] }) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground">Live Feed</h3>
      </div>
      {recentCheckins.length === 0 ? (
        <p className="text-sm text-muted-foreground">No check-ins yet.</p>
      ) : (
        <ul className="space-y-3">
          {recentCheckins.map((a, i) => (
            <li
              key={a.id}
              className="flex items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                <UserCheck size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.entry_time ? formatDistanceToNow(new Date(a.entry_time), { addSuffix: true }) : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveFeed;
