"use strict";

const STORAGE_KEY = "celebrity-sim-state-v2";
const API_KEY = "celebrity-sim-api-v1";

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const roll = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const statNames = {
  acting: "演技",
  singing: "唱跳",
  social: "社交",
  charm: "魅力",
  insight: "洞察",
  fame: "名气",
  money: "现金",
  fanLove: "粉丝黏性",
  mental: "心态",
  health: "健康",
  morality: "底线",
  scandal: "黑料风险",
};

const families = [
  ["poor", "贫寒家庭", "你从小在巷口背台词，知道一张通告费能压住多少窘迫。家人生病、被看轻、临时缺钱会成为常见暗线。", { money: 8, acting: 8, mental: 8, fanLove: 5, social: -4 }],
  ["middle", "普通中产", "家里不算富，但愿意给你买第一套正装。你拥有稳定起点，也背着父母对安全生活的期待。", { money: 22, mental: 5, health: 5 }],
  ["rich", "全国富豪之子/女", "你的姓氏本身就是入场券。资源多，质疑也多，豪门交易和继承风波会频繁靠近。", { money: 68, social: 10, fame: 8, scandal: 8, fanLove: -5 }],
  ["illegitimate", "豪门私生子/女", "你拥有一半金光和一半阴影。羞辱、争产、承认与否，会成为长期剧情。", { money: 35, charm: 8, insight: 10, mental: -8, scandal: 12 }],
  ["art", "文艺世家", "家里懂剧院和片场，能教你审美，也会用严苛标准审判你。", { acting: 12, singing: 6, insight: 6, money: 24 }],
].map(([id, name, desc, stats]) => ({ id, name, desc, stats }));

const perks = [
  ["镜头宠儿", "红毯、硬照、路透都容易被放大成出圈瞬间。", { charm: 10, fame: 5 }],
  ["台词怪物", "长段独白不怯场，正剧导演会记住你。", { acting: 12 }],
  ["舞台体力", "高强度排练后仍能保持状态。", { singing: 8, health: 8 }],
  ["热搜体质", "一句话都可能被剪成爆点。", { fame: 10, scandal: 4 }],
  ["富贵脸", "奢牌和古偶妆造会主动找上门。", { charm: 9, money: 8 }],
  ["草根共情", "粉丝觉得你真实，路人愿意听你解释。", { fanLove: 12, social: 4 }],
  ["冷静公关", "风波里能先稳住呼吸再开口。", { mental: 10, scandal: -6 }],
  ["人脉嗅觉", "饭局里总能找到真正能拍板的人。", { social: 12 }],
  ["学习狂", "技能成长更快，后期培养收益更高。", { acting: 5, singing: 5, insight: 5 }],
  ["家族庇护", "有人会替你挡掉一部分恶意。", { money: 12, scandal: -4 }],
  ["破碎感", "脆弱气质容易吸引虐恋剧本和保护欲粉丝。", { charm: 8, fanLove: 7, mental: -3 }],
  ["黑红免疫", "被骂时掉血更少，争议也能转成流量。", { mental: 10, fame: 6, morality: -4 }],
  ["清白履历", "合作方更敢押你，代言审核更顺。", { scandal: -12, money: 5 }],
  ["天籁嗓", "OST、音乐综艺和现场会给你加分。", { singing: 14 }],
  ["即兴反应", "采访、直播、突袭都更容易化险为夷。", { social: 7, insight: 7 }],
  ["强心脏", "高压剧组和恶剪综艺很难击穿你。", { mental: 15 }],
  ["贵人缘", "关键节点更容易遇到愿意伸手的人。", { social: 8, fame: 4 }],
  ["野心明亮", "你不怕说想红，事业推进更快。", { fame: 6, mental: 5, morality: -2 }],
  ["古典气质", "年代戏、仙侠、艺术片适配度高。", { acting: 7, charm: 7 }],
  ["综艺感", "能接梗也能造梗。", { social: 9, fanLove: 5 }],
  ["数据粉盘", "初期就有能打投控评的核心粉。", { fanLove: 14, scandal: 3 }],
  ["商业脑", "会谈分成，也会判断项目值不值得。", { money: 14, insight: 4 }],
  ["自律饮食", "身体状态稳定，不容易被行程拖垮。", { health: 12, charm: 3 }],
  ["边界清晰", "暧昧、私联、饭局都更不容易失控。", { scandal: -8, morality: 6 }],
  ["危险吸引力", "让人想靠近又害怕。", { charm: 12, scandal: 5 }],
  ["反差萌", "冷脸和幼稚小动作并存，粉圈很吃。", { fanLove: 8, charm: 5 }],
  ["剧本雷达", "能看出烂项目和隐藏爆款。", { insight: 12 }],
  ["资本语言", "听得懂合同、估值和资源置换。", { money: 9, social: 5 }],
  ["伤痛转化", "家庭和舆论带来的痛会变成表演材料。", { acting: 8, mental: 5 }],
  ["美强惨叙事", "越被压，越容易激起保护盘。", { fanLove: 10, fame: 4, health: -3 }],
  ["端水大师", "CP、唯粉、路人之间不容易翻车。", { social: 8, scandal: -4 }],
  ["路人缘", "不追星的人也愿意夸你一句顺眼。", { fame: 5, fanLove: 8 }],
  ["审美掌控", "妆造、拍摄、舞美能被你拉高一档。", { charm: 7, insight: 7 }],
  ["狠人执行", "决定要做的事会做到极致。", { acting: 5, singing: 5, mental: 5, health: -3 }],
  ["温柔人格", "工作人员愿意替你说好话。", { social: 7, fanLove: 6 }],
  ["神秘背景", "越查不到越有人猜，传闻会变成光环。", { fame: 8, scandal: 6, charm: 5 }],
  ["危机嗅觉", "塌房前一秒能闻到风向。", { insight: 10, scandal: -5 }],
  ["亲和直播", "直播间像深夜电台，粉丝愿意留下。", { fanLove: 9, money: 4 }],
  ["导演缘", "创作者喜欢你对角色的理解。", { acting: 8, social: 5 }],
  ["逆风翻盘", "低谷时额外触发反击故事。", { mental: 8, fame: 4, fanLove: 4 }],
].map((p, i) => ({ id: `perk-${i}`, name: p[0], desc: p[1], stats: p[2] }));

const npcPool = [
  ["lin", "林予川", 29, "电影导演", "男", "双性恋，偏爱独立、有主见的人", ["温柔", "控制欲藏得深", "艺术洁癖"], "他的人生轨迹像一条慢河：少年成名后拍砸过一部电影，于是开始迷信真实。他会被清醒的人吸引，也会在关系里反复确认边界。", "#2f6f73"],
  ["shen", "沈雾", 26, "顶流歌手", "女", "泛性恋，容易被强者吸引", ["病娇感", "占有欲", "舞台疯子"], "她从练习室一路杀出来，习惯把爱和胜负混在一起。越亲近，越会暴露不安与独占欲。", "#672b47"],
  ["qiao", "乔砚", 34, "经纪公司合伙人", "男", "同性恋，喜欢成熟稳定型", ["霸道", "现实", "护短"], "他见过太多塌房和背叛，所以凡事先谈筹码。他能给资源，也会要求你证明价值。", "#30343f"],
  ["yan", "晏青梨", 31, "制片人", "女", "女同/双性恋，欣赏锋利野心", ["GB气质", "冷静", "资源强"], "她擅长让所有人坐到正确的位置上。亲密关系里也如此，但她尊重明确拒绝。", "#145c58"],
  ["xie", "谢燃", 24, "新晋演员", "男", "异性恋，可被亲密相处影响", ["阳光", "自卑", "吃醋"], "他总在笑，心里却怕自己只是被短暂喜欢。你给他确定感，他会迅速靠近。", "#cb6e4f"],
  ["su", "苏弥", 28, "时尚主编", "非二元", "酷儿，重视精神共振", ["神秘", "审美毒舌", "温柔后撤"], "TA 的世界由规则、暗号和审美组成。被看懂时会靠近，被冒犯时会消失。", "#635380"],
  ["he", "贺云岑", 37, "影帝", "男", "双性恋，偏爱强强关系", ["克制", "前辈感", "低温占有"], "他用十年把自己修成奖杯，也把柔软藏进无人区。想靠近他，需要先赢得尊重。", "#414833"],
  ["rui", "容芮", 23, "女团 ACE", "女", "双性恋，喜欢会保护她的人", ["甜酷", "野心", "社恐"], "她在镜头前无懈可击，收工后却常常发呆。她害怕被淘汰，也害怕被真正看见。", "#b8445f"],
  ["mo", "莫栖", 32, "编剧", "女", "泛性恋，爱灵魂先于外表", ["敏感", "疯批文人", "记仇"], "她会把你说过的每句话写进角色里。她的爱像锋利注释，温柔也疼。", "#7b2741"],
  ["lu", "陆承白", 30, "资本代表", "男", "异性恋，偏爱漂亮而危险的人", ["精英", "交易感", "控制欲"], "他相信世界都是价格表，直到遇见不能定价的人。向他要资源很容易，欠人情很难。", "#1f2f46"],
  ["ji", "纪南星", 27, "电竞跨界明星", "男", "双性恋，喜欢轻松直接的人", ["嘴欠", "护短", "少年气"], "他从另一个名利场闯进娱乐圈，不懂规矩，却懂输赢。", "#22577a"],
  ["tang", "唐泠", 35, "唱片制作人", "女", "女同，偏爱稳定关系", ["温柔", "慢热", "听觉洁癖"], "她能听出你声音里的裂缝，也会在你最狼狈时替你关掉麦克风。", "#8a6f3f"],
  ["wei", "魏照夜", 40, "金牌律师", "男", "同性恋，偏爱理性强者", ["冷峻", "边界感", "保护欲"], "他处理过无数娱乐圈危机，知道每个谣言如何长成刀。", "#354f52"],
  ["an", "安瓷", 25, "黑红网红", "女", "泛性恋，喜欢刺激", ["叛逆", "会演", "危险"], "她靠争议活下来，也差点被争议吞掉。靠近她，像站在热搜边缘。", "#9b2226"],
  ["bai", "白澈", 22, "新人爱豆", "男", "双性恋，易被引导", ["乖顺", "慕强", "易碎"], "他还没学会名利场的暗语，所以每次心动都像递出软肋。", "#669bbc"],
  ["du", "杜若衡", 33, "摄影师", "男", "酷儿，偏爱自由灵魂", ["浪子", "观察者", "不承诺"], "他拍过太多漂亮面孔，只对镜头背后仍真实的人停留。", "#6a4c93"],
  ["cheng", "程曼殊", 38, "电视台制片", "女", "双性恋，偏爱聪明人", ["强势", "周全", "资源网"], "她知道谁会红，也知道谁会死在舆论里。她帮你时，总有第二层理由。", "#386641"],
  ["yu", "虞照", 29, "话剧演员", "男", "异性恋，偏爱文艺气质", ["清高", "深情", "慢燃"], "他讨厌流量，却羡慕被看见。和他相处，要先拆掉他的偏见。", "#6c584c"],
  ["ning", "宁曦", 31, "豪门千金", "女", "女同，喜欢漂亮野心家", ["骄矜", "慷慨", "占有"], "她把爱当收藏，也把资源当玫瑰。她给得起，但想要你心甘情愿。", "#bc6c25"],
  ["zhao", "赵临川", 36, "反派专业户", "男", "双性恋，偏爱反差感", ["幽默", "疯感", "清醒"], "他在戏里杀伐，戏外很会照顾人。越熟，越能看见他的悲观。", "#4a4e69"],
].map(([id, name, age, job, gender, orientation, traits, arc, color]) => ({
  id,
  name,
  age,
  job,
  gender,
  orientation,
  traits,
  arc,
  kink: "偏好以成年、自愿、边界明确的方式呈现，亲密剧情会淡出镜头。",
  palette: [color, "#f0d084", "#2f2f38"],
}));

const eventThemes = [
  ["粉丝事件", "机场有粉丝冲破栏杆递来长信，信里写着她如何靠你的角色撑过低谷。你认真道谢，也提醒大家别越过安全线。", { fanLove: 7, scandal: 2, mental: -2 }],
  ["私联传闻", "有人晒出疑似小号聊天记录，真假难辨。粉圈开始分裂，团队要求你立刻决定沉默、澄清还是承认曾回复鼓励私信。", { scandal: 8, fanLove: -5, social: 2 }],
  ["包养邀约", "饭局散场后，投资人助理递来房卡和资源清单。捷径很轻，代价很重。你意识到每一次点头都会留下把柄。", { money: 10, fame: 5, morality: -9, scandal: 10 }],
  ["地下恋爱", "狗仔拍到你和神秘人同进小区。照片模糊，却足够让全网编十版爱情故事。", { fame: 6, fanLove: -6, scandal: 7, mental: -4 }],
  ["堕落路线", "连续通宵后，有人说只要把自己当商品，痛苦就会少一点。你差点被说服。", { fame: 6, money: 8, mental: -8, morality: -7 }],
  ["粉圈内斗", "大粉为应援账目吵上热搜，黑粉趁机带节奏。你要求公开明细，却也被指责过度下场。", { fanLove: 6, scandal: 3, social: -2 }],
  ["跟踪危机", "陌生账号连续七天发你的路透，还准确说出行程。那不是爱，是越界。", { mental: -6, scandal: 2, fanLove: -2 }],
  ["正向高光", "片场临时改戏，你用一场无声哭戏救回整段剧情。导演让场记把你的名字单独标出来。", { acting: 6, fame: 5, fanLove: 4 }],
  ["品牌审查", "奢牌法务翻出你早年的争议发言，要求今晚前给出说明。互联网不会忘记轻狂。", { money: -4, scandal: 5, insight: 3 }],
  ["资源置换", "平台递来一份捆绑合约，表面是主角，背后要你带一个关系户。", { fame: 5, money: 4, morality: -3, scandal: 3 }],
  ["导演试探", "导演单独约你聊角色，话题却绕到私人生活。你把话题带回剧本，空气安静了几秒。", { acting: 4, scandal: -2, social: 2 }],
  ["黑粉爆料", "黑粉整理了三十页所谓证据，里面大半是断章取义。你的团队一边辟谣一边心疼预算。", { scandal: 6, mental: -4, fanLove: 3 }],
  ["家人求助", "家里人打来电话，说钱周转不开。亲情和事业账本忽然叠在一起。", { money: -8, mental: -5, morality: 2 }],
  ["豪门羞辱", "宴会上有人故意叫错你的姓，又笑着说只是玩笑。你第一次想把所有轻蔑都还回去。", { mental: -7, fame: 4, morality: -4 }],
  ["直播失控", "直播弹幕突然刷屏问你隐私。你笑着转开话题，手心却出了一层汗。", { social: 5, fanLove: 4, mental: -3 }],
  ["代言翻车", "品牌合作方被曝问题，你的海报还挂在首页。撤不撤，都会有人骂。", { money: -6, scandal: 7, insight: 4 }],
  ["同行抢角", "熟人截走你谈了三个月的角色，还发消息说希望你别介意。", { acting: 3, mental: -5, social: -2 }],
  ["资本施压", "资方暗示，只要你公开站队，下部戏就是你的。经纪人让你先别急着拒绝。", { money: 8, fame: 4, morality: -5, scandal: 5 }],
  ["CP 失控", "营业 CP 被粉丝当真，另一方团队开始借你炒热度。", { fame: 7, fanLove: -2, scandal: 5 }],
  ["救场演出", "前辈临时生病，你被推上舞台救场。灯亮起时，你听见自己心跳像鼓点。", { singing: 6, fame: 5, health: -3 }],
];

const dailyEvents = Array.from({ length: 100 }, (_, i) => {
  const [tag, text, effects] = eventThemes[i % eventThemes.length];
  const extra = [
    "你没有立刻回答，而是先看向窗外的广告屏，上面正循环播放你笑得最完美的一秒。",
    "经纪人压低声音说：这件事处理不好，会变成你很久以后的标签。",
    "热搜词条像潮水一样涨上来，你忽然分不清这是机会还是审判。",
    "你想起入圈第一天的自己，那个时候还以为努力可以解释一切。",
    "有人在背后递刀，也有人在深夜给你发来一句撑住。",
  ][Math.floor(i / 20)];
  return { tag: `${tag} ${i + 1}`, type: "event", text: `${text}${extra}`, effects };
});

const actionPool = [
  ["audition", "试镜抢角", "去竞争激烈的剧组，把自己塞进导演视线。", "白炽灯把人照得没有退路。你没有急着落泪，而是先把角色的骄傲撑起来，直到最后一句台词才让声音裂开。副导演低头写了很久，你知道这至少不是被遗忘的一天。", { acting: 4, fame: 4, mental: -2 }],
  ["train", "封闭训练", "唱跳、台词、体态、镜头感，今天只和自己较劲。", "练功房的镜子把疲惫照得无处可藏。你一遍遍重来，直到舞步和呼吸终于贴合，直到台词不再像背诵，而像从身体里长出来。", { acting: 3, singing: 3, health: -2, mental: 1 }],
  ["variety", "综艺营业", "用反应、笑点和分寸换一波路人盘。", "主持人抛来一个带刺的问题，全场等着你失态。你笑了一下，把刺拆成包袱，又把包袱递回给对方。弹幕开始刷：这个人有点东西。", { social: 4, fanLove: 4, fame: 3, health: -2 }],
  ["family", "处理家庭", "回到原生家庭的故事里，那里有支撑也有伤口。", "你关掉工作手机，坐上回家的车。名利场的噪声暂时被隔开，但旧日的期待、亏欠和秘密也在门后等你。", { mental: 4, social: 2 }],
  ["fans", "粉丝沟通", "直播、信件、见面会，处理爱意和边界。", "你读到一封长信，写信的人说因为你才熬过最糟的一年。你郑重感谢，也提醒大家先过好自己的生活。", { fanLove: 7, mental: 2, scandal: -1 }],
  ["dark", "灰色饭局", "进入更暗的房间，拿资源，也付出代价。", "包厢里每个人都笑得熟练。有人讲项目，有人讲情分，有人把规矩藏在玩笑里递给你。你可以只喝茶，也可以把名字押进桌上的游戏。", { money: 12, fame: 6, morality: -8, scandal: 8, mental: -3 }],
  ["rest", "休息复盘", "睡觉、看剧本、写日记，守住没被消耗完的自己。", "你把窗帘拉开，让阳光落在乱糟糟的剧本上。今天没有闪光灯，只有一杯温水和慢慢恢复清晰的自己。", { health: 10, mental: 8, fame: -1 }],
  ["charity", "公益露面", "用真实议题换回路人信任。", "你站在没有滤镜的现场，听一个普通人讲完自己的困境。镜头终于不再只拍你的脸，也拍见了你沉默时认真倾听的样子。", { fame: 3, fanLove: 5, morality: 4 }],
  ["script", "围读剧本", "和主创逐场拆解人物。", "桌上摊满便利贴，你把角色从第一场到最后一场的崩塌线重新梳理。编剧抬头看你，说这版可以写进修订稿。", { acting: 5, insight: 4, mental: -1 }],
  ["business", "谈商业约", "争取代言、分成和更好的宣发位置。", "会议室里没有人谈梦想，只有曝光、转化和风险。你第一次把自己的名字当成公司来谈，语气稳得像另一个人。", { money: 10, insight: 3, social: 2 }],
  ["resource", "向 NPC 要资源", "今日出现的 NPC 里，也许有人能递来项目。", "你没有绕弯子，直接问对方手里有没有适合你的机会。名利场喜欢含蓄，但真正饥饿的人不会假装不饿。", { social: 4, fame: 3, morality: -1 }],
  ["group", "多人局试探", "进入复杂关系场，可能触发 NP 暧昧或资源交换。", "一场私人局里，几条关系线同时交错。有人递酒，有人递资源，有人只递来一个意味深长的眼神。你保持清醒，知道所有亲密都必须建立在成年人自愿与边界上。", { charm: 5, social: 5, scandal: 6, morality: -2 }],
];

const popups = [
  ["深夜来电", "凌晨一点，经纪人说有个临时综艺缺人，强度极高，但播出位置很好。", [["接下通告", { fame: 8, money: 6, health: -7 }], ["拒绝休整", { health: 8, mental: 5, fame: -2 }], ["要求加价", { money: 10, social: 3, scandal: 2 }]]],
  ["旧照泄露", "有人放出你未出道时的派对旧照，照片本身没问题，标题却写得暧昧恶意。", [["坦然讲述过去", { fanLove: 7, scandal: -3 }], ["律师函警告", { scandal: -5, money: -5 }], ["顺势制造话题", { fame: 9, scandal: 5, morality: -2 }]]],
  ["暧昧试探", "熟悉的 NPC 问：如果事业和我站在对面，你会选哪边？", [["认真谈边界", { social: 6, mental: 3 }], ["给出暧昧答案", { charm: 6, scandal: 4 }], ["反问对方筹码", { insight: 6, morality: -2 }]]],
].map(([title, body, choices]) => ({ title, body, choices }));

function loadApi() {
  try {
    return JSON.parse(localStorage.getItem(API_KEY)) || { endpoint: "https://api.openai.com/v1/chat/completions", model: "gpt-4.1-mini", key: "" };
  } catch {
    return { endpoint: "", model: "", key: "" };
  }
}

function baseState() {
  const roster = sample(npcPool, 6).map((n) => n.id);
  return {
    created: false,
    view: "create",
    player: null,
    selectedPerks: [],
    stats: {},
    day: 1,
    age: 18,
    logs: [],
    relationships: Object.fromEntries(npcPool.map((n) => [n.id, { affection: 15, trust: 10, heat: 0, focus: false, history: [], gifts: 0, trajectory: [] }])),
    children: [],
    modal: null,
    api: loadApi(),
    chatNpc: roster[0],
    todaysNpcs: roster,
    todaysActions: sample(actionPool, 6).map((a) => a[0]),
  };
}

function loadState() {
  try {
    const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!loaded) return baseState();
    loaded.api = loaded.api || loadApi();
    loaded.relationships = loaded.relationships || {};
    npcPool.forEach((n) => {
      loaded.relationships[n.id] ||= { affection: 15, trust: 10, heat: 0, focus: false, history: [], gifts: 0, trajectory: [] };
      loaded.relationships[n.id].trajectory ||= [];
      loaded.relationships[n.id].history ||= [];
    });
    loaded.todaysNpcs ||= sample(npcPool, 6).map((n) => n.id);
    loaded.todaysActions ||= sample(actionPool, 6).map((a) => a[0]);
    return loaded;
  } catch {
    return baseState();
  }
}

let state = loadState();
const app = document.getElementById("app");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(API_KEY, JSON.stringify(state.api));
}

function applyEffects(effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    state.stats[key] = clamp((state.stats[key] ?? 50) + value, key === "money" ? -999 : 0, key === "money" ? 999 : 100);
  });
}

function effectText(effects = {}) {
  return Object.entries(effects).map(([k, v]) => `${statNames[k] || k}${v >= 0 ? "+" : ""}${v}`).join(" / ");
}

function addLog(title, body, type = "normal", effects) {
  state.logs.unshift({ day: state.day, title, body, type, effects: effects ? effectText(effects) : "" });
}

function npc(id) {
  return npcPool.find((n) => n.id === id);
}

function actionById(id) {
  const a = actionPool.find((item) => item[0] === id);
  return { id: a[0], name: a[1], desc: a[2], story: a[3], effects: a[4] };
}

function rerollDay() {
  const focused = Object.entries(state.relationships).filter(([, r]) => r.focus).map(([id]) => id);
  state.todaysNpcs = [...new Set([...focused, ...sample(npcPool, 6).map((n) => n.id)])].slice(0, 8);
  state.todaysActions = sample(actionPool, 6).map((a) => a[0]);
}

function startGame() {
  const name = document.getElementById("name").value.trim() || "无名新人";
  const gender = document.getElementById("gender").value;
  const family = families.find((f) => f.id === document.getElementById("family").value);
  if (state.selectedPerks.length !== 5) return alert("请选择正好五个优势。");
  state.player = { name, gender, family: family.id, familyName: family.name };
  state.stats = { acting: 35, singing: 35, social: 35, charm: 35, insight: 35, fame: 8, money: 20, fanLove: 25, mental: 62, health: 65, morality: 72, scandal: 5 };
  applyEffects(family.stats);
  state.selectedPerks.map((id) => perks.find((p) => p.id === id)).forEach((p) => applyEffects(p.stats));
  state.created = true;
  state.view = "home";
  addLog("入圈第一天", `${name} 带着“${family.name}”的出身和五个优势进入娱乐圈。你会遇见临时资源、粉丝风暴、亲密关系、家庭旧账与更暗的交换。`, "normal");
  save();
  render();
}

function doAction(actionId) {
  const action = actionById(actionId);
  applyEffects(action.effects);
  addLog(action.name, action.story, "normal", action.effects);
  if (action.id === "resource") requestResource();
  if (action.id === "group") groupScene();
  triggerDailyEvent();
  state.day += 1;
  growChildren();
  rerollDay();
  if (state.day % 3 === 0) state.modal = pick(popups);
  save();
  render();
}

function triggerDailyEvent() {
  const event = pick(dailyEvents);
  applyEffects(event.effects);
  addLog(event.tag, event.text, event.type, event.effects);
}

function requestResource(id = pick(state.todaysNpcs)) {
  const n = npc(id);
  const rel = state.relationships[id];
  const success = rel.trust + rel.affection + state.stats.social + roll(0, 40) > 105;
  const effects = success ? { fame: 7, money: 5, social: 2 } : { mental: -3, social: 1, scandal: 2 };
  applyEffects(effects);
  rel.trajectory.unshift(`第 ${state.day} 天：你向 TA 要资源，${success ? "TA 给了一个试镜/商务入口，但提醒你欠人情要记得还。" : "TA 没有直接答应，只说时机不对。你听懂了拒绝，也听懂了考验。"}`);
  addLog(`向 ${n.name} 要资源`, success ? `${n.name}看完你的近况，递来一个项目联系人：“别谢太早，拿不拿得到还要看你自己。”` : `${n.name}把茶杯推远：“你现在要资源太急，会被人看轻。先做出一个能让我替你开口的理由。”`, success ? "normal" : "event", effects);
}

function groupScene() {
  const people = sample(state.todaysNpcs.map(npc), Math.min(3, state.todaysNpcs.length));
  const names = people.map((p) => p.name).join("、");
  addLog("多人关系局", `${names} 同时出现在一场私人聚会。话题从项目滑向关系，又从关系滑回筹码。你可以感觉到几条暧昧线彼此牵扯，但今晚所有越界都停在明确同意和清醒边界之前。`, "event", { charm: 4, scandal: 4 });
}

function resolveModalChoice(index) {
  const choice = state.modal.choices[index];
  applyEffects(choice[1]);
  addLog(state.modal.title, `${state.modal.body} 你选择了“${choice[0]}”。`, "event", choice[1]);
  state.modal = null;
  save();
  render();
}

function togglePerk(id) {
  if (state.selectedPerks.includes(id)) state.selectedPerks = state.selectedPerks.filter((p) => p !== id);
  else if (state.selectedPerks.length < 5) state.selectedPerks.push(id);
  else return alert("最多只能选择五个优势。");
  render();
}

function setView(view) {
  state.view = view;
  save();
  render();
}

function portrait(person, child) {
  const pal = person?.palette || child?.palette || ["#147c83", "#f2c078", "#7654a6"];
  return `<div class="portrait"><svg viewBox="0 0 120 160"><rect width="120" height="160" fill="${pal[0]}"/><circle cx="22" cy="24" r="5" fill="#fff" opacity=".55"/><path d="M14 160c8-39 28-58 46-58s39 19 47 58z" fill="${pal[2]}" opacity=".82"/><circle cx="61" cy="67" r="33" fill="#f1c7a5"/><path d="M25 67c2-36 24-50 50-43 20 5 31 22 28 48-18-13-33-12-49-32-6 13-15 21-29 27z" fill="#3f332f"/><path d="M43 76q6 5 12 0M68 76q6 5 12 0" stroke="#432" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M54 96q8 7 18 0" stroke="#9b4b4b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M31 122c20 18 39 18 58 0v38H31z" fill="${pal[1]}"/></svg></div>`;
}

function focusNpc(id) {
  state.relationships[id].focus = !state.relationships[id].focus;
  if (state.relationships[id].focus) state.chatNpc = id;
  rerollDay();
  save();
  render();
}

function interactNpc(id, mode) {
  const n = npc(id);
  const rel = state.relationships[id];
  const data = {
    chat: [`${n.name}听你说完今日的混乱，没有急着评价。TA 用符合自己性格的方式拆解你的处境，最后留下一个很轻的问题：你真正想保住的是名气，还是还没被名利场改坏的自己？`, { affection: 3, trust: 4 }],
    sex: [`你和${n.name}确认彼此都是成年人，也确认了边界、意愿和停止信号。之后的亲密被夜色带过；第二天醒来，关系里多了一层不能轻易命名的张力。`, { affection: 8, heat: 12, trust: 2, scandal: 4 }],
    gift: [`你送给${n.name}一份认真挑选的礼物。TA 没有立刻夸张回应，却把包装纸折得很整齐，像是把这份心意收进了私人领地。`, { affection: 7, money: -5 }],
    askGift: [`你半真半假地向${n.name}要礼物。TA 看出你的试探，${rel.affection > 45 ? "笑着答应，还顺手问你想要资源还是珠宝。" : "没有拒绝，却提醒你别把亲密变成索取的捷径。"}`, { affection: rel.affection > 45 ? 4 : -2, money: rel.affection > 45 ? 8 : 0, heat: 2 }],
    dinner: [`你和${n.name}吃了一顿避开镜头的晚餐。桌上没有宏大承诺，只有慢慢松动的戒备和几句差点说出口的真话。`, { affection: 6, trust: 5, mental: 3 }],
    resource: [`你向${n.name}开口要资源。TA 沉默片刻，像在衡量你、项目和风险之间的价格。`, { social: 2 }],
    np: [`你、${n.name}和另一位熟人进入一段复杂的成年人关系试探。暧昧、占有和资源彼此缠绕，但所有亲密都停留在自愿、清醒、可撤回的边界里。`, { charm: 5, heat: 8, scandal: 7, morality: -2 }],
  }[mode];
  applyEffects(data[1]);
  rel.affection = clamp(rel.affection + (data[1].affection || 0));
  rel.trust = clamp(rel.trust + (data[1].trust || 0));
  rel.heat = clamp(rel.heat + (data[1].heat || 0));
  rel.gifts += mode === "gift" ? 1 : 0;
  rel.trajectory.unshift(`第 ${state.day} 天：${data[0]}`);
  addLog(`互动：${n.name}`, data[0], mode === "sex" || mode === "np" ? "event" : "normal", data[1]);
  if (mode === "resource") requestResource(id);
  save();
  render();
}

function localChatOptions(n) {
  const rel = state.relationships[n.id];
  return [
    `聊事业：请${n.name}用“${n.traits[0]}”的一面评价我今天该不该抢资源。`,
    `聊关系：问${n.name}对占有、公开、边界和亲密节奏的真实态度。`,
    `聊暗线：让${n.name}判断一次饭局、舆论或多人关系局是否值得冒险。`,
  ].map((text, i) => ({ text, i, heat: rel.heat }));
}

function chooseLocalChat(i) {
  const n = npc(state.chatNpc);
  const rel = state.relationships[n.id];
  const tone = [
    `${n.name}把你的资源表推回来：“你可以抢，但别抢到忘了自己为什么要站上台。以你现在的位置，先拿一个能证明能力的项目，比拿一个空壳主角更重要。”`,
    `${n.name}沉默了几秒：“我有我的偏好和占有欲，但那不是逼你让步的理由。你可以靠近，也可以随时停下。真正让我心动的，是你说不的时候也很清醒。”`,
    `${n.name}看向门口，像确认没有人偷听：“暗线可以走，但每一步都要留证据、留退路、留清醒。多人关系和资源交换最容易把人拖进误会，别把刺激当成安全感。”`,
  ][i];
  rel.history.push({ role: "user", text: localChatOptions(n)[i].text });
  rel.history.push({ role: "assistant", text: tone });
  rel.affection = clamp(rel.affection + 2 + i);
  rel.trust = clamp(rel.trust + 2);
  save();
  render();
}

async function callNpcApi() {
  const n = npc(state.chatNpc);
  const rel = state.relationships[n.id];
  if (!rel.focus) return alert("只有特别关注的 NPC 才能长期聊天。");
  const input = document.getElementById("chatInput").value.trim();
  if (!input) return alert("先写一句你想说的话。");
  rel.history.push({ role: "user", text: input });
  document.getElementById("chatInput").value = "";
  save();
  render();
  if (!state.api.key || !state.api.endpoint || !state.api.model) {
    rel.history.push({ role: "assistant", text: `${n.name}说：“你还没填 API，所以我只能先用本地剧情回答。填好后，我会按我的性格、人生轨迹、取向和我们当前关系继续聊。”` });
    save();
    render();
    return;
  }
  try {
    const messages = [
      { role: "system", content: `你扮演娱乐圈模拟器 NPC：${n.name}，${n.age}岁，${n.job}，性别${n.gender}，性取向：${n.orientation}。性格：${n.traits.join("、")}。人生轨迹：${n.arc}。关系数值：好感${rel.affection}、信任${rel.trust}、张力${rel.heat}。所有亲密和成人内容必须是成年人、自愿、非露骨、淡出镜头，强调边界与同意。中文回复，故事感强，120-220字。` },
      ...rel.history.slice(-10).map((m) => ({ role: m.role, content: m.text })),
    ];
    const res = await fetch(state.api.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.api.key}` }, body: JSON.stringify({ model: state.api.model, messages, temperature: 0.9 }) });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    rel.history.push({ role: "assistant", text: data.choices?.[0]?.message?.content || "对方沉默了一会儿，像是在斟酌下一句话。" });
  } catch (err) {
    rel.history.push({ role: "assistant", text: `API 调用失败：${err.message}。请检查地址、模型名和密钥。` });
  }
  save();
  render();
}

function saveApi() {
  state.api.endpoint = document.getElementById("apiEndpoint").value.trim();
  state.api.model = document.getElementById("apiModel").value.trim();
  state.api.key = document.getElementById("apiKey").value.trim();
  save();
  alert("API 设置已保存到本机浏览器。");
}

function createChild(method) {
  const child = { id: `child-${Date.now()}`, name: pick(["星遥", "知夏", "听澜", "予白", "云起", "南枝", "照野", "明穗"]), age: 0, aptitude: roll(45, 98), template: pick(["镜头敏感型", "学术探索型", "商业继承型", "自由艺术型", "运动竞技型", "幕后创作型"]), perks: sample(perks, 3).map((p) => p.name), bond: 35, growth: 0, path: "尚未选择", method, palette: [pick(["#147c83", "#b8445f", "#7654a6", "#b17c18"]), "#f1c27d", "#3e2d2b"] };
  state.children.push(child);
  addLog("新生命", `你通过“${method}”迎来孩子 ${child.name}。TA 不是附属品，而是会长出自己选择的人。资质 ${child.aptitude}，模板为“${child.template}”。`, "family");
  save();
  render();
}

function growChildren() {
  state.children.forEach((child) => {
    child.growth += Math.max(1, Math.floor(child.aptitude / 30));
    if (child.growth >= 12) {
      child.growth = 0;
      child.age += 1;
      if (child.age >= 6 && Math.random() < child.aptitude / 130) child.path = pick(["音乐制作", "电影学院", "商业管理", "公益法律", "电竞解说", "海外读书", "娱乐圈星二代路线"]);
      addLog("孩子成长", `${child.name} 长大了一岁。${child.aptitude > 82 ? "即使你忙到缺席，天赋也在悄悄托住 TA。" : "TA 更需要稳定陪伴和耐心培养。"} 当前倾向：${child.path}。`, "family");
    }
  });
}

function trainChild(id, type) {
  const child = state.children.find((c) => c.id === id);
  child.bond = clamp(child.bond + (type === "bond" ? 12 : 5));
  child.aptitude = clamp(child.aptitude + (type === "art" ? 4 : type === "study" ? 3 : 1));
  child.growth += type === "bond" ? 2 : 5;
  applyEffects({ money: type === "bond" ? -2 : -8, mental: type === "bond" ? 4 : -1 });
  addLog(`培养 ${child.name}`, { art: "你为孩子安排表演、音乐和镜头课程。TA 不一定要进圈，但多了一种表达自己的语言。", study: "你陪 TA 做长期学习规划，告诉 TA 未来不必替你完成任何遗憾。", bond: "你推掉一个饭局，只陪 TA 吃饭、散步、聊天。很多培养不是课程，是被认真看见。" }[type], "family");
  save();
  render();
}

function inheritChild(id) {
  const child = state.children.find((c) => c.id === id);
  state.player = { name: child.name, gender: "可自定", family: "art", familyName: "星二代传承" };
  state.day = 1;
  state.stats = { acting: 38 + Math.floor(child.aptitude / 8), singing: 35 + Math.floor(child.aptitude / 10), social: 32, charm: 36, insight: 35, fame: 18, money: Math.max(20, Math.floor(state.stats.money / 2)), fanLove: 22, mental: 65, health: 72, morality: 70, scandal: 8 };
  state.children = state.children.filter((c) => c.id !== id);
  state.logs = [];
  addLog("传代开始", `${child.name} 继承上一代留下的名声、债、人脉和阴影，以星二代身份重新踏入娱乐圈。`, "family");
  save();
  render();
}

function render() {
  if (!state.created) {
    app.innerHTML = renderCreate();
    return;
  }
  app.innerHTML = `<div class="app-shell">${renderTopbar()}<main style="margin-top:18px">${renderView()}</main></div>${state.modal ? renderModal() : ""}`;
}

function renderTopbar() {
  const nav = [["home", "首页"], ["profile", "资料"], ["npcs", "今日 NPC"], ["focus", "特别关注"], ["chat", "AI 对话"], ["children", "子女"], ["api", "API"], ["logs", "日志"]];
  return `<header class="topbar"><div class="brand"><div class="brand-mark">星</div><div><h1>星河名利场</h1><p>娱乐圈模拟器 · 第 ${state.day} 天</p></div></div><nav class="nav">${nav.map(([id, label]) => `<button class="${state.view === id ? "active" : ""}" onclick="setView('${id}')">${label}</button>`).join("")}</nav></header>`;
}

function renderView() {
  return { home: renderHome, profile: renderProfilePage, npcs: renderNpcs, focus: renderFocus, chat: renderChat, children: renderChildren, api: renderApi, logs: renderLogs }[state.view]();
}

function renderProfileStats() {
  return `<div class="stats">${Object.keys(statNames).map((k) => `<div class="stat"><b>${statNames[k]} ${state.stats[k] ?? 0}</b><div class="bar"><span style="width:${clamp(state.stats[k] ?? 0)}%"></span></div></div>`).join("")}</div>`;
}

function renderProfilePage() {
  const fam = families.find((f) => f.id === state.player.family);
  return `<section class="panel"><h2>${state.player.name}</h2><div class="muted">${state.player.gender} · ${state.player.familyName} · ${state.age} 岁</div><p class="muted">${fam?.desc || "传代角色，背着上一代的光与影继续前进。"}</p>${renderProfileStats()}<div class="pill-row">${state.selectedPerks.map((id) => `<span class="pill">${perks.find((p) => p.id === id)?.name || id}</span>`).join("")}</div><button class="ghost-btn" onclick="localStorage.removeItem('${STORAGE_KEY}'); state = baseState(); render();">重开人生</button></section>`;
}

function renderHome() {
  return `<section class="panel hero-card"><h2>今天也要在灯光里活下来。</h2><p>每天可选行动和遇见的 NPC 都会刷新。突发事件池已有 100 条，故事会围绕粉丝、资源、恋爱、灰色交易、家庭和多人关系局展开。</p></section><section class="panel" style="margin-top:16px"><h2>今日行动</h2><div class="action-grid">${state.todaysActions.map(actionById).map((a) => `<button class="card action-card" onclick="doAction('${a.id}')"><h3>${a.name}</h3><p>${a.desc}</p><span class="muted">${effectText(a.effects)}</span></button>`).join("")}</div></section>`;
}

function renderNpcCard(n) {
  const rel = state.relationships[n.id];
  return `<article class="card npc-card">${portrait(n)}<div><h3>${n.name} · ${n.age}</h3><div class="npc-meta">${n.job} / ${n.gender}<br>${n.orientation}<br>特质：${n.traits.join("、")}<br>${n.arc}</div><div class="pill-row"><span class="pill">好感 ${rel.affection}</span><span class="pill">信任 ${rel.trust}</span><span class="pill">张力 ${rel.heat}</span></div><div class="card-actions"><button class="ghost-btn" onclick="focusNpc('${n.id}')">${rel.focus ? "取消特别关注" : "设为特别关注"}</button>${rel.focus ? `<button class="primary-btn" onclick="state.chatNpc='${n.id}'; setView('chat')">聊天</button>` : ""}</div></div></article>`;
}

function renderNpcs() {
  return `<section class="panel"><h2>今日 NPC</h2><p class="muted">每天出现的人都不一样。点“特别关注”后，对方会固定进入你的长期关系网，也才能一直聊天。</p><div class="npc-grid">${state.todaysNpcs.map(npc).map(renderNpcCard).join("")}</div></section>`;
}

function renderFocus() {
  const focused = npcPool.filter((n) => state.relationships[n.id].focus);
  if (!focused.length) return `<section class="panel"><h2>特别关注</h2><div class="empty">还没有特别关注的 NPC。今日 NPC 页面点亮一个人，之后这里会出现聊天、做爱、送礼物、要礼物、吃饭、要资源、NP 关系局等互动。</div></section>`;
  return `<section class="panel"><h2>特别关注</h2><div class="npc-grid">${focused.map((n) => `<article class="card npc-card">${portrait(n)}<div><h3>${n.name}</h3><div class="npc-meta">${n.traits.join("、")} · ${n.orientation}</div><div class="card-actions"><button class="primary-btn" onclick="state.chatNpc='${n.id}'; setView('chat')">聊天</button><button class="ghost-btn" onclick="interactNpc('${n.id}','dinner')">吃饭</button><button class="ghost-btn" onclick="interactNpc('${n.id}','gift')">送礼物</button><button class="ghost-btn" onclick="interactNpc('${n.id}','askGift')">要礼物</button><button class="ghost-btn" onclick="interactNpc('${n.id}','resource')">要资源</button><button class="danger-btn" onclick="interactNpc('${n.id}','sex')">做爱</button><button class="danger-btn" onclick="interactNpc('${n.id}','np')">NP 剧情</button></div><details><summary>人生轨迹</summary><p class="muted">${n.arc}</p><div class="log-list">${state.relationships[n.id].trajectory.map((t) => `<div class="log-item">${t}</div>`).join("") || `<div class="empty">还没有共同轨迹。</div>`}</div></details></div></article>`).join("")}</div></section>`;
}

function renderChat() {
  const n = npc(state.chatNpc);
  const rel = state.relationships[n.id];
  if (!rel.focus) return `<section class="panel"><h2>AI 对话</h2><div class="empty">只有特别关注的 NPC 才能一直聊天。先去今日 NPC 页面点“特别关注”。</div></section>`;
  const options = localChatOptions(n);
  return `<section class="split"><div class="panel chat-box"><h2>和 ${n.name} 对话</h2><div class="message-list">${rel.history.length ? rel.history.map((m) => `<div class="message ${m.role === "user" ? "me" : ""}">${m.text}</div>`).join("") : `<div class="empty">系统先给你三个符合 TA 性格的选项；不满意时，第四选项调用 API 自由输入。</div>`}</div><div class="choice-grid">${options.map((o) => `<button class="choice-btn" onclick="chooseLocalChat(${o.i})">${o.text}</button>`).join("")}</div><div class="field"><label>第四选项：调用 API 自由输入</label><textarea id="chatInput" rows="3" placeholder="写下你想对 ${n.name} 说的话"></textarea></div><button class="primary-btn" onclick="callNpcApi()">不满意，调用 API</button></div><aside class="panel">${renderNpcCard(n)}</aside></section>`;
}

function renderChildren() {
  return `<section class="panel"><h2>子女与传代</h2><p class="muted">子女只进入成长、教育、职业选择和传承系统。同性角色可通过共同育儿、辅助生育或代孕协议拥有孩子。</p><div class="card-actions"><button class="primary-btn" onclick="createChild('共同育儿')">共同育儿</button><button class="ghost-btn" onclick="createChild('辅助生育')">辅助生育</button><button class="ghost-btn" onclick="createChild('代孕协议')">代孕协议</button></div><div class="child-grid" style="margin-top:14px">${state.children.length ? state.children.map(renderChild).join("") : `<div class="empty">还没有孩子。</div>`}</div></section>`;
}

function renderChild(child) {
  return `<article class="card child-card"><div style="display:grid;grid-template-columns:76px 1fr;gap:12px">${portrait(null, child)}<div><h3>${child.name} · ${child.age} 岁</h3><div class="child-meta">方式：${child.method}<br>资质：${child.aptitude} / 羁绊：${child.bond}<br>模板：${child.template}<br>随机优势：${child.perks.join("、")}<br>未来倾向：${child.path}</div></div></div><div class="card-actions"><button class="ghost-btn" onclick="trainChild('${child.id}','art')">艺术培养</button><button class="ghost-btn" onclick="trainChild('${child.id}','study')">学业培养</button><button class="ghost-btn" onclick="trainChild('${child.id}','bond')">陪伴</button><button class="danger-btn" onclick="inheritChild('${child.id}')">选择传代</button></div></article>`;
}

function renderApi() {
  return `<section class="panel"><h2>AI 对话 API 设置</h2><p class="muted">使用 OpenAI 兼容的 Chat Completions 接口。前三个选项始终本地生成；第四个选项调用 API，并会带入 NPC 性格、人生轨迹和关系数值。</p><div class="form-grid"><div class="field"><label>接口地址</label><input id="apiEndpoint" value="${state.api.endpoint || ""}"></div><div class="field"><label>模型名</label><input id="apiModel" value="${state.api.model || ""}"></div><div class="field"><label>API Key</label><input id="apiKey" type="password" value="${state.api.key || ""}"></div></div><div class="footer-actions"><button class="primary-btn" onclick="saveApi()">保存 API</button></div></section>`;
}

function renderLogs() {
  return `<section class="panel"><h2>人生日志</h2><div class="log-list">${state.logs.map((l) => `<div class="log-item ${l.type}"><b>第 ${l.day} 天 · ${l.title}</b><br>${l.body}${l.effects ? `<br><span class="muted">${l.effects}</span>` : ""}</div>`).join("")}</div></section>`;
}

function renderModal() {
  return `<div class="modal-backdrop"><div class="modal"><h2>${state.modal.title}</h2><p>${state.modal.body}</p><div class="choice-grid">${state.modal.choices.map((c, i) => `<button class="choice-btn" onclick="resolveModalChoice(${i})">${c[0]}<br><span class="muted">${effectText(c[1])}</span></button>`).join("")}</div></div></div>`;
}

function renderCreate() {
  return `<div class="app-shell"><section class="panel hero-card"><h2>星河名利场</h2><p>从姓名、性别、家境和五个优势开始。你会遇见粉丝、狗仔、资本、亲密关系、家庭旧账、多人关系局和下一代传承。</p></section><section class="panel" style="margin-top:16px"><h2>创建角色</h2><div class="form-grid"><div class="field"><label>姓名</label><input id="name" placeholder="输入艺名或本名"></div><div class="field"><label>性别</label><select id="gender"><option>女</option><option>男</option><option>非二元</option></select></div><div class="field"><label>出生家境</label><select id="family">${families.map((f) => `<option value="${f.id}">${f.name}</option>`).join("")}</select></div></div><div class="panel" style="margin-top:14px;box-shadow:none"><h3>选择五个优势 <span class="muted">(${state.selectedPerks.length}/5)</span></h3><div class="perk-grid">${perks.map((p) => `<button class="perk ${state.selectedPerks.includes(p.id) ? "selected" : ""}" onclick="togglePerk('${p.id}')"><b>${p.name}</b><p class="muted">${p.desc}</p><span class="muted">${effectText(p.stats)}</span></button>`).join("")}</div></div><div class="footer-actions"><button class="primary-btn" onclick="startGame()">进入娱乐圈</button></div></section></div>`;
}

render();
