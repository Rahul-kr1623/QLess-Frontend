import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useAttendees = () => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pehle attendees fetch karte hain
      const { data, error: err } = await supabase
        .from('attendees')
        .select('*');

      if (err) throw err;

      // Manually sort in frontend to avoid SQL errors if column missing
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
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const total = attendees.length;
  const checkedIn = attendees.filter(a => a.is_present).length;
  const remaining = total - checkedIn;
  const recentCheckins = attendees.filter(a => a.is_present).slice(0, 5);

  return { attendees, total, checkedIn, remaining, recentCheckins, loading, error, refreshData };
};