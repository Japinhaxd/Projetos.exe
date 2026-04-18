import { Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import {
  initFirebase,
  loginWithGoogle,
  loginWithMicrosoft,
  subscribeAuth,
  validateFirebaseConfig,
} from '../lib/firebase';
import { Modal } from '../components/ui/Modal';
import type { AuthUser } from '../types';

export function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const firebaseConfig = useStore((s) => s.firebaseConfig);
  const setFirebaseConfig = useStore((s) => s.setFirebaseConfig);
  const setUser = useStore((s) => s.setUser);
  const user = useStore((s) => s.user);
  const pushToast = useStore((s) => s.pushToast);

  const [setupOpen, setSetupOpen] = useState(false);
  const [configText, setConfigText] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (firebaseConfig) {
      try {
        initFirebase(firebaseConfig);
        const unsub = subscribeAuth((u) => {
          if (u) {
            setUser(u);
          }
        });
        return unsub;
      } catch (e) {
        // keep login page
      }
    }
  }, [firebaseConfig, setUser]);

  async function handleGoogle() {
    if (!firebaseConfig) {
      setSetupOpen(true);
      return;
    }
    try {
      setLoading('google');
      initFirebase(firebaseConfig);
      const u = await loginWithGoogle();
      setUser(u);
      navigate('/', { replace: true });
    } catch (e: any) {
      pushToast({ type: 'error', message: e?.message || 'Login failed' });
    } finally {
      setLoading(null);
    }
  }

  async function handleMicrosoft() {
    if (!firebaseConfig) {
      setSetupOpen(true);
      return;
    }
    try {
      setLoading('ms');
      initFirebase(firebaseConfig);
      const u = await loginWithMicrosoft();
      setUser(u);
      navigate('/', { replace: true });
    } catch (e: any) {
      pushToast({ type: 'error', message: e?.message || 'Login failed' });
    } finally {
      setLoading(null);
    }
  }

  function handleLocal() {
    const u: AuthUser = {
      uid: 'local',
      displayName: 'Local User',
      email: '',
      photoURL: '',
      provider: 'local',
    };
    setUser(u);
    navigate('/', { replace: true });
  }

  function handleSaveConfig() {
    const parsed = validateFirebaseConfig(configText);
    if (!parsed) {
      pushToast({ type: 'error', message: t('toast.invalidFirebase') });
      return;
    }
    setFirebaseConfig(parsed);
    try {
      initFirebase(parsed);
    } catch (e: any) {
      pushToast({ type: 'error', message: e?.message || 'Init failed' });
      return;
    }
    pushToast({ type: 'success', message: t('toast.saved') });
    setSetupOpen(false);
  }

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-2xl p-8 border border-[#1e1e2e] bg-[#111118] shadow-2xl"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-pos-soft flex items-center justify-center mb-4">
              <Wallet size={26} className="text-pos" />
            </div>
            <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">
              Finance OS
            </h1>
            <p className="text-sm text-[#64748b] mt-1">{t('app.tagline')}</p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              className="w-full h-11 rounded-lg bg-white text-[#0f172a] font-medium text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
              onClick={handleGoogle}
              disabled={loading !== null}
            >
              <GoogleLogo />
              {loading === 'google' ? '...' : t('app.continueGoogle')}
            </button>

            <button
              className="w-full h-11 rounded-lg bg-[#2f2f3a] text-white font-medium text-sm hover:bg-[#3a3a48] transition-colors flex items-center justify-center gap-3 border border-[#2a2a3a] disabled:opacity-60"
              onClick={handleMicrosoft}
              disabled={loading !== null}
            >
              <MicrosoftLogo />
              {loading === 'ms' ? '...' : t('app.continueMicrosoft')}
            </button>
          </div>

          <p className="text-center text-[11px] text-[#64748b] mt-5">
            🔒 {t('app.localOnly')}
          </p>

          <div className="mt-6 text-center border-t border-[#1e1e2e] pt-5">
            <button
              onClick={handleLocal}
              className="text-xs text-[#64748b] hover:text-pos transition-colors underline-offset-4 hover:underline"
            >
              {t('app.localModeLink')}
            </button>
          </div>

          {!firebaseConfig && (
            <div className="mt-5 text-center">
              <button
                onClick={() => setSetupOpen(true)}
                className="text-[11px] text-[#64748b] hover:text-[#e2e8f0] transition-colors"
              >
                ⚙️ {t('app.setupFirebase')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Firebase setup modal */}
      <Modal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        title={t('app.setupFirebase')}
        size="md"
      >
        <p className="text-sm text-muted mb-4">{t('app.setupFirebaseDesc')}</p>
        <textarea
          className="input font-mono text-xs"
          rows={10}
          placeholder={`{\n  "apiKey": "...",\n  "authDomain": "your-app.firebaseapp.com",\n  "projectId": "your-app",\n  "appId": "..."\n}`}
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
        />
        <p className="text-[11px] text-muted mt-2">
          Firebase Console → Project Settings → Your apps → SDK setup →
          Config.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-ghost" onClick={() => setSetupOpen(false)}>
            {t('app.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSaveConfig}>
            {t('app.saveContinue')}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23">
      <rect x="1" y="1" width="10" height="10" fill="#F35325" />
      <rect x="12" y="1" width="10" height="10" fill="#81BC06" />
      <rect x="1" y="12" width="10" height="10" fill="#05A6F0" />
      <rect x="12" y="12" width="10" height="10" fill="#FFBA08" />
    </svg>
  );
}
