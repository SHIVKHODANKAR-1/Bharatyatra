import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useI18n } from '../../i18n/index';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToForgot,
}) => {
  const { login, continueAsGuest } = useAuth();
  const { trackEvent } = useAnalytics();
  const { t } = useI18n();

  const [identifier, setIdentifier] = useState('traveler@bharatyatra.in');
  const [password, setPassword] = useState('Yatra@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    trackEvent('login_started', { method: 'password' });

    const result = await login({ identifier, password, rememberMe });
    setIsLoading(false);

    if (result.success) {
      trackEvent('login_completed', { method: 'password' });
      onClose();
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.loginTitle}
      description={t.auth.loginSubtitle}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label={t.auth.emailOrPhone}
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="e.g. traveler@bharatyatra.in or 9876543210"
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label={t.auth.password}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-stone-600 dark:text-stone-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-stone-300 text-[#D9531E] focus:ring-[#D9531E]"
            />
            <span>{t.auth.rememberMe}</span>
          </label>
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-[#D9531E] hover:underline font-medium"
          >
            {t.auth.forgotPassword}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {t.auth.submitLogin}
        </Button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200 dark:border-stone-800" />
          </div>
          <span className="relative bg-white dark:bg-stone-900 px-3 text-xs text-stone-400">or</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGuest}
          className="w-full text-stone-700 dark:text-stone-300"
        >
          {t.auth.continueGuest}
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
          >
            {t.auth.dontHaveAccount}
          </button>
        </div>
      </form>
    </Modal>
  );
};
