import { imageUrl } from '../lib/image';

export interface Artist {
  id: string;
  name: { zh: string; en: string };
  role: { zh: string; en: string };
  bio: { zh: string; en: string };
  avatar: string;
}

export interface FeaturedArtist extends Artist {
  fullBio: { zh: string; en: string };
}

export const featuredArtist: FeaturedArtist = {
  id: 'lin-jianwei',
  name: { zh: '林见微', en: 'Lin Jianwei' },
  role: { zh: '摄影师', en: 'Photographer' },
  bio: {
    zh: '用镜头记录城市的呼吸，捕捉霓虹退散后转瞬即逝的光影秩序。',
    en: 'Capturing the breath of the city with his lens — the fleeting order of light after neon fades.',
  },
  fullBio: {
    zh: '林见微的镜头里没有宏大叙事，只有日常缝隙里被忽略的诗意。毕业于中央美术学院摄影系，作品多次入选国际摄影展，擅长以极简构图捕捉城市光影的微妙变化。他的限量作品在 M·art 独家发售，每幅作品均附有签名版次证书。',
    en: "Lin Jianwei's frames hold no grand narratives, only the poetry overlooked in daily seams. Graduated from the Central Academy of Fine Arts photography department, his works have been selected for international photography exhibitions multiple times. He specializes in capturing subtle changes of urban light and shadow through minimalist composition. His limited edition works are exclusively available at M·art, each accompanied by a signed edition certificate.",
  },
  avatar: imageUrl(
    'portrait of Chinese male photographer, natural light, warm tones, studio environment, editorial',
    'square'
  ),
};

export const SIGNED_ARTISTS: Artist[] = [
  {
    id: 'chen-mobai',
    name: { zh: '陈墨白', en: 'Chen Mobai' },
    role: { zh: '摄影师', en: 'Photographer' },
    bio: {
      zh: '专注于黑白城市影像，以极简构图捕捉建筑与光影的几何秩序。',
      en: 'Specializes in black-and-white urban imagery, capturing the geometric order of architecture and light through minimalist composition.',
    },
    avatar: imageUrl(
      'portrait of Chinese male photographer, contemplative, natural light, black and white film style',
      'square'
    ),
  },
  {
    id: 'su-yuqing',
    name: { zh: '苏雨晴', en: 'Su Yuqing' },
    role: { zh: '摄影师', en: 'Photographer' },
    bio: {
      zh: '以柔光与静物见长，镜头下的日常场景总带着一层诗意的薄雾。',
      en: 'Known for soft light and still life, her everyday scenes are always veiled in a poetic mist.',
    },
    avatar: imageUrl(
      'portrait of Chinese female photographer, soft light, gentle expression, editorial style',
      'square'
    ),
  },
  {
    id: 'zhou-ye',
    name: { zh: '周野', en: 'Zhou Ye' },
    role: { zh: '插画师', en: 'Illustrator' },
    bio: {
      zh: '游走于抽象与具象之间，用色克制，线条大胆，作品充满都市张力。',
      en: 'Navigating between abstract and figurative, with restrained color and bold lines, his work pulses with urban tension.',
    },
    avatar: imageUrl(
      'portrait of Chinese male illustrator, creative studio, warm tones, artistic environment',
      'square'
    ),
  },
  {
    id: 'gu-anran',
    name: { zh: '顾安然', en: 'Gu Anran' },
    role: { zh: '插画师', en: 'Illustrator' },
    bio: {
      zh: '擅长植物与静物水彩，色调温润，画面宁静而细腻。',
      en: 'Specializes in botanical and still-life watercolor, with warm tones and serene, delicate imagery.',
    },
    avatar: imageUrl(
      'portrait of Chinese female illustrator, botanical studio, natural light, calm expression',
      'square'
    ),
  },
  {
    id: 'liang-chuan',
    name: { zh: '梁川', en: 'Liang Chuan' },
    role: { zh: '摄影师', en: 'Photographer' },
    bio: {
      zh: '风景摄影师，常年行走于山野之间，记录大地的辽阔与寂静。',
      en: 'Landscape photographer, wandering through mountains and wilderness, documenting the vastness and silence of the earth.',
    },
    avatar: imageUrl(
      'portrait of Chinese male landscape photographer, outdoor setting, rugged style',
      'square'
    ),
  },
  {
    id: 'shen-yuwei',
    name: { zh: '沈予微', en: 'Shen Yuwei' },
    role: { zh: '版画师', en: 'Printmaker' },
    bio: {
      zh: '版画艺术家，融合传统技法与当代题材，作品层次丰富。',
      en: 'Printmaking artist, blending traditional techniques with contemporary themes, creating richly layered works.',
    },
    avatar: imageUrl(
      'portrait of Chinese non-binary printmaker, ink-stained hands, workshop background',
      'square'
    ),
  },
  {
    id: 'ye-zhiqiu',
    name: { zh: '叶知秋', en: 'Ye Zhiqiu' },
    role: { zh: '摄影师', en: 'Photographer' },
    bio: {
      zh: '街头摄影师，善于在喧嚣都市中捕捉转瞬即逝的人物瞬间。',
      en: 'Street photographer, adept at capturing fleeting human moments in the bustling city.',
    },
    avatar: imageUrl(
      'portrait of Chinese female photographer, urban setting, street photography style',
      'square'
    ),
  },
  {
    id: 'bai-lu',
    name: { zh: '白鹿', en: 'Bai Lu' },
    role: { zh: '插画师', en: 'Illustrator' },
    bio: {
      zh: '奇幻风格插画师，色彩明快，充满童话般的想象力。',
      en: 'Fantasy illustrator with vibrant colors and fairy-tale imagination.',
    },
    avatar: imageUrl(
      'portrait of Chinese female illustrator, whimsical style, colorful studio background',
      'square'
    ),
  },
  {
    id: 'he-mu',
    name: { zh: '何暮', en: 'He Mu' },
    role: { zh: '版画师', en: 'Printmaker' },
    bio: {
      zh: '传统版画工匠，坚持手工制版，作品古朴而厚重。',
      en: 'Traditional printmaker, adhering to hand-carved plates, creating rustic and substantial works.',
    },
    avatar: imageUrl(
      'portrait of Chinese male printmaker, traditional workshop, focused expression',
      'square'
    ),
  },
  {
    id: 'tang-xiaoshan',
    name: { zh: '唐小山', en: 'Tang Xiaoshan' },
    role: { zh: '摄影师', en: 'Photographer' },
    bio: {
      zh: '极简主义摄影师，以纯净的画面语言探讨空间与留白。',
      en: 'Minimalist photographer, exploring space and negative space through pure visual language.',
    },
    avatar: imageUrl(
      'portrait of Chinese male photographer, minimalist studio, clean background',
      'square'
    ),
  },
];
