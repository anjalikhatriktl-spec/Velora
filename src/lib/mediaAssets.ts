import heroImg from '../assets/images/velora_hero_bottle_1794827946315.jpg';
import atelierImg from '../assets/images/atelier_brand_story_1794650661993.jpg';
import campaignImg from '../assets/images/velora_campaign_banner_1794827946589.jpg';
import lavenderImg from '../assets/images/ingredient_lavender_blossom_1794650663945.jpg';
import marigoldImg from '../assets/images/velora_marigold_radiance_1794827954801.jpg';
import violetImg from '../assets/images/ingredient_violet_harmony_1794650663747.jpg';
import sapphireImg from '../assets/images/ingredient_sapphire_symphony_1794650664611.jpg';
import mirageImg from '../assets/images/velora_enchanted_mirage_1794827947497.jpg';
import elixirImg from '../assets/images/velora_radiant_elixir_1794827950490.jpg';
import celestialImg from '../assets/images/velora_celestial_serenity_1794827949328.jpg';
import orchidImg from '../assets/images/velora_opulent_orchid_1794827950136.jpg';
import midnightImg from '../assets/images/velora_midnight_whispers_1794827952306.jpg';
import velvetImg from '../assets/images/velora_velvet_enigma_1794827951846.jpg';
import goldenAuraImg from '../assets/images/velora_golden_aura_1794827953454.jpg';
import royalEssenceImg from '../assets/images/velora_royal_essence_1794827953608.jpg';

export const ASSET_KEY_MAP: Record<string, string> = {
  'asset:hero': heroImg,
  'asset:atelier': atelierImg,
  'asset:campaign': campaignImg,
  'asset:lavender': lavenderImg,
  'asset:marigold': marigoldImg,
  'asset:violet': violetImg,
  'asset:sapphire': sapphireImg,
  'asset:velora-enchanted-mirage': mirageImg,
  'asset:velora-radiant-elixir': elixirImg,
  'asset:velora-celestial-serenity': celestialImg,
  'asset:velora-opulent-orchid': orchidImg,
  'asset:velora-midnight-whispers': midnightImg,
  'asset:velora-velvet-enigma': velvetImg,
  'asset:velora-golden-aura': goldenAuraImg,
  'asset:velora-royal-essence': royalEssenceImg,
  'asset:midnight': midnightImg,
};

export const GALLERY_ASSET_CHOICES: { key: string; label: string; preview: string }[] = [
  { key: 'asset:velora-enchanted-mirage', label: 'VELORA Enchanted Mirage', preview: mirageImg },
  { key: 'asset:velora-radiant-elixir', label: 'VELORA Radiant Elixir', preview: elixirImg },
  { key: 'asset:velora-celestial-serenity', label: 'VELORA Celestial Serenity', preview: celestialImg },
  { key: 'asset:velora-opulent-orchid', label: 'VELORA Opulent Orchid', preview: orchidImg },
  { key: 'asset:velora-midnight-whispers', label: 'VELORA Midnight Whispers', preview: midnightImg },
  { key: 'asset:velora-velvet-enigma', label: 'VELORA Velvet Enigma', preview: velvetImg },
  { key: 'asset:velora-golden-aura', label: 'VELORA Golden Aura', preview: goldenAuraImg },
  { key: 'asset:velora-royal-essence', label: 'VELORA Royal Essence', preview: royalEssenceImg },
  { key: 'asset:hero', label: 'Hero Crystal Flacon', preview: heroImg },
  { key: 'asset:campaign', label: 'Mediterranean Campaign', preview: campaignImg },
  { key: 'asset:atelier', label: 'Perfumery Workbench', preview: atelierImg },
];

export function resolveMediaUrl(src?: string | null): string {
  if (!src) return mirageImg;
  if (ASSET_KEY_MAP[src]) return ASSET_KEY_MAP[src];
  return src;
}
