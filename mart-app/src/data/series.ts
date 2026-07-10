/**
 * M·art 艺术商店 Phase 2 系列数据层。
 *
 * 包含 4 个系列，works 字段引用 WORKS 中对应作品（共享引用，无复制）。
 * 依赖关系：series.ts → works.ts（单向，无循环依赖）。
 */

import { imageUrl } from "../lib/image";
import type { Series } from "./types";
import { getWorksBySeries } from "./works";

const shanShui: Series = {
  id: "series-shan-shui",
  slug: "shan-shui",
  artistSlug: "chen-mobai",
  artistName: { zh: "陈墨白", en: "Chen Mobai" },
  name: { zh: "山水", en: "Shan Shui" },
  coverImage: imageUrl(
    "mountain landscape series cover, misty valley at dawn, minimalist black and white photography, gallery presentation",
    "landscape_4_3"
  ),
  description: {
    zh: "陈墨白的「山水」系列以东方山水精神为内核，用极简的黑白灰捕捉自然中转瞬即逝的光影秩序，是他对传统山水意象的当代影像转译。",
    en: "Chen Mobai's \"Shan Shui\" series takes the spirit of Eastern landscape as its core, using minimalist black, white, and gray to capture fleeting orders of light in nature — a contemporary photographic translation of the traditional landscape idiom.",
  },
  workCount: 0,
  works: [],
};

const stillLife: Series = {
  id: "series-still-life",
  slug: "still-life",
  artistSlug: "su-yuqing",
  artistName: { zh: "苏雨晴", en: "Su Yuqing" },
  name: { zh: "静物", en: "Still Life" },
  coverImage: imageUrl(
    "still life series cover, soft afternoon light on tabletop with vase, warm desaturated tones, fine art photography",
    "landscape_4_3"
  ),
  description: {
    zh: "苏雨晴的「静物」系列在静止中寻找流动的诗意。低饱和色调与柔和明暗记录下日常缝隙里最安宁的时刻，让静物成为时间的容器。",
    en: "Su Yuqing's \"Still Life\" series finds flowing poetry within stillness. Desaturated tones and gentle chiaroscuro record the most serene moments in the seams of the everyday, turning still objects into vessels of time.",
  },
  workCount: 0,
  works: [],
};

const cityscape: Series = {
  id: "series-cityscape",
  slug: "cityscape",
  artistSlug: "zhou-ye",
  artistName: { zh: "周野", en: "Zhou Ye" },
  name: { zh: "都市", en: "Cityscape" },
  coverImage: imageUrl(
    "cityscape series cover, geometric architecture facade, bold lines and concrete, urban tension, black and white",
    "landscape_4_3"
  ),
  description: {
    zh: "周野的「都市」系列把城市拆解为线、面与节奏。从建筑纹理到抽象构成，他用克制的色块与大胆的笔触，呈现都市生活的冷峻张力。",
    en: "Zhou Ye's \"Cityscape\" series dismantles the city into lines, planes, and rhythms. From architectural texture to abstract composition, he uses restrained color blocks and bold strokes to present the austere tension of urban life.",
  },
  workCount: 0,
  works: [],
};

const floral: Series = {
  id: "series-floral",
  slug: "floral",
  artistSlug: "gu-anran",
  artistName: { zh: "顾安然", en: "Gu Anran" },
  name: { zh: "花语", en: "Floral" },
  coverImage: imageUrl(
    "floral series cover, watercolor flowers and botanical illustration, warm tones, soft washes, gallery presentation",
    "landscape_4_3"
  ),
  description: {
    zh: "顾安然的「花语」系列以水彩的透明层次赋予花卉以情绪。从静物到浮世，花瓣的层叠既是盛放也是凋零的预演，色调温润而细腻。",
    en: "Gu Anran's \"Floral\" series lends flowers an emotional depth through the transparent layers of watercolor. From still life to the floating world, the layering of petals is both a full bloom and a rehearsal of fading, in warm and delicate tones.",
  },
  workCount: 0,
  works: [],
};

/** 系列原始定义（works 待注入）。 */
const SERIES_DEFS: Series[] = [shanShui, stillLife, cityscape, floral];

/**
 * 为每个系列注入 works 与 workCount（引用 WORKS 中对应作品）。
 * 使用工厂函数避免与 works.ts 形成循环依赖时的初始化顺序问题。
 */
function buildSeries(): Series[] {
  return SERIES_DEFS.map((s) => {
    const works = getWorksBySeries(s.artistSlug, s.slug);
    return {
      ...s,
      works,
      workCount: works.length,
    };
  });
}

export const SERIES: Series[] = buildSeries();

// 开发期自检：确保每个系列至少包含 1 件作品
if (process.env.NODE_ENV !== "production") {
  for (const s of SERIES) {
    if (s.workCount === 0) {
      console.warn(`[series] series "${s.slug}" has no works`);
    }
  }
}

/** 按艺术家 slug + 系列 slug 查询系列。 */
export function getSeriesBySlug(artistSlug: string, seriesSlug: string): Series | undefined {
  return SERIES.find(
    (s) => s.artistSlug === artistSlug && s.slug === seriesSlug
  );
}
