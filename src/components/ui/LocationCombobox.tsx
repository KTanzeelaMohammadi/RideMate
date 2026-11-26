import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin, Plus, X } from 'lucide-react';
import { LOCATION_GROUPS } from '../../services/seedData';

interface LocationComboboxProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  iconTone?: 'muted' | 'forest';
}

export function LocationCombobox({
  id,
  value,
  onChange,
  placeholder = 'Search or type a location',
  required = false,
  iconTone = 'muted',
}: LocationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllOnOpen, setShowAllOnOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAllOnOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const query = value.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (showAllOnOpen || !query) {
      return LOCATION_GROUPS;
    }
    return LOCATION_GROUPS.map((group) => ({
      category: group.category,
      locations: group.locations.filter((loc) => loc.toLowerCase().includes(query)),
    })).filter((group) => group.locations.length > 0);
  }, [query, showAllOnOpen]);

  const flatOptions = useMemo(() => {
    const items = filteredGroups.flatMap((g) => g.locations);
    return items;
  }, [filteredGroups]);

  const hasExactMatch = useMemo(() => {
    if (!query) return true;
    return LOCATION_GROUPS.some((g) =>
      g.locations.some((loc) => loc.toLowerCase() === query)
    );
  }, [query]);

  const totalSelectableCount = flatOptions.length + (!hasExactMatch && value.trim() ? 1 : 0);

  const handleSelect = (loc: string) => {
    onChange(loc);
    setIsOpen(false);
    setShowAllOnOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      setHighlightedIndex(0);
      return;
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowAllOnOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalSelectableCount > 0) {
        setHighlightedIndex((prev) => (prev + 1) % totalSelectableCount);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalSelectableCount > 0) {
        setHighlightedIndex((prev) =>
          prev <= 0 ? totalSelectableCount - 1 : prev - 1
        );
      }
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      if (highlightedIndex < flatOptions.length) {
        handleSelect(flatOptions[highlightedIndex]);
      } else if (!hasExactMatch && value.trim()) {
        handleSelect(value.trim());
      }
    }
  };

  let runningIndex = -1;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <MapPin
          className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            iconTone === 'forest' ? 'text-[#244B3B]' : 'text-[#5F665F]'
          }`}
          aria-hidden="true"
        />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          autoComplete="off"
          required={required}
          value={value}
          onFocus={() => {
            setIsOpen(true);
            setShowAllOnOpen(true);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setShowAllOnOpen(false);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#244B3B]/20 bg-white pl-9 pr-14 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setShowAllOnOpen(true);
                setIsOpen(true);
                setHighlightedIndex(-1);
              }}
              aria-label="Clear location"
              className="flex h-7 w-7 items-center justify-center rounded text-[#5F665F] hover:bg-[#EFEAE1] hover:text-[#292D29] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Toggle location options"
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              setShowAllOnOpen(next);
              setHighlightedIndex(-1);
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-[#5F665F] hover:bg-[#EFEAE1] hover:text-[#292D29] transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-40 mt-1.5 w-full max-h-72 overflow-y-auto rounded-xl border border-[#244B3B]/15 bg-[#FCFBF8] py-1.5 shadow-lg"
        >
          {filteredGroups.map((group) => (
            <div key={group.category} className="py-1">
              <div className="px-3.5 py-1 text-[11px] font-semibold tracking-wide text-[#5F665F] bg-[#F7F5EF]/80 border-y border-[#244B3B]/5">
                {group.category}
              </div>
              <div className="py-0.5">
                {group.locations.map((loc) => {
                  runningIndex += 1;
                  const itemIndex = runningIndex;
                  const isSelected = loc.toLowerCase() === query;
                  const isHighlighted = itemIndex === highlightedIndex;
                  return (
                    <button
                      key={loc}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(itemIndex)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(loc);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                        isHighlighted || isSelected
                          ? 'bg-[#DCE7DC]/65 text-[#244B3B] font-medium'
                          : 'text-[#292D29] hover:bg-[#DCE7DC]/40'
                      }`}
                    >
                      <span className="truncate">{loc}</span>
                      {isSelected ? (
                        <span className="text-[11px] text-[#244B3B] shrink-0">Selected</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && !value.trim() ? (
            <div className="px-3.5 py-3 text-xs text-[#5F665F]">
              Type to search locations or enter a custom pickup/destination.
            </div>
          ) : null}

          {!hasExactMatch && value.trim() ? (
            <div className="border-t border-[#244B3B]/10 mt-1 pt-1 px-1.5">
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseEnter={() => setHighlightedIndex(flatOptions.length)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(value.trim());
                }}
                className={`w-full text-left rounded-lg px-2.5 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
                  highlightedIndex === flatOptions.length
                    ? 'bg-[#DCE7DC]/70 text-[#244B3B]'
                    : 'text-[#244B3B] hover:bg-[#DCE7DC]/45'
                }`}
              >
                <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">Use custom location: &ldquo;{value.trim()}&rdquo;</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
