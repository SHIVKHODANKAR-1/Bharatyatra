import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { requestPasswordReset, resetPassword } = useAuth();

  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await requestPasswordReset(identifier);
    setIsLoading(false);
    if (res.success) {
      setStep('reset');
    } else {
      setErrorMessage(res.error || 'Failed to send reset link.');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const res = await resetPassword(newPassword);
    setIsLoading(false);
    if (res.success) {
      setStep('success');
    } else {
      setErrorMessage(res.error || 'Failed to reset password.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'request'
          ? 'Reset Your Password'
          : step === 'reset'
          ? 'Choose a New Password'
          : 'Password Updated'
      }
      description={
        step === 'request'
          ? 'Enter your registered email or phone to receive a verification code.'
          : step === 'reset'
          ? 'Enter a secure new password for your Bharat Yatra account.'
          : 'Your account password has been updated securely.'
      }
      maxWidth="sm"
    >
      {step === 'request' && (
        <form onSubmit={handleRequest} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          <Input
            label="Email or Mobile Number"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. traveler@bharatyatra.in"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Send Reset Code
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Update Password
          </Button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4 pt-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            You can now log in using your newly configured credentials.
          </p>
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={onSwitchToLogin}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In with New Password
          </Button>
        </div>
      )}
    </Modal>
  );
};
