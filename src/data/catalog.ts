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

import {
  BlogArticle,
  GalleryItem,
  IngredientCard,
  Product,
  Testimonial,
} from '../types';

export const BRAND_MEDIA = {
  hero: heroImg,
  atelier: atelierImg,
  campaign: campaignImg,
  experience: royalEssenceImg,
  lavender: lavenderImg,
  marigold: marigoldImg,
  violet: violetImg,
  sapphire: sapphireImg,
};

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const PRODUCTS: Product[] = [
  {
    id: 'velora-enchanted-mirage',
    slug: 'velora-enchanted-mirage',
    name: 'VELORA Enchanted Mirage',
    subtitle: 'Blush Damascus Rose & White Amber',
    category: 'Floral',
    concentration: 'Eau de Parfum',
    shortDescription:
      'Luminous Damascus rose petals layered over warm cashmere wood and translucent white amber.',
    description:
      'VELORA Enchanted Mirage opens with sun-warmed pink peppercorn and crisp Sicilian bergamot before revealing a heart of hand-harvested Damascus rose and Florentine iris butter. It settles into an intimate veil of white amber, cashmere wood, and sheer musk that lingers from dawn until evening.',
    price: 2899,
    originalPrice: 3499,
    rating: 4.9,
    reviewCount: 148,
    featured: true,
    inCollectionCarousel: true,
    tag: 'Signature Edition',
    image: mirageImg,
    gallery: [mirageImg, heroImg, atelierImg],
    volumes: [
      { volume: '30ml', price: 1899, originalPrice: 2299 },
      { volume: '50ml', price: 2899, originalPrice: 3499 },
      { volume: '100ml', price: 4399, originalPrice: 4999 },
    ],
    notes: {
      top: ['Sicilian Bergamot', 'Pink Peppercorn', 'White Pear'],
      heart: ['Damascus Rose', 'Florentine Iris', 'Peony Silk'],
      base: ['White Amber', 'Cashmere Wood', 'Skin Musk'],
    },
    longevity: '8 – 10 Hours',
    sillage: 'Moderate to Intimate',
    origin: 'Macerated in Grasse, Crafted for India',
  },
  {
    id: 'velora-radiant-elixir',
    slug: 'velora-radiant-elixir',
    name: 'VELORA Radiant Elixir',
    subtitle: 'Golden Marigold, Wild Honey & Saffron',
    category: 'Oriental',
    concentration: 'Extrait de Parfum',
    shortDescription:
      'Sunlit golden marigold and wild acacia honey infused with warm Kashmiri saffron and benzoin.',
    description:
      'VELORA Radiant Elixir captures the glow of golden-hour sunlight spilling across sandstone arches. Golden marigold blossoms intertwine with delicate saffron threads and raw acacia honey, resting on a resinous foundation of Siam benzoin and Madagascar vanilla bean.',
    price: 3499,
    originalPrice: 4199,
    rating: 4.9,
    reviewCount: 112,
    featured: true,
    inCollectionCarousel: true,
    tag: 'Bestseller',
    image: elixirImg,
    gallery: [elixirImg, campaignImg, marigoldImg],
    volumes: [
      { volume: '30ml', price: 2199, originalPrice: 2599 },
      { volume: '50ml', price: 3499, originalPrice: 4199 },
      { volume: '100ml', price: 4999 },
    ],
    notes: {
      top: ['Golden Marigold', 'Kashmiri Saffron', 'Mandarin Zest'],
      heart: ['Wild Acacia Honey', 'Orange Blossom', 'Cinnamon Bark'],
      base: ['Siam Benzoin', 'Roasted Tonka', 'Amber Resin'],
    },
    longevity: '10 – 12 Hours',
    sillage: 'Radiant & Enveloping',
    origin: 'Small-Batch Botanical Extraction',
  },
  {
    id: 'velora-celestial-serenity',
    slug: 'velora-celestial-serenity',
    name: 'VELORA Celestial Serenity',
    subtitle: 'Calabrian Bergamot, White Tea & Cedar',
    category: 'Fresh',
    concentration: 'Eau de Parfum',
    shortDescription:
      'Crisp bergamot dew and silver needle white tea balanced by mineral musk and Atlas cedar.',
    description:
      'Designed for effortless clarity, VELORA Celestial Serenity pairs chilled Calabrian bergamot and crushed neroli leaves with steamed silver-needle white tea. A clean breeze of blue lotus and blonde Atlas cedarwood leaves an airy, architectural trail on skin and linen.',
    price: 1999,
    originalPrice: 2499,
    rating: 4.8,
    reviewCount: 96,
    featured: true,
    inCollectionCarousel: true,
    tag: 'Morning Ritual',
    image: celestialImg,
    gallery: [celestialImg, heroImg, sapphireImg],
    volumes: [
      { volume: '30ml', price: 999, originalPrice: 1299 },
      { volume: '50ml', price: 1999, originalPrice: 2499 },
      { volume: '100ml', price: 3199, originalPrice: 3699 },
    ],
    notes: {
      top: ['Calabrian Bergamot', 'Crushed Neroli', 'Dewy Verbena'],
      heart: ['Silver Needle Tea', 'Blue Lotus', 'Lavender Mist'],
      base: ['Atlas Cedar', 'Mineral Musk', 'Vetiver Root'],
    },
    longevity: '6 – 8 Hours',
    sillage: 'Clean & Airy',
    origin: 'Cold-Pressed Citrus Accord',
  },
  {
    id: 'velora-opulent-orchid',
    slug: 'velora-opulent-orchid',
    name: 'VELORA Opulent Orchid',
    subtitle: 'Night-Blooming Orchid, Plum & Patchouli',
    category: 'Floral',
    concentration: 'Eau de Parfum',
    shortDescription:
      'Velvety dark orchid and spiced black plum wrapped in Indonesian patchouli and smoked vanilla.',
    description:
      'VELORA Opulent Orchid is an ode to twilight botanical gardens. Rich black plum and cardamom open into a hypnotic heart of night-blooming orchid and violet leaf, grounded by aged Indonesian patchouli and dark cacao absolute.',
    price: 3299,
    originalPrice: 3899,
    rating: 4.9,
    reviewCount: 134,
    featured: true,
    inCollectionCarousel: true,
    tag: 'Evening Reserve',
    image: orchidImg,
    gallery: [orchidImg, violetImg, atelierImg],
    volumes: [
      { volume: '30ml', price: 2099, originalPrice: 2499 },
      { volume: '50ml', price: 3299, originalPrice: 3899 },
      { volume: '100ml', price: 4799 },
    ],
    notes: {
      top: ['Spiced Black Plum', 'Green Cardamom', 'Bergamot Peel'],
      heart: ['Black Orchid', 'Violet Leaf', 'Jasmine Sambac'],
      base: ['Aged Patchouli', 'Smoked Vanilla', 'Cacao Absolute'],
    },
    longevity: '10+ Hours',
    sillage: 'Rich & Memorable',
    origin: 'Slow-Aged 90 Days in Oak',
  },
  {
    id: 'velora-midnight-whispers',
    slug: 'velora-midnight-whispers',
    name: 'VELORA Midnight Whispers',
    subtitle: 'Smoked Oud, Black Pepper & Mysore Sandalwood',
    category: 'Woody',
    concentration: 'Extrait de Parfum',
    shortDescription:
      'Smoked agarwood and roasted black pepper anchored by creamy Mysore sandalwood and labdanum.',
    description:
      'Crafted at 28% parfum concentration, VELORA Midnight Whispers balances architectural restraint with smoldering depth. Crushed black peppercorn and juniper berry illuminate rare aged oud and creamy Mysore sandalwood, leaving a magnetic dry-down.',
    price: 3999,
    originalPrice: 4699,
    rating: 5.0,
    reviewCount: 89,
    featured: true,
    inCollectionCarousel: true,
    tag: 'Limited Reserve',
    image: midnightImg,
    gallery: [midnightImg, atelierImg, campaignImg],
    volumes: [
      { volume: '30ml', price: 2499, originalPrice: 2899 },
      { volume: '50ml', price: 3999, originalPrice: 4699 },
      { volume: '100ml', price: 4999 },
    ],
    notes: {
      top: ['Black Peppercorn', 'Juniper Berry', 'Elemi Resin'],
      heart: ['Smoked Oud', 'Guaiac Wood', 'Turkish Rose'],
      base: ['Mysore Sandalwood', 'Cistus Labdanum', 'Dark Leather'],
    },
    longevity: '12+ Hours',
    sillage: 'Commanding & Refined',
    origin: '28% Extrait Concentration',
  },
  {
    id: 'velora-velvet-enigma',
    slug: 'velora-velvet-enigma',
    name: 'VELORA Velvet Enigma',
    subtitle: 'Cognac Amber, Roasted Tonka & Cedarwood',
    category: 'Oriental',
    concentration: 'Eau de Parfum',
    shortDescription:
      'Spiced cognac amber and warm cedarwood smoothed with velvety tonka bean and toasted almond.',
    description:
      'VELORA Velvet Enigma wraps the wearer like spun cashmere on a cool evening. Opening with caramelized fig and nutmeg, it unfolds into warm cognac-tinted amber, smoked cedarwood, and velvety roasted tonka bean.',
    price: 2699,
    originalPrice: 3199,
    rating: 4.8,
    reviewCount: 103,
    featured: true,
    inCollectionCarousel: true,
    tag: 'Autumn Favorite',
    image: velvetImg,
    gallery: [velvetImg, heroImg, campaignImg],
    volumes: [
      { volume: '30ml', price: 1599, originalPrice: 1899 },
      { volume: '50ml', price: 2699, originalPrice: 3199 },
      { volume: '100ml', price: 4199, originalPrice: 4699 },
    ],
    notes: {
      top: ['Caramelized Fig', 'Grated Nutmeg', 'Bitter Almond'],
      heart: ['Cognac Accord', 'Ceylon Cinnamon', 'Dried Violet'],
      base: ['Golden Amber', 'Virginia Cedar', 'Roasted Tonka'],
    },
    longevity: '9 – 11 Hours',
    sillage: 'Warm & Velvety',
    origin: 'Artisanal Amber Maceration',
  },
  {
    id: 'velora-golden-aura',
    slug: 'velora-golden-aura',
    name: 'VELORA Golden Aura',
    subtitle: 'Neroli Blossom, White Fig & Sunlit Musk',
    category: 'Fresh',
    concentration: 'Eau de Parfum',
    shortDescription:
      'Sun-drenched Tunisian neroli and crisp Mediterranean fig leaf over warm champagne musk.',
    description:
      'VELORA Golden Aura radiates effortless poise from first spritz to golden dusk. Luminous neroli blossom, crushed petitgrain, and white fig melt seamlessly into warm skin musk and golden ambrette seed.',
    price: 2299,
    originalPrice: 2799,
    rating: 4.8,
    reviewCount: 74,
    featured: false,
    inCollectionCarousel: true,
    tag: 'Radiance Edition',
    image: goldenAuraImg,
    gallery: [goldenAuraImg, campaignImg, lavenderImg],
    volumes: [
      { volume: '30ml', price: 1299, originalPrice: 1599 },
      { volume: '50ml', price: 2299, originalPrice: 2799 },
      { volume: '100ml', price: 3599 },
    ],
    notes: {
      top: ['Tunisian Neroli', 'White Fig Leaf', 'Mandarin Blossom'],
      heart: ['Orange Flower', 'Sunlit Mimosa', 'Jasmine Petal'],
      base: ['Champagne Musk', 'Ambrette Seed', 'Blonde Cedar'],
    },
    longevity: '8 – 9 Hours',
    sillage: 'Luminous & Balanced',
    origin: 'Sun-Cured Citrus Extraction',
  },
  {
    id: 'velora-royal-essence',
    slug: 'velora-royal-essence',
    name: 'VELORA Royal Essence',
    subtitle: 'Sacred Sandalwood, Cardamom & Gold Amber',
    category: 'Woody',
    concentration: 'Extrait de Parfum',
    shortDescription:
      'Creamy Mysore sandalwood and crushed green cardamom crowned with rare iris and golden amber.',
    description:
      'The jewel of the house, VELORA Royal Essence celebrates timeless sophistication. Sustainably harvested Mysore sandalwood meets aromatic green cardamom, powdery Florentine iris, and warm ambergris.',
    price: 3799,
    originalPrice: 4399,
    rating: 4.9,
    reviewCount: 91,
    featured: false,
    inCollectionCarousel: true,
    tag: 'Heritage Extrait',
    image: royalEssenceImg,
    gallery: [royalEssenceImg, heroImg, midnightImg],
    volumes: [
      { volume: '30ml', price: 2399, originalPrice: 2799 },
      { volume: '50ml', price: 3799, originalPrice: 4399 },
      { volume: '100ml', price: 4999 },
    ],
    notes: {
      top: ['Green Cardamom', 'Italian Bergamot', 'Saffron Mist'],
      heart: ['Florentine Iris', 'Royal Rose', 'Cypress Heart'],
      base: ['Mysore Sandalwood', 'Golden Amber', 'Velvet Vetiver'],
    },
    longevity: '11 – 12 Hours',
    sillage: 'Regal & Sculptural',
    origin: 'Flagship Extrait Collection',
  },
];

export const INGREDIENTS: IngredientCard[] = [
  {
    id: 'lavender-blossom',
    name: 'Lavender Blossom',
    botanicalName: 'Lavandula angustifolia',
    origin: 'High-Altitude Provence',
    category: 'Fresh',
    description:
      'Hand-cut at sunrise to preserve crisp herbaceous clarity and calming floral facets.',
    image: lavenderImg,
  },
  {
    id: 'marigold-radiance',
    name: 'Marigold Radiance',
    botanicalName: 'Tagetes erecta',
    origin: 'Nashik & Deccan Plateau',
    category: 'Oriental',
    description:
      'Sun-drenched golden petals offering warm honeyed spice and luminous resinous depth.',
    image: marigoldImg,
  },
  {
    id: 'violet-harmony',
    name: 'Violet Harmony',
    botanicalName: 'Viola odorata',
    origin: 'Grasse & Nilgiri Hills',
    category: 'Floral',
    description:
      'Powdery iris-kissed petals balanced with fresh green leaf for velvety floral poise.',
    image: violetImg,
  },
  {
    id: 'sapphire-symphony',
    name: 'Sapphire Symphony',
    botanicalName: 'Citrus bergamia & Nymphaea',
    origin: 'Calabria & Coastal Estates',
    category: 'Fresh',
    description:
      'Cold-pressed bergamot rind and aqueous blue lotus creating effortless luminous lift.',
    image: sapphireImg,
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'VELORA Enchanted Mirage',
    category: 'Floral',
    caption: 'Damascus rose & white amber captured in sculpted crystal.',
    image: mirageImg,
    aspect: 'tall',
    productId: 'velora-enchanted-mirage',
  },
  {
    id: 'gal-2',
    title: 'VELORA Royal Essence',
    category: 'Woody',
    caption: 'Mysore sandalwood and golden amber in brushed brass crystal.',
    image: royalEssenceImg,
    aspect: 'tall',
    productId: 'velora-royal-essence',
  },
  {
    id: 'gal-3',
    title: 'VELORA Radiant Elixir',
    category: 'Oriental',
    caption: 'Fluted amber crystal catching late afternoon warmth.',
    image: elixirImg,
    aspect: 'square',
    productId: 'velora-radiant-elixir',
  },
  {
    id: 'gal-4',
    title: 'VELORA Golden Aura',
    category: 'Fresh',
    caption: 'Sunlit Tunisian neroli and white fig in octagonal crystal.',
    image: goldenAuraImg,
    aspect: 'square',
    productId: 'velora-golden-aura',
  },
  {
    id: 'gal-5',
    title: 'VELORA Midnight Whispers',
    category: 'Woody',
    caption: 'Obsidian extrait flacon resting on charcoal travertine.',
    image: midnightImg,
    aspect: 'tall',
    productId: 'velora-midnight-whispers',
  },
  {
    id: 'gal-6',
    title: 'VELORA Opulent Orchid',
    category: 'Floral',
    caption: 'Plum-amber crystal crowned with faceted onyx and gold.',
    image: orchidImg,
    aspect: 'square',
    productId: 'velora-opulent-orchid',
  },
  {
    id: 'gal-7',
    title: 'VELORA Velvet Enigma',
    category: 'Oriental',
    caption: 'Warm cognac amber aged in small numbered lots.',
    image: velvetImg,
    aspect: 'tall',
    productId: 'velora-velvet-enigma',
  },
  {
    id: 'gal-8',
    title: 'VELORA Celestial Serenity',
    category: 'Fresh',
    caption: 'Minimalist clarity distilled from white tea and cedar.',
    image: celestialImg,
    aspect: 'square',
    productId: 'velora-celestial-serenity',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Ananya Deshmukh',
    role: 'Architectural Interior Stylist',
    city: 'Mumbai',
    rating: 5,
    quote:
      'VELORA Enchanted Mirage feels unlike anything else on my vanity. Hours after spraying it, guests still ask what soft rose-amber scent lingers in the room.',
    fragrance: 'VELORA Enchanted Mirage · 50ml',
    initials: 'AD',
    avatarImage: mirageImg,
  },
  {
    id: 'test-2',
    name: 'Vikramaditya Rao',
    role: 'Creative Director',
    city: 'Bengaluru',
    rating: 5,
    quote:
      'VELORA Midnight Whispers has remarkable restraint—deep smoked oud and Mysore sandalwood without ever feeling overpowering. It lasts effortlessly past midnight.',
    fragrance: 'VELORA Midnight Whispers · 100ml',
    initials: 'VR',
    avatarImage: midnightImg,
  },
  {
    id: 'test-3',
    name: 'Meera Kapoor',
    role: 'Gallery Curator',
    city: 'New Delhi',
    rating: 5,
    quote:
      'From the ivory VELORA packaging to the dry-down of Radiant Elixir, every detail feels thoughtfully crafted. Celestial Serenity is my daily morning ritual.',
    fragrance: 'VELORA Radiant Elixir · 50ml',
    initials: 'MK',
    avatarImage: elixirImg,
  },
  {
    id: 'test-4',
    name: 'Rohan Malhotra',
    role: 'Hospitality Founder',
    city: 'Jaipur',
    rating: 5,
    quote:
      'VELORA Velvet Enigma balances warm cognac spice and cedar with true international polish. The packaging and Cash on Delivery experience were seamless.',
    fragrance: 'VELORA Velvet Enigma · 50ml',
    initials: 'RM',
    avatarImage: velvetImg,
  },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'art-maceration',
    slug: 'the-quiet-alchemy-of-slow-maceration',
    title: 'The Quiet Alchemy of Slow Botanical Maceration',
    category: 'Craftsmanship',
    date: 'October 28, 2026',
    readTime: '5 min read',
    author: 'Claire Beaumont, Master Perfumer',
    excerpt:
      'Why resting rare flower absolutes and aged woods for ninety days transforms sharp notes into a seamless VELORA liquid veil.',
    content: [
      'True perfumery refuses to be hurried. When essential oils, resinoids, and botanical absolutes first meet organic grape alcohol, their individual characters remain distinct—sometimes bright, sometimes untamed.',
      'At VELORA, every small-batch composition rests in temperature-controlled dark glass vessels for up to ninety days. During this quiet maceration window, volatile citrus molecules harmonize with heavier woods like Mysore sandalwood and aged patchouli.',
      'The result on skin is unmistakable: instead of a fleeting top note that vanishes in twenty minutes, every VELORA fragrance unfolds in calm, continuous chapters from morning light through late evening.',
    ],
    image: atelierImg,
  },
  {
    id: 'art-layering',
    slug: 'composing-your-signature-scent-wardrobe',
    title: 'Composing Your Signature Scent Wardrobe by Season',
    category: 'Fragrance Rituals',
    date: 'October 14, 2026',
    readTime: '4 min read',
    author: 'Nandini Verma, Olfactory Archivist',
    excerpt:
      'How humidity, skin chemistry, and linen texture shape the projection of VELORA fresh citrus versus resinous amber extraits.',
    content: [
      'Humidity amplifies every molecule on the skin. During sunlit summer mornings, crisp cold-pressed bergamot and silver-needle white tea in VELORA Celestial Serenity or Golden Aura deliver immediate clarity without heaviness.',
      'As twilight cools or indoor spaces transition into evening gatherings, deeper accords such as VELORA Opulent Orchid or Velvet Enigma bloom slowly with body heat, releasing spiced plum, roasted tonka, and smoked vanilla.',
      'For subtle sophistication, misting VELORA Royal Essence once onto a woven silk scarf or cashmere lapel preserves delicate floral heart notes long after skin evaporation.',
    ],
    image: campaignImg,
  },
  {
    id: 'art-botanicals',
    slug: 'from-high-altitude-lavender-to-gold-marigold',
    title: 'From High-Altitude Lavender to Sunlit Marigold',
    category: 'Ingredients',
    date: 'September 29, 2026',
    readTime: '6 min read',
    author: 'Arjun Deshpande, Botanical Sourcing',
    excerpt:
      'Inside VELORA harvest partnerships connecting Provençal lavender fields with heirloom marigold estates across India.',
    content: [
      'Every iconic VELORA bottle begins in soil, altitude, and harvest timing. High-altitude Provençal lavender cut just after dawn yields a cleaner, less camphoraceous oil rich in natural linalyl acetate.',
      'Meanwhile, heirloom marigold blossoms cultivated across the Deccan Plateau bring an unexpected golden warmth—herbaceous at first breath, then richly honeyed as the sun-dried petals are extracted.',
      'By pairing European floral architecture with Indian sandalwood, saffron, and marigold heritage, every VELORA composition carries a distinct sense of timeless elegance.',
    ],
    image: marigoldImg,
  },
];
