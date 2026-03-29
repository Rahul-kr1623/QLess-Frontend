import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import Scanner from '@/components/Scanner'; // 👈 Purana panel hatakar naya Scanner import kiya
import { useAttendees } from '@/hooks/useAttendees';

const extractRegNo = (rawValue: string) => {
  const value = rawValue.trim();
  if (!value) return '';

  try {
    const parsed = JSON.parse(value) as Record<string, unknown> | string;
    if (typeof parsed === 'string') return parsed.trim();

    const fromJson =
      parsed.reg_no ??
      parsed.regNo ??
      parsed.registration_no ??
      parsed.registrationNo;

    if (typeof fromJson === 'string') return fromJson.trim();
  } catch {
    // ignore JSON parse errors
  }

  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const url = new URL(value);
      const fromQuery =
        url.searchParams.get('reg_no') ||
        url.searchParams.get('regNo') ||
        url.searchParams.get('registration_no');

      if (fromQuery) return fromQuery.trim();
    }
  } catch {
    // ignore URL parse errors
  }

  return value;
};

const Attendees = () => {
  const { attendees, loading, error, refreshData } = useAttendees(); // 👈 checkIn ki jagah refreshData use karenge
  const [search, setSearch] = useState('');
  const [flashId, setFlashId] = useState<string | null>(null);

  const filtered = attendees.filter(
    (a) =>
      (a.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.reg_no ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Manual Check-in logic using our Backend API
  const handleCheckIn = async (regNo: string) => {
    try {
      const response = await fetch('http://localhost:5000/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_no: regNo, event_id: 'abcd' }) // 'abcd' ko dynamic kar sakte ho
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        refreshData(); // List refresh karo
        const attendee = attendees.find(a => a.reg_no === regNo);
        if (attendee) {
          setFlashId(attendee.id);
          setTimeout(() => setFlashId(null), 1200);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Backend connect nahi ho pa raha!");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AppHeader title="Attendee Live Feed" />
      <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        
        {/* Naya Scanner Component */}
        <div className="glass-card p-4">
          <Scanner onScanSuccess={refreshData} />
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by name or reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="glass-card overflow-hidden border border-white/10 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-4 py-4 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden sm:table-cell">Reg No</th>
                    <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="text-right px-4 py-4 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                        No attendees found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => (
                      <tr
                        key={a.id}
                        className={`border-b border-white/5 transition-all duration-500 ${
                          flashId === a.id ? 'bg-green-500/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="px-4 py-4 font-medium text-foreground">{a.name}</td>
                        <td className="px-4 py-4 text-muted-foreground hidden sm:table-cell">{a.reg_no}</td>
                        <td className="px-4 py-4 text-muted-foreground hidden md:table-cell">{a.email}</td>
                        <td className="px-4 py-4 text-right">
                          {a.is_present ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                              <Check size={12} />
                              PRESENT
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCheckIn(a.reg_no)}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200 border border-primary/20"
                            >
                              MARK PRESENT
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Attendees;