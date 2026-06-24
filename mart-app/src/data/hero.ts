import { imageUrl } from '../lib/image';

export interface HeroSlide {
  id: string;
  tag: { zh: string; en: string };
  title: { zh: string; en: string };
  subtitle: { zh: string; en: string };
  cta: { zh: string; en: string };
  ctaLink: string;
  image: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'featured',
    tag: { zh: '精选推荐', en: 'Featured' },
    title: {
      zh: '让艺术走进日常 ——<br/>每一面墙都是一座美术馆',
      en: 'Art in Everyday Life ——<br/>Every wall is a gallery',
    },
    subtitle: { zh: 'M·art · 签约限量艺术', en: 'M·art · Signed Limited Editions' },
    cta: { zh: '探索作品', en: 'Explore Works' },
    ctaLink: '/works',
    image: imageUrl(
      'fine art photography, vast minimalist interior with large artwork on white wall, natural light, serene atmosphere, editorial',
      'landscape_16_9'
    ),
  },
  {
    id: 'curated-home',
    tag: { zh: '居家策展', en: 'Curated Home' },
    title: {
      zh: '卧室里的诗 ——<br/>用一幅画定义你的空间',
      en: 'Poetry in the Bedroom ——<br/>Define your space with a single piece',
    },
    subtitle: { zh: '苏雨晴 · 摄影系列', en: 'Su Yuqing · Photography' },
    cta: { zh: '认识艺术家', en: 'Meet the Artist' },
    ctaLink: '/artists/su-yuqing',
    image: imageUrl(
      'fine art photography, bedroom with framed photograph above bed, soft linen, warm afternoon light, curated interior',
      'landscape_16_9'
    ),
  },
  {
    id: 'inspiring-spaces',
    tag: { zh: '灵感空间', en: 'Inspiring Spaces' },
    title: {
      zh: '餐桌旁的光影 ——<br/>艺术与生活的自然交汇',
      en: 'Light and Shadow by the Table ——<br/>Where art meets daily life',
    },
    subtitle: { zh: '林见微 · 油画系列', en: 'Lin Jianwei · Oil Series' },
    cta: { zh: '查看作品', en: 'View Works' },
    ctaLink: '/works',
    image: imageUrl(
      'fine art photography, dining room with art print on wall, warm ambient light, ceramic objects, elegant setting',
      'landscape_16_9'
    ),
  },
  {
    id: 'membership',
    tag: { zh: '新会员权益', en: 'Membership' },
    title: {
      zh: '首单立减 ¥100 ——<br/>开启你的艺术收藏之旅',
      en: '¥100 Off First Order ——<br/>Start your art collection journey',
    },
    subtitle: { zh: 'M·art Member', en: 'M·art Member' },
    cta: { zh: '加入会员', en: 'Join Now' },
    ctaLink: '/account',
    image: imageUrl(
      'fine art photography, modern living room with abstract art, concrete and wood, natural light, contemporary design',
      'landscape_16_9'
    ),
  },
];
