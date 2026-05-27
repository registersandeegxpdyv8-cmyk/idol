"use strict";

const STORAGE_KEY = "celebrity-sim-state-v1";
const API_KEY = "celebrity-sim-api-v1";

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
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
  {
    id: "poor",
    name: "贫寒家庭",
    desc: "你从小在巷口练台词，知道每一张通告费背后的重量。容易遇到被轻视、家人生病、资源被截胡的剧情。",
    stats: { money: 8, acting: 8, social: -4, mental: 8, fanLove: 5 },
  },
  {
    id: "middle",
    name: "普通中产",
    desc: "家里不算富，但愿意给你买第一套正装。开局稳定，剧情冲突更多来自事业选择。",
    stats: { money: 22, health: 5, mental: 5 },
  },
  {
    id: "rich",
    name: "全国富豪之子/女",
    desc: "你的姓氏本身就是入场券。钱和人脉充足，但也容易被质疑靠家里、被卷入豪门交易。",
    stats: { money: 68, social: 10, fame: 8, scandal: 8, fanLove: -5 },
  },
  {
    id: "illegitimate",
    name: "豪门私生子/女",
    desc: "你拥有一半金光和一半阴影。家族承认与否会成为长期剧情，霸凌、争产、羞辱和反击都会出现。",
    stats: { money: 35, charm: 8, insight: 10, mental: -8, scandal: 12 },
  },
  {
    id: "art",
    name: "文艺世家",
    desc: "父母熟悉剧院和片场，能教你审美，也会用严苛标准审判你。",
    stats: { acting: 12, singing: 6, insight: 6, money: 24 },
  },
];

const perks = [
  ["镜头宠儿", "天生知道镜头在哪，红毯与综艺都容易出圈。", { charm: 10, fame: 5 }],
  ["台词怪物", "长段独白不怯场，正剧导演会记住你。", { acting: 12 }],
  ["舞台体力", "高强度排练后仍能保持笑容。", { singing: 8, health: 8 }],
  ["热搜体质", "一句话都可能被剪成爆点。", { fame: 10, scandal: 4 }],
  ["富贵脸", "奢牌和古偶妆造会主动找上门。", { charm: 9, money: 8 }],
  ["草根共情", "粉丝觉得你真实，路人愿意听你解释。", { fanLove: 12, social: 4 }],
  ["冷静公关", "风波里能先稳住呼吸再开口。", { mental: 10, scandal: -6 }],
  ["人脉嗅觉", "你总能在饭局里找到真正能拍板的人。", { social: 12 }],
  ["学习狂", "技能成长更快，后期培养收益更高。", { acting: 5, singing: 5, insight: 5 }],
  ["家族庇护", "有人会替你挡掉一部分恶意。", { money: 12, scandal: -4 }],
  ["破碎感", "脆弱气质容易吸引虐恋剧本和保护欲粉丝。", { charm: 8, fanLove: 7, mental: -3 }],
  ["黑红免疫", "被骂时掉血更少，争议也能转化成流量。", { mental: 10, fame: 6, morality: -4 }],
  ["清白履历", "合作方更敢押你，代言审核更顺。", { scandal: -12, money: 5 }],
  ["天籁嗓", "OST、音乐综艺和现场会给你加分。", { singing: 14 }],
  ["即兴反应", "采访、直播、粉丝突袭都更容易化险为夷。", { social: 7, insight: 7 }],
  ["强心脏", "高压剧组和恶剪综艺很难击穿你。", { mental: 15 }],
  ["贵人缘", "关键节点更容易遇到愿意伸手的人。", { social: 8, fame: 4 }],
  ["野心明亮", "你不怕说想红，事业推进更快。", { fame: 6, mental: 5, morality: -2 }],
  ["古典气质", "年代戏、仙侠、艺术片适配度高。", { acting: 7, charm: 7 }],
  ["综艺感", "能接梗也能造梗。", { social: 9, fanLove: 5 }],
  ["数据粉盘", "初期就有能打投控评的核心粉。", { fanLove: 14, scandal: 3 }],
  ["商业脑", "会谈分成，会判断项目值不值得。", { money: 14, insight: 4 }],
  ["自律饮食", "身体状态稳定，不容易被行程拖垮。", { health: 12, charm: 3 }],
  ["边界清晰", "暧昧、私联、饭局都更不容易失控。", { scandal: -8, morality: 6 }],
  ["危险吸引力", "你身上有让人想靠近又害怕的气场。", { charm: 12, scandal: 5 }],
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

const npcs = [
  {
    id: "lin",
    name: "林予川",
    age: 29,
    job: "电影导演",
    gender: "男",
    orientation: "双性恋，偏爱独立、有主见的人",
    traits: ["温柔", "控制欲藏得深", "艺术洁癖"],
    kink: "喜欢被信任后的轻度支配感，边界谈清才会靠近",
    palette: ["#2f6f73", "#f2c078", "#1f2f46"],
  },
  {
    id: "shen",
    name: "沈雾",
    age: 26,
    job: "顶流歌手",
    gender: "女",
    orientation: "泛性恋，容易被强者吸引",
    traits: ["病娇感", "占有欲", "舞台疯子"],
    kink: "偏爱强烈绑定和试探，但会尊重明确拒绝",
    palette: ["#672b47", "#f5a3b7", "#2c1c2e"],
  },
  {
    id: "qiao",
    name: "乔砚",
    age: 34,
    job: "经纪公司合伙人",
    gender: "男",
    orientation: "同性恋，喜欢成熟稳定型",
    traits: ["霸道", "现实", "护短"],
    kink: "喜欢权力博弈式暧昧，不喜欢失控丑闻",
    palette: ["#30343f", "#d8a85d", "#646f58"],
  },
  {
    id: "yan",
    name: "晏青梨",
    age: 31,
    job: "制片人",
    gender: "女",
    orientation: "女同/双性恋，欣赏锋利野心",
    traits: ["GB气质", "冷静", "资源强"],
    kink: "偏爱四爱文化语境下的角色反转，但只在成年人自愿关系里展开",
    palette: ["#145c58", "#f0d084", "#7b2741"],
  },
  {
    id: "xie",
    name: "谢燃",
    age: 24,
    job: "新晋演员",
    gender: "男",
    orientation: "异性恋，可被亲密相处影响",
    traits: ["阳光", "自卑", "容易吃醋"],
    kink: "嘴硬心软，喜欢被坚定选择",
    palette: ["#cb6e4f", "#f5d6a2", "#22577a"],
  },
  {
    id: "su",
    name: "苏弥",
    age: 28,
    job: "时尚主编",
    gender: "非二元",
    orientation: "酷儿，重视精神共振",
    traits: ["神秘", "审美毒舌", "温柔后撤"],
    kink: "喜欢以规则、暗号和契约感建立安全感",
    palette: ["#635380", "#d7c0d0", "#36413e"],
  },
];

const dailyEvents = [
  {
    tag: "粉丝事件",
    type: "event",
    text: "机场有粉丝冲破栏杆递来一本厚厚的手写信，信里夹着她熬夜整理的澄清时间线。你停下脚步认真道谢，保安提醒你别停太久。粉丝爱意上涨，但路透也被营销号剪成“耍大牌让全场等”。",
    effects: { fanLove: 7, scandal: 2, mental: -2 },
  },
  {
    tag: "私联传闻",
    type: "event",
    text: "有人晒出疑似你小号和粉丝深夜聊天的截图。截图真假难辨，但粉圈已经开始分裂：一部分人说你真诚，一部分人觉得边界崩塌。你可以选择沉默、澄清或承认曾回复过鼓励私信。",
    effects: { scandal: 8, fanLove: -5, social: 2 },
  },
  {
    tag: "包养邀约",
    type: "event",
    text: "饭局散场后，投资人助理递来房卡和一份看似慷慨的资源清单。那张纸很轻，却像压着一整条捷径。你拒绝会失去项目，接受会让底线变薄，也可能留下长期把柄。",
    effects: { money: 10, fame: 5, morality: -9, scandal: 10 },
  },
  {
    tag: "地下恋爱",
    type: "event",
    text: "狗仔拍到你和神秘人同进小区。照片不清晰，却足够让全网编出十版爱情故事。CP 粉狂欢，唯粉心碎，品牌方开始询问你的感情状态。",
    effects: { fame: 6, fanLove: -6, scandal: 7, mental: -4 },
  },
  {
    tag: "堕落路线",
    type: "event",
    text: "连续三天通宵后，你在后台听见有人说：只要学会把自己当商品，痛苦就会少一点。你差点被这句话说服。短期资源变多，心态和底线却被磨掉一层。",
    effects: { fame: 6, money: 8, mental: -8, morality: -7 },
  },
  {
    tag: "粉圈内斗",
    type: "event",
    text: "大粉为了应援账目吵上热搜，黑粉趁机带节奏说你的团队吃粉丝血汗钱。你亲自要求公开明细，粉丝心疼你下场收拾烂摊子，工作室却担心你过度介入。",
    effects: { fanLove: 6, social: -2, scandal: 3 },
  },
  {
    tag: "病娇式关注",
    type: "event",
    text: "一个陌生账号连续七天发你同一张路透，并准确说出你的行程。安全团队建议报警。粉圈把它叫“爱到疯”，你知道那不是爱，是越界。",
    effects: { mental: -6, scandal: 2, fanLove: -2 },
  },
  {
    tag: "正向高光",
    type: "event",
    text: "片场临时改戏，你用一场无声哭戏救回整段剧情。导演没有夸很多，只是让场记把你的名字单独标出来。真正的机会有时就是这样安静地靠近。",
    effects: { acting: 6, fame: 5, fanLove: 4 },
  },
  {
    tag: "品牌审查",
    type: "event",
    text: "奢牌法务翻出你早年的争议发言，要求团队今晚前给出说明。你第一次意识到，互联网不会忘记任何一句年轻时的轻狂。",
    effects: { money: -4, scandal: 5, insight: 3 },
  },
];

const familyEvents = {
  poor: [
    ["家人生病", "家里打来电话，说检查结果不太好。你坐在化妆间里听着心电仪三个字，忽然理解为什么有人会向捷径低头。", { money: -12, mental: -8, morality: -3 }],
    ["被轻视", "试镜现场有人看见你的旧外套，笑着问你是不是走错棚。你没有争辩，只把下一场戏演到全场安静。", { acting: 5, mental: -3, fanLove: 3 }],
  ],
  rich: [
    ["靠家质疑", "营销号把你的通告表和家族企业投资图放在一起，配文只有四个字：资源咖吧。", { fame: 3, scandal: 8, fanLove: -5 }],
    ["家族交易", "父亲的秘书提醒你，某个代言能换来集团的一笔方便。你突然分不清自己是艺人，还是谈判桌上的筹码。", { money: 12, morality: -5, scandal: 4 }],
  ],
  illegitimate: [
    ["家族羞辱", "宴会上有人故意叫错你的姓，又笑着说只是玩笑。你端着酒杯站在灯下，第一次想把所有人都踩回阴影里。", { mental: -7, fame: 4, morality: -4 }],
    ["继承风波", "一份匿名文件把你和豪门的关系送到媒体邮箱。你可以否认，也可以借这阵风让所有人重新认识你。", { fame: 8, scandal: 9, money: 6 }],
  ],
  middle: [
    ["父母担心", "父母问你是不是一定要继续走这条路。他们不是不支持，只是害怕你被名利场磨碎。", { mental: 3, fanLove: 2 }],
  ],
  art: [
    ["严苛审美", "家里长辈看完你的样片，只说了一句“技巧太满，灵魂不够”。你气了一夜，第二天把剧本翻烂。", { acting: 5, mental: -2, insight: 3 }],
  ],
};

const popups = [
  {
    title: "三日节点：深夜来电",
    body: "凌晨一点，经纪人说有个临时综艺缺人，录制强度极高，但播出位置很好。你接下它，可能涨名气也会透支身体；拒绝它，团队会少一个向上谈判的筹码。",
    choices: [
      ["接下通告", { fame: 8, money: 6, health: -7, mental: -3 }],
      ["拒绝并休整", { health: 8, mental: 5, fame: -2 }],
      ["要求加价", { money: 10, social: 3, scandal: 2 }],
    ],
  },
  {
    title: "舆论节点：旧照泄露",
    body: "有人放出你未出道时在酒吧驻唱或陪朋友参加派对的照片。照片本身没问题，但标题写得暧昧恶意。你需要选择公关口径。",
    choices: [
      ["坦然讲述过去", { fanLove: 7, scandal: -3, mental: 2 }],
      ["律师函警告", { scandal: -5, money: -5, social: -2 }],
      ["顺势制造话题", { fame: 9, scandal: 5, morality: -2 }],
    ],
  },
  {
    title: "关系节点：暧昧试探",
    body: "一个熟悉的 NPC 在收工后问你：如果事业和我站在对面，你会选哪边？这句话听起来像情话，也像陷阱。",
    choices: [
      ["认真谈边界", { social: 6, mental: 3 }],
      ["给出暧昧答案", { charm: 6, scandal: 4 }],
      ["反问对方筹码", { insight: 6, morality: -2 }],
    ],
  },
];

const actions = [
  {
    id: "audition",
    name: "试镜抢角",
    desc: "去一个竞争激烈的剧组，把自己塞进导演视线。",
    story: "你站在白炽灯下，前一个演员刚哭到缺氧。轮到你时，你没有急着落泪，而是把人物的骄傲先撑起来，直到最后一句台词才让声音裂开。副导演低头写了很久，你知道这至少不是被遗忘的一天。",
    effects: { acting: 4, fame: 4, mental: -2 },
  },
  {
    id: "train",
    name: "封闭训练",
    desc: "唱跳、台词、体态、镜头感，今天只和自己较劲。",
    story: "练功房的镜子把疲惫照得无处可藏。你一遍遍重来，直到舞步和呼吸终于贴合，直到台词不再像背诵，而像从你身体里长出来。",
    effects: { acting: 3, singing: 3, health: -2, mental: 1 },
  },
  {
    id: "variety",
    name: "综艺营业",
    desc: "用反应、笑点和分寸换一波路人盘。",
    story: "主持人抛来一个带刺的问题，全场等着你失态。你笑了一下，把刺拆成包袱，又把包袱递回给对方。弹幕开始刷：这个人有点东西。",
    effects: { social: 4, fanLove: 4, fame: 3, health: -2 },
  },
  {
    id: "family",
    name: "处理家庭",
    desc: "回到原生家庭的故事里，那里有支撑也有伤口。",
    story: "你关掉工作手机，坐上回家的车。窗外霓虹变成小区门口的路灯，名利场的噪声被暂时隔开，但旧日的期待、亏欠和秘密也在门后等你。",
    effects: { mental: 4, social: 2 },
  },
  {
    id: "fans",
    name: "粉丝沟通",
    desc: "直播、信件、见面会，处理爱意和边界。",
    story: "你读到一封长信，写信的人说因为你才熬过最糟的一年。你郑重感谢，也提醒大家先过好自己的生活。粉丝在屏幕那边哭，工作人员在镜头外给你比时间。",
    effects: { fanLove: 7, mental: 2, scandal: -1 },
  },
  {
    id: "dark",
    name: "灰色饭局",
    desc: "进入更暗的房间，拿资源，也付出不一定写在合同里的代价。",
    story: "包厢里每个人都笑得很熟练。有人讲项目，有人讲情分，有人把规矩藏在玩笑里递给你。你可以只喝茶，也可以把自己的名字押进这张桌子的游戏。",
    effects: { money: 12, fame: 6, morality: -8, scandal: 8, mental: -3 },
  },
  {
    id: "rest",
    name: "休息复盘",
    desc: "睡觉、看剧本、写日记，守住没被消耗完的自己。",
    story: "你把窗帘拉开，让阳光落在乱糟糟的剧本上。今天没有闪光灯，没有倒计时，只有一杯温水和一个慢慢恢复清晰的自己。",
    effects: { health: 10, mental: 8, fame: -1 },
  },
];

function baseState() {
  return {
    created: false,
    view: "create",
    player: null,
    selectedPerks: [],
    stats: {},
    day: 1,
    age: 18,
    logs: [],
    relationships: Object.fromEntries(npcs.map((n) => [n.id, { affection: 15, trust: 10, heat: 0, focus: false, history: [] }])),
    children: [],
    modal: null,
    api: loadApi(),
    chatNpc: "lin",
    legacyReady: false,
  };
}

let state = loadState();
const app = document.getElementById("app");

function loadApi() {
  try {
    return JSON.parse(localStorage.getItem(API_KEY)) || {
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4.1-mini",
      key: "",
    };
  } catch {
    return { endpoint: "", model: "", key: "" };
  }
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || baseState();
  } catch {
    return baseState();
  }
}

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
  return Object.entries(effects)
    .map(([k, v]) => `${statNames[k] || k}${v >= 0 ? "+" : ""}${v}`)
    .join(" / ");
}

function addLog(title, body, type = "normal", effects) {
  state.logs.unshift({
    day: state.day,
    title,
    body,
    type,
    effects: effects ? effectText(effects) : "",
  });
}

function startGame() {
  const name = document.getElementById("name").value.trim() || "无名新人";
  const gender = document.getElementById("gender").value;
  const family = families.find((f) => f.id === document.getElementById("family").value);
  if (state.selectedPerks.length !== 5) {
    alert("请选择正好五个优势。");
    return;
  }
  state.player = { name, gender, family: family.id, familyName: family.name };
  state.stats = {
    acting: 35,
    singing: 35,
    social: 35,
    charm: 35,
    insight: 35,
    fame: 8,
    money: 20,
    fanLove: 25,
    mental: 62,
    health: 65,
    morality: 72,
    scandal: 5,
  };
  applyEffects(family.stats);
  state.selectedPerks.map((id) => perks.find((p) => p.id === id)).forEach((p) => applyEffects(p.stats));
  state.created = true;
  state.view = "home";
  addLog("入圈第一天", `${name} 带着“${family.name}”的出身和五个天赋进入娱乐圈。没人知道你会成为清醒的赢家，还是被灯光吞没的人。`, "normal");
  save();
  render();
}

function doAction(actionId) {
  const action = actions.find((a) => a.id === actionId);
  applyEffects(action.effects);
  addLog(action.name, action.story, "normal", action.effects);
  triggerDailyEvent();
  state.day += 1;
  growChildren();
  if (state.day % 3 === 0) state.modal = pick(popups);
  if (state.stats.health <= 3 || state.stats.mental <= 3) {
    state.legacyReady = true;
    addLog("生命低谷", "长期透支让你倒在片场。医生说你必须停下来。若你已有孩子，可以在传代界面选择让下一代继承这条星路。", "event");
  }
  save();
  render();
}

function triggerDailyEvent() {
  const familyPool = familyEvents[state.player.family] || [];
  const isFamily = Math.random() < 0.28 && familyPool.length;
  if (isFamily) {
    const [title, body, effects] = pick(familyPool);
    applyEffects(effects);
    addLog(title, body, "family", effects);
    return;
  }
  const event = pick(dailyEvents);
  applyEffects(event.effects);
  addLog(event.tag, event.text, event.type, event.effects);
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
  if (state.selectedPerks.includes(id)) {
    state.selectedPerks = state.selectedPerks.filter((p) => p !== id);
  } else if (state.selectedPerks.length < 5) {
    state.selectedPerks.push(id);
  } else {
    alert("最多只能选择五个优势。");
  }
  render();
}

function setView(view) {
  state.view = view;
  save();
  render();
}

function portrait(npc, child) {
  const pal = npc?.palette || child?.palette || ["#147c83", "#f2c078", "#7654a6"];
  const hair = child ? "#4b3930" : pal[2];
  return `<div class="portrait" aria-label="头像立绘">
    <svg viewBox="0 0 120 160" role="img">
      <rect width="120" height="160" fill="${pal[0]}"/>
      <circle cx="22" cy="24" r="5" fill="#fff" opacity=".55"/>
      <circle cx="95" cy="42" r="4" fill="#fff" opacity=".45"/>
      <path d="M14 160c8-39 28-58 46-58s39 19 47 58z" fill="${pal[2]}" opacity=".82"/>
      <circle cx="61" cy="67" r="33" fill="#f1c7a5"/>
      <path d="M25 67c2-36 24-50 50-43 20 5 31 22 28 48-18-13-33-12-49-32-6 13-15 21-29 27z" fill="${hair}"/>
      <path d="M43 76q6 5 12 0M68 76q6 5 12 0" stroke="#432" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M54 96q8 7 18 0" stroke="#9b4b4b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M31 122c20 18 39 18 58 0v38H31z" fill="${pal[1]}"/>
    </svg>
  </div>`;
}

function focusNpc(id) {
  state.relationships[id].focus = !state.relationships[id].focus;
  save();
  render();
}

function interactNpc(id, mode) {
  const npc = npcs.find((n) => n.id === id);
  const rel = state.relationships[id];
  const variants = {
    date: [`你和${npc.name}在一家需要预约的深夜餐厅见面。对方没有谈资源，只问你最近有没有真的睡好。那一刻暧昧变得柔软，像可以落地的灯。`, { affection: 8, trust: 5, heat: 3, scandal: 2, mental: 3 }],
    work: [`${npc.name}帮你复盘了一个项目，把剧本、平台、宣发和潜在黑点一条条拆开。你们像同盟，也像在互相试探底牌。`, { affection: 3, trust: 7, heat: 1, insight: 5 }],
    dark: [`你选择和${npc.name}玩一场更危险的心理拉扯：不越过明确边界，却把占有、嫉妒和权力感摆上桌面。火花很亮，风险也很亮。`, { affection: 6, trust: -2, heat: 8, scandal: 6, morality: -3 }],
    boundary: [`你和${npc.name}认真谈了亲密边界、公开尺度和彼此不能碰的伤口。关系没有立刻升温，却更像能经得住下一场风暴。`, { affection: 4, trust: 9, heat: -2, scandal: -3, mental: 4 }],
  };
  const [body, effect] = variants[mode];
  rel.affection = clamp(rel.affection + (effect.affection || 0));
  rel.trust = clamp(rel.trust + (effect.trust || 0));
  rel.heat = clamp(rel.heat + (effect.heat || 0));
  applyEffects(effect);
  addLog(`特别关注：${npc.name}`, body, mode === "dark" ? "event" : "normal", effect);
  save();
  render();
}

function localChatOptions(npc) {
  return [
    `聊事业：问${npc.name}如何看你现在的资源位置，以及下一步该避开什么坑。`,
    `聊关系：试探${npc.name}对亲密、公开、边界和占有欲的真实态度。`,
    `聊暗线：询问${npc.name}是否愿意陪你处理更危险的舆论、饭局或权力游戏。`,
  ];
}

function chooseLocalChat(text) {
  const npc = npcs.find((n) => n.id === state.chatNpc);
  const rel = state.relationships[npc.id];
  rel.history.push({ role: "user", text });
  const replies = [
    `${npc.name}看了你很久，语气放轻：“你想赢可以，但不要把自己拆成别人喜欢的形状。先把主动权拿回来，我会告诉你哪些局能去，哪些局只是漂亮的陷阱。”`,
    `${npc.name}笑了一下：“你问边界，说明你还清醒。我的偏好不重要，重要的是你每一次靠近都不是被迫。你可以改变我对你的判断，但别试图用伤害自己证明什么。”`,
    `${npc.name}把手机扣在桌上：“暗线不是不能走，是每一步都要留退路。你若想玩权力游戏，就先学会保存证据、保护团队，也保护你自己。”`,
  ];
  rel.history.push({ role: "assistant", text: pick(replies) });
  rel.affection = clamp(rel.affection + 2);
  rel.trust = clamp(rel.trust + 2);
  save();
  render();
}

async function callNpcApi() {
  const npc = npcs.find((n) => n.id === state.chatNpc);
  const rel = state.relationships[npc.id];
  const input = document.getElementById("chatInput").value.trim();
  if (!input) return alert("先写一句你想对 NPC 说的话。");
  rel.history.push({ role: "user", text: input });
  document.getElementById("chatInput").value = "";
  save();
  render();
  if (!state.api.key || !state.api.endpoint || !state.api.model) {
    rel.history.push({
      role: "assistant",
      text: `${npc.name}低声回应：“你还没有填写 API，所以这次由本地剧情接管。等你填好 API，我会按我的性格、取向、关系进度和你继续聊。”`,
    });
    save();
    render();
    return;
  }
  try {
    const messages = [
      {
        role: "system",
        content: `你在娱乐圈模拟器中扮演 NPC：${npc.name}，${npc.age}岁，职业${npc.job}，性别${npc.gender}，性取向：${npc.orientation}。性格：${npc.traits.join("、")}。偏好设定：${npc.kink}。所有浪漫或成人暗示都必须发生在成年人之间，保持非露骨，强调同意、边界和情绪张力。回复中文，故事性丰富，120到220字。`,
      },
      ...rel.history.slice(-8).map((m) => ({ role: m.role, content: m.text })),
    ];
    const res = await fetch(state.api.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.api.key}`,
      },
      body: JSON.stringify({ model: state.api.model, messages, temperature: 0.9 }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "对方沉默了一会儿，像是在斟酌下一句话。";
    rel.history.push({ role: "assistant", text });
  } catch (err) {
    rel.history.push({ role: "assistant", text: `API 调用失败：${err.message}。你可以检查地址、模型名和密钥。` });
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
  const names = ["星遥", "知夏", "听澜", "予白", "云起", "南枝", "照野", "明穗"];
  const templates = ["镜头敏感型", "学术探索型", "商业继承型", "自由艺术型", "运动竞技型", "幕后创作型"];
  const childPerks = [...perks].sort(() => Math.random() - 0.5).slice(0, 3).map((p) => p.name);
  const child = {
    id: `child-${Date.now()}`,
    name: pick(names),
    age: 0,
    aptitude: roll(45, 98),
    template: pick(templates),
    perks: childPerks,
    bond: 35,
    growth: 0,
    path: "尚未选择",
    method,
    palette: [pick(["#147c83", "#b8445f", "#7654a6", "#b17c18"]), "#f1c27d", "#3e2d2b"],
  };
  state.children.push(child);
  addLog("新生命", `你通过“${method}”迎来孩子 ${child.name}。这不是附属品，而是一个会长出自己选择的人。资质 ${child.aptitude}，模板为“${child.template}”。`, "family");
  save();
  render();
}

function growChildren() {
  state.children.forEach((child) => {
    child.growth += Math.max(1, Math.floor(child.aptitude / 30));
    if (child.growth >= 12) {
      child.growth = 0;
      child.age += 1;
      const paths = ["音乐制作", "电影学院", "商业管理", "公益法律", "电竞解说", "海外读书", "娱乐圈星二代路线"];
      if (child.age >= 6 && Math.random() < child.aptitude / 130) child.path = pick(paths);
      addLog("孩子成长", `${child.name} 长大了一岁。${child.aptitude > 82 ? "即使你忙到缺席，天赋也在悄悄托住 TA。" : "TA 更需要稳定陪伴和耐心培养。"} 当前倾向：${child.path}。`, "family");
    }
  });
}

function trainChild(id, type) {
  const child = state.children.find((c) => c.id === id);
  const text = {
    art: "你为孩子安排表演、音乐和镜头课程。TA 不一定要进圈，但多了一种表达自己的语言。",
    study: "你陪 TA 做长期学习规划，告诉 TA 未来不必替你完成任何遗憾。",
    bond: "你推掉一个饭局，只陪 TA 吃饭、散步、聊天。很多培养不是课程，是被认真看见。",
  };
  child.bond = clamp(child.bond + (type === "bond" ? 12 : 5));
  child.aptitude = clamp(child.aptitude + (type === "art" ? 4 : type === "study" ? 3 : 1), 0, 100);
  child.growth += type === "bond" ? 2 : 5;
  applyEffects({ money: type === "bond" ? -2 : -8, mental: type === "bond" ? 4 : -1 });
  addLog(`培养 ${child.name}`, text[type], "family");
  save();
  render();
}

function inheritChild(id) {
  const child = state.children.find((c) => c.id === id);
  if (!child) return;
  const legacyPerks = child.perks.slice(0, 2);
  state.player.name = child.name;
  state.player.familyName = "星二代传承";
  state.player.family = "art";
  state.age = Math.max(18, child.age);
  state.day = 1;
  state.stats = {
    acting: 38 + Math.floor(child.aptitude / 8),
    singing: 35 + Math.floor(child.aptitude / 10),
    social: 32,
    charm: 36,
    insight: 35,
    fame: 18,
    money: Math.max(20, Math.floor(state.stats.money / 2)),
    fanLove: 22,
    mental: 65,
    health: 72,
    morality: 70,
    scandal: 8,
  };
  state.children = state.children.filter((c) => c.id !== id);
  state.logs = [];
  state.legacyReady = false;
  addLog("传代开始", `${child.name} 继承上一代留下的名声、债、人脉和阴影，以星二代身份重新踏入娱乐圈。继承优势：${legacyPerks.join("、")}。`, "family");
  save();
  render();
}

function render() {
  if (!state.created) {
    app.innerHTML = renderCreate();
    return;
  }
  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      <div class="main-grid">
        <aside class="panel">${renderProfile()}</aside>
        <main>${renderView()}</main>
      </div>
    </div>
    ${state.modal ? renderModal() : ""}
  `;
}

function renderTopbar() {
  const nav = [
    ["home", "首页"],
    ["npcs", "NPC"],
    ["focus", "特别关注"],
    ["chat", "AI 对话"],
    ["children", "子女"],
    ["api", "API"],
    ["logs", "日志"],
  ];
  return `<header class="topbar">
    <div class="brand"><div class="brand-mark">星</div><div><h1>星河名利场</h1><p>娱乐圈模拟器 · 第 ${state.day} 天</p></div></div>
    <nav class="nav">${nav.map(([id, label]) => `<button class="${state.view === id ? "active" : ""}" onclick="setView('${id}')">${label}</button>`).join("")}</nav>
  </header>`;
}

function renderProfile() {
  return `<div class="profile-card">
    <h2>${state.player.name}</h2>
    <div class="muted">${state.player.gender} · ${state.player.familyName} · ${state.age} 岁</div>
    <div class="stats">
      ${Object.keys(statNames).map((k) => `<div class="stat"><b>${statNames[k]} ${state.stats[k] ?? 0}</b><div class="bar"><span style="width:${clamp(state.stats[k] ?? 0)}%"></span></div></div>`).join("")}
    </div>
    <button class="ghost-btn" onclick="localStorage.removeItem('${STORAGE_KEY}'); state = baseState(); render();">重开人生</button>
  </div>`;
}

function renderView() {
  const map = {
    home: renderHome,
    npcs: renderNpcs,
    focus: renderFocus,
    chat: renderChat,
    children: renderChildren,
    api: renderApi,
    logs: renderLogs,
  };
  return map[state.view]();
}

function renderHome() {
  return `<section class="panel hero-card">
    <h2>今天也要在灯光里活下来。</h2>
    <p>每一天都会触发突发事件。你可以走作品路线、粉丝路线、资本路线、亲密关系路线，也可以在暗处交换筹码。名气、粉丝、黑料、健康、底线会一起变化。</p>
  </section>
  <section class="panel" style="margin-top:16px">
    <h2>今日行动</h2>
    <div class="action-grid">
      ${actions.map((a) => `<button class="card action-card" onclick="doAction('${a.id}')"><h3>${a.name}</h3><p>${a.desc}</p><span class="muted">${effectText(a.effects)}</span></button>`).join("")}
    </div>
  </section>`;
}

function renderNpcs() {
  return `<section class="panel">
    <h2>全员 NPC</h2>
    <div class="npc-grid">${npcs.map(renderNpcCard).join("")}</div>
  </section>`;
}

function renderNpcCard(npc) {
  const rel = state.relationships[npc.id];
  return `<article class="card npc-card">
    ${portrait(npc)}
    <div>
      <h3>${npc.name} · ${npc.age}</h3>
      <div class="npc-meta">${npc.job} / ${npc.gender}<br>${npc.orientation}<br>特质：${npc.traits.join("、")}<br>${npc.kink}</div>
      <div class="pill-row"><span class="pill">好感 ${rel.affection}</span><span class="pill">信任 ${rel.trust}</span><span class="pill">张力 ${rel.heat}</span></div>
      <div class="card-actions">
        <button class="ghost-btn" onclick="focusNpc('${npc.id}')">${rel.focus ? "取消关注" : "特别关注"}</button>
        <button class="primary-btn" onclick="state.chatNpc='${npc.id}'; setView('chat')">对话</button>
      </div>
    </div>
  </article>`;
}

function renderFocus() {
  const focused = npcs.filter((n) => state.relationships[n.id].focus);
  if (!focused.length) return `<section class="panel"><h2>特别关注</h2><div class="empty">还没有特别关注的 NPC。去 NPC 页面点亮一个人，之后这里会出现约会、合作、边界谈话和暗线互动。</div></section>`;
  return `<section class="panel">
    <h2>特别关注</h2>
    <div class="npc-grid">${focused.map((npc) => `<article class="card npc-card">
      ${portrait(npc)}
      <div>
        <h3>${npc.name}</h3>
        <div class="npc-meta">${npc.traits.join("、")} · ${npc.orientation}</div>
        <div class="card-actions">
          <button class="primary-btn" onclick="interactNpc('${npc.id}','date')">约会</button>
          <button class="ghost-btn" onclick="interactNpc('${npc.id}','work')">资源合作</button>
          <button class="ghost-btn" onclick="interactNpc('${npc.id}','boundary')">谈边界</button>
          <button class="danger-btn" onclick="interactNpc('${npc.id}','dark')">暗黑拉扯</button>
        </div>
      </div>
    </article>`).join("")}</div>
  </section>`;
}

function renderChat() {
  const npc = npcs.find((n) => n.id === state.chatNpc);
  const rel = state.relationships[npc.id];
  const options = localChatOptions(npc);
  return `<section class="split">
    <div class="panel chat-box">
      <h2>和 ${npc.name} 对话</h2>
      <div class="message-list">
        ${rel.history.length ? rel.history.map((m) => `<div class="message ${m.role === "user" ? "me" : ""}">${m.text}</div>`).join("") : `<div class="empty">系统会先给你三个本地选项。三个都不满意时，可以在下方输入并点击“调用 API”。</div>`}
      </div>
      <div class="choice-grid">${options.map((o) => `<button class="choice-btn" onclick="chooseLocalChat('${o.replaceAll("'", "\\'")}')">${o}</button>`).join("")}</div>
      <div class="field"><label>第四选项：调用 API 自由输入</label><textarea id="chatInput" rows="3" placeholder="写下你想对 ${npc.name} 说的话"></textarea></div>
      <button class="primary-btn" onclick="callNpcApi()">不满意，调用 API</button>
    </div>
    <aside class="panel">${renderNpcCard(npc)}</aside>
  </section>`;
}

function renderChildren() {
  return `<section class="panel">
    <h2>子女与传代</h2>
    <p class="muted">子女只进入成长、教育、职业选择和传承系统。孩子会有资质、人物模板、随机优势和自己的未来；不培养也会自然发展，资质高会走得更稳。同性角色可通过共同育儿、辅助生育或代孕协议拥有孩子。</p>
    <div class="card-actions">
      <button class="primary-btn" onclick="createChild('共同育儿')">共同育儿</button>
      <button class="ghost-btn" onclick="createChild('辅助生育')">辅助生育</button>
      <button class="ghost-btn" onclick="createChild('代孕协议')">代孕协议</button>
    </div>
    <div class="child-grid" style="margin-top:14px">
      ${state.children.length ? state.children.map(renderChild).join("") : `<div class="empty">还没有孩子。你可以先发展事业或关系，也可以直接开启家庭线。</div>`}
    </div>
  </section>`;
}

function renderChild(child) {
  return `<article class="card child-card">
    <div style="display:grid;grid-template-columns:76px 1fr;gap:12px">
      ${portrait(null, child)}
      <div>
        <h3>${child.name} · ${child.age} 岁</h3>
        <div class="child-meta">方式：${child.method}<br>资质：${child.aptitude} / 羁绊：${child.bond}<br>模板：${child.template}<br>随机优势：${child.perks.join("、")}<br>未来倾向：${child.path}</div>
      </div>
    </div>
    <div class="card-actions">
      <button class="ghost-btn" onclick="trainChild('${child.id}','art')">艺术培养</button>
      <button class="ghost-btn" onclick="trainChild('${child.id}','study')">学业培养</button>
      <button class="ghost-btn" onclick="trainChild('${child.id}','bond')">陪伴</button>
      <button class="danger-btn" onclick="inheritChild('${child.id}')">选择传代</button>
    </div>
  </article>`;
}

function renderApi() {
  return `<section class="panel">
    <h2>AI 对话 API 设置</h2>
    <p class="muted">使用 OpenAI 兼容的 Chat Completions 接口。保存后，NPC 对话页的第四选项会调用 API；前三个选项始终由本地剧情提供。</p>
    <div class="form-grid">
      <div class="field"><label>接口地址</label><input id="apiEndpoint" value="${state.api.endpoint || ""}" placeholder="https://api.openai.com/v1/chat/completions"></div>
      <div class="field"><label>模型名</label><input id="apiModel" value="${state.api.model || ""}" placeholder="gpt-4.1-mini"></div>
      <div class="field"><label>API Key</label><input id="apiKey" type="password" value="${state.api.key || ""}" placeholder="sk-..."></div>
    </div>
    <div class="footer-actions"><button class="primary-btn" onclick="saveApi()">保存 API</button></div>
  </section>`;
}

function renderLogs() {
  return `<section class="panel"><h2>人生日志</h2><div class="log-list">
    ${state.logs.map((l) => `<div class="log-item ${l.type}"><b>第 ${l.day} 天 · ${l.title}</b><br>${l.body}${l.effects ? `<br><span class="muted">${l.effects}</span>` : ""}</div>`).join("")}
  </div></section>`;
}

function renderModal() {
  return `<div class="modal-backdrop">
    <div class="modal">
      <h2>${state.modal.title}</h2>
      <p>${state.modal.body}</p>
      <div class="choice-grid">${state.modal.choices.map((c, i) => `<button class="choice-btn" onclick="resolveModalChoice(${i})">${c[0]}<br><span class="muted">${effectText(c[1])}</span></button>`).join("")}</div>
    </div>
  </div>`;
}

function renderCreate() {
  return `<div class="app-shell">
    <section class="panel hero-card">
      <h2>星河名利场</h2>
      <p>从姓名、性别、家境和五个优势开始。你会遇见粉丝、狗仔、资本、亲密关系、家庭旧账、暗线诱惑和下一代传承。</p>
    </section>
    <section class="panel" style="margin-top:16px">
      <h2>创建角色</h2>
      <div class="form-grid">
        <div class="field"><label>姓名</label><input id="name" placeholder="输入艺名或本名"></div>
        <div class="field"><label>性别</label><select id="gender"><option>女</option><option>男</option><option>非二元</option></select></div>
        <div class="field"><label>出生家境</label><select id="family">${families.map((f) => `<option value="${f.id}">${f.name}</option>`).join("")}</select></div>
      </div>
      <div class="panel" style="margin-top:14px;box-shadow:none">
        <h3>选择五个优势 <span class="muted">(${state.selectedPerks.length}/5)</span></h3>
        <div class="perk-grid">
          ${perks.map((p) => `<button class="perk ${state.selectedPerks.includes(p.id) ? "selected" : ""}" onclick="togglePerk('${p.id}')"><b>${p.name}</b><p class="muted">${p.desc}</p><span class="muted">${effectText(p.stats)}</span></button>`).join("")}
        </div>
      </div>
      <div class="footer-actions"><button class="primary-btn" onclick="startGame()">进入娱乐圈</button></div>
    </section>
  </div>`;
}

render();
