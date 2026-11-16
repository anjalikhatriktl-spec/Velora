import type { BottleVolume } from '../types.ts';

export interface ProductPricingEntry {
  id: string;
  name: string;
  volumes: Record<BottleVolume, number>;
}

export const PRODUCT_PRICING: Record<string, ProductPricingEntry> = {
  'velora-enchanted-mirage': {
    id: 'velora-enchanted-mirage',
    name: 'VELORA Enchanted Mirage',
    volumes: { '30ml': 1899, '50ml': 2899, '100ml': 4399 },
  },
  'velora-radiant-elixir': {
    id: 'velora-radiant-elixir',
    name: 'VELORA Radiant Elixir',
    volumes: { '30ml': 2199, '50ml': 3499, '100ml': 4999 },
  },
  'velora-celestial-serenity': {
    id: 'velora-celestial-serenity',
    name: 'VELORA Celestial Serenity',
    volumes: { '30ml': 999, '50ml': 1999, '100ml': 3199 },
  },
  'velora-opulent-orchid': {
    id: 'velora-opulent-orchid',
    name: 'VELORA Opulent Orchid',
    volumes: { '30ml': 2099, '50ml': 3299, '100ml': 4799 },
  },
  'velora-midnight-whispers': {
    id: 'velora-midnight-whispers',
    name: 'VELORA Midnight Whispers',
    volumes: { '30ml': 2499, '50ml': 3999, '100ml': 4999 },
  },
  'velora-velvet-enigma': {
    id: 'velora-velvet-enigma',
    name: 'VELORA Velvet Enigma',
    volumes: { '30ml': 1599, '50ml': 2699, '100ml': 4199 },
  },
  'velora-golden-aura': {
    id: 'velora-golden-aura',
    name: 'VELORA Golden Aura',
    volumes: { '30ml': 1299, '50ml': 2299, '100ml': 3599 },
  },
  'velora-royal-essence': {
    id: 'velora-royal-essence',
    name: 'VELORA Royal Essence',
    volumes: { '30ml': 2399, '50ml': 3799, '100ml': 4999 },
  },
};
