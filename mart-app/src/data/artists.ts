/**
 * M·art 艺术商店 Phase 2 艺术家数据层。
 *
 * 保留 Phase 1 导出（featuredArtist / SIGNED_ARTISTS）以维持向后兼容（H6），
 * 新增 ARTISTS 聚合导出与 getArtistBySlug 查询函数。
 *
 * 依赖关系：artists.ts → works.ts + series.ts（单向，无循环依赖）。
 * series / standaloneWorks 字段通过引用 WORKS / SERIES 共享对象实现。
 */

import { imageUrl } from "../lib/image";
import type { Artist, FeaturedArtist, LocalizedText, Exhibition } from "./types";
import { getWorksByArtist } from "./works";
import { SERIES } from "./series";

export type { Artist, FeaturedArtist } from "./types";

/** 艺术家种子数据（聚合字段由 buildArtist 计算）。 */
type ArtistSeed = {
  id: string;
  slug: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
  avatar: string;
  fullBio?: LocalizedText;
  birthYear?: number | null;
  birthPlace?: LocalizedText | null;
  currentLocation?: LocalizedText | null;
  statement?: LocalizedText | null;
  exhibitions?: Exhibition[];
};

/**
 * 根据种子数据构建完整 Artist，自动计算 workCount / seriesCount /
 * series / standaloneWorks。
 */
function buildArtist(seed: ArtistSeed): Artist {
  const works = getWorksByArtist(seed.slug);
  const series = SERIES.filter((s) => s.artistSlug === seed.slug);
  const standaloneWorks = works.filter((w) => w.seriesSlug == null);
  return {
    ...seed,
    workCount: works.length,
    seriesCount: series.length,
    series,
    standaloneWorks,
  };
}

// ==================== 种子数据 ====================

const linJianweiSeed: ArtistSeed = {
  id: "lin-jianwei",
  slug: "lin-jianwei",
  name: { zh: "林见微", en: "Lin Jianwei" },
  role: { zh: "摄影师", en: "Photographer" },
  bio: {
    zh: "用镜头记录城市的呼吸，捕捉霓虹退散后转瞬即逝的光影秩序。",
    en: "Capturing the breath of the city with his lens — the fleeting order of light after neon fades.",
  },
  fullBio: {
    zh: "林见微的镜头里没有宏大叙事，只有日常缝隙里被忽略的诗意。毕业于中央美术学院摄影系，作品多次入选国际摄影展，擅长以极简构图捕捉城市光影的微妙变化。他的限量作品在 M·art 独家发售，每幅作品均附有签名版次证书。",
    en: "Lin Jianwei's frames hold no grand narratives, only the poetry overlooked in daily seams. Graduated from the Central Academy of Fine Arts photography department, his works have been selected for international photography exhibitions multiple times. He specializes in capturing subtle changes of urban light and shadow through minimalist composition. His limited edition works are exclusively available at M·art, each accompanied by a signed edition certificate.",
  },
  avatar: imageUrl(
    "portrait of Chinese male photographer, natural light, warm tones, studio environment, editorial",
    "square"
  ),
  birthYear: 1985,
  birthPlace: { zh: "江苏南京", en: "Nanjing, Jiangsu" },
  currentLocation: { zh: "上海", en: "Shanghai" },
  statement: {
    zh: "城市的呼吸藏在霓虹退散之后的瞬间。我用镜头捕捉那些被白昼忽略的光影秩序，让转瞬即逝的街角、玻璃与雾气凝结为可被凝视的诗意。摄影不是记录，而是与城市共同呼吸的方式。",
    en: "The breath of the city hides in the moment after neon fades. Through my lens I capture the overlooked order of light that daylight ignores, freezing fleeting corners, glass and mist into a poetry that can be gazed upon. Photography is not recording, but a way of breathing with the city.",
  },
  exhibitions: [
    {
      id: "lin-jianwei-exhibition-1",
      artistSlug: "lin-jianwei",
      year: 2024,
      title: { zh: "霓虹之后", en: "After Neon" },
      gallery: { zh: "M·art 独立空间", en: "M·art Independent Space" },
      location: { zh: "上海", en: "Shanghai" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "lin-jianwei-exhibition-2",
      artistSlug: "lin-jianwei",
      year: 2022,
      title: { zh: "城市呼吸", en: "City Breath" },
      gallery: { zh: "三影堂摄影艺术中心", en: "Three Shadows Photography Art Centre" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "lin-jianwei-exhibition-3",
      artistSlug: "lin-jianwei",
      year: 2019,
      title: { zh: "光影之间", en: "Between Light and Shadow" },
      gallery: { zh: "OCAT 上海馆", en: "OCAT Shanghai" },
      location: { zh: "上海", en: "Shanghai" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const chenMobaiSeed: ArtistSeed = {
  id: "chen-mobai",
  slug: "chen-mobai",
  name: { zh: "陈墨白", en: "Chen Mobai" },
  role: { zh: "摄影师", en: "Photographer" },
  bio: {
    zh: "专注于黑白城市影像，以极简构图捕捉建筑与光影的几何秩序。",
    en: "Specializes in black-and-white urban imagery, capturing the geometric order of architecture and light through minimalist composition.",
  },
  avatar: imageUrl(
    "portrait of Chinese male photographer, contemplative, natural light, black and white film style",
    "square"
  ),
  birthYear: 1978,
  birthPlace: { zh: "浙江杭州", en: "Hangzhou, Zhejiang" },
  currentLocation: { zh: "北京", en: "Beijing" },
  statement: {
    zh: "黑白是城市影像的骨骼。剥离色彩之后，建筑与光的关系才显露出真正的几何秩序。我以极简构图切割都市的喧嚣，让线条与阴影在留白中沉淀，使观者重新看见那些被颜色掩盖的结构之美。",
    en: "Black and white is the skeleton of urban imagery. Stripped of color, the relationship between architecture and light reveals its true geometric order. I cut through the city's noise with minimalist composition, letting lines and shadow settle in negative space, so the viewer may once again see the structural beauty concealed by color.",
  },
  exhibitions: [
    {
      id: "chen-mobai-exhibition-1",
      artistSlug: "chen-mobai",
      year: 2024,
      title: { zh: "黑白骨架", en: "Skeleton in Black and White" },
      gallery: { zh: "M·art 独立空间", en: "M·art Independent Space" },
      location: { zh: "北京", en: "Beijing" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "chen-mobai-exhibition-2",
      artistSlug: "chen-mobai",
      year: 2021,
      title: { zh: "几何都市", en: "Geometric City" },
      gallery: { zh: "UCCA 尤伦斯当代艺术中心", en: "UCCA Center for Contemporary Art" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "chen-mobai-exhibition-3",
      artistSlug: "chen-mobai",
      year: 2018,
      title: { zh: "极简之间", en: "Between Minimalisms" },
      gallery: { zh: "上海摄影艺术中心", en: "Shanghai Center of Photography" },
      location: { zh: "上海", en: "Shanghai" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const suYuqingSeed: ArtistSeed = {
  id: "su-yuqing",
  slug: "su-yuqing",
  name: { zh: "苏雨晴", en: "Su Yuqing" },
  role: { zh: "摄影师", en: "Photographer" },
  bio: {
    zh: "以柔光与静物见长，镜头下的日常场景总带着一层诗意的薄雾。",
    en: "Known for soft light and still life, her everyday scenes are always veiled in a poetic mist.",
  },
  avatar: imageUrl(
    "portrait of Chinese female photographer, soft light, gentle expression, editorial style",
    "square"
  ),
  birthYear: 1988,
  birthPlace: { zh: "福建厦门", en: "Xiamen, Fujian" },
  currentLocation: { zh: "杭州", en: "Hangzhou" },
  statement: {
    zh: "柔光是日常最温柔的呼吸。我让光线在静物表面缓慢沉降，使一束花、一只杯、一片窗纱都裹上薄雾般的诗意。摄影并非捕捉完美，而是与光共同等待，让被忽略的静默时刻重新拥有被凝视的厚度。那些薄雾之间，藏着我对时间的全部敬意。",
    en: "Soft light is the gentlest breath of the everyday. I let illumination settle slowly across still surfaces, so that a single bloom, a porcelain cup, a length of sheer curtain may each be veiled in a kind of mist-like poetry. Photography, for me, is never the capture of perfection, but a patient waiting alongside light — restoring thickness of gaze to the overlooked silences of domestic life. Within that thin mist, between bright things, lies all my quiet reverence for passing time, and for stillness itself.",
  },
  exhibitions: [
    {
      id: "su-yuqing-exhibition-1",
      artistSlug: "su-yuqing",
      year: 2024,
      title: { zh: "薄雾之间", en: "Between Mists" },
      gallery: { zh: "M·art 独立空间", en: "M·art Independent Space" },
      location: { zh: "杭州", en: "Hangzhou" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "su-yuqing-exhibition-2",
      artistSlug: "su-yuqing",
      year: 2022,
      title: { zh: "静物诗学", en: "Still Life Poetics" },
      gallery: { zh: "三影堂摄影艺术中心", en: "Three Shadows Photography Art Centre" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "su-yuqing-exhibition-3",
      artistSlug: "su-yuqing",
      year: 2020,
      title: { zh: "柔光集", en: "Soft Light Collection" },
      gallery: { zh: "蜂巢当代艺术中心", en: "Hive Center for Contemporary Art" },
      location: { zh: "上海", en: "Shanghai" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const zhouYeSeed: ArtistSeed = {
  id: "zhou-ye",
  slug: "zhou-ye",
  name: { zh: "周野", en: "Zhou Ye" },
  role: { zh: "插画师", en: "Illustrator" },
  bio: {
    zh: "游走于抽象与具象之间，用色克制，线条大胆，作品充满都市张力。",
    en: "Navigating between abstract and figurative, with restrained color and bold lines, his work pulses with urban tension.",
  },
  avatar: imageUrl(
    "portrait of Chinese male illustrator, creative studio, warm tones, artistic environment",
    "square"
  ),
  birthYear: 1990,
  birthPlace: { zh: "广东广州", en: "Guangzhou, Guangdong" },
  currentLocation: { zh: "深圳", en: "Shenzhen" },
  statement: {
    zh: "线条是都市的神经。我克制地使用色彩，让黑色的线在画面中奔跑、缠绕、断裂，把城市的速度与张力压缩进每一寸纸面。抽象与具象并非对立，而是同一张网的两面——线的尽头是混乱的秩序，也是秩序中燃烧的混乱。",
    en: "Lines are the nerves of the city. I use color with restraint, letting black lines run, tangle, and fracture across the surface, compressing the velocity and tension of the metropolis into every inch of paper. For me, the abstract and the figurative are never true opposites, but two faces of a single mesh — at the end of every line lies the order of chaos, and the chaos burning within order itself. I draw so that the city may finally recognize its own pulse.",
  },
  exhibitions: [
    {
      id: "zhou-ye-exhibition-1",
      artistSlug: "zhou-ye",
      year: 2023,
      title: { zh: "线的张力", en: "Tension of the Line" },
      gallery: { zh: "蜂巢当代艺术中心", en: "Hive Center for Contemporary Art" },
      location: { zh: "深圳", en: "Shenzhen" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "zhou-ye-exhibition-2",
      artistSlug: "zhou-ye",
      year: 2021,
      title: { zh: "都市切片", en: "Urban Slices" },
      gallery: { zh: "UCCA 尤伦斯当代艺术中心", en: "UCCA Center for Contemporary Art" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "zhou-ye-exhibition-3",
      artistSlug: "zhou-ye",
      year: 2019,
      title: { zh: "新锐插画", en: "Emerging Illustration" },
      gallery: { zh: "龙美术馆", en: "Long Museum" },
      location: { zh: "上海", en: "Shanghai" },
      type: "group",
      sortOrder: 3,
    },
  ],
};

const guAnranSeed: ArtistSeed = {
  id: "gu-anran",
  slug: "gu-anran",
  name: { zh: "顾安然", en: "Gu Anran" },
  role: { zh: "插画师", en: "Illustrator" },
  bio: {
    zh: "擅长植物与静物水彩，色调温润，画面宁静而细腻。",
    en: "Specializes in botanical and still-life watercolor, with warm tones and serene, delicate imagery.",
  },
  avatar: imageUrl(
    "portrait of Chinese female illustrator, botanical studio, natural light, calm expression",
    "square"
  ),
  birthYear: 1992,
  birthPlace: { zh: "云南昆明", en: "Kunming, Yunnan" },
  currentLocation: { zh: "成都", en: "Chengdu" },
  statement: {
    zh: "植物教会我等待。水彩在纸上洇开的速度，正如一片叶子的舒展——无法催促，只能陪伴。我用温润的色调记录植物的呼吸，让静物在宁静中获得生长的余地。每一笔水分都是与时间的小型和解，细腻不是技巧，而是一种对生活保持温柔的耐心。",
    en: "Plants have taught me how to wait. The pace at which watercolor blooms across paper mirrors the unfurling of a leaf — it cannot be rushed, only accompanied. I use warm, muted tones to record the quiet breathing of botanical life, letting still objects find room to grow within serenity. Every brush of moisture is a small reconciliation with time. Delicacy, for me, is never a matter of technique, but a patience that keeps its tenderness toward all living things, and toward the slowness they require.",
  },
  exhibitions: [
    {
      id: "gu-anran-exhibition-1",
      artistSlug: "gu-anran",
      year: 2024,
      title: { zh: "植物志", en: "Botanical Notes" },
      gallery: { zh: "千高原艺术空间", en: "A Thousand Plateaus Art Space" },
      location: { zh: "成都", en: "Chengdu" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "gu-anran-exhibition-2",
      artistSlug: "gu-anran",
      year: 2022,
      title: { zh: "温润之间", en: "Between Warmth" },
      gallery: { zh: "蜂巢当代艺术中心", en: "Hive Center for Contemporary Art" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "gu-anran-exhibition-3",
      artistSlug: "gu-anran",
      year: 2020,
      title: { zh: "静物呼吸", en: "Breathing Still Life" },
      gallery: { zh: "红砖美术馆", en: "Red Brick Art Museum" },
      location: { zh: "北京", en: "Beijing" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const liangChuanSeed: ArtistSeed = {
  id: "liang-chuan",
  slug: "liang-chuan",
  name: { zh: "梁川", en: "Liang Chuan" },
  role: { zh: "摄影师", en: "Photographer" },
  bio: {
    zh: "风景摄影师，常年行走于山野之间，记录大地的辽阔与寂静。",
    en: "Landscape photographer, wandering through mountains and wilderness, documenting the vastness and silence of the earth.",
  },
  avatar: imageUrl(
    "portrait of Chinese male landscape photographer, outdoor setting, rugged style",
    "square"
  ),
  birthYear: 1981,
  birthPlace: { zh: "四川阿坝", en: "Aba, Sichuan" },
  currentLocation: { zh: "成都", en: "Chengdu" },
  statement: {
    zh: "山野不语，却比任何言语都辽阔。我背着相机行走于无人之处，记录大地在晨昏与四季中的缓慢呼吸。风景于我从来不是背景，而是一种近乎宗教的沉默。辽阔之中，人会重新认识自己的渺小；寂静之间，才能听见土地深处那古老而持续的心跳。",
    en: "The mountains do not speak, yet they are vaster than any words could hold. I carry my camera into places without people, recording the slow breathing of the earth across dawn, dusk, and the turning of seasons. Landscape, to me, is never a backdrop, but a silence close to religion. Within vastness, one recognizes one's own smallness again; and within stillness, one can finally hear the ancient, unbroken heartbeat deep beneath the land — and perhaps, beneath oneself as well.",
  },
  exhibitions: [
    {
      id: "liang-chuan-exhibition-1",
      artistSlug: "liang-chuan",
      year: 2023,
      title: { zh: "山野志", en: "Mountain Chronicles" },
      gallery: { zh: "M·art 独立空间", en: "M·art Independent Space" },
      location: { zh: "成都", en: "Chengdu" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "liang-chuan-exhibition-2",
      artistSlug: "liang-chuan",
      year: 2021,
      title: { zh: "大地之书", en: "Book of the Earth" },
      gallery: { zh: "上海当代艺术博物馆", en: "Power Station of Art" },
      location: { zh: "上海", en: "Shanghai" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "liang-chuan-exhibition-3",
      artistSlug: "liang-chuan",
      year: 2018,
      title: { zh: "辽阔与寂静", en: "Vastness and Silence" },
      gallery: { zh: "三影堂摄影艺术中心", en: "Three Shadows Photography Art Centre" },
      location: { zh: "北京", en: "Beijing" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const shenYuweiSeed: ArtistSeed = {
  id: "shen-yuwei",
  slug: "shen-yuwei",
  name: { zh: "沈予微", en: "Shen Yuwei" },
  role: { zh: "版画师", en: "Printmaker" },
  bio: {
    zh: "版画艺术家，融合传统技法与当代题材，作品层次丰富。",
    en: "Printmaking artist, blending traditional techniques with contemporary themes, creating richly layered works.",
  },
  avatar: imageUrl(
    "portrait of Chinese non-binary printmaker, ink-stained hands, workshop background",
    "square"
  ),
  birthYear: 1987,
  birthPlace: { zh: "江苏苏州", en: "Suzhou, Jiangsu" },
  currentLocation: { zh: "杭州", en: "Hangzhou" },
  statement: {
    zh: "版画是时间叠压的艺术。每一层套色都是一次决断，也是一次与失误的和解。我用传统的木刻与铜版承载当代的议题，让古老的技法在新的图像中重新呼吸。层次的丰富并非堆砌，而是让观看变成一种考古——观者必须层层深入，才能抵达画面最深处那句未曾言明的话。",
    en: "Printmaking is, above all, the art of layered time. Each color run is a decision, and also a small reconciliation with error. I use traditional woodcut and intaglio to carry contemporary concerns, letting ancient techniques breathe anew within fresh imagery. Richness of layer is never mere accumulation, but a way of turning looking into a kind of archaeology — the viewer must descend, layer by layer, to finally reach the unspoken sentence buried deepest within the frame, where meaning refuses to explain itself.",
  },
  exhibitions: [
    {
      id: "shen-yuwei-exhibition-1",
      artistSlug: "shen-yuwei",
      year: 2024,
      title: { zh: "叠层", en: "Strata" },
      gallery: { zh: "浙江美术馆", en: "Zhejiang Art Museum" },
      location: { zh: "杭州", en: "Hangzhou" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "shen-yuwei-exhibition-2",
      artistSlug: "shen-yuwei",
      year: 2022,
      title: { zh: "新版", en: "New Editions" },
      gallery: { zh: "上海当代艺术博物馆", en: "Power Station of Art" },
      location: { zh: "上海", en: "Shanghai" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "shen-yuwei-exhibition-3",
      artistSlug: "shen-yuwei",
      year: 2020,
      title: { zh: "古法新语", en: "Ancient Method, New Voice" },
      gallery: { zh: "蜂巢当代艺术中心", en: "Hive Center for Contemporary Art" },
      location: { zh: "北京", en: "Beijing" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const yeZhiqiuSeed: ArtistSeed = {
  id: "ye-zhiqiu",
  slug: "ye-zhiqiu",
  name: { zh: "叶知秋", en: "Ye Zhiqiu" },
  role: { zh: "摄影师", en: "Photographer" },
  bio: {
    zh: "街头摄影师，善于在喧嚣都市中捕捉转瞬即逝的人物瞬间。",
    en: "Street photographer, adept at capturing fleeting human moments in the bustling city.",
  },
  avatar: imageUrl(
    "portrait of Chinese female photographer, urban setting, street photography style",
    "square"
  ),
  birthYear: 1989,
  birthPlace: { zh: "湖南长沙", en: "Changsha, Hunan" },
  currentLocation: { zh: "广州", en: "Guangzhou" },
  statement: {
    zh: "街头是都市的剧场，每个人都是即兴的演员。我在人群中穿行，等待那个不属于任何剧本的瞬间——一个回眸、一次擦肩、一束恰好落在陌生人脸上的光。这些转瞬即逝的片段，构成了城市最真实的叙事。我不构造画面，只忠实接住生活抛来的每一个眼神。",
    en: "The street is the theater of the city, and everyone in it an improvising actor. I move through the crowd, waiting for the instant that belongs to no script at all — a turned glance, a brushing of shoulders, a shaft of light that happens to fall across a stranger's face. These fleeting fragments compose the truest narrative the city has to offer. I do not construct the frame; I only faithfully catch each gaze that life tosses my way, and let it remain unedited.",
  },
  exhibitions: [
    {
      id: "ye-zhiqiu-exhibition-1",
      artistSlug: "ye-zhiqiu",
      year: 2023,
      title: { zh: "瞬间剧场", en: "Instant Theater" },
      gallery: { zh: "M·art 独立空间", en: "M·art Independent Space" },
      location: { zh: "广州", en: "Guangzhou" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "ye-zhiqiu-exhibition-2",
      artistSlug: "ye-zhiqiu",
      year: 2021,
      title: { zh: "街头切片", en: "Street Slices" },
      gallery: { zh: "三影堂摄影艺术中心", en: "Three Shadows Photography Art Centre" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "ye-zhiqiu-exhibition-3",
      artistSlug: "ye-zhiqiu",
      year: 2019,
      title: { zh: "擦肩", en: "Passing By" },
      gallery: { zh: "OCAT 上海馆", en: "OCAT Shanghai" },
      location: { zh: "上海", en: "Shanghai" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const baiLuSeed: ArtistSeed = {
  id: "bai-lu",
  slug: "bai-lu",
  name: { zh: "白鹿", en: "Bai Lu" },
  role: { zh: "插画师", en: "Illustrator" },
  bio: {
    zh: "奇幻风格插画师，色彩明快，充满童话般的想象力。",
    en: "Fantasy illustrator with vibrant colors and fairy-tale imagination.",
  },
  avatar: imageUrl(
    "portrait of Chinese female illustrator, whimsical style, colorful studio background",
    "square"
  ),
  birthYear: 1994,
  birthPlace: { zh: "山东青岛", en: "Qingdao, Shandong" },
  currentLocation: { zh: "上海", en: "Shanghai" },
  statement: {
    zh: "奇幻并非逃避现实，而是为现实打开一扇童话的窗。我用明快的色彩搭建那些只存在于梦境与童年记忆里的国度，让飞行的鲸鱼、会说话的森林一同呼吸。色彩是我对抗平庸的武器，想象力是通往另一种诚实的路径。愿每个观者都能在画中拾回那个曾经相信奇迹的自己。",
    en: "Fantasy is not an escape from reality, but a fairy-tale window opened onto it. I build, in bright colors, the realms that exist only within dreams and childhood memory — letting flying whales, talking forests, and floating islands breathe together as one. Color is my chosen weapon against the ordinary, and imagination a path toward another kind of honesty. May every viewer recover, somewhere within the frame, that earlier self who once believed in miracles, and who still remembers how to fly.",
  },
  exhibitions: [
    {
      id: "bai-lu-exhibition-1",
      artistSlug: "bai-lu",
      year: 2024,
      title: { zh: "梦境地图", en: "Dream Atlas" },
      gallery: { zh: "龙美术馆", en: "Long Museum" },
      location: { zh: "上海", en: "Shanghai" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "bai-lu-exhibition-2",
      artistSlug: "bai-lu",
      year: 2022,
      title: { zh: "童话重构", en: "Fairy Tale Reconstructed" },
      gallery: { zh: "蜂巢当代艺术中心", en: "Hive Center for Contemporary Art" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "bai-lu-exhibition-3",
      artistSlug: "bai-lu",
      year: 2020,
      title: { zh: "色彩之国", en: "Land of Color" },
      gallery: { zh: "M·art 独立空间", en: "M·art Independent Space" },
      location: { zh: "上海", en: "Shanghai" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const heMuSeed: ArtistSeed = {
  id: "he-mu",
  slug: "he-mu",
  name: { zh: "何暮", en: "He Mu" },
  role: { zh: "版画师", en: "Printmaker" },
  bio: {
    zh: "传统版画工匠，坚持手工制版，作品古朴而厚重。",
    en: "Traditional printmaker, adhering to hand-carved plates, creating rustic and substantial works.",
  },
  avatar: imageUrl(
    "portrait of Chinese male printmaker, traditional workshop, focused expression",
    "square"
  ),
  birthYear: 1979,
  birthPlace: { zh: "山西平遥", en: "Pingyao, Shanxi" },
  currentLocation: { zh: "北京", en: "Beijing" },
  statement: {
    zh: "手工制版是与时间对抗的方式。每一刀刻入木板，都是对耐心的修行。我坚持传统工艺，不为怀旧，而是相信缓慢的劳作能赋予图像以重量。古朴的纹理与厚重的墨色里，藏着机器无法复制的体温。版画的力道从不在锋利，而在沉厚——那是手与物长年对话之后留下的回响。",
    en: "Hand-carving plates is a way of resisting time. Every knife-stroke sunk into the wood is a small discipline of patience. I keep to traditional craft not out of nostalgia, but because I believe that slow labor alone can lend an image its true weight. Within the rustic texture and heavy ink lies a warmth that no machine can ever reproduce. The strength of printmaking lies never in sharpness, but in density — the echo left after long years of dialogue between the hand and its material.",
  },
  exhibitions: [
    {
      id: "he-mu-exhibition-1",
      artistSlug: "he-mu",
      year: 2023,
      title: { zh: "刀与木", en: "Knife and Wood" },
      gallery: { zh: "中国版画博物馆", en: "China Printmaking Museum" },
      location: { zh: "深圳", en: "Shenzhen" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "he-mu-exhibition-2",
      artistSlug: "he-mu",
      year: 2021,
      title: { zh: "古法", en: "Old Methods" },
      gallery: { zh: "中央美术学院美术馆", en: "CAFA Art Museum" },
      location: { zh: "北京", en: "Beijing" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "he-mu-exhibition-3",
      artistSlug: "he-mu",
      year: 2019,
      title: { zh: "厚重", en: "Gravitas" },
      gallery: { zh: "蜂巢当代艺术中心", en: "Hive Center for Contemporary Art" },
      location: { zh: "北京", en: "Beijing" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

const tangXiaoshanSeed: ArtistSeed = {
  id: "tang-xiaoshan",
  slug: "tang-xiaoshan",
  name: { zh: "唐小山", en: "Tang Xiaoshan" },
  role: { zh: "摄影师", en: "Photographer" },
  bio: {
    zh: "极简主义摄影师，以纯净的画面语言探讨空间与留白。",
    en: "Minimalist photographer, exploring space and negative space through pure visual language.",
  },
  avatar: imageUrl(
    "portrait of Chinese male photographer, minimalist studio, clean background",
    "square"
  ),
  birthYear: 1983,
  birthPlace: { zh: "安徽黄山", en: "Huangshan, Anhui" },
  currentLocation: { zh: "杭州", en: "Hangzhou" },
  statement: {
    zh: "留白是一种克制，也是一种诚实。我去除画面中所有不必要的元素，让空间本身成为主角。当主体被压缩到最小，观看才真正开始——观者将在那片空白中听见自己的呼吸。极简不是贫穷，而是富足之后的取舍；它要求摄影师学会不说话，让沉默替图像开口。",
    en: "Negative space is a form of restraint, and also a form of honesty. I strip away every unnecessary element until space itself becomes the protagonist. Only when the subject is reduced to its very minimum does seeing truly begin — and within that emptiness, the viewer will gradually hear their own breathing. Minimalism is never poverty, but the quiet choice made after abundance; it asks the photographer to learn silence, and to let the void speak in place of the image itself.",
  },
  exhibitions: [
    {
      id: "tang-xiaoshan-exhibition-1",
      artistSlug: "tang-xiaoshan",
      year: 2024,
      title: { zh: "留白", en: "Blank Space" },
      gallery: { zh: "M·art 独立空间", en: "M·art Independent Space" },
      location: { zh: "杭州", en: "Hangzhou" },
      type: "solo",
      sortOrder: 1,
    },
    {
      id: "tang-xiaoshan-exhibition-2",
      artistSlug: "tang-xiaoshan",
      year: 2022,
      title: { zh: "空间之间", en: "Between Spaces" },
      gallery: { zh: "OCAT 上海馆", en: "OCAT Shanghai" },
      location: { zh: "上海", en: "Shanghai" },
      type: "group",
      sortOrder: 2,
    },
    {
      id: "tang-xiaoshan-exhibition-3",
      artistSlug: "tang-xiaoshan",
      year: 2020,
      title: { zh: "极简之境", en: "Realm of Minimalism" },
      gallery: { zh: "浙江美术馆", en: "Zhejiang Art Museum" },
      location: { zh: "杭州", en: "Hangzhou" },
      type: "solo",
      sortOrder: 3,
    },
  ],
};

// ==================== 聚合导出 ====================

/** 精选艺术家（林见微，含 fullBio）。 */
export const featuredArtist: FeaturedArtist = {
  ...buildArtist(linJianweiSeed),
  fullBio: linJianweiSeed.fullBio!,
};

/** 签约艺术家列表（Phase 1 已有，保留向后兼容）。 */
export const SIGNED_ARTISTS: Artist[] = [
  chenMobaiSeed,
  suYuqingSeed,
  zhouYeSeed,
  guAnranSeed,
  liangChuanSeed,
  shenYuweiSeed,
  yeZhiqiuSeed,
  baiLuSeed,
  heMuSeed,
  tangXiaoshanSeed,
].map(buildArtist);

/** 全部艺术家（精选 + 签约）。 */
export const ARTISTS: Artist[] = [featuredArtist, ...SIGNED_ARTISTS];

/** 按 slug 查询艺术家。 */
export function getArtistBySlug(slug: string): Artist | undefined {
  return ARTISTS.find((a) => a.slug === slug);
}
