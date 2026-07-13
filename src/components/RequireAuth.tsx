import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { input as inp, btnPrimary } from './theme';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;
  if (authed) return <>{children}</>;

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr('Those details don’t match an account.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <div className="mt-5 space-y-3">
          <input className={inp} type="email" placeholder="name@company.com"
            value={email} onChange={e => setEmail(e.target.value)} />
          <input className={inp} type="password" placeholder="Password"
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && signIn()} />
          {err && <p className="text-xs font-medium text-red-600">{err}</p>}
          <button className={`${btnPrimary} w-full`} onClick={signIn}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
