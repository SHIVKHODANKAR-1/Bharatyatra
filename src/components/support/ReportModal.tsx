import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SupportCategory } from '../../types/booking';
import { SupportService } from '../../services/supportService';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'experience' | 'provider' | 'review' | 'event' | 'general';
  targetId?: string;
  targetTitle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { currentUser } = useAuth();

  const [category, setCategory] = useState<SupportCategory>('Inaccurate Information');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories: SupportCategory[] = [
    'Inaccurate Information',
    'Safety Concern',
    'Quality Issue',
    'Payment Issue',
    'Harassment',
    'Cancellation Dispute',
    'Other',
  ];

  const handleSubmit = () => {
    setErrorMessage(null);
    const sub = subject.trim() || `Report regarding ${targetTitle || targetType}`;
    if (sub.length < 4) {
      setErrorMessage('Please provide a subject line.');
      return;
    }
    if (description.trim().length < 15) {
      setErrorMessage('Please describe the issue with at least 15 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = SupportService.createTicket({
        userId: currentUser?.id || currentUser?.uid || 'usr_demo_traveler',
        userName: currentUser?.fullName || currentUser?.displayName || 'Aarav Sharma',
        userEmail: currentUser?.email || 'aarav@example.com',
        targetType,
        targetId,
        targetTitle,
        category,
        subject: sub,
        description: description.trim(),
        priority,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1800);
      } else {
        setErrorMessage(res.error || 'Failed to submit report.');
      }
    } catch {
      setErrorMessage('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Submit Report / Support Inquiry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-stone-900 dark:text-stone-100">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold">Inquiry Submitted</h4>
              <p className="text-stone-500">
                Our safety and moderation desk will inspect this case immediately.
              </p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              {targetTitle && (
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Target Item</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">{targetTitle}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Issue Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of concern..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Detailed Explanation *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide specific details to assist our review team..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="text-xs" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 text-xs"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Moderation Team'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
