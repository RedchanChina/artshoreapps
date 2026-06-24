import { imageUrl } from '../lib/image';

export interface Product {
  id: string;
  category: 'photography' | 'illustration';
  artist: { zh: string; en: string };
  title: { zh: string; en: string };
  categoryLabel: { zh: string; en: string };
  edition: { zh: string; en: string };
  priceCNY: number;
  priceUSD: number;
  sold: number;
  total: number;
  mainImage: string;
  sceneImage: string;
  aspectRatio: 'square';
}

const PHOTO_LABEL = { zh: '摄影', en: 'Photography' };
const ILLUS_LABEL = { zh: '插画', en: 'Illustration' };

const editionOf = (total: number) => ({
  zh: `限定 ${total} 版`,
  en: `Edition of ${total}`,
});

export const PRODUCTS: Product[] = [
  // ==================== 摄影 ====================
  {
    id: 'morning-mist',
    category: 'photography',
    artist: { zh: '陈墨白', en: 'Chen Mobai' },
    title: { zh: '晨雾', en: 'Morning Mist' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(99),
    priceCNY: 1280,
    priceUSD: 177.99,
    sold: 23,
    total: 99,
    mainImage: imageUrl(
      'framed Morning Mist fog photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'art print on white wall, Scandinavian interior, natural light, Morning Mist artwork',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'silent-afternoon',
    category: 'photography',
    artist: { zh: '苏雨晴', en: 'Su Yuqing' },
    title: { zh: '无声的午后', en: 'Silent Afternoon' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(30),
    priceCNY: 2460,
    priceUSD: 341.99,
    sold: 8,
    total: 30,
    mainImage: imageUrl(
      'framed Silent Afternoon photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'framed photo in modern living room, warm afternoon light, Silent Afternoon on wall',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'urban-texture',
    category: 'photography',
    artist: { zh: '周野', en: 'Zhou Ye' },
    title: { zh: '城市纹理', en: 'Urban Texture' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(200),
    priceCNY: 1580,
    priceUSD: 219.99,
    sold: 45,
    total: 200,
    mainImage: imageUrl(
      'framed Urban Texture photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'contemporary loft with Urban Texture photo on wall, industrial interior, natural light',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'folds-of-light',
    category: 'photography',
    artist: { zh: '林见微', en: 'Lin Jianwei' },
    title: { zh: '光的褶皱', en: 'Folds of Light' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(20),
    priceCNY: 3200,
    priceUSD: 444.99,
    sold: 5,
    total: 20,
    mainImage: imageUrl(
      'framed Folds of Light photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'elegant dining room with Folds of Light photo, warm ambient light, curated interior',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'coastline',
    category: 'photography',
    artist: { zh: '陈墨白', en: 'Chen Mobai' },
    title: { zh: '海岸线', en: 'Coastline' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(50),
    priceCNY: 3680,
    priceUSD: 511.99,
    sold: 8,
    total: 50,
    mainImage: imageUrl(
      'framed Coastline photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'coastal home with Coastline photo on wall, white and wood tones, serene atmosphere',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'room-of-memory',
    category: 'photography',
    artist: { zh: '苏雨晴', en: 'Su Yuqing' },
    title: { zh: '记忆的房间', en: 'Room of Memory' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(100),
    priceCNY: 1580,
    priceUSD: 219.99,
    sold: 45,
    total: 100,
    mainImage: imageUrl(
      'framed Room of Memory photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'bedroom with Room of Memory photo above bed, soft linen, warm neutral tones',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'northern-mountains',
    category: 'photography',
    artist: { zh: '梁川', en: 'Liang Chuan' },
    title: { zh: '北方的山', en: 'Northern Mountains' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(99),
    priceCNY: 1180,
    priceUSD: 163.99,
    sold: 99,
    total: 99,
    mainImage: imageUrl(
      'framed Northern Mountains photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'minimalist study with Northern Mountains photo, wooden desk, quiet atmosphere',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'spring-equinox',
    category: 'photography',
    artist: { zh: '苏雨晴', en: 'Su Yuqing' },
    title: { zh: '春分', en: 'Spring Equinox' },
    categoryLabel: PHOTO_LABEL,
    edition: editionOf(30),
    priceCNY: 2280,
    priceUSD: 316.99,
    sold: 6,
    total: 30,
    mainImage: imageUrl(
      'framed Spring Equinox photograph on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'bright entryway with Spring Equinox photo, spring flowers, natural light',
      'square'
    ),
    aspectRatio: 'square',
  },
  // ==================== 插画 ====================
  {
    id: 'still-life-no-7',
    category: 'illustration',
    artist: { zh: '顾安然', en: 'Gu Anran' },
    title: { zh: '静物 No.7', en: 'Still Life No.7' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(200),
    priceCNY: 980,
    priceUSD: 136.99,
    sold: 50,
    total: 200,
    mainImage: imageUrl(
      'framed Still Life No.7 illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'modern kitchen with Still Life No.7 on wall, ceramic objects, warm tones',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'night-walker',
    category: 'illustration',
    artist: { zh: '陈墨白', en: 'Chen Mobai' },
    title: { zh: '夜行者', en: 'Night Walker' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(50),
    priceCNY: 1680,
    priceUSD: 233.99,
    sold: 12,
    total: 50,
    mainImage: imageUrl(
      'framed Night Walker illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'moody hallway with Night Walker illustration, dark wall, dramatic lighting',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'flowers-and-butterfly',
    category: 'illustration',
    artist: { zh: '周野', en: 'Zhou Ye' },
    title: { zh: '花与蝶', en: 'Flowers & Butterfly' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(80),
    priceCNY: 1280,
    priceUSD: 177.99,
    sold: 15,
    total: 80,
    mainImage: imageUrl(
      'framed Flowers and Butterfly illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'bedroom with Flowers and Butterfly illustration, soft pastel bedding, gentle light',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'blue-mood',
    category: 'illustration',
    artist: { zh: '顾安然', en: 'Gu Anran' },
    title: { zh: '蓝调', en: 'Blue Mood' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(100),
    priceCNY: 1580,
    priceUSD: 219.99,
    sold: 28,
    total: 100,
    mainImage: imageUrl(
      'framed Blue Mood illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'reading nook with Blue Mood illustration, blue accent cushions, cozy atmosphere',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'between-mountains',
    category: 'illustration',
    artist: { zh: '梁川', en: 'Liang Chuan' },
    title: { zh: '山间', en: 'Between Mountains' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(60),
    priceCNY: 1980,
    priceUSD: 274.99,
    sold: 10,
    total: 60,
    mainImage: imageUrl(
      'framed Between Mountains illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'zen living room with Between Mountains illustration, natural wood, minimalist decor',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'abstract-composition',
    category: 'illustration',
    artist: { zh: '周野', en: 'Zhou Ye' },
    title: { zh: '抽象构成', en: 'Abstract Composition' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(30),
    priceCNY: 2180,
    priceUSD: 302.99,
    sold: 5,
    total: 30,
    mainImage: imageUrl(
      'framed Abstract Composition illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'modern office with Abstract Composition illustration, clean desk, professional atmosphere',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'goldfish',
    category: 'illustration',
    artist: { zh: '林见微', en: 'Lin Jianwei' },
    title: { zh: '金鱼', en: 'Goldfish' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(80),
    priceCNY: 1680,
    priceUSD: 233.99,
    sold: 18,
    total: 80,
    mainImage: imageUrl(
      'framed Goldfish illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'bathroom with Goldfish illustration, white tiles, subtle warmth',
      'square'
    ),
    aspectRatio: 'square',
  },
  {
    id: 'ukiyo',
    category: 'illustration',
    artist: { zh: '顾安然', en: 'Gu Anran' },
    title: { zh: '浮世', en: 'Ukiyo' },
    categoryLabel: ILLUS_LABEL,
    edition: editionOf(75),
    priceCNY: 1480,
    priceUSD: 205.99,
    sold: 22,
    total: 75,
    mainImage: imageUrl(
      'framed Ukiyo illustration on clean white wall, soft shadow, gallery presentation, 1:1 square composition',
      'square'
    ),
    sceneImage: imageUrl(
      'living room with Ukiyo illustration on wall, warm tones, curated interior',
      'square'
    ),
    aspectRatio: 'square',
  },
];

export const PHOTOGRAPHY_PRODUCTS: Product[] = PRODUCTS.filter(
  (p) => p.category === 'photography'
);

export const ILLUSTRATION_PRODUCTS: Product[] = PRODUCTS.filter(
  (p) => p.category === 'illustration'
);
