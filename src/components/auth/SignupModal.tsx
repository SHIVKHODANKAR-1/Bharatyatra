import React, { useState } from 'react';
import { User, Mail, Phone, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useI18n } from '../../i18n/index';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signup } = useAuth();
  const { trackEvent } = useAnalytics();
  const { t } = useI18n();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: 'Empty', score: 0, color: 'bg-stone-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: 'Weak', score: 1, color: 'bg-red-500' };
    if (score === 2 || score === 3) return { label: 'Moderate', score: 2, color: 'bg-amber-500' };
    return { label: 'Strong', score: 3, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    trackEvent('signup_started', { method: 'email_phone' });

    const result = await signup({
      fullName,
      email,
      phone,
      password,
      termsAccepted,
      referralCode,
    });

    setIsLoading(false);
    if (result.success) {
      trackEvent('signup_completed', { method: 'email_phone' });
      onClose();
    } else {
      setErrorMessage(result.error || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.signupTitle}
      description={t.auth.signupSubtitle}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label={t.auth.fullName}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t.auth.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label={t.auth.phone}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label={t.auth.password}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>Password strength:</span>
              <span className="font-semibold">{strength.label}</span>
            </div>
            <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden flex gap-1">
              <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
              <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
              <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
            </div>
          </div>
        )}

        <Input
          label={t.auth.confirmPassword}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <label className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="rounded border-stone-300 text-[#D9531E] focus:ring-[#D9531E] mt-0.5"
            required
          />
          <span>{t.auth.termsAgree}</span>
        </label>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {t.auth.submitSignup}
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
          >
            {t.auth.alreadyHaveAccount}
          </button>
        </div>
      </form>
    </Modal>
  );
};
