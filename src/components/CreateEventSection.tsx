import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { InfoIcon, Link2, Copy, Plus, Table2 } from 'lucide-react';

// Tera Service Account Email jo users ko share karni hogi
const BOT_EMAIL = 'qless-bot@qless-saas-491608.iam.gserviceaccount.com';

interface CreateEventProps {
  onEventCreated: () => void;
}

const CreateEventSection: React.FC<CreateEventProps> = ({ onEventCreated }) => {
  const { user } = useAuth();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDate || !sheetUrl || !user) {
      toast.error('Please fill required fields (Name, Date, and Sheet URL)');
      return;
    }

    setIsLoading(true);
    try {
      // Note: apps_script_url aur tickets_sent ab optional hain hamare naye scanner logic mein
      const { error } = await supabase.from('events').insert([{
        name: eventName,
        date: eventDate,
        event_time: eventTime,
        event_venue: eventVenue,
        sheet_url: sheetUrl,
        club_id: user.id
      }]);

      if (error) throw error;
      
      toast.success('Event Sync Started! Scanning mode active.');
      
      // Fields reset
      setEventName(''); setEventDate(''); setEventTime(''); setEventVenue(''); setSheetUrl('');
      
      // Dashboard refresh
      onEventCreated();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 md:p-8 space-y-6 rounded-2xl border border-border shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-primary/10 text-primary"><Plus size={22} /></div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Connect Event Sheet</h2>
          <p className="text-sm text-muted-foreground">Universal scanner setup for any Google Sheet.</p>
        </div>
      </div>

      <form onSubmit={handleCreateEvent} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          <Input placeholder="Venue" value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} />
        </div>

        <div className="relative">
          <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Google Sheet URL" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
        </div>

        {/* --- DYNAMIC SCANNING GUIDE --- */}
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 space-y-4 text-sm">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider">
            <InfoIcon size={18} /> Scanner Integration Guide
          </div>
          
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-bold">1</span>
              <p>Share your sheet with <b>Editor</b> access to: <br/>
              <code className="bg-muted px-1 rounded text-primary">{BOT_EMAIL}</code> 
              <button type="button" onClick={() => copyToClipboard(BOT_EMAIL, 'Email Copied!')} className="ml-2 text-xs underline">Copy</button></p>
            </div>

            <div className="flex items-start gap-2">
              <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-bold">2</span>
              <p>Ensure your Sheet has these <b>Header Names</b> (Exact Spelling):</p>
            </div>

            <div className="flex justify-around gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border/50">
               <div className="flex items-center gap-1 font-mono text-xs"><Table2 size={12}/> Reg No</div>
               <div className="flex items-center gap-1 font-mono text-xs"><Table2 size={12}/> Name</div>
               <div className="flex items-center gap-1 font-mono text-xs"><Table2 size={12}/> Attendance</div>
            </div>

            <p className="text-[11px] italic text-orange-500">Note: Our scanner will automatically find these columns in any order.</p>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-lg shadow-md" disabled={isLoading}>
          {isLoading ? 'Connecting Engine...' : 'Connect Sheet & Start Syncing'}
        </Button>
      </form>
    </div>
  );
};

export default CreateEventSection;