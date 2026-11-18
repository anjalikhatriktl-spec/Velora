import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload } from 'lucide-react';
import { resolveMediaUrl } from '../lib/mediaAssets';

interface ImageUploaderFieldProps {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  presetOptions?: { label: string; value: string }[];
  compact?: boolean;
}

const DEFAULT_PRESETS = [
  { label: 'Enchanted Mirage Bottle', value: 'asset:velora-enchanted-mirage' },
  { label: 'Radiant Elixir Bottle', value: 'asset:velora-radiant-elixir' },
  { label: 'Celestial Serenity Bottle', value: 'asset:velora-celestial-serenity' },
  { label: 'Opulent Orchid Bottle', value: 'asset:velora-opulent-orchid' },
  { label: 'Midnight Whispers Bottle', value: 'asset:velora-midnight-whispers' },
  { label: 'Velvet Enigma Bottle', value: 'asset:velora-velvet-enigma' },
  { label: 'Golden Aura Bottle', value: 'asset:velora-golden-aura' },
  { label: 'Royal Essence Bottle', value: 'asset:velora-royal-essence' },
  { label: 'VELORA Hero Campaign', value: 'asset:hero' },
  { label: 'VELORA Sunset Campaign', value: 'asset:campaign' },
];

export const ImageUploaderField: React.FC<ImageUploaderFieldProps> = ({
  label,
  value,
  onChange,
  presetOptions = DEFAULT_PRESETS,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid PNG, JPG, WEBP, or GIF file.');
      return;
    }
    if (file.size > 4.5 * 1024 * 1024) {
      setError('Image must be under 4.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploading(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            filename: file.name,
            dataUrl: String(reader.result || ''),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Upload failed.');
        }
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to upload image.');
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E]">
        {label}
      </label>
      <div className={`flex ${compact ? 'items-center gap-3' : 'flex-col sm:flex-row sm:items-center gap-3'}`}>
        <div className="w-14 h-16 bg-[#F2ECE4] border border-[#E6DDD1] shrink-0 overflow-hidden flex items-center justify-center">
          {value ? (
            <img
              src={resolveMediaUrl(value)}
              alt={label}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <ImagePlus className="w-5 h-5 text-[#9A7742]" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] disabled:opacity-60 transition-colors text-[11px] uppercase tracking-[0.14em]"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            </button>

            <select
              value={presetOptions.some((p) => p.value === value) ? value : ''}
              onChange={(e) => {
                if (e.target.value) onChange(e.target.value);
              }}
              aria-label={`Select preset for ${label}`}
              className="px-2.5 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs text-[#181614] focus:outline-none focus:border-[#181614]"
            >
              <option value="">Choose VELORA Studio Asset...</option>
              {presetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {!compact && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/uploads/... or asset:velora-enchanted-mirage"
              className="w-full px-3 py-1.5 bg-[#FAF8F4] border border-[#E6DDD1] text-xs text-[#181614] focus:outline-none focus:border-[#181614]"
            />
          )}
          {error && <p className="text-xs text-[#9E352B]">{error}</p>}
        </div>
      </div>
    </div>
  );
};
