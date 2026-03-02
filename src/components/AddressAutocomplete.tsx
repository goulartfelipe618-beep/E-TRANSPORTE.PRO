import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useGlobalConfig } from "@/contexts/GlobalConfigContext";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  id: string;
  place_name: string;
}

export default function AddressAutocomplete({ value, onChange, placeholder, className }: AddressAutocompleteProps) {
  const { mapProvider, mapApiKey } = useGlobalConfig();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !mapApiKey) {
      setSuggestions([]);
      return;
    }

    try {
      if (mapProvider === "mapbox") {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapApiKey}&language=pt-BR&country=BR&limit=5`
        );
        const data = await res.json();
        setSuggestions(
          (data.features || []).map((f: any) => ({ id: f.id, place_name: f.place_name }))
        );
      } else if (mapProvider === "google") {
        // Google Places Autocomplete via session proxy not available client-side without SDK
        // Use the simple geocoding approach
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${mapApiKey}&language=pt-BR&region=br`
        );
        const data = await res.json();
        setSuggestions(
          (data.results || []).slice(0, 5).map((r: any) => ({ id: r.place_id, place_name: r.formatted_address }))
        );
      }
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    }
  }, [mapProvider, mapApiKey]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (place: string) => {
    setInputValue(place);
    onChange(place);
    setShowDropdown(false);
    setSuggestions([]);
  };

  if (!mapApiKey) {
    return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />;
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder || "Digite o endereço..."}
        className={className}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-start gap-2 transition-colors"
              onClick={() => handleSelect(s.place_name)}
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span>{s.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
