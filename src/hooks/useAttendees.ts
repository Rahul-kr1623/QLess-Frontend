import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth'; // 👈 Auth hook import kiya

export const useAttendees = () => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // 👈 Logged-in user ki ID nikalne ke liye

  const refreshData = useCallback(async () => {
    if (!user?.id) return; // User nahi toh data nahi

    try {
      setLoading(true);
      setError(null);

      // Sirf wahi attendees laao jo is logged-in club ke hain
      const { data, error: err } = await supabase
        .from('attendees')
        .select('*')
        .eq('club_id', user.id); // 👈 Privacy Filter

      if (err) throw err;

      // Sorting logic (Recent first)
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.marked_at || a.created_at).getTime();
        const dateB = new Date(b.marked_at || b.created_at).getTime();
        return dateB - dateA;
      });

      setAttendees(sortedData);
    } catch (err: any) {
      console.error("Hook Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Stats calculation
  const total = attendees.length;
  const checkedIn = attendees.filter(a => a.is_present).length;
  const remaining = total - checkedIn;
  const recentCheckins = attendees.filter(a => a.is_present).slice(0, 5);

  return { attendees, total, checkedIn, remaining, recentCheckins, loading, error, refreshData };
};