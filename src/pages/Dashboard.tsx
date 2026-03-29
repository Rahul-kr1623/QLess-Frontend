import { Users, UserCheck, UserMinus, ScanLine } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import StatsCard from '@/components/StatsCard';
import LiveFeed from '@/components/LiveFeed';
import CreateEvent from '@/components/CreateEventSection';
import Scanner from '@/components/Scanner'; 
import { useAttendees } from '@/hooks/useAttendees';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 👈 Supabase import

const Dashboard = () => {
  const { total, checkedIn, remaining, recentCheckins, loading, error, refreshData } = useAttendees();
  const [showScanner, setShowScanner] = useState(false);

  // --- AUTO SET EVENT ID ---
  useEffect(() => {
    const setFirstEvent = async () => {
      const storedId = localStorage.getItem('current_event_id');
      if (!storedId || storedId === 'undefined') {
        const { data } = await supabase.from('events').select('id').limit(1);
        if (data && data.length > 0) {
          localStorage.setItem('current_event_id', data[0].id);
        }
      }
    };
    setFirstEvent();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AppHeader title="QLess Sync" />
      <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CreateEvent onEventCreated={refreshData} />
              
              <button 
                onClick={() => setShowScanner(!showScanner)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
                  showScanner ? 'bg-red-500 text-white' : 'bg-primary text-white hover:scale-105'
                }`}
              >
                <ScanLine size={20} />
                {showScanner ? "Close Scanner" : "Open Live Scanner"}
              </button>
            </div>

            {showScanner && (
              <div className="mt-6 p-6 border-2 border-dashed border-primary/20 rounded-2xl bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                 <Scanner onScanSuccess={refreshData} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <StatsCard title="Total Registered" value={total} icon={Users} />
              <StatsCard title="Checked In" value={checkedIn} icon={UserCheck} accentClass="text-green-500" />
              <StatsCard title="Remaining" value={remaining} icon={UserMinus} accentClass="text-gray-400" />
            </div>
            
            <LiveFeed recentCheckins={recentCheckins} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;