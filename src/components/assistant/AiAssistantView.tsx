import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Mic,
  MicOff,
  Share2,
  MapPin,
  Clock,
  DollarSign,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info,
  CalendarPlus,
  Bookmark,
  Eye,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DataClassification } from '../../types/index';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { AssistantChatMessage, AssistantCardPayload } from '../../types/recommendation';
import { AssistantService } from '../../services/assistantService';
import { AddToTripModal } from '../modals/AddToTripModal';

interface AiAssistantViewProps {
  onSelectDestination?: (dest: any) => void;
  savedItemIds?: Set<string>;
  onToggleSave?: (id: string) => void;
  onExploreSimilar?: (category: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'Where should I travel?',
  'Suggest places near my location',
  'Suggest a budget trip',
  'Find peaceful places',
  'Suggest family-friendly destinations',
  'What food experiences can I try?',
  'Plan a one-day trip',
  'Find hidden gems',
  'Suggest adventure activities',
  'Compare Varanasi and Hampi',
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  onSelectDestination,
  savedItemIds,
  onToggleSave,
  onExploreSimilar,
}) => {
  const { preferences } = useOnboarding();
  const { trackEvent } = useAnalytics();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [speechSupported, setSpeechSupported] = useState(false);

  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [tripModalItem, setTripModalItem] = useState<any | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize messages on mount
  useEffect(() => {
    const initialMsgs = AssistantService.init(preferences);
    setMessages([...initialMsgs]);

    // Check Speech Recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = preferences.language === 'hi' ? 'hi-IN' : 'en-IN';
        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };
        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);
        recognitionRef.current = recog;
      }
    }
  }, [preferences]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery('');
    setIsLoading(true);
    setErrorMessage(null);
    trackEvent('ai_query_submitted', { query: q });

    try {
      await AssistantService.sendMessage(q, preferences);
      setMessages([...AssistantService.getMessages()]);
      setLastFailedQuery(null);
    } catch {
      setLastFailedQuery(q);
      setErrorMessage('Unable to retrieve grounded response. Please verify connection and retry.');
      setMessages([...AssistantService.getMessages()]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarificationChoice = async (option: string, contextKey: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await AssistantService.handleClarification(option, contextKey, preferences);
      setMessages([...AssistantService.getMessages()]);
    } catch {
      setErrorMessage('Unable to process selection. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    AssistantService.clearHistory(preferences);
    setMessages([...AssistantService.getMessages()]);
    setErrorMessage(null);
    setLastFailedQuery(null);
  };

  const handleCopy = (msg: AssistantChatMessage) => {
    navigator.clipboard?.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: type }));
    AssistantService.setMessageFeedback(msgId, type === 'up' ? 'positive' : 'negative');
    trackEvent(type === 'up' ? 'ai_feedback_positive' : 'ai_feedback_negative', {
      messageId: msgId,
      rating: type,
    });
  };

  const handleShare = () => {
    const fullTranscript = messages
      .map((m) => `${m.sender.toUpperCase()} (${m.timestamp}):\n${m.text}`)
      .join('\n\n---\n\n');
    navigator.clipboard?.writeText(fullTranscript);
    alert('Full travel consultation transcript copied to clipboard!');
  };

  const renderCardPayload = (payload: AssistantCardPayload, idx: number) => {
    switch (payload.type) {
      case 'destination': {
        const dest = payload.data;
        const isSaved = savedItemIds?.has(dest.id);
        return (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#D9531E] transition-all space-y-2.5"
          >
            <div className="flex items-center gap-3">
              {dest.imageUrl && (
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#D9531E] font-bold truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{dest.location?.city || dest.name}, {dest.location?.state}</span>
                  </div>
                  {onToggleSave && (
                    <button
                      type="button"
                      onClick={() => onToggleSave(dest.id)}
                      className={`p-1 rounded-lg border text-[10px] font-bold transition-colors shrink-0 ${
                        isSaved
                          ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Destination'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#D9531E]' : ''}`} />
                    </button>
                  )}
                </div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                  {dest.name}
                </h4>
                <p className="text-xs text-stone-500 truncate">{dest.tagline}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                  <span>⏱️ {dest.idealDurationDays} Days</span>
                  <span>•</span>
                  <span className="capitalize">💰 {dest.estimatedBudget}</span>
                  {dest.distanceKm && (
                    <>
                      <span>•</span>
                      <span className="text-[#D9531E] font-semibold">📍 {Math.round(dest.distanceKm)} km away</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar: View Details, Save, Add to Itinerary, Explore Similar */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex-wrap">
              {onSelectDestination && (
                <button
                  type="button"
                  onClick={() => onSelectDestination(dest)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-[#D9531E] text-stone-700 dark:text-stone-300 hover:text-[#D9531E] text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Details</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setTripModalItem({
                    id: dest.id || dest.name,
                    title: dest.name,
                    location: dest.location,
                    approxPriceInr:
                      dest.estimatedBudget === 'budget'
                        ? 250
                        : dest.estimatedBudget === 'luxury'
                        ? 2500
                        : 800,
                    durationMinutes: (dest.idealDurationDays || 1) * 180,
                    itemType: 'destination',
                  })
                }
                className="px-2.5 py-1 rounded-lg border border-[#D9531E]/30 text-[#D9531E] hover:bg-[#D9531E]/10 text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <CalendarPlus className="w-3 h-3" />
                <span>Add to Itinerary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onExploreSimilar) {
                    onExploreSimilar(dest.category);
                  } else {
                    handleSend(`Suggest more places similar to ${dest.name} in category ${dest.category}`);
                  }
                }}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-[#D9531E] hover:border-[#D9531E] text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Explore Similar</span>
              </button>
            </div>
          </div>
        );
      }

      case 'experience': {
        const exp = payload.data;
        const isSaved = savedItemIds?.has(exp.id);
        return (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="capitalize font-semibold text-[#D9531E]">{exp.experienceType || exp.category}</span>
              <div className="flex items-center gap-2">
                <span>₹{exp.priceInr || exp.approxPriceInr} / person</span>
                {onToggleSave && (
                  <button
                    type="button"
                    onClick={() => onToggleSave(exp.id)}
                    className={`p-1 rounded-lg border text-[10px] font-bold transition-colors ${
                      isSaved
                        ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save Experience'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#D9531E]' : ''}`} />
                  </button>
                )}
              </div>
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{exp.title}</h4>
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{exp.shortDescription || exp.description}</p>

            <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  setTripModalItem({
                    id: exp.id || exp.title,
                    title: exp.title,
                    location: exp.location || exp.destinationName || 'India',
                    approxPriceInr: exp.priceInr || exp.approxPriceInr || 500,
                    durationMinutes: (exp.durationHours || 2) * 60,
                    itemType: 'experience',
                  })
                }
                className="px-2.5 py-1 rounded-lg border border-[#D9531E]/30 text-[#D9531E] hover:bg-[#D9531E]/10 text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <CalendarPlus className="w-3 h-3" />
                <span>Add to Itinerary</span>
              </button>

              <button
                type="button"
                onClick={() => handleSend(`Suggest more ${exp.category || 'adventure'} activities like ${exp.title}`)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-[#D9531E] text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Explore Similar</span>
              </button>
            </div>
          </div>
        );
      }

      case 'food': {
        const food = payload.data;
        return (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-amber-500/5 dark:bg-stone-900 border border-amber-500/20 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">
              <span>🍽️ {food.cuisineType} Cuisine</span>
              <div className="flex items-center gap-2">
                <span>~₹{food.priceForTwoInr} for two</span>
                <button
                  type="button"
                  onClick={() =>
                    setTripModalItem({
                      id: food.id || food.name,
                      title: food.name,
                      location: food.location || 'India',
                      approxPriceInr: Math.round((food.priceForTwoInr || 600) / 2),
                      durationMinutes: 60,
                      itemType: 'food',
                    })
                  }
                  className="px-2 py-0.5 rounded-lg border border-amber-600/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1 text-[10px] font-bold transition-colors shrink-0"
                  title="Add to Itinerary"
                >
                  <CalendarPlus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{food.name}</h4>
            <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Specialties: <strong>{food.specialtyDishes?.join(', ')}</strong>
            </div>
          </div>
        );
      }

      case 'route_summary': {
        const route = payload.data;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-sky-500/5 dark:bg-stone-900 border border-sky-500/20 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400">
              <span>🚗 Road & Rail Connectivity</span>
              <span>{route.distanceKm} km</span>
            </div>
            <div className="text-xs text-stone-700 dark:text-stone-300">
              Estimated travel duration: <strong>~{route.estimatedRoadHours} hours</strong> via national highway corridors.
            </div>
            <div className="text-[11px] text-stone-500 bg-white dark:bg-stone-800 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
              Transit Guidance: {route.recommendedMode}
            </div>
          </div>
        );
      }

      case 'budget_summary': {
        const b = payload.data;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
              <span>Estimated Budget Breakdown ({b.days} Days)</span>
              <span className="text-[#D9531E] font-black text-sm">~₹{b.totalEstimateInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700">
                🏨 Stay: ₹{b.stayEstimateInr.toLocaleString('en-IN')}
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700">
                🍛 Meals: ₹{b.foodEstimateInr.toLocaleString('en-IN')}
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700">
                🚖 Local Transit: ₹{b.transitEstimateInr.toLocaleString('en-IN')}
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700">
                🏛️ Monuments: ₹{b.monumentsEstimateInr.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-9.5rem)] min-h-[580px] bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D9531E] via-amber-600 to-[#B45309] text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Bharat Yatra AI Assistant
              </h2>
              <Badge classification={DataClassification.VERIFIED} />
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded in Archaeological Survey of India & State Tourism archives</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Copy entire consultation"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#D9531E] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`rounded-3xl p-4 sm:p-5 space-y-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#D9531E] text-white rounded-tr-xs shadow-sm'
                  : 'bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-xs shadow-xs'
              }`}
            >
              {/* Intent Tag if Assistant */}
              {msg.sender === 'assistant' && msg.intent && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700/60 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  <Sparkles className="w-3 h-3 text-[#D9531E]" />
                  <span>{msg.intent}</span>
                </div>
              )}

              {/* Warning Notice if applicable (e.g. Booking disclaimer) */}
              {msg.warningNote && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{msg.warningNote}</span>
                </div>
              )}

              {/* Main Response Text */}
              <div className="whitespace-pre-line text-stone-800 dark:text-stone-200 space-y-1">
                {msg.text}
              </div>

              {/* Clarifying Question interactive pills */}
              {msg.clarifyingQuestion && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <HelpCircle className="w-3.5 h-3.5 text-[#D9531E]" />
                    <span>{msg.clarifyingQuestion.question}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.clarifyingQuestion.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          handleClarificationChoice(opt, msg.clarifyingQuestion!.contextKey)
                        }
                        className="text-xs px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-[#D9531E] hover:text-white dark:hover:bg-[#D9531E] text-stone-700 dark:text-stone-300 font-medium transition-all flex items-center gap-1 border border-stone-200 dark:border-stone-700"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Card Payloads */}
              {msg.cardPayloads && msg.cardPayloads.length > 0 && (
                <div className="space-y-2 pt-1">
                  {msg.cardPayloads.map((card, idx) => renderCardPayload(card, idx))}
                </div>
              )}

              {/* 5-Tier Source Verification Chips */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 mt-2 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px] text-stone-500 dark:text-stone-400 space-y-1.5">
                  <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Corroborated Sources:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => {
                      const name = typeof src === 'string' ? src : src.sourceName;
                      const confidence = typeof src === 'object' ? src.confidenceScore : 95;
                      return (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium border border-stone-200/80 dark:border-stone-700 flex items-center gap-1"
                        >
                          <span>{name}</span>
                          <span className="text-emerald-600 font-bold">({confidence}%)</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message Bottom Action Bar */}
              {msg.sender === 'assistant' && (
                <div className="pt-2 flex items-center justify-between text-xs text-stone-400 border-t border-stone-200/40 dark:border-stone-800">
                  <span className="text-[10px]">{msg.timestamp}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(msg)}
                      className="p-1.5 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'up')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        feedbackGiven[msg.id] === 'up'
                          ? 'text-emerald-600 bg-emerald-500/10'
                          : 'hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title="Helpful verified match"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'down')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        feedbackGiven[msg.id] === 'down'
                          ? 'text-red-600 bg-red-500/10'
                          : 'hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title="Inaccurate or unhelpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#D9531E]/10 text-[#D9531E] flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Bharat Yatra AI Travel Assistant
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Ask anything about verified Indian itineraries, budget plans, peaceful hidden gems, family-friendly destinations, or regional food trails.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {lastFailedQuery && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  handleSend(lastFailedQuery);
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shrink-0 flex items-center gap-1 shadow-2xs transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-9 h-9 rounded-2xl bg-[#D9531E]/10 text-[#D9531E] flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 space-y-2 text-xs text-stone-600 dark:text-stone-400 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9531E] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9531E] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9531E] animate-bounce" />
                </span>
                <span className="font-semibold text-stone-700 dark:text-stone-300">Bharat Yatra Assistant is typing...</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <Sparkles className="w-3.5 h-3.5 text-[#D9531E] animate-spin" />
                <span>Cross-referencing verified government & tourism records...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Explore:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-[#D9531E] hover:text-[#D9531E] transition-all shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {speechSupported && (
            <button
              type="button"
              onClick={toggleSpeech}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:text-[#D9531E]'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input (Hindi/English)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about travel permits, optimal seasons, cultural etiquette, routes..."
            className="flex-1 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 px-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D9531E] transition-all"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuery.trim() || isLoading}
            isLoading={isLoading}
            className="px-5 rounded-2xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <AddToTripModal
        isOpen={!!tripModalItem}
        onClose={() => setTripModalItem(null)}
        item={tripModalItem}
      />
    </div>
  );
};
