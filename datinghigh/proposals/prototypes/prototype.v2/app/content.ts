// 心動迴路 DEMO：結構化 Mock / Fixture 內容（不含任何圖片或網路資源，可直接被單元測試載入）

/** 夏樹的表情（對應四張事件 CG） */
export type Expr = "smile" | "blush" | "happy" | "worry";

/** 對話角色類型 */
export type Who = "partner" | "me" | "narrator" | "system";

/** 一句 VN 台詞 */
export interface ScriptLine {
  who: Who;
  text: string;
  expr?: Expr;
}

// ============================================================================
// 虛擬人物（化身）
// ============================================================================

export interface AvatarStyle {
  id: string;
  name: string;
  tagline: string;
  traits: string[];
  accent: string;
}

export const AVATAR_STYLES: AvatarStyle[] = [
  { id: "sun", name: "暖陽系", tagline: "笑起來像午後陽光的行動派", traits: ["開朗", "愛冒險", "好相處"], accent: "#ffb347" },
  { id: "moon", name: "月光文青系", tagline: "安靜卻很會聽人說話的人", traits: ["沉穩", "有品味", "細心"], accent: "#8aa4ff" },
  { id: "sakura", name: "櫻語甜心系", tagline: "會把日常過成小確幸的人", traits: ["溫柔", "愛撒嬌", "點子多"], accent: "#ff8fb8" },
  { id: "forest", name: "森語帥氣系", tagline: "外表酷酷、內心很暖的人", traits: ["自信", "直率", "有安全感"], accent: "#5fd3b0" },
];

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;
export const BIO_MAX = 40;
export const CHAT_MAX = 60;

// ============================================================================
// 偏好欄位
// ============================================================================

export const INTEREST_OPTIONS = [
  "實境解謎",
  "手沖咖啡",
  "文創手作",
  "獨立書店",
  "底片攝影",
  "黑膠唱片",
  "桌遊",
  "夜跑",
  "貓咪咖啡",
  "展覽策展",
  "公益志工",
  "美食探索",
];

export const TOPIC_OPTIONS = ["旅行", "音樂", "美食", "電影", "創作", "寵物", "夢想"];

export const WEEKEND_OPTIONS = ["宅家充電", "外出探索", "看心情"];
export const SCHEDULE_OPTIONS = ["早鳥型", "夜貓型"];
export const CHAT_STYLE_OPTIONS = ["慢熱溫暖", "幽默輕鬆", "深度交流"];
export const MODE_OPTIONS = ["先當朋友慢慢來", "固定每週見面", "一起探索新事物"];
export const AGE_OPTIONS = ["22–27 歲", "25–30 歲", "28–35 歲"];
export const AREA_OPTIONS = ["雙北同城", "台北市內", "不限地區"];

export interface Profile {
  interests: string[];
  topics: string[];
  weekend: string;
  schedule: string;
  chatStyle: string;
  mode: string;
  age: string;
  area: string;
}

export const DEFAULT_PROFILE: Profile = {
  interests: ["實境解謎", "手沖咖啡", "文創手作"],
  topics: ["旅行", "創作"],
  weekend: "外出探索",
  schedule: "夜貓型",
  chatStyle: "慢熱溫暖",
  mode: "一起探索新事物",
  age: "22–27 歲",
  area: "雙北同城",
};

export const INTEREST_MIN = 3;

/** 配對對象「夏樹」的公開偏好（Fixture） */
export const PARTNER = {
  name: "夏樹",
  title: "獨立插畫家・週末手沖咖啡師",
  age: 24,
  distance: "3.2 km 內",
  interests: ["實境解謎", "手沖咖啡", "文創手作", "獨立書店", "底片攝影", "公益志工"],
  topics: ["旅行", "創作", "音樂", "美食"],
  weekend: "外出探索",
  schedule: "夜貓型",
  chatStyle: "慢熱溫暖",
  mode: "一起探索新事物",
  ageOk: ["22–27 歲", "25–30 歲"],
  areaOk: ["雙北同城", "台北市內", "不限地區"],
};

// ============================================================================
// 好感度規則
// ============================================================================

export const BASE_AFFECTION = 20;
/** 線上階段門檻（解鎖小遊戲、支線與協力任務） */
export const STAGE1_AT = 40;
/** 實體約會階段門檻（劇情推薦實體合作通路） */
export const STAGE2_AT = 75;
/** 低好感安全下限 */
export const LOW_FLOOR = 10;

export const LEVEL_NAMES = ["初識", "心動", "戀慕"];

export const FACTOR_CAPS = { freq: 20, fit: 60, dwell: 10, quest: 36 };

// ============================================================================
// 劇情：序章、三輪破冰選項、自由聊天建議
// ============================================================================

export interface ChoiceDef {
  id: string;
  tag: string;
  text: string;
  interest?: string;
  fit: number;
  reply: ScriptLine[];
}

export interface RoundDef {
  id: string;
  title: string;
  intro: ScriptLine[];
  choices: ChoiceDef[];
}

export const ROUNDS: RoundDef[] = [
  {
    id: "r1",
    title: "破冰・起手式",
    intro: [],
    choices: [
      {
        id: "r1-coffee",
        tag: "自然搭話",
        text: "對啊，被門口的肉桂香氣勾進來的。你手上那杯是耶加雪菲嗎？聞起來好香。",
        interest: "手沖咖啡",
        fit: 8,
        reply: [
          { who: "partner", expr: "happy", text: "哇，你鼻子好靈！是水洗耶加雪菲，有檸檬和白花的香氣。老闆說這是今天最後一杯手沖囉。" },
          { who: "partner", expr: "smile", text: "（把杯子輕輕往你這邊推了一點）要不要聞聞看？不過只能聞，不能偷喝喔。" },
        ],
      },
      {
        id: "r1-puzzle",
        tag: "觀察入微",
        text: "冒昧問一下，你桌上手札貼的那枚徽章，是實境解謎的通關章嗎？",
        interest: "實境解謎",
        fit: 10,
        reply: [
          { who: "partner", expr: "happy", text: "欸！你、你認得出來？！（眼睛瞬間亮了起來）這是上個月「發條鐘密室」的通關章！" },
          { who: "partner", expr: "blush", text: "太好了……身邊朋友都嫌解謎太燒腦，好久沒遇到會注意到這種小細節的人了。" },
        ],
      },
      {
        id: "r1-tease",
        tag: "溫柔幽默",
        text: "我是{nick}。看你一直望著窗外發呆，是在等雨停，還是在等一個人來搭話呢？",
        fit: 6,
        reply: [
          { who: "partner", expr: "blush", text: "（噗哧笑出來，耳尖微微泛紅）……被你發現了。我是在等雨停啦。" },
          { who: "partner", expr: "smile", text: "不過現在，好像有點希望雨晚一點再停了。" },
        ],
      },
    ],
  },
  {
    id: "r2",
    title: "深入話題・假日的你",
    intro: [
      { who: "partner", expr: "smile", text: "（把手札闔上，單手托著下巴看向你）那你呢？平常的假日都怎麼度過呀？" },
    ],
    choices: [
      {
        id: "r2-book",
        tag: "安靜充電",
        text: "我會待在獨立書店或咖啡館，翻翻書、發發呆，把一週的電量慢慢補回來。",
        interest: "獨立書店",
        fit: 7,
        reply: [
          { who: "partner", expr: "happy", text: "我懂我懂！那種「什麼都不用做也很好」的時間最珍貴了。" },
          { who: "partner", expr: "smile", text: "我手札裡還夾著好幾張書店的書籤呢，之後可以交換看看。" },
        ],
      },
      {
        id: "r2-puzzle",
        tag: "挑戰派",
        text: "揪朋友去挑戰新的實境解謎。有時候為了一個機關，可以吵一整個晚上。",
        interest: "實境解謎",
        fit: 10,
        reply: [
          { who: "partner", expr: "happy", text: "哈哈哈！吵到最後發現答案其實一直在眼前對吧？那種瞬間真的超爽！" },
          { who: "partner", expr: "blush", text: "跟你一起解謎的話……感覺一定會很有默契。" },
        ],
      },
      {
        id: "r2-craft",
        tag: "手作系",
        text: "去老街的手作工坊，敲敲皮革、縫縫線。手上有事做，心就靜下來了。",
        interest: "文創手作",
        fit: 9,
        reply: [
          { who: "partner", expr: "blush", text: "真的嗎……？我平常也會自己敲皮革鑰匙圈，上面還刻了很幼稚的小圖案。" },
          { who: "partner", expr: "happy", text: "能遇到懂得這種手作溫度的人，我今天好像有點太幸運了。" },
        ],
      },
    ],
  },
  {
    id: "r3",
    title: "拉近距離・心跳的瞬間",
    intro: [
      { who: "partner", expr: "blush", text: "……說真的，我很少跟剛認識的人聊這麼多。跟你說話，好像不用特別想下一句要說什麼。" },
    ],
    choices: [
      {
        id: "r3-laugh",
        tag: "真誠回應",
        text: "我也是。你笑起來的樣子，會讓人想把話題一直延續下去。",
        fit: 10,
        reply: [
          { who: "partner", expr: "blush", text: "（慌張地低下頭，用雙手握住杯子）你、你怎麼可以這麼自然地說出這種話啦……" },
          { who: "partner", expr: "happy", text: "但是……我很開心。真的。" },
        ],
      },
      {
        id: "r3-rain",
        tag: "浪漫一點",
        text: "那今天這場雨，大概是特地為了讓我們相遇而下的吧。",
        fit: 8,
        reply: [
          { who: "partner", expr: "happy", text: "噗，這句話可以寫進我的手札了！（笑）" },
          { who: "partner", expr: "blush", text: "如果是這樣，那我要謝謝這場雨。" },
        ],
      },
      {
        id: "r3-next",
        tag: "輕鬆邀約",
        text: "那我們先把這份自在存起來，下一次繼續聊？",
        fit: 6,
        reply: [
          { who: "partner", expr: "smile", text: "好呀。（認真地點頭）那這個「下一次」，我會好好期待的。" },
        ],
      },
    ],
  },
];

/** 三輪破冰後的收尾台詞 */
export const AFTER_ROUNDS: ScriptLine[] = [
  { who: "partner", expr: "smile", text: "（看向窗外）雨好像小一點了……不過，我們好像還有好多話題沒聊完呢。" },
  { who: "system", text: "💬 現在可以點選建議話題、直接輸入想說的話，或打開右上角「任務中心」與夏樹一起玩。" },
];

export interface SuggestionDef {
  id: string;
  label: string;
  fit: number;
  reply: ScriptLine[];
}

export const SUGGESTIONS: SuggestionDef[] = [
  {
    id: "s-travel",
    label: "問她最想去旅行的地方",
    fit: 4,
    reply: [
      { who: "partner", expr: "happy", text: "旅行的話……冰島！我想站在極光下面發呆一整晚。你呢？有沒有一個想帶人一起去的地方？" },
    ],
  },
  {
    id: "s-music",
    label: "分享最近單曲循環的歌",
    fit: 4,
    reply: [
      { who: "partner", expr: "happy", text: "欸，我也有一首下雨天一定會放的歌！下次交換播放清單好不好？" },
    ],
  },
  {
    id: "s-sketch",
    label: "誇誇她手札上的手繪插圖",
    fit: 5,
    reply: [
      { who: "partner", expr: "blush", text: "（慌張地把手札抱到胸前）被、被看到了！那是我隨手畫的……可是你這樣說，我真的好開心。" },
    ],
  },
  {
    id: "s-heartbeat",
    label: "聊聊最近一次心動的小事",
    fit: 5,
    reply: [
      { who: "partner", expr: "smile", text: "最近嗎……大概是剛剛吧。（小聲）有人注意到我手札上的小徽章。" },
    ],
  },
  {
    id: "s-dessert",
    label: "約定下次一起試試新甜點",
    fit: 4,
    reply: [
      { who: "partner", expr: "happy", text: "好耶！這間店的焦糖肉桂捲我已經吃三次了，但還有檸檬塔沒試過，下次一人一半！" },
    ],
  },
  {
    id: "s-glad",
    label: "告訴她：今天遇見你真好",
    fit: 6,
    reply: [
      { who: "partner", expr: "blush", text: "……我也是。（垂下眼睛，嘴角藏不住笑意）今天的雨，好像沒那麼討厭了。" },
    ],
  },
];

// ============================================================================
// 自由輸入的回應模板、離場與情緒關鍵字
// ============================================================================

export const EXIT_KEYWORDS = ["掰掰", "拜拜", "bye", "不想繼續", "不想聊", "不聊了", "先到這邊", "先走了", "退出", "結束對話"];
export const NEGATIVE_KEYWORDS = ["無聊", "討厭", "很煩", "閉嘴", "滾", "不想理", "噁", "沒興趣", "不關你的事"];
export const POSITIVE_KEYWORDS = ["喜歡", "開心", "好棒", "可愛", "謝謝", "有趣", "期待", "好聽", "好看", "哈哈", "好呀", "太好了", "溫柔", "漂亮"];

export const POSITIVE_REPLIES: ScriptLine[] = [
  { who: "partner", expr: "happy", text: "嘿嘿，聽你這麼說，我的心情一下子變好了。" },
  { who: "partner", expr: "blush", text: "你怎麼可以這麼自然地說出這種話啦……（低頭攪拌咖啡）" },
  { who: "partner", expr: "happy", text: "感覺我們的頻率越來越接近了耶。" },
];
export const NEUTRAL_REPLIES: ScriptLine[] = [
  { who: "partner", expr: "smile", text: "嗯嗯，我懂。然後呢然後呢？我想聽更多。" },
  { who: "partner", expr: "smile", text: "原來是這樣呀……（認真點頭）謝謝你願意跟我說。" },
  { who: "partner", expr: "happy", text: "這個話題好有趣，我們可以慢慢聊下去。" },
];
export const NEGATIVE_REPLIES: ScriptLine[] = [
  { who: "partner", expr: "worry", text: "……是嗎。（輕輕放下咖啡杯）如果我說錯了什麼，先跟你說聲抱歉。" },
  { who: "partner", expr: "worry", text: "我感覺你好像有點不耐煩了。要不要我們先慢下來，或是你想先休息一下？" },
];

export const EXIT_HINT_LINES: ScriptLine[] = [
  { who: "system", text: "🛡️ 系統偵測到你可能想結束這次互動。沒關係，你隨時可以離開，不需要任何理由，也不會被挽留。" },
];

export const COOLDOWN_LINES: ScriptLine[] = [
  { who: "narrator", text: "你們都安靜了下來，各自看向窗外的雨。短暫的沉默，讓彼此都有了呼吸的空間。" },
  { who: "partner", expr: "smile", text: "（輕聲）……謝謝你願意停下來。我們慢慢來就好。" },
];

export const PARTNER_LEAVE_LINES: ScriptLine[] = [
  { who: "partner", expr: "worry", text: "抱歉……我想先到這邊了。謝謝你今天陪我聊天，真的。" },
  { who: "system", text: "對方表示想結束本輪互動，系統已尊重對方的決定並關閉對話。" },
];

// ============================================================================
// 階段解鎖台詞
// ============================================================================

export const STAGE1_LINES: ScriptLine[] = [
  { who: "system", text: "📱 線上階段解鎖！「任務中心」已開放：默契二選一、雙人協力拼圖、支線劇情「手札裡的祕密」。" },
  { who: "partner", expr: "happy", text: "對了對了！我手札裡夾著一張「線上任務卡」……要不要一起解鎖看看？點右上角的任務中心就可以囉。" },
];

export const STAGE2_LINES: ScriptLine[] = [
  { who: "narrator", text: "不知不覺，窗外的雨停了。一道金色的光從雲縫裡透進來，落在木桌上。" },
  { who: "partner", expr: "blush", text: "……那個。雨停了，可是我還不想結束今天。" },
  { who: "partner", expr: "happy", text: "我知道幾個很有趣的地方，要不要把我們在線上的默契，帶到真實世界試試看？" },
  { who: "system", text: "🎟️ 實體約會階段解鎖！已依你們的共同興趣，推薦 3 個認證合作通路。" },
];

export const AFTER_BOOKING_LINES: ScriptLine[] = [
  { who: "partner", expr: "blush", text: "那就說好囉。……我會把這天，好好畫進手札裡。" },
  { who: "system", text: "✅ 行程已建立。你也可以隨時點選「結束本輪」，體驗平順退出機制。" },
];

// ============================================================================
// 線上任務
// ============================================================================

export type QuestId = "pair" | "puzzle" | "story";

export const QUESTS: { id: QuestId; icon: string; title: string; desc: string; kind: string }[] = [
  { id: "pair", icon: "💞", title: "默契二選一", desc: "雙方同時選擇，揭曉你們的默契指數。", kind: "小遊戲" },
  { id: "puzzle", icon: "🧩", title: "雙人協力拼圖", desc: "你換一塊、夏樹補一塊，一起拼回回憶畫面。", kind: "協力任務" },
  { id: "story", icon: "📖", title: "手札裡的祕密", desc: "翻開那張泛黃的票根，解鎖一段支線劇情。", kind: "支線劇情" },
];

export interface PairQuestion {
  q: string;
  a: string;
  b: string;
  partner: "a" | "b";
}

export const PAIR_QUESTIONS: PairQuestion[] = [
  { q: "放假的午後，你更想…", a: "窩在咖啡館讀一本書", b: "出門挑戰新的密室", partner: "b" },
  { q: "第一次約會，你希望…", a: "慢慢散步聊天", b: "一起動手做點什麼", partner: "b" },
  { q: "出發去旅行前，你會…", a: "排好完整行程表", b: "抵達再隨性決定", partner: "b" },
  { q: "下雨天，你偏好…", a: "待在室內聽黑膠", b: "撐傘去街角逛逛", partner: "a" },
  { q: "甜點只能選一個…", a: "焦糖肉桂捲", b: "檸檬塔", partner: "a" },
];

/** 拼圖初始排列（每一塊的正確位置編號）：2 列 × 3 欄 */
export const PUZZLE_START = [3, 0, 5, 2, 1, 4];

export interface StoryNode {
  intro: ScriptLine[];
  options: { text: string; points: number; reply: string }[];
}

export const STORY_QUEST_NODES: StoryNode[] = [
  {
    intro: [
      { who: "narrator", text: "夏樹翻開手札，裡面夾著一張邊角微捲的泛黃票根。" },
      { who: "partner", text: "這是我第一次一個人去解謎的票根……當天雖然沒有破關，卻讓我記到現在。" },
    ],
    options: [
      { text: "「那天發生了什麼事？」", points: 4, reply: "有個店員在我卡關時，什麼都沒說，只是默默把提示卡推到我手邊。我那時候覺得：被溫柔對待，其實很簡單。" },
      { text: "「下次換我陪你一起去。」", points: 7, reply: "（睜大眼睛）真的嗎？……那我要先說好，我很會卡關喔，你要有心理準備！" },
    ],
  },
  {
    intro: [
      { who: "narrator", text: "票根背面，用鉛筆寫著一行小小的字：想和某個人，一起破一次關。" },
      { who: "partner", text: "……被你看到了。這個願望，我還沒跟任何人說過。" },
    ],
    options: [
      { text: "「那我可以當第一個知道的人嗎？」", points: 7, reply: "（耳尖紅透）你已經是了啦……笨蛋。" },
      { text: "「我們把這個願望，一起實現吧。」", points: 8, reply: "好。……一言為定。" },
    ],
  },
];

// ============================================================================
// 實體合作通路（認證商戶 Fixture，皆為 DEMO 示意）
// ============================================================================

export interface Venue {
  id: string;
  kind: string;
  name: string;
  store: string;
  place: string;
  theme: string;
  intro: string;
  tags: string[];
  coupon: { code: string; desc: string };
  price: string;
  partnerWants: boolean;
  holdNote: string;
  slots: { id: string; label: string }[];
  itinerary: { time: string; text: string }[];
}

export const VENUES: Venue[] = [
  {
    id: "escape",
    kind: "實境解謎",
    name: "發條鐘的記憶迷宮",
    store: "時光迴廊解謎工作室",
    place: "台北市中山區・捷運中山站步行 4 分",
    theme: "雙人協力密室・約 60 分鐘",
    intro: "專為初次見面設計的合作型密室，必須兩人分工找線索才能破關，是最自然的破冰與默契測試。",
    tags: ["實境解謎"],
    coupon: { code: "HL-ESC-0412", desc: "雙人同行現折 NT$300" },
    price: "雙人 NT$1,100 起",
    partnerWants: true,
    holdNote: "",
    slots: [
      { id: "sat-14", label: "週六 14:00" },
      { id: "sat-16", label: "週六 16:30" },
      { id: "sun-11", label: "週日 11:00" },
    ],
    itinerary: [
      { time: "集合", text: "於店門口公共區域會合，各自前往，不需要事先交換私人聯絡方式" },
      { time: "活動", text: "雙人協力密室挑戰（約 60 分鐘），工作人員全程在場" },
      { time: "之後", text: "憑優惠碼在合作咖啡館延伸小聚，隨時可自由離場" },
    ],
  },
  {
    id: "craft",
    kind: "手作工坊",
    name: "皮革敲印・專屬鑰匙圈",
    store: "微光革物手作工坊",
    place: "台北市大同區・赤峰街巷弄",
    theme: "雙人手作體驗・約 90 分鐘",
    intro: "親手敲印彼此的化身代號，做成一對皮革鑰匙圈，把第一次見面變成可以帶走的紀念物。",
    tags: ["文創手作", "手沖咖啡"],
    coupon: { code: "HL-CRAFT-0618", desc: "贈雙人手沖咖啡茶點組" },
    price: "雙人 NT$1,480 起",
    partnerWants: true,
    holdNote: "",
    slots: [
      { id: "sat-13", label: "週六 13:30" },
      { id: "sun-15", label: "週日 15:00" },
      { id: "sun-17", label: "週日 17:00" },
    ],
    itinerary: [
      { time: "集合", text: "於工坊門口會合，建議各自前往，現場有店員協助" },
      { time: "活動", text: "挑選皮革、敲印字樣、縫製收邊（約 90 分鐘）" },
      { time: "之後", text: "享用贈送的手沖咖啡茶點組，聊聊今天的作品" },
    ],
  },
  {
    id: "cafe",
    kind: "特色咖啡館",
    name: "雨歇二樓・手沖品飲茶席",
    store: "轉角・雨歇 2F 品飲室",
    place: "台北市大安區・巷弄轉角",
    theme: "雙人品飲茶席・約 60 分鐘",
    intro: "在你們相遇的咖啡館二樓，老闆親自帶領品飲三款單品，適合想慢慢聊的人。",
    tags: ["手沖咖啡", "獨立書店"],
    coupon: { code: "HL-CAFE-0925", desc: "第二杯半價＋手寫明信片" },
    price: "雙人 NT$680 起",
    partnerWants: false,
    holdNote: "夏樹想先保留，這次想先去一個可以「動手做點什麼」的地方。",
    slots: [
      { id: "sat-10", label: "週六 10:30" },
      { id: "sat-15", label: "週六 15:00" },
      { id: "sun-14", label: "週日 14:00" },
    ],
    itinerary: [
      { time: "集合", text: "於一樓吧台會合，公共空間、有店員在場" },
      { time: "活動", text: "品飲三款手沖單品與搭配甜點（約 60 分鐘）" },
      { time: "之後", text: "可選擇在店內續聊或自由離場" },
    ],
  },
];

export const SAFETY_TIPS = [
  "首次見面請選擇公共場所，並建議各自前往、各自返回",
  "不需要提前交換電話、社群帳號等真實個資",
  "行程可隨時取消，也能隨時結束本輪互動",
];

/** DEMO 導覽的七個步驟 */
export const STEP_LABELS = [
  "建立虛擬人物",
  "填寫興趣與條件",
  "配對成功",
  "劇情破冰對話",
  "線上階段解鎖",
  "實體約會階段",
  "平順退出機制",
];
