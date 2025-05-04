import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const initializeSessionSync = () => {
  const handleStorageChange = async (event: StorageEvent) => {
    if (event.key === 'supabase.auth.token') {
      const { data: { session } } = await supabase.auth.getSession();
      window.dispatchEvent(new CustomEvent('supabase.session.update', {
        detail: session
      }));
    }
  };

  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.dispatchEvent(new CustomEvent('supabase.session.update', {
          detail: session
        }));
      }
    }
  };

  const handleSessionUpdate = (event: CustomEvent<Session>) => {
    console.log('Session updated:', event.detail ? 'Session active' : 'No session');
  };

  window.addEventListener('storage', handleStorageChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('supabase.session.update', handleSessionUpdate as EventListener);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('supabase.session.update', handleSessionUpdate as EventListener);
  };
};