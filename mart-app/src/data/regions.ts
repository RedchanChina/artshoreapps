/**
 * 国家/地区对应的省/州 与 城市 级联数据。
 *
 * 覆盖 Phase 3.3 seed 中 13 个支持配送的国家。
 * 数据结构与 LocalizedText 一致（{ zh, en }），便于在表单下拉中按 locale 渲染。
 *
 * 已补全：中国大陆 34 个省级行政区 / 港澳台 / 美国 50 州 + DC
 * 其余国家保留主要地区，后续可按需扩展。
 *
 * 后续如需后台管理，可迁移为 Prisma 模型；当前 MVP 阶段使用静态数据。
 */
import type { LocalizedText } from "./types";

export interface RegionDivision {
  /** 省/州 名称（双语） */
  state: LocalizedText;
  /** 该省/州下的城市列表（双语） */
  cities: LocalizedText[];
}

/** 国家代码 → 省州/城市 级联数据 */
export const REGION_DIVISIONS: Record<string, RegionDivision[]> = {
  // 中国大陆（34 个省级行政区：23 省 + 5 自治区 + 4 直辖市 + 2 特别行政区）
  CN: [
    // 直辖市
    {
      state: { zh: "北京市", en: "Beijing" },
      cities: [
        { zh: "东城区", en: "Dongcheng" },
        { zh: "西城区", en: "Xicheng" },
        { zh: "朝阳区", en: "Chaoyang" },
        { zh: "海淀区", en: "Haidian" },
        { zh: "丰台区", en: "Fengtai" },
        { zh: "石景山区", en: "Shijingshan" },
        { zh: "通州区", en: "Tongzhou" },
        { zh: "昌平区", en: "Changping" },
        { zh: "大兴区", en: "Daxing" },
        { zh: "顺义区", en: "Shunyi" },
        { zh: "房山区", en: "Fangshan" },
        { zh: "门头沟区", en: "Mentougou" },
        { zh: "平谷区", en: "Pinggu" },
        { zh: "怀柔区", en: "Huairou" },
        { zh: "密云区", en: "Miyun" },
        { zh: "延庆区", en: "Yanqing" },
      ],
    },
    {
      state: { zh: "天津市", en: "Tianjin" },
      cities: [
        { zh: "和平区", en: "Heping" },
        { zh: "河东区", en: "Hedong" },
        { zh: "河西区", en: "Hexi" },
        { zh: "南开区", en: "Nankai" },
        { zh: "河北区", en: "Hebei" },
        { zh: "红桥区", en: "Hongqiao" },
        { zh: "东丽区", en: "Dongli" },
        { zh: "西青区", en: "Xiqing" },
        { zh: "津南区", en: "Jinnan" },
        { zh: "北辰区", en: "Beichen" },
        { zh: "武清区", en: "Wuqing" },
        { zh: "宝坻区", en: "Baodi" },
        { zh: "滨海新区", en: "Binhai New Area" },
        { zh: "宁河区", en: "Ninghe" },
        { zh: "静海区", en: "Jinghai" },
        { zh: "蓟州区", en: "Jizhou" },
      ],
    },
    {
      state: { zh: "上海市", en: "Shanghai" },
      cities: [
        { zh: "黄浦区", en: "Huangpu" },
        { zh: "徐汇区", en: "Xuhui" },
        { zh: "长宁区", en: "Changning" },
        { zh: "静安区", en: "Jing'an" },
        { zh: "普陀区", en: "Putuo" },
        { zh: "虹口区", en: "Hongkou" },
        { zh: "杨浦区", en: "Yangpu" },
        { zh: "浦东新区", en: "Pudong New Area" },
        { zh: "闵行区", en: "Minhang" },
        { zh: "宝山区", en: "Baoshan" },
        { zh: "嘉定区", en: "Jiading" },
        { zh: "金山区", en: "Jinshan" },
        { zh: "松江区", en: "Songjiang" },
        { zh: "青浦区", en: "Qingpu" },
        { zh: "奉贤区", en: "Fengxian" },
        { zh: "崇明区", en: "Chongming" },
      ],
    },
    {
      state: { zh: "重庆市", en: "Chongqing" },
      cities: [
        { zh: "渝中区", en: "Yuzhong" },
        { zh: "江北区", en: "Jiangbei" },
        { zh: "南岸区", en: "Nan'an" },
        { zh: "九龙坡区", en: "Jiulongpo" },
        { zh: "沙坪坝区", en: "Shapingba" },
        { zh: "大渡口区", en: "Dadukou" },
        { zh: "渝北区", en: "Yubei" },
        { zh: "巴南区", en: "Banan" },
        { zh: "北碚区", en: "Beibei" },
        { zh: "万州区", en: "Wanzhou" },
        { zh: "涪陵区", en: "Fuling" },
        { zh: "永川区", en: "Yongchuan" },
      ],
    },
    // 省
    {
      state: { zh: "广东省", en: "Guangdong" },
      cities: [
        { zh: "广州市", en: "Guangzhou" },
        { zh: "深圳市", en: "Shenzhen" },
        { zh: "珠海市", en: "Zhuhai" },
        { zh: "佛山市", en: "Foshan" },
        { zh: "东莞市", en: "Dongguan" },
        { zh: "中山市", en: "Zhongshan" },
        { zh: "惠州市", en: "Huizhou" },
        { zh: "江门市", en: "Jiangmen" },
        { zh: "湛江市", en: "Zhanjiang" },
        { zh: "茂名市", en: "Maoming" },
        { zh: "肇庆市", en: "Zhaoqing" },
        { zh: "梅州市", en: "Meizhou" },
        { zh: "汕尾市", en: "Shanwei" },
        { zh: "河源市", en: "Heyuan" },
        { zh: "阳江市", en: "Yangjiang" },
        { zh: "清远市", en: "Qingyuan" },
        { zh: "潮州市", en: "Chaozhou" },
        { zh: "揭阳市", en: "Jieyang" },
        { zh: "云浮市", en: "Yunfu" },
        { zh: "汕头市", en: "Shantou" },
      ],
    },
    {
      state: { zh: "浙江省", en: "Zhejiang" },
      cities: [
        { zh: "杭州市", en: "Hangzhou" },
        { zh: "宁波市", en: "Ningbo" },
        { zh: "温州市", en: "Wenzhou" },
        { zh: "嘉兴市", en: "Jiaxing" },
        { zh: "绍兴市", en: "Shaoxing" },
        { zh: "金华市", en: "Jinhua" },
        { zh: "衢州市", en: "Quzhou" },
        { zh: "舟山市", en: "Zhoushan" },
        { zh: "台州市", en: "Taizhou" },
        { zh: "丽水市", en: "Lishui" },
        { zh: "湖州市", en: "Huzhou" },
      ],
    },
    {
      state: { zh: "江苏省", en: "Jiangsu" },
      cities: [
        { zh: "南京市", en: "Nanjing" },
        { zh: "苏州市", en: "Suzhou" },
        { zh: "无锡市", en: "Wuxi" },
        { zh: "常州市", en: "Changzhou" },
        { zh: "南通市", en: "Nantong" },
        { zh: "扬州市", en: "Yangzhou" },
        { zh: "盐城市", en: "Yancheng" },
        { zh: "徐州市", en: "Xuzhou" },
        { zh: "连云港市", en: "Lianyungang" },
        { zh: "淮安市", en: "Huai'an" },
        { zh: "镇江市", en: "Zhenjiang" },
        { zh: "泰州市", en: "Taizhou" },
        { zh: "宿迁市", en: "Suqian" },
      ],
    },
    {
      state: { zh: "福建省", en: "Fujian" },
      cities: [
        { zh: "福州市", en: "Fuzhou" },
        { zh: "厦门市", en: "Xiamen" },
        { zh: "泉州市", en: "Quanzhou" },
        { zh: "漳州市", en: "Zhangzhou" },
        { zh: "莆田市", en: "Putian" },
        { zh: "龙岩市", en: "Longyan" },
        { zh: "三明市", en: "Sanming" },
        { zh: "南平市", en: "Nanping" },
        { zh: "宁德市", en: "Ningde" },
      ],
    },
    {
      state: { zh: "山东省", en: "Shandong" },
      cities: [
        { zh: "济南市", en: "Jinan" },
        { zh: "青岛市", en: "Qingdao" },
        { zh: "烟台市", en: "Yantai" },
        { zh: "威海市", en: "Weihai" },
        { zh: "潍坊市", en: "Weifang" },
        { zh: "淄博市", en: "Zibo" },
        { zh: "临沂市", en: "Linyi" },
        { zh: "济宁市", en: "Jining" },
        { zh: "泰安市", en: "Tai'an" },
        { zh: "日照市", en: "Rizhao" },
        { zh: "德州市", en: "Dezhou" },
        { zh: "聊城市", en: "Liaocheng" },
        { zh: "滨州市", en: "Binzhou" },
        { zh: "东营市", en: "Dongying" },
      ],
    },
    {
      state: { zh: "河南省", en: "Henan" },
      cities: [
        { zh: "郑州市", en: "Zhengzhou" },
        { zh: "洛阳市", en: "Luoyang" },
        { zh: "开封市", en: "Kaifeng" },
        { zh: "南阳市", en: "Nanyang" },
        { zh: "安阳市", en: "Anyang" },
        { zh: "新乡市", en: "Xinxiang" },
        { zh: "许昌市", en: "Xuchang" },
        { zh: "平顶山市", en: "Pingdingshan" },
        { zh: "焦作市", en: "Jiaozuo" },
        { zh: "商丘市", en: "Shangqiu" },
        { zh: "信阳市", en: "Xinyang" },
        { zh: "周口市", en: "Zhoukou" },
        { zh: "驻马店市", en: "Zhumadian" },
        { zh: "濮阳市", en: "Puyang" },
        { zh: "三门峡市", en: "Sanmenxia" },
        { zh: "漯河市", en: "Luohe" },
        { zh: "鹤壁市", en: "Hebi" },
      ],
    },
    {
      state: { zh: "河北省", en: "Hebei" },
      cities: [
        { zh: "石家庄市", en: "Shijiazhuang" },
        { zh: "唐山市", en: "Tangshan" },
        { zh: "保定市", en: "Baoding" },
        { zh: "邯郸市", en: "Handan" },
        { zh: "廊坊市", en: "Langfang" },
        { zh: "沧州市", en: "Cangzhou" },
        { zh: "邢台市", en: "Xingtai" },
        { zh: "张家口市", en: "Zhangjiakou" },
        { zh: "衡水市", en: "Hengshui" },
        { zh: "承德市", en: "Chengde" },
        { zh: "秦皇岛市", en: "Qinhuangdao" },
      ],
    },
    {
      state: { zh: "湖北省", en: "Hubei" },
      cities: [
        { zh: "武汉市", en: "Wuhan" },
        { zh: "宜昌市", en: "Yichang" },
        { zh: "襄阳市", en: "Xiangyang" },
        { zh: "荆州市", en: "Jingzhou" },
        { zh: "黄石市", en: "Huangshi" },
        { zh: "十堰市", en: "Shiyan" },
        { zh: "荆门市", en: "Jingmen" },
        { zh: "孝感市", en: "Xiaogan" },
        { zh: "黄冈市", en: "Huanggang" },
        { zh: "咸宁市", en: "Xianning" },
        { zh: "随州市", en: "Suizhou" },
        { zh: "鄂州市", en: "Ezhou" },
        { zh: "恩施州", en: "Enshi" },
      ],
    },
    {
      state: { zh: "湖南省", en: "Hunan" },
      cities: [
        { zh: "长沙市", en: "Changsha" },
        { zh: "株洲市", en: "Zhuzhou" },
        { zh: "湘潭市", en: "Xiangtan" },
        { zh: "衡阳市", en: "Hengyang" },
        { zh: "岳阳市", en: "Yueyang" },
        { zh: "常德市", en: "Changde" },
        { zh: "益阳市", en: "Yiyang" },
        { zh: "郴州市", en: "Chenzhou" },
        { zh: "永州市", en: "Yongzhou" },
        { zh: "怀化市", en: "Huaihua" },
        { zh: "娄底市", en: "Loudi" },
        { zh: "邵阳市", en: "Shaoyang" },
        { zh: "张家界市", en: "Zhangjiajie" },
        { zh: "湘西州", en: "Xiangxi" },
      ],
    },
    {
      state: { zh: "江西省", en: "Jiangxi" },
      cities: [
        { zh: "南昌市", en: "Nanchang" },
        { zh: "赣州市", en: "Ganzhou" },
        { zh: "九江市", en: "Jiujiang" },
        { zh: "宜春市", en: "Yichun" },
        { zh: "吉安市", en: "Ji'an" },
        { zh: "上饶市", en: "Shangrao" },
        { zh: "抚州市", en: "Fuzhou" },
        { zh: "萍乡市", en: "Pingxiang" },
        { zh: "新余市", en: "Xinyu" },
        { zh: "鹰潭市", en: "Yingtan" },
        { zh: "景德镇市", en: "Jingdezhen" },
      ],
    },
    {
      state: { zh: "安徽省", en: "Anhui" },
      cities: [
        { zh: "合肥市", en: "Hefei" },
        { zh: "芜湖市", en: "Wuhu" },
        { zh: "蚌埠市", en: "Bengbu" },
        { zh: "安庆市", en: "Anqing" },
        { zh: "马鞍山市", en: "Ma'anshan" },
        { zh: "滁州市", en: "Chuzhou" },
        { zh: "阜阳市", en: "Fuyang" },
        { zh: "宿州市", en: "Suzhou" },
        { zh: "六安市", en: "Lu'an" },
        { zh: "亳州市", en: "Bozhou" },
        { zh: "宣城市", en: "Xuancheng" },
        { zh: "池州市", en: "Chizhou" },
        { zh: "铜陵市", en: "Tongling" },
        { zh: "黄山市", en: "Huangshan" },
        { zh: "淮南市", en: "Huainan" },
        { zh: "淮北市", en: "Huaibei" },
      ],
    },
    {
      state: { zh: "辽宁省", en: "Liaoning" },
      cities: [
        { zh: "沈阳市", en: "Shenyang" },
        { zh: "大连市", en: "Dalian" },
        { zh: "鞍山市", en: "Anshan" },
        { zh: "抚顺市", en: "Fushun" },
        { zh: "本溪市", en: "Benxi" },
        { zh: "丹东市", en: "Dandong" },
        { zh: "锦州市", en: "Jinzhou" },
        { zh: "营口市", en: "Yingkou" },
        { zh: "盘锦市", en: "Panjin" },
        { zh: "阜新市", en: "Fuxin" },
        { zh: "辽阳市", en: "Liaoyang" },
        { zh: "铁岭市", en: "Tieling" },
        { zh: "朝阳市", en: "Chaoyang" },
        { zh: "葫芦岛市", en: "Huludao" },
      ],
    },
    {
      state: { zh: "吉林省", en: "Jilin" },
      cities: [
        { zh: "长春市", en: "Changchun" },
        { zh: "吉林市", en: "Jilin" },
        { zh: "四平市", en: "Siping" },
        { zh: "辽源市", en: "Liaoyuan" },
        { zh: "通化市", en: "Tonghua" },
        { zh: "白山市", en: "Baishan" },
        { zh: "松原市", en: "Songyuan" },
        { zh: "白城市", en: "Baicheng" },
        { zh: "延边州", en: "Yanbian" },
      ],
    },
    {
      state: { zh: "黑龙江省", en: "Heilongjiang" },
      cities: [
        { zh: "哈尔滨市", en: "Harbin" },
        { zh: "齐齐哈尔市", en: "Qiqihar" },
        { zh: "鸡西市", en: "Jixi" },
        { zh: "鹤岗市", en: "Hegang" },
        { zh: "双鸭山市", en: "Shuangyashan" },
        { zh: "大庆市", en: "Daqing" },
        { zh: "伊春市", en: "Yichun" },
        { zh: "佳木斯市", en: "Jiamusi" },
        { zh: "七台河市", en: "Qitaihe" },
        { zh: "牡丹江市", en: "Mudanjiang" },
        { zh: "黑河市", en: "Heihe" },
        { zh: "绥化市", en: "Suihua" },
        { zh: "大兴安岭地区", en: "Da Hinggan Ling" },
      ],
    },
    {
      state: { zh: "四川省", en: "Sichuan" },
      cities: [
        { zh: "成都市", en: "Chengdu" },
        { zh: "绵阳市", en: "Mianyang" },
        { zh: "德阳市", en: "Deyang" },
        { zh: "南充市", en: "Nanchong" },
        { zh: "宜宾市", en: "Yibin" },
        { zh: "泸州市", en: "Luzhou" },
        { zh: "乐山市", en: "Leshan" },
        { zh: "自贡市", en: "Zigong" },
        { zh: "内江市", en: "Neijiang" },
        { zh: "达州市", en: "Dazhou" },
        { zh: "广元市", en: "Guangyuan" },
        { zh: "遂宁市", en: "Suining" },
        { zh: "广安市", en: "Guang'an" },
        { zh: "眉山市", en: "Meishan" },
        { zh: "资阳市", en: "Ziyang" },
        { zh: "雅安市", en: "Ya'an" },
        { zh: "攀枝花市", en: "Panzhihua" },
        { zh: "凉山州", en: "Liangshan" },
        { zh: "阿坝州", en: "Aba" },
        { zh: "甘孜州", en: "Garze" },
      ],
    },
    {
      state: { zh: "贵州省", en: "Guizhou" },
      cities: [
        { zh: "贵阳市", en: "Guiyang" },
        { zh: "遵义市", en: "Zunyi" },
        { zh: "六盘水市", en: "Liupanshui" },
        { zh: "安顺市", en: "Anshun" },
        { zh: "毕节市", en: "Bijie" },
        { zh: "铜仁市", en: "Tongren" },
        { zh: "黔东南州", en: "Qiandongnan" },
        { zh: "黔南州", en: "Qiannan" },
        { zh: "黔西南州", en: "Qianxinan" },
      ],
    },
    {
      state: { zh: "云南省", en: "Yunnan" },
      cities: [
        { zh: "昆明市", en: "Kunming" },
        { zh: "曲靖市", en: "Qujing" },
        { zh: "玉溪市", en: "Yuxi" },
        { zh: "大理州", en: "Dali" },
        { zh: "丽江市", en: "Lijiang" },
        { zh: "西双版纳州", en: "Xishuangbanna" },
        { zh: "保山市", en: "Baoshan" },
        { zh: "昭通市", en: "Zhaotong" },
        { zh: "普洱市", en: "Pu'er" },
        { zh: "临沧市", en: "Lincang" },
        { zh: "德宏州", en: "Dehong" },
        { zh: "怒江州", en: "Nujiang" },
        { zh: "迪庆州", en: "Diqing" },
        { zh: "楚雄州", en: "Chuxiong" },
        { zh: "红河州", en: "Honghe" },
        { zh: "文山州", en: "Wenshan" },
      ],
    },
    {
      state: { zh: "陕西省", en: "Shaanxi" },
      cities: [
        { zh: "西安市", en: "Xi'an" },
        { zh: "宝鸡市", en: "Baoji" },
        { zh: "咸阳市", en: "Xianyang" },
        { zh: "渭南市", en: "Weinan" },
        { zh: "汉中市", en: "Hanzhong" },
        { zh: "榆林市", en: "Yulin" },
        { zh: "延安市", en: "Yan'an" },
        { zh: "安康市", en: "Ankang" },
        { zh: "商洛市", en: "Shangluo" },
        { zh: "铜川市", en: "Tongchuan" },
      ],
    },
    {
      state: { zh: "甘肃省", en: "Gansu" },
      cities: [
        { zh: "兰州市", en: "Lanzhou" },
        { zh: "天水市", en: "Tianshui" },
        { zh: "酒泉市", en: "Jiuquan" },
        { zh: "庆阳市", en: "Qingyang" },
        { zh: "平凉市", en: "Pingliang" },
        { zh: "定西市", en: "Dingxi" },
        { zh: "陇南市", en: "Longnan" },
        { zh: "张掖市", en: "Zhangye" },
        { zh: "武威市", en: "Wuwei" },
        { zh: "白银市", en: "Baiyin" },
        { zh: "金昌市", en: "Jinchang" },
        { zh: "嘉峪关市", en: "Jiayuguan" },
        { zh: "临夏州", en: "Linxia" },
        { zh: "甘南州", en: "Gannan" },
      ],
    },
    {
      state: { zh: "青海省", en: "Qinghai" },
      cities: [
        { zh: "西宁市", en: "Xining" },
        { zh: "海东市", en: "Haidong" },
        { zh: "海北州", en: "Haibei" },
        { zh: "海南州", en: "Hainan" },
        { zh: "黄南州", en: "Huangnan" },
        { zh: "果洛州", en: "Golog" },
        { zh: "玉树州", en: "Yushu" },
        { zh: "海西州", en: "Haixi" },
      ],
    },
    {
      state: { zh: "山西省", en: "Shanxi" },
      cities: [
        { zh: "太原市", en: "Taiyuan" },
        { zh: "大同市", en: "Datong" },
        { zh: "阳泉市", en: "Yangquan" },
        { zh: "长治市", en: "Changzhi" },
        { zh: "晋城市", en: "Jincheng" },
        { zh: "朔州市", en: "Shuozhou" },
        { zh: "晋中市", en: "Jinzhong" },
        { zh: "运城市", en: "Yuncheng" },
        { zh: "忻州市", en: "Xinzhou" },
        { zh: "临汾市", en: "Linfen" },
        { zh: "吕梁市", en: "Lvliang" },
      ],
    },
    // 自治区
    {
      state: { zh: "内蒙古自治区", en: "Inner Mongolia" },
      cities: [
        { zh: "呼和浩特市", en: "Hohhot" },
        { zh: "包头市", en: "Baotou" },
        { zh: "鄂尔多斯市", en: "Ordos" },
        { zh: "赤峰市", en: "Chifeng" },
        { zh: "通辽市", en: "Tongliao" },
        { zh: "呼伦贝尔市", en: "Hulunbuir" },
        { zh: "巴彦淖尔市", en: "Bayannur" },
        { zh: "乌兰察布市", en: "Ulanqab" },
        { zh: "兴安盟", en: "Hinggan" },
        { zh: "锡林郭勒盟", en: "Xilingol" },
        { zh: "阿拉善盟", en: "Alxa" },
        { zh: "乌海市", en: "Wuhai" },
      ],
    },
    {
      state: { zh: "广西壮族自治区", en: "Guangxi" },
      cities: [
        { zh: "南宁市", en: "Nanning" },
        { zh: "柳州市", en: "Liuzhou" },
        { zh: "桂林市", en: "Guilin" },
        { zh: "梧州市", en: "Wuzhou" },
        { zh: "北海市", en: "Beihai" },
        { zh: "防城港市", en: "Fangchenggang" },
        { zh: "钦州市", en: "Qinzhou" },
        { zh: "贵港市", en: "Guigang" },
        { zh: "玉林市", en: "Yulin" },
        { zh: "百色市", en: "Baise" },
        { zh: "贺州市", en: "Hezhou" },
        { zh: "河池市", en: "Hechi" },
        { zh: "来宾市", en: "Laibin" },
        { zh: "崇左市", en: "Chongzuo" },
      ],
    },
    {
      state: { zh: "西藏自治区", en: "Tibet" },
      cities: [
        { zh: "拉萨市", en: "Lhasa" },
        { zh: "日喀则市", en: "Xigaze" },
        { zh: "昌都市", en: "Qamdo" },
        { zh: "林芝市", en: "Nyingchi" },
        { zh: "山南市", en: "Lhoka" },
        { zh: "那曲市", en: "Nagqu" },
        { zh: "阿里地区", en: "Ngari" },
      ],
    },
    {
      state: { zh: "宁夏回族自治区", en: "Ningxia" },
      cities: [
        { zh: "银川市", en: "Yinchuan" },
        { zh: "石嘴山市", en: "Shizuishan" },
        { zh: "吴忠市", en: "Wuzhong" },
        { zh: "固原市", en: "Guyuan" },
        { zh: "中卫市", en: "Zhongwei" },
      ],
    },
    {
      state: { zh: "新疆维吾尔自治区", en: "Xinjiang" },
      cities: [
        { zh: "乌鲁木齐市", en: "Urumqi" },
        { zh: "克拉玛依市", en: "Karamay" },
        { zh: "吐鲁番市", en: "Turpan" },
        { zh: "哈密市", en: "Hami" },
        { zh: "昌吉州", en: "Changji" },
        { zh: "博尔塔拉州", en: "Bortala" },
        { zh: "巴音郭楞州", en: "Bayingolin" },
        { zh: "阿克苏地区", en: "Aksu" },
        { zh: "克孜勒苏州", en: "Kizilsu" },
        { zh: "喀什地区", en: "Kashgar" },
        { zh: "和田地区", en: "Hotan" },
        { zh: "伊犁州", en: "Ili" },
        { zh: "塔城地区", en: "Tacheng" },
        { zh: "阿勒泰地区", en: "Altay" },
        { zh: "石河子市", en: "Shihezi" },
      ],
    },
    // 海南省（含南海诸岛）
    {
      state: { zh: "海南省", en: "Hainan" },
      cities: [
        { zh: "海口市", en: "Haikou" },
        { zh: "三亚市", en: "Sanya" },
        { zh: "三沙市", en: "Sansha" },
        { zh: "儋州市", en: "Danzhou" },
        { zh: "琼海市", en: "Qionghai" },
        { zh: "文昌市", en: "Wenchang" },
        { zh: "万宁市", en: "Wanning" },
        { zh: "五指山市", en: "Wuzhishan" },
        { zh: "东方市", en: "Dongfang" },
        { zh: "澄迈县", en: "Chengmai" },
        { zh: "定安县", en: "Ding'an" },
        { zh: "屯昌县", en: "Tunchang" },
        { zh: "临高县", en: "Lingao" },
        { zh: "白沙县", en: "Baisha" },
        { zh: "昌江县", en: "Changjiang" },
        { zh: "乐东县", en: "Ledong" },
        { zh: "陵水县", en: "Lingshui" },
        { zh: "保亭县", en: "Baoting" },
        { zh: "琼中县", en: "Qiongzhong" },
      ],
    },
    // 台湾省
    {
      state: { zh: "台湾省", en: "Taiwan Province" },
      cities: [
        { zh: "台北市", en: "Taipei City" },
        { zh: "新北市", en: "New Taipei City" },
        { zh: "桃园市", en: "Taoyuan" },
        { zh: "台中市", en: "Taichung" },
        { zh: "台南市", en: "Tainan" },
        { zh: "高雄市", en: "Kaohsiung" },
        { zh: "基隆市", en: "Keelung" },
        { zh: "新竹市", en: "Hsinchu" },
        { zh: "嘉义市", en: "Chiayi" },
      ],
    },
  ],

  // 中国香港（18 区）
  HK: [
    {
      state: { zh: "香港岛", en: "Hong Kong Island" },
      cities: [
        { zh: "中西区", en: "Central and Western" },
        { zh: "湾仔区", en: "Wan Chai" },
        { zh: "东区", en: "Eastern" },
        { zh: "南区", en: "Southern" },
      ],
    },
    {
      state: { zh: "九龙", en: "Kowloon" },
      cities: [
        { zh: "油尖旺区", en: "Yau Tsim Mong" },
        { zh: "深水埗区", en: "Sham Shui Po" },
        { zh: "九龙城区", en: "Kowloon City" },
        { zh: "黄大仙区", en: "Wong Tai Sin" },
        { zh: "观塘区", en: "Kwun Tong" },
      ],
    },
    {
      state: { zh: "新界", en: "New Territories" },
      cities: [
        { zh: "葵青区", en: "Kwai Tsing" },
        { zh: "沙田区", en: "Sha Tin" },
        { zh: "大埔区", en: "Tai Po" },
        { zh: "荃湾区", en: "Tsuen Wan" },
        { zh: "屯门区", en: "Tuen Mun" },
        { zh: "元朗区", en: "Yuen Long" },
        { zh: "北区", en: "North" },
        { zh: "西贡区", en: "Sai Kung" },
        { zh: "离岛区", en: "Islands" },
      ],
    },
  ],

  // 中国澳门（堂区完整列表）
  MO: [
    {
      state: { zh: "澳门半岛", en: "Macau Peninsula" },
      cities: [
        { zh: "花地玛堂区", en: "Nossa Senhora de Fátima" },
        { zh: "圣安多尼堂区", en: "Santo António" },
        { zh: "大堂区", en: "Sé" },
        { zh: "望德堂区", en: "São Lazaro" },
        { zh: "风顺堂区", en: "São Lourenço" },
      ],
    },
    {
      state: { zh: "氹仔", en: "Taipa" },
      cities: [{ zh: "嘉模堂区", en: "Nossa Senhora do Carmo" }],
    },
    {
      state: { zh: "路环", en: "Coloane" },
      cities: [{ zh: "圣方济各堂区", en: "São Francisco Xavier" }],
    },
    {
      state: { zh: "路氹城", en: "Cotai" },
      cities: [{ zh: "路氹填海区", en: "Cotai Strip" }],
    },
  ],

  // 中国台湾（关键城市，TW 国家码下完整覆盖 6 直辖市 + 3 市 + 13 县市）
  TW: [
    {
      state: { zh: "台北市", en: "Taipei City" },
      cities: [
        { zh: "中正区", en: "Zhongzheng" },
        { zh: "大同区", en: "Datong" },
        { zh: "中山区", en: "Zhongshan" },
        { zh: "松山区", en: "Songshan" },
        { zh: "大安区", en: "Da'an" },
        { zh: "万华区", en: "Wanhua" },
        { zh: "信义区", en: "Xinyi" },
        { zh: "士林区", en: "Shilin" },
        { zh: "北投区", en: "Beitou" },
        { zh: "内湖区", en: "Neihu" },
        { zh: "南港区", en: "Nangang" },
        { zh: "文山区", en: "Wenshan" },
      ],
    },
    {
      state: { zh: "新北市", en: "New Taipei City" },
      cities: [
        { zh: "板桥区", en: "Banqiao" },
        { zh: "三重区", en: "Sanchong" },
        { zh: "中和区", en: "Zhonghe" },
        { zh: "永和区", en: "Yonghe" },
        { zh: "新庄区", en: "Xinzhuang" },
        { zh: "新店区", en: "Xindian" },
        { zh: "土城区", en: "Tucheng" },
        { zh: "芦洲区", en: "Luzhou" },
        { zh: "树林区", en: "Shulin" },
        { zh: "汐止区", en: "Xizhi" },
        { zh: "三峡区", en: "Sanxia" },
        { zh: "淡水区", en: "Tamsui" },
        { zh: "瑞芳区", en: "Ruifang" },
        { zh: "五股区", en: "Wugu" },
        { zh: "泰山区", en: "Taishan" },
        { zh: "林口区", en: "Linkou" },
        { zh: "八里区", en: "Bali" },
      ],
    },
    {
      state: { zh: "桃园市", en: "Taoyuan" },
      cities: [
        { zh: "桃园区", en: "Taoyuan" },
        { zh: "中坜区", en: "Zhongli" },
        { zh: "平镇区", en: "Pingzhen" },
        { zh: "八德区", en: "Bade" },
        { zh: "杨梅区", en: "Yangmei" },
        { zh: "芦竹区", en: "Luzhu" },
        { zh: "大园区", en: "Dayuan" },
        { zh: "龟山区", en: "Guishan" },
        { zh: "龙潭区", en: "Longtan" },
      ],
    },
    {
      state: { zh: "台中市", en: "Taichung City" },
      cities: [
        { zh: "中区", en: "Central" },
        { zh: "东区", en: "East" },
        { zh: "南区", en: "South" },
        { zh: "西区", en: "West" },
        { zh: "北区", en: "North" },
        { zh: "西屯区", en: "Xitun" },
        { zh: "南屯区", en: "Nantun" },
        { zh: "北屯区", en: "Beitun" },
        { zh: "丰原区", en: "Fengyuan" },
        { zh: "大里区", en: "Dali" },
        { zh: "太平区", en: "Taiping" },
      ],
    },
    {
      state: { zh: "台南市", en: "Tainan City" },
      cities: [
        { zh: "中西区", en: "West Central" },
        { zh: "东区", en: "East" },
        { zh: "南区", en: "South" },
        { zh: "北区", en: "North" },
        { zh: "安平区", en: "Anping" },
        { zh: "安南区", en: "Annan" },
        { zh: "永康区", en: "Yongkang" },
        { zh: "新化区", en: "Xinhua" },
      ],
    },
    {
      state: { zh: "高雄市", en: "Kaohsiung City" },
      cities: [
        { zh: "盐埕区", en: "Yancheng" },
        { zh: "鼓山区", en: "Gushan" },
        { zh: "左营区", en: "Zuoying" },
        { zh: "楠梓区", en: "Nanzi" },
        { zh: "三民区", en: "Sanmin" },
        { zh: "新兴区", en: "Xinxing" },
        { zh: "前金区", en: "Qianjin" },
        { zh: "苓雅区", en: "Lingya" },
        { zh: "前镇区", en: "Qianzhen" },
        { zh: "旗津区", en: "Qijin" },
        { zh: "小港区", en: "Xiaogang" },
        { zh: "凤山区", en: "Fengshan" },
      ],
    },
    {
      state: { zh: "基隆市", en: "Keelung City" },
      cities: [{ zh: "仁爱区", en: "Ren'ai" }, { zh: "中正区", en: "Zhongzheng" }],
    },
    {
      state: { zh: "新竹市", en: "Hsinchu City" },
      cities: [{ zh: "东区", en: "East" }, { zh: "北区", en: "North" }],
    },
    {
      state: { zh: "嘉义市", en: "Chiayi City" },
      cities: [{ zh: "东区", en: "East" }, { zh: "西区", en: "West" }],
    },
    {
      state: { zh: "新竹县", en: "Hsinchu County" },
      cities: [{ zh: "竹北市", en: "Zhubei" }, { zh: "竹东镇", en: "Zhudong" }],
    },
    {
      state: { zh: "苗栗县", en: "Miaoli County" },
      cities: [{ zh: "苗栗市", en: "Miaoli City" }, { zh: "头份市", en: "Toufen" }],
    },
    {
      state: { zh: "彰化县", en: "Changhua County" },
      cities: [{ zh: "彰化市", en: "Changhua City" }, { zh: "员林市", en: "Yuanlin" }],
    },
    {
      state: { zh: "南投县", en: "Nantou County" },
      cities: [{ zh: "南投市", en: "Nantou City" }, { zh: "埔里镇", en: "Puli" }],
    },
    {
      state: { zh: "云林县", en: "Yunlin County" },
      cities: [{ zh: "斗六市", en: "Douliu" }],
    },
    {
      state: { zh: "嘉义县", en: "Chiayi County" },
      cities: [{ zh: "太保市", en: "Taibao" }, { zh: "朴子市", en: "Puzi" }],
    },
    {
      state: { zh: "屏东县", en: "Pingtung County" },
      cities: [{ zh: "屏东市", en: "Pingtung City" }],
    },
    {
      state: { zh: "宜兰县", en: "Yilan County" },
      cities: [{ zh: "宜兰市", en: "Yilan City" }, { zh: "罗东镇", en: "Luodong" }],
    },
    {
      state: { zh: "花莲县", en: "Hualien County" },
      cities: [{ zh: "花莲市", en: "Hualien City" }],
    },
    {
      state: { zh: "台东县", en: "Taitung County" },
      cities: [{ zh: "台东市", en: "Taitung City" }],
    },
    {
      state: { zh: "澎湖县", en: "Penghu County" },
      cities: [{ zh: "马公市", en: "Magong" }],
    },
    {
      state: { zh: "金门县", en: "Kinmen County" },
      cities: [{ zh: "金城镇", en: "Jincheng" }],
    },
    {
      state: { zh: "连江县", en: "Lienchiang County" },
      cities: [{ zh: "南竿乡", en: "Nangan" }],
    },
  ],

  // 美国（50 州 + 哥伦比亚特区）
  US: [
    {
      state: { zh: "阿拉巴马州", en: "Alabama" },
      cities: [{ zh: "伯明翰", en: "Birmingham" }, { zh: "蒙哥马利", en: "Montgomery" }, { zh: "亨茨维尔", en: "Huntsville" }],
    },
    {
      state: { zh: "阿拉斯加州", en: "Alaska" },
      cities: [{ zh: "安克雷奇", en: "Anchorage" }, { zh: "费尔班克斯", en: "Fairbanks" }, { zh: "朱诺", en: "Juneau" }],
    },
    {
      state: { zh: "亚利桑那州", en: "Arizona" },
      cities: [{ zh: "凤凰城", en: "Phoenix" }, { zh: "图森", en: "Tucson" }, { zh: "梅萨", en: "Mesa" }],
    },
    {
      state: { zh: "阿肯色州", en: "Arkansas" },
      cities: [{ zh: "小石城", en: "Little Rock" }, { zh: "费耶特维尔", en: "Fayetteville" }],
    },
    {
      state: { zh: "加利福尼亚州", en: "California" },
      cities: [
        { zh: "洛杉矶", en: "Los Angeles" },
        { zh: "旧金山", en: "San Francisco" },
        { zh: "圣地亚哥", en: "San Diego" },
        { zh: "圣何塞", en: "San Jose" },
        { zh: "萨克拉门托", en: "Sacramento" },
        { zh: "弗雷斯诺", en: "Fresno" },
        { zh: "长滩", en: "Long Beach" },
        { zh: "奥克兰", en: "Oakland" },
      ],
    },
    {
      state: { zh: "科罗拉多州", en: "Colorado" },
      cities: [{ zh: "丹佛", en: "Denver" }, { zh: "科罗拉多斯普林斯", en: "Colorado Springs" }, { zh: "奥罗拉", en: "Aurora" }],
    },
    {
      state: { zh: "康涅狄格州", en: "Connecticut" },
      cities: [{ zh: "哈特福德", en: "Hartford" }, { zh: "纽黑文", en: "New Haven" }, { zh: "斯坦福", en: "Stamford" }],
    },
    {
      state: { zh: "特拉华州", en: "Delaware" },
      cities: [{ zh: "多佛", en: "Dover" }, { zh: "威尔明顿", en: "Wilmington" }],
    },
    {
      state: { zh: "佛罗里达州", en: "Florida" },
      cities: [
        { zh: "迈阿密", en: "Miami" },
        { zh: "奥兰多", en: "Orlando" },
        { zh: "坦帕", en: "Tampa" },
        { zh: "杰克逊维尔", en: "Jacksonville" },
        { zh: "塔拉哈西", en: "Tallahassee" },
      ],
    },
    {
      state: { zh: "佐治亚州", en: "Georgia" },
      cities: [{ zh: "亚特兰大", en: "Atlanta" }, { zh: "萨凡纳", en: "Savannah" }],
    },
    {
      state: { zh: "夏威夷州", en: "Hawaii" },
      cities: [{ zh: "火奴鲁鲁", en: "Honolulu" }, { zh: "希洛", en: "Hilo" }],
    },
    {
      state: { zh: "爱达荷州", en: "Idaho" },
      cities: [{ zh: "博伊西", en: "Boise" }, { zh: "默里迪恩", en: "Meridian" }],
    },
    {
      state: { zh: "伊利诺伊州", en: "Illinois" },
      cities: [{ zh: "芝加哥", en: "Chicago" }, { zh: "奥罗拉", en: "Aurora" }, { zh: "斯普林菲尔德", en: "Springfield" }],
    },
    {
      state: { zh: "印第安纳州", en: "Indiana" },
      cities: [{ zh: "印第安纳波利斯", en: "Indianapolis" }, { zh: "韦恩堡", en: "Fort Wayne" }],
    },
    {
      state: { zh: "爱荷华州", en: "Iowa" },
      cities: [{ zh: "得梅因", en: "Des Moines" }, { zh: "锡达拉皮兹", en: "Cedar Rapids" }],
    },
    {
      state: { zh: "堪萨斯州", en: "Kansas" },
      cities: [{ zh: "威奇托", en: "Wichita" }, { zh: "托皮卡", en: "Topeka" }],
    },
    {
      state: { zh: "肯塔基州", en: "Kentucky" },
      cities: [{ zh: "路易斯维尔", en: "Louisville" }, { zh: "莱克星顿", en: "Lexington" }],
    },
    {
      state: { zh: "路易斯安那州", en: "Louisiana" },
      cities: [{ zh: "新奥尔良", en: "New Orleans" }, { zh: "巴吞鲁日", en: "Baton Rouge" }],
    },
    {
      state: { zh: "缅因州", en: "Maine" },
      cities: [{ zh: "波特兰", en: "Portland" }, { zh: "奥古斯塔", en: "Augusta" }],
    },
    {
      state: { zh: "马里兰州", en: "Maryland" },
      cities: [{ zh: "巴尔的摩", en: "Baltimore" }, { zh: "安纳波利斯", en: "Annapolis" }, { zh: "银泉", en: "Silver Spring" }],
    },
    {
      state: { zh: "马萨诸塞州", en: "Massachusetts" },
      cities: [{ zh: "波士顿", en: "Boston" }, { zh: "剑桥", en: "Cambridge" }, { zh: "伍斯特", en: "Worcester" }],
    },
    {
      state: { zh: "密歇根州", en: "Michigan" },
      cities: [{ zh: "底特律", en: "Detroit" }, { zh: "大急流城", en: "Grand Rapids" }, { zh: "兰辛", en: "Lansing" }],
    },
    {
      state: { zh: "明尼苏达州", en: "Minnesota" },
      cities: [{ zh: "明尼阿波利斯", en: "Minneapolis" }, { zh: "圣保罗", en: "Saint Paul" }],
    },
    {
      state: { zh: "密西西比州", en: "Mississippi" },
      cities: [{ zh: "杰克逊", en: "Jackson" }, { zh: "格尔夫波特", en: "Gulfport" }],
    },
    {
      state: { zh: "密苏里州", en: "Missouri" },
      cities: [{ zh: "堪萨斯城", en: "Kansas City" }, { zh: "圣路易斯", en: "St. Louis" }, { zh: "斯普林菲尔德", en: "Springfield" }],
    },
    {
      state: { zh: "蒙大拿州", en: "Montana" },
      cities: [{ zh: "比林斯", en: "Billings" }, { zh: "海伦娜", en: "Helena" }],
    },
    {
      state: { zh: "内布拉斯加州", en: "Nebraska" },
      cities: [{ zh: "奥马哈", en: "Omaha" }, { zh: "林肯", en: "Lincoln" }],
    },
    {
      state: { zh: "内华达州", en: "Nevada" },
      cities: [{ zh: "拉斯维加斯", en: "Las Vegas" }, { zh: "里诺", en: "Reno" }, { zh: "卡森城", en: "Carson City" }],
    },
    {
      state: { zh: "新罕布什尔州", en: "New Hampshire" },
      cities: [{ zh: "曼彻斯特", en: "Manchester" }, { zh: "康科德", en: "Concord" }],
    },
    {
      state: { zh: "新泽西州", en: "New Jersey" },
      cities: [{ zh: "纽瓦克", en: "Newark" }, { zh: "泽西城", en: "Jersey City" }, { zh: "特伦顿", en: "Trenton" }],
    },
    {
      state: { zh: "新墨西哥州", en: "New Mexico" },
      cities: [{ zh: "阿尔伯克基", en: "Albuquerque" }, { zh: "圣达菲", en: "Santa Fe" }],
    },
    {
      state: { zh: "纽约州", en: "New York" },
      cities: [
        { zh: "纽约市", en: "New York City" },
        { zh: "布法罗", en: "Buffalo" },
        { zh: "罗切斯特", en: "Rochester" },
        { zh: "奥尔巴尼", en: "Albany" },
        { zh: "雪城", en: "Syracuse" },
      ],
    },
    {
      state: { zh: "北卡罗来纳州", en: "North Carolina" },
      cities: [{ zh: "夏洛特", en: "Charlotte" }, { zh: "罗利", en: "Raleigh" }, { zh: "格林斯伯勒", en: "Greensboro" }],
    },
    {
      state: { zh: "北达科他州", en: "North Dakota" },
      cities: [{ zh: "法戈", en: "Fargo" }, { zh: "俾斯麦", en: "Bismarck" }],
    },
    {
      state: { zh: "俄亥俄州", en: "Ohio" },
      cities: [{ zh: "哥伦布", en: "Columbus" }, { zh: "克利夫兰", en: "Cleveland" }, { zh: "辛辛那提", en: "Cincinnati" }],
    },
    {
      state: { zh: "俄克拉荷马州", en: "Oklahoma" },
      cities: [{ zh: "俄克拉荷马城", en: "Oklahoma City" }, { zh: "塔尔萨", en: "Tulsa" }],
    },
    {
      state: { zh: "俄勒冈州", en: "Oregon" },
      cities: [{ zh: "波特兰", en: "Portland" }, { zh: "塞勒姆", en: "Salem" }, { zh: "尤金", en: "Eugene" }],
    },
    {
      state: { zh: "宾夕法尼亚州", en: "Pennsylvania" },
      cities: [{ zh: "费城", en: "Philadelphia" }, { zh: "匹兹堡", en: "Pittsburgh" }, { zh: "哈里斯堡", en: "Harrisburg" }],
    },
    {
      state: { zh: "罗德岛州", en: "Rhode Island" },
      cities: [{ zh: "普罗维登斯", en: "Providence" }, { zh: "纽波特", en: "Newport" }],
    },
    {
      state: { zh: "南卡罗来纳州", en: "South Carolina" },
      cities: [{ zh: "查尔斯顿", en: "Charleston" }, { zh: "哥伦比亚", en: "Columbia" }],
    },
    {
      state: { zh: "南达科他州", en: "South Dakota" },
      cities: [{ zh: "苏福尔斯", en: "Sioux Falls" }, { zh: "皮尔", en: "Pierre" }],
    },
    {
      state: { zh: "田纳西州", en: "Tennessee" },
      cities: [{ zh: "纳什维尔", en: "Nashville" }, { zh: "孟菲斯", en: "Memphis" }, { zh: "诺克斯维尔", en: "Knoxville" }],
    },
    {
      state: { zh: "得克萨斯州", en: "Texas" },
      cities: [
        { zh: "休斯顿", en: "Houston" },
        { zh: "达拉斯", en: "Dallas" },
        { zh: "奥斯汀", en: "Austin" },
        { zh: "圣安东尼奥", en: "San Antonio" },
        { zh: "沃斯堡", en: "Fort Worth" },
      ],
    },
    {
      state: { zh: "犹他州", en: "Utah" },
      cities: [{ zh: "盐湖城", en: "Salt Lake City" }, { zh: "普罗沃", en: "Provo" }],
    },
    {
      state: { zh: "佛蒙特州", en: "Vermont" },
      cities: [{ zh: "伯灵顿", en: "Burlington" }, { zh: "蒙彼利埃", en: "Montpelier" }],
    },
    {
      state: { zh: "弗吉尼亚州", en: "Virginia" },
      cities: [{ zh: "弗吉尼亚海滩", en: "Virginia Beach" }, { zh: "里士满", en: "Richmond" }, { zh: "阿灵顿", en: "Arlington" }],
    },
    {
      state: { zh: "华盛顿州", en: "Washington" },
      cities: [
        { zh: "西雅图", en: "Seattle" },
        { zh: "斯波坎", en: "Spokane" },
        { zh: "塔科马", en: "Tacoma" },
        { zh: "奥林匹亚", en: "Olympia" },
      ],
    },
    {
      state: { zh: "西弗吉尼亚州", en: "West Virginia" },
      cities: [{ zh: "查尔斯顿", en: "Charleston" }, { zh: "亨廷顿", en: "Huntington" }],
    },
    {
      state: { zh: "威斯康星州", en: "Wisconsin" },
      cities: [{ zh: "密尔沃基", en: "Milwaukee" }, { zh: "麦迪逊", en: "Madison" }],
    },
    {
      state: { zh: "怀俄明州", en: "Wyoming" },
      cities: [{ zh: "夏延", en: "Cheyenne" }, { zh: "卡斯珀", en: "Casper" }],
    },
    // 哥伦比亚特区（首都华盛顿所在地）
    {
      state: { zh: "哥伦比亚特区", en: "District of Columbia" },
      cities: [{ zh: "华盛顿", en: "Washington" }],
    },
  ],

  // 日本（保留原有主要地区）
  JP: [
    {
      state: { zh: "東京都", en: "Tokyo" },
      cities: [
        { zh: "千代田区", en: "Chiyoda" },
        { zh: "中央区", en: "Chuo" },
        { zh: "港区", en: "Minato" },
        { zh: "新宿区", en: "Shinjuku" },
        { zh: "涩谷区", en: "Shibuya" },
      ],
    },
    {
      state: { zh: "大阪府", en: "Osaka" },
      cities: [
        { zh: "大阪市", en: "Osaka City" },
        { zh: "堺市", en: "Sakai" },
        { zh: "东大阪市", en: "Higashiosaka" },
      ],
    },
    {
      state: { zh: "京都府", en: "Kyoto" },
      cities: [{ zh: "京都市", en: "Kyoto City" }],
    },
  ],

  // 韩国
  KR: [
    {
      state: { zh: "首尔特别市", en: "Seoul" },
      cities: [
        { zh: "江南区", en: "Gangnam" },
        { zh: "中区", en: "Jung" },
        { zh: "钟路区", en: "Jongno" },
        { zh: "瑞草区", en: "Seocho" },
      ],
    },
    {
      state: { zh: "釜山广域市", en: "Busan" },
      cities: [{ zh: "中区", en: "Jung" }, { zh: "海云台区", en: "Haeundae" }],
    },
  ],

  // 加拿大
  CA: [
    {
      state: { zh: "安大略省", en: "Ontario" },
      cities: [
        { zh: "多伦多", en: "Toronto" },
        { zh: "渥太华", en: "Ottawa" },
        { zh: "密西沙加", en: "Mississauga" },
      ],
    },
    {
      state: { zh: "不列颠哥伦比亚省", en: "British Columbia" },
      cities: [
        { zh: "温哥华", en: "Vancouver" },
        { zh: "维多利亚", en: "Victoria" },
      ],
    },
    {
      state: { zh: "魁北克省", en: "Quebec" },
      cities: [{ zh: "蒙特利尔", en: "Montreal" }, { zh: "魁北克市", en: "Quebec City" }],
    },
  ],

  // 英国
  GB: [
    {
      state: { zh: "大伦敦", en: "Greater London" },
      cities: [{ zh: "伦敦", en: "London" }],
    },
    {
      state: { zh: "大曼彻斯特", en: "Greater Manchester" },
      cities: [{ zh: "曼彻斯特", en: "Manchester" }],
    },
    {
      state: { zh: "西约克郡", en: "West Yorkshire" },
      cities: [{ zh: "利兹", en: "Leeds" }],
    },
  ],

  // 法国
  FR: [
    {
      state: { zh: "法兰西岛", en: "Île-de-France" },
      cities: [{ zh: "巴黎", en: "Paris" }, { zh: "凡尔赛", en: "Versailles" }],
    },
    {
      state: { zh: "罗讷-阿尔卑斯", en: "Rhône-Alpes" },
      cities: [{ zh: "里昂", en: "Lyon" }, { zh: "格勒诺布尔", en: "Grenoble" }],
    },
  ],

  // 德国
  DE: [
    {
      state: { zh: "柏林", en: "Berlin" },
      cities: [{ zh: "柏林", en: "Berlin" }],
    },
    {
      state: { zh: "巴伐利亚", en: "Bavaria" },
      cities: [{ zh: "慕尼黑", en: "Munich" }, { zh: "纽伦堡", en: "Nuremberg" }],
    },
    {
      state: { zh: "汉堡", en: "Hamburg" },
      cities: [{ zh: "汉堡", en: "Hamburg" }],
    },
  ],

  // 澳大利亚
  AU: [
    {
      state: { zh: "新南威尔士州", en: "New South Wales" },
      cities: [{ zh: "悉尼", en: "Sydney" }, { zh: "纽卡斯尔", en: "Newcastle" }],
    },
    {
      state: { zh: "维多利亚州", en: "Victoria" },
      cities: [{ zh: "墨尔本", en: "Melbourne" }],
    },
    {
      state: { zh: "昆士兰州", en: "Queensland" },
      cities: [{ zh: "布里斯班", en: "Brisbane" }, { zh: "黄金海岸", en: "Gold Coast" }],
    },
  ],

  // 新加坡
  SG: [
    {
      state: { zh: "新加坡中央区", en: "Central Region" },
      cities: [
        { zh: "新加坡", en: "Singapore" },
        { zh: "滨海湾", en: "Marina Bay" },
        { zh: "乌节路", en: "Orchard" },
      ],
    },
  ],
};

/** 判断某国家是否有省/州 级联数据。 */
export function hasRegionDivisions(countryCode: string): boolean {
  return !!REGION_DIVISIONS[countryCode];
}

/** 读取某国家的省/州 列表。 */
export function getStatesByCountry(
  countryCode: string,
): RegionDivision[] {
  return REGION_DIVISIONS[countryCode] ?? [];
}
