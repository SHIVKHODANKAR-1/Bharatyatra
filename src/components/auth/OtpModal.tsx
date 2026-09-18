import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/index';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, onClose }) => {
  const { otpState, verifyOtp, sendOtp } = useAuth();
  const { t } = useI18n();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setDigits(['', '', '', '', '', '']);
    setTimer(45);
    setErrorMessage(null);
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 100);
  }, [isOpen]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Handle single character
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 filled
    if (index === 5 && value && newDigits.every((d) => d !== '')) {
      handleVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const arr = pasteData.split('');
      setDigits(arr);
      inputsRef.current[5]?.focus();
      handleVerify(pasteData);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const result = await verifyOtp(code);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Invalid OTP code.');
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !otpState) return;
    setTimer(45);
    setDigits(['', '', '', '', '', '']);
    inputsRef.current[0]?.focus();
    await sendOtp(otpState.target, otpState.type);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.enterOtp}
      description={`${t.auth.otpSentTo} ${otpState?.target || 'your mobile/email'}`}
      maxWidth="sm"
    >
      <div className="space-y-5 pt-2 text-center">
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6 Digits Boxes */}
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D9531E] focus:border-[#D9531E] transition-all"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>{timer > 0 ? `Code expires in 00:${timer < 10 ? '0' : ''}${timer}` : 'Code expired'}</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0}
            className="text-[#D9531E] hover:underline font-semibold disabled:text-stone-400 disabled:no-underline"
          >
            {t.auth.resendOtp}
          </button>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => handleVerify()}
          isLoading={isLoading}
          className="w-full"
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        >
          {t.auth.verifyOtp}
        </Button>
      </div>
    </Modal>
  );
};
