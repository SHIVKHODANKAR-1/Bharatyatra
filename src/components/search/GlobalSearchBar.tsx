import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Mic,
  MicOff,
  SlidersHorizontal,
  History,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { UnifiedSearchItem } from '../../types/travel';
import { DataClassification } from '../../types/index';
import {
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  TRENDING_SEARCHES,
  getAllUnifiedItems,
} from '../../services/searchExploreService';

interface GlobalSearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onOpenFilters?: () => void;
  onSelectSuggestion?: (item: UnifiedSearchItem | { name: string; city?: string }) => void;
  activeFilterCount?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  value,
  onChange,
  onSearchSubmit,
  onOpenFilters,
  onSelectSuggestion,
  activeFilterCount = 0,
  placeholder = 'Search destinations, attractions, food, stays, road trips...',
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close suggestions when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when query changes (debounced 250ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        } else {
          throw new Error('API returned error');
        }
      } catch (err) {
        // Fallback to offline client-side suggestion matching
        try {
          const allItems = getAllUnifiedItems();
          const q = value.trim().toLowerCase();
          const matched = allItems
            .filter(
              (i) =>
                i.name.toLowerCase().includes(q) ||
                i.location.city.toLowerCase().includes(q) ||
                i.location.state.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q)
            )
            .slice(0, 8);

          setSuggestions(
            matched.map((m) => ({
              id: m.id,
              name: m.name,
              type: m.type,
              category: m.category,
              city: m.location.city,
              state: m.location.state,
              dataClassification: m.dataClassification,
            }))
          );
        } catch {
          setSuggestions([]);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [value]);

  // Voice Search via Web Speech API or voice prompt simulation
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice recognition is not supported in this browser. Please type your query.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    try {
      if (isListening) {
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... Speak destination, city or activity');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setVoiceNotice(`Heard: "${transcript}"`);
        onChange(transcript);
        onSearchSubmit(transcript);
        saveRecentSearch(transcript);
        setRecentSearches(getRecentSearches());
        setTimeout(() => setVoiceNotice(null), 2500);
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        setVoiceNotice(`Voice capture error: ${e.error || 'Check microphone permission'}`);
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setVoiceNotice('Microphone access unavailable in this environment.');
      setTimeout(() => setVoiceNotice(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        const selected = suggestions[selectedIndex];
        onChange(selected.name);
        onSearchSubmit(selected.name);
        saveRecentSearch(selected.name);
        setRecentSearches(getRecentSearches());
        if (onSelectSuggestion) onSelectSuggestion(selected);
        setIsFocused(false);
      } else {
        if (value.trim()) {
          saveRecentSearch(value.trim());
          setRecentSearches(getRecentSearches());
          onSearchSubmit(value.trim());
        }
        setIsFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleSelectRecent = (q: string) => {
    onChange(q);
    onSearchSubmit(q);
    saveRecentSearch(q);
    setRecentSearches(getRecentSearches());
    setIsFocused(false);
  };

  const handleRemoveRecent = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(q);
    setRecentSearches(updated);
  };

  const handleClearAllRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const showDropdown = isFocused;

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      {/* Main Input Bar */}
      <div
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border transition-all duration-200 shadow-sm ${
          isFocused
            ? 'border-[#D9531E] ring-2 ring-[#D9531E]/20 shadow-md'
            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
        }`}
      >
        <Search className={`w-5 h-5 shrink-0 ${isFocused ? 'text-[#D9531E]' : 'text-stone-400'}`} />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent border-none outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm font-medium"
        />

        {/* Clear Query */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          className={`p-1.5 rounded-xl transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
          title={isListening ? 'Listening...' : 'Voice Search'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Advanced Filters Button */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilterCount > 0
                ? 'bg-[#D9531E] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#D9531E] text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Voice Notification Banner */}
      {voiceNotice && (
        <div className="absolute top-full left-0 right-0 mt-2 z-40 px-4 py-2 bg-stone-900 text-white text-xs rounded-xl shadow-lg border border-stone-800 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* Suggestions / Recent / Trending Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn max-h-[75vh] overflow-y-auto">
          {/* If typing & loading */}
          {isLoadingSuggestions && (
            <div className="p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#D9531E] border-t-transparent rounded-full animate-spin" />
              <span>Finding verified destinations, stays & attractions...</span>
            </div>
          )}

          {/* Suggestions List when query exists */}
          {value.trim() && suggestions.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Matching Suggestions
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.name);
                    onSearchSubmit(item.name);
                    saveRecentSearch(item.name);
                    setRecentSearches(getRecentSearches());
                    if (onSelectSuggestion) onSelectSuggestion(item);
                    setIsFocused(false);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-3 text-left transition-colors ${
                    selectedIndex === idx
                      ? 'bg-stone-100 dark:bg-stone-800'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                        {item.name}
                      </span>
                      {item.dataClassification === DataClassification.VERIFIED && (
                        <span title="Verified by State/National Tourism Authority" className="inline-flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1 truncate">
                      <span className="capitalize">{item.type}</span>
                      <span>•</span>
                      <span>{item.city}, {item.state}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* No results for query */}
          {value.trim() && !isLoadingSuggestions && suggestions.length === 0 && (
            <div className="p-5 text-center space-y-1">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                No direct match for "{value}"
              </p>
              <p className="text-[11px] text-stone-500">
                Press Enter to search all states, culinary trails, and regional attractions.
              </p>
            </div>
          )}

          {/* Recent Searches (when query empty or focused) */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-t border-stone-100 dark:border-stone-800/80">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-stone-400" />
                  <span>Recent Searches</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearAllRecents}
                  className="text-[10px] text-stone-400 hover:text-rose-500 transition-colors"
                >
                  Clear history
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((query) => (
                  <span
                    key={query}
                    onClick={() => handleSelectRecent(query)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer transition-colors"
                  >
                    <span>{query}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecent(e, query)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="p-3 bg-stone-50/70 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800/80">
            <div className="px-1 mb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#D9531E]" />
              <span>Trending Across India</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TRENDING_SEARCHES.slice(0, 6).map((trend) => (
                <button
                  key={trend}
                  type="button"
                  onClick={() => handleSelectRecent(trend)}
                  className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-[#D9531E] hover:text-[#D9531E] transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{trend}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
