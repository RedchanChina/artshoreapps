const cloudbase = require('@cloudbase/node-sdk')

const app = cloudbase.init()
const db = app.database()

const COLLECTIONS = {
  users: {
    indexes: [{ name: 'openId', fields: { openId: 1 }, unique: true }],
  },
  artworks: {
    indexes: [
      { name: 'artistId', fields: { artistId: 1 } },
      { name: 'category', fields: { category: 1 } },
      { name: 'createdAt', fields: { createdAt: -1 } },
    ],
  },
  artists: {
    indexes: [{ name: 'createdAt', fields: { createdAt: -1 } }],
  },
  orders: {
    indexes: [
      { name: 'userId', fields: { userId: 1 } },
      { name: 'status', fields: { status: 1 } },
    ],
  },
  payments: {
    indexes: [
      { name: 'orderId', fields: { orderId: 1 } },
      { name: 'userId', fields: { userId: 1 } },
    ],
  },
  addresses: {
    indexes: [{ name: 'openId', fields: { openId: 1 } }],
  },
  collections: {
    indexes: [{ name: 'openId', fields: { openId: 1 } }],
  },
  coupons: {
    indexes: [{ name: 'openId', fields: { openId: 1 } }],
  },
  articles: {
    indexes: [{ name: 'createdAt', fields: { createdAt: -1 } }],
  },
  topics: {
    indexes: [{ name: 'postCount', fields: { postCount: -1 } }],
  },
  posts: {
    indexes: [
      { name: 'topicId', fields: { topicId: 1 } },
      { name: 'createdAt', fields: { createdAt: -1 } },
    ],
  },
  comments: {
    indexes: [{ name: 'postId', fields: { postId: 1 } }],
  },
  stores: {
    indexes: [],
  },
  exhibitions: {
    indexes: [{ name: 'startDate', fields: { startDate: -1 } }],
  },
  registrations: {
    indexes: [{ name: 'exhibitionId', fields: { exhibitionId: 1 } }],
  },
  follows: {
    indexes: [{ name: 'openId_artistId', fields: { openId: 1, artistId: 1 }, unique: true }],
  },
  post_likes: {
    indexes: [{ name: 'postId_openId', fields: { postId: 1, openId: 1 }, unique: true }],
  },
}

const SEED_DATA = {
  artists: [
    {
      name: '林清远',
      avatar: '/artists/artist1.jpg',
      bio: '中国当代摄影艺术家，擅长以极简构图捕捉自然光影',
      representativeWorks: [],
      followerCount: 12800,
      isFollowing: false,
      story: '林清远，1985年生于杭州，毕业于中国美术学院摄影系。他的作品以极简主义风格著称，善于在自然中寻找光影的对话。作品曾在东京摄影节、巴黎Photo Fair展出。',
      exhibitions: [
        { name: '光影之间', date: '2024-03-15', location: '上海当代艺术馆' },
        { name: '自然之眼', date: '2023-11-20', location: '北京798艺术区' },
      ],
      honors: ['2024年度亚洲摄影新锐', '中国摄影金像奖提名'],
      createdAt: '2024-01-15T08:00:00.000Z',
    },
    {
      name: '苏雨晴',
      avatar: '/artists/artist2.jpg',
      bio: '插画艺术家，以水彩与数字媒介融合创作梦幻场景',
      representativeWorks: [],
      followerCount: 9500,
      isFollowing: false,
      story: '苏雨晴，1990年生于成都，英国皇家艺术学院插画硕士。她的作品融合东方水墨意境与西方超现实主义，创造出独特的梦幻视觉语言。',
      exhibitions: [
        { name: '梦境花园', date: '2024-06-01', location: '成都当代美术馆' },
      ],
      honors: ['World Illustration Awards 2023 入围', 'Bologna插画展入选'],
      createdAt: '2024-02-20T08:00:00.000Z',
    },
    {
      name: '陈墨白',
      avatar: '/artists/artist3.jpg',
      bio: '建筑摄影师，专注于城市空间与人文关系的影像记录',
      representativeWorks: [],
      followerCount: 7200,
      isFollowing: false,
      story: '陈墨白，1988年生于北京，同济大学建筑系毕业后转向摄影。他的镜头关注城市建筑中人的存在，以几何构图和光影对比呈现建筑的诗意。',
      exhibitions: [
        { name: '城市呼吸', date: '2024-09-10', location: '深圳OCAT' },
      ],
      honors: ['IPA建筑摄影金奖', '阿尔勒摄影节新人奖'],
      createdAt: '2024-03-10T08:00:00.000Z',
    },
    {
      name: '赵芷若',
      avatar: '/artists/artist4.jpg',
      bio: '植物插画师，以科学插画精度呈现自然之美',
      representativeWorks: [],
      followerCount: 6100,
      isFollowing: false,
      story: '赵芷若，1992年生于昆明，中科院植物学硕士。她将科学插画的严谨与艺术审美结合，创作出兼具知识性与美感的植物艺术作品。',
      exhibitions: [
        { name: '植物志', date: '2024-04-20', location: '昆明当代美术馆' },
      ],
      honors: ['RHS植物艺术展银奖', '中国植物艺术双年展金奖'],
      createdAt: '2024-04-05T08:00:00.000Z',
    },
  ],
  artworks: [
    {
      title: '晨雾中的西湖',
      image: '/artworks/work1.jpg',
      images: ['/artworks/work1.jpg', '/artworks/work1-detail.jpg'],
      artistName: '林清远',
      artistId: '',
      category: 'photography',
      price: 2800,
      originalPrice: 3500,
      description: '清晨五点的西湖，薄雾如纱，远山若隐若现。这幅作品捕捉了西湖最宁静的一刻，光线穿透雾气，在水面上留下金色的痕迹。限量50版，每版均附艺术家签名及编号证书。',
      specifications: [
        { size: '30×40cm', material: '博物馆级纯棉无酸纸', frameStyle: '原木浮框', price: 2800, stock: 15 },
        { size: '50×70cm', material: '博物馆级纯棉无酸纸', frameStyle: '原木浮框', price: 4800, stock: 8 },
        { size: '70×100cm', material: '博物馆级纯棉无酸纸', frameStyle: '原木浮框', price: 8800, stock: 3 },
      ],
      sales: 42,
      stock: 26,
      rating: 4.9,
      tags: ['限量', '摄影', '风景', '西湖'],
      createdAt: '2024-05-01T08:00:00.000Z',
    },
    {
      title: '梦境花园 No.7',
      image: '/artworks/work2.jpg',
      images: ['/artworks/work2.jpg', '/artworks/work2-detail.jpg'],
      artistName: '苏雨晴',
      artistId: '',
      category: 'illustration',
      price: 2200,
      originalPrice: null,
      description: '梦境花园系列第七幅，描绘了一个被月光照亮的秘密花园。水彩与数字技术的融合创造出介于现实与梦境之间的视觉体验。限量80版。',
      specifications: [
        { size: '30×40cm', material: '纯棉水彩纸微喷', frameStyle: '白色极简框', price: 2200, stock: 25 },
        { size: '50×60cm', material: '纯棉水彩纸微喷', frameStyle: '白色极简框', price: 3800, stock: 12 },
      ],
      sales: 38,
      stock: 37,
      rating: 4.8,
      tags: ['限量', '插画', '梦幻', '花园'],
      createdAt: '2024-05-10T08:00:00.000Z',
    },
    {
      title: '光的几何',
      image: '/artworks/work3.jpg',
      images: ['/artworks/work3.jpg', '/artworks/work3-detail.jpg'],
      artistName: '陈墨白',
      artistId: '',
      category: 'photography',
      price: 3600,
      originalPrice: 4200,
      description: '安藤忠雄光之教堂的光影瞬间。光线穿过十字形开口，在清水混凝土墙面上投射出神圣的几何图案。限量30版。',
      specifications: [
        { size: '40×50cm', material: '博物馆级纯棉无酸纸', frameStyle: '黑色金属框', price: 3600, stock: 10 },
        { size: '60×80cm', material: '博物馆级纯棉无酸纸', frameStyle: '黑色金属框', price: 6800, stock: 5 },
      ],
      sales: 28,
      stock: 15,
      rating: 4.9,
      tags: ['限量', '摄影', '建筑', '光影'],
      createdAt: '2024-06-01T08:00:00.000Z',
    },
    {
      title: '山茶花图谱',
      image: '/artworks/work4.jpg',
      images: ['/artworks/work4.jpg', '/artworks/work4-detail.jpg'],
      artistName: '赵芷若',
      artistId: '',
      category: 'illustration',
      price: 1800,
      originalPrice: null,
      description: '以18世纪植物图谱风格绘制的云南山茶花，兼具科学精确性与艺术美感。每一片花瓣、每一根花蕊都经过严谨的植物学考证。限量100版。',
      specifications: [
        { size: '24×30cm', material: '纯棉水彩纸微喷', frameStyle: '原木浮框', price: 1800, stock: 40 },
        { size: '40×50cm', material: '纯棉水彩纸微喷', frameStyle: '原木浮框', price: 3200, stock: 20 },
      ],
      sales: 56,
      stock: 60,
      rating: 4.7,
      tags: ['限量', '插画', '植物', '科学艺术'],
      createdAt: '2024-06-15T08:00:00.000Z',
    },
    {
      title: '雨后新竹',
      image: '/artworks/work5.jpg',
      images: ['/artworks/work5.jpg'],
      artistName: '林清远',
      artistId: '',
      category: 'photography',
      price: 2400,
      originalPrice: null,
      description: '雨后安吉竹海，水珠挂在翠竹之上，阳光透过竹叶洒下斑驳光影。一幅充满东方禅意的摄影作品。限量60版。',
      specifications: [
        { size: '30×40cm', material: '博物馆级纯棉无酸纸', frameStyle: '原木浮框', price: 2400, stock: 20 },
        { size: '50×70cm', material: '博物馆级纯棉无酸纸', frameStyle: '原木浮框', price: 4200, stock: 10 },
      ],
      sales: 33,
      stock: 30,
      rating: 4.8,
      tags: ['限量', '摄影', '自然', '竹'],
      createdAt: '2024-07-01T08:00:00.000Z',
    },
    {
      title: '星夜漫游',
      image: '/artworks/work6.jpg',
      images: ['/artworks/work6.jpg', '/artworks/work6-detail.jpg'],
      artistName: '苏雨晴',
      artistId: '',
      category: 'illustration',
      price: 2600,
      originalPrice: 3200,
      description: '一个小女孩骑着纸飞机在星空中漫游，灵感来自圣埃克苏佩里的小王子。水彩晕染的星空与细腻的人物形成梦幻的对比。限量50版。',
      specifications: [
        { size: '30×40cm', material: '纯棉水彩纸微喷', frameStyle: '白色极简框', price: 2600, stock: 18 },
        { size: '50×60cm', material: '纯棉水彩纸微喷', frameStyle: '白色极简框', price: 4500, stock: 8 },
      ],
      sales: 45,
      stock: 26,
      rating: 4.9,
      tags: ['限量', '插画', '星空', '梦幻'],
      createdAt: '2024-07-15T08:00:00.000Z',
    },
  ],
  topics: [
    { name: '家居挂画指南', coverImage: '/community/topic1.jpg', description: '分享你的家居挂画灵感与搭配技巧', postCount: 128, followCount: 2300, isFollowed: false, createdAt: '2024-01-01T08:00:00.000Z' },
    { name: '艺术微喷科普', coverImage: '/community/topic2.jpg', description: '了解艺术微喷的工艺、材料与收藏价值', postCount: 86, followCount: 1800, isFollowed: false, createdAt: '2024-01-15T08:00:00.000Z' },
    { name: '摄影师日常', coverImage: '/community/topic3.jpg', description: '记录摄影创作背后的故事', postCount: 215, followCount: 3500, isFollowed: false, createdAt: '2024-02-01T08:00:00.000Z' },
    { name: '插画创作过程', coverImage: '/community/topic4.jpg', description: '分享你的插画创作过程与心得', postCount: 167, followCount: 2900, isFollowed: false, createdAt: '2024-02-15T08:00:00.000Z' },
  ],
  stores: [
    { name: 'ArtShop 上海旗舰店', address: '上海市黄浦区南京东路233号', businessHours: '10:00-22:00', images: ['/stores/shanghai.jpg'], latitude: 31.2345, longitude: 121.4737, phone: '021-63218888', createdAt: '2024-01-01T08:00:00.000Z' },
    { name: 'ArtShop 北京798店', address: '北京市朝阳区酒仙桥路798艺术区', businessHours: '10:00-20:00', images: ['/stores/beijing.jpg'], latitude: 39.9842, longitude: 116.4964, phone: '010-59786666', createdAt: '2024-01-01T08:00:00.000Z' },
    { name: 'ArtShop 深圳万象城店', address: '深圳市罗湖区宝安南路万象城', businessHours: '10:00-22:00', images: ['/stores/shenzhen.jpg'], latitude: 22.5463, longitude: 114.1019, phone: '0755-22668888', createdAt: '2024-01-01T08:00:00.000Z' },
  ],
  exhibitions: [
    { title: '光影之间 — 林清远摄影展', coverImage: '/exhibitions/ex1.jpg', startDate: '2025-03-15T08:00:00.000Z', endDate: '2025-06-15T18:00:00.000Z', location: 'ArtShop 上海旗舰店', description: '林清远最新个展，展出近三年创作的30幅摄影作品，探索自然光影的极致表达。', ticketPrice: 0, isRegistered: false },
    { title: '梦境花园 — 苏雨晴插画展', coverImage: '/exhibitions/ex2.jpg', startDate: '2025-05-01T08:00:00.000Z', endDate: '2025-08-01T18:00:00.000Z', location: 'ArtShop 北京798店', description: '苏雨晴沉浸式插画体验展，走进她笔下的梦幻花园。', ticketPrice: 38, isRegistered: false },
    { title: '城市呼吸 — 建筑摄影三人展', coverImage: '/exhibitions/ex3.jpg', startDate: '2025-07-01T08:00:00.000Z', endDate: '2025-09-30T18:00:00.000Z', location: 'ArtShop 深圳万象城店', description: '陈墨白等三位建筑摄影师联展，用镜头解读城市空间的诗意。', ticketPrice: 28, isRegistered: false },
  ],
  articles: [
    { title: '如何选择适合你家的艺术微喷作品', coverImage: '/community/art1.jpg', author: 'ArtShop 编辑部', summary: '从空间风格到色彩搭配，一文读懂家居挂画的选择之道', content: '选择艺术作品是家居装饰中最具个性化的环节...', viewCount: 3560, likeCount: 289, createdAt: '2024-08-01T08:00:00.000Z' },
    { title: '艺术微喷 vs 传统印刷：你需要知道的区别', coverImage: '/community/art2.jpg', author: 'ArtShop 编辑部', summary: '深入了解艺术微喷工艺，为什么它是收藏级复刻的首选', content: '艺术微喷（Giclée）是一种高端数字印刷技术...', viewCount: 2890, likeCount: 215, createdAt: '2024-08-15T08:00:00.000Z' },
    { title: '2025年艺术收藏趋势：年轻藏家的崛起', coverImage: '/community/art3.jpg', author: 'ArtShop 编辑部', summary: '从限量版画到数字艺术，年轻一代正在重新定义收藏', content: '近年来，艺术品收藏市场出现了显著的变化...', viewCount: 4120, likeCount: 356, createdAt: '2024-09-01T08:00:00.000Z' },
  ],
}

async function createCollections() {
  console.log('开始创建数据库集合...')
  for (const [name, config] of Object.entries(COLLECTIONS)) {
    try {
      await db.createCollection(name)
      console.log(`  ✓ 集合 "${name}" 创建成功`)
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        console.log(`  - 集合 "${name}" 已存在，跳过`)
      } else {
        console.error(`  ✗ 集合 "${name}" 创建失败:`, err.message)
      }
    }
  }
}

async function seedData() {
  console.log('\n开始填充示例数据...')

  const artistIds = {}
  for (const artist of SEED_DATA.artists) {
    try {
      const result = await db.collection('artists').add(artist)
      artistIds[artist.name] = result.id
      console.log(`  ✓ 艺术家 "${artist.name}" 添加成功`)
    } catch (err) {
      console.error(`  ✗ 艺术家 "${artist.name}" 添加失败:`, err.message)
    }
  }

  for (const artwork of SEED_DATA.artworks) {
    try {
      artwork.artistId = artistIds[artwork.artistName] || ''
      await db.collection('artworks').add(artwork)
      console.log(`  ✓ 作品 "${artwork.title}" 添加成功`)
    } catch (err) {
      console.error(`  ✗ 作品 "${artwork.title}" 添加失败:`, err.message)
    }
  }

  for (const [collectionName, items] of Object.entries(SEED_DATA)) {
    if (collectionName === 'artists' || collectionName === 'artworks') continue
    for (const item of items) {
      try {
        await db.collection(collectionName).add(item)
        console.log(`  ✓ ${collectionName} 数据添加成功`)
      } catch (err) {
        console.error(`  ✗ ${collectionName} 数据添加失败:`, err.message)
      }
    }
  }
}

async function main() {
  console.log('=== ArtShop 数据库初始化 ===\n')
  await createCollections()
  await seedData()
  console.log('\n=== 初始化完成 ===')
}

main().catch(console.error)
