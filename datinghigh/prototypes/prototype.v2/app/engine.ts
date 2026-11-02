// 心動迴路 DEMO：純函式遊戲引擎（狀態機、好感度、配對、安全過濾）
// 所有行為皆為結構化 Mock，不呼叫任何外部 API。

import {
  AFTER_BOOKING_LINES,
  AFTER_ROUNDS,
  AVATAR_STYLES,
  BASE_AFFECTION,
  BIO_MAX,
  CHAT_MAX,
  COOLDOWN_LINES,
  DEFAULT_PROFILE,
  EXIT_HINT_LINES,
  EXIT_KEYWORDS,
  FACTOR_CAPS,
  INTEREST_MIN,
  LOW_FLOOR,
  NEGATIVE_KEYWORDS,
  NEGATIVE_REPLIES,
  NEUTRAL_REPLIES,
  NICKNAME_MAX,
  NICKNAME_MIN,
  PARTNER,
  PARTNER_LEAVE_LINES,
  POSITIVE_KEYWORDS,
  POSITIVE_REPLIES,
  PUZZLE_START,
  ROUNDS,
  STAGE1_AT,
  STAGE1_LINES,
  STAGE2_AT,
  STAGE2_LINES,
  SUGGESTIONS,
  VENUES,
} from "./content";
import type { ChoiceDef, Expr, Profile, QuestId, ScriptLine, Who } from "./content";

// ============================================================================
// 安全過濾與語意偵測
// ============================================================================

/** 過濾使用者輸入：移除標籤、控制字元與尖括號，並限制長度（不可信資料邊界） */
export function sanitizeText(input: string, max: number, trim = true): { value: string; changed: boolean } {
  const raw = String(input ?? "");
  let value = raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/javascript\s*:/gi, "")
    .replace(/\s+/g, " ");
  if (trim) value = value.trim();
  if (value.length > max) value = value.slice(0, max);
  return { value, changed: value !== (trim ? raw.trim() : raw) };
}

/** 判斷是否包含離場語境（掰掰、不想繼續…） */
export function detectExit(text: string): boolean {
  const lower = String(text ?? "").toLowerCase();
  return EXIT_KEYWORDS.some((word) => lower.includes(word));
}

export type Sentiment = "positive" | "negative" | "neutral";

/** 簡易情緒分類（DEMO 用關鍵字規則） */
export function classifyText(text: string): Sentiment {
  const lower = String(text ?? "").toLowerCase();
  if (NEGATIVE_KEYWORDS.some((word) => lower.includes(word))) return "negative";
  if (POSITIVE_KEYWORDS.some((word) => lower.includes(word))) return "positive";
  return "neutral";
}

// ============================================================================
// 配對契合度
// ============================================================================

export interface CompatPart {
  label: string;
  value: number;
}

export interface Compatibility {
  total: number;
  parts: CompatPart[];
  shared: string[];
  sharedTopics: string[];
  conditionsMet: string[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** 依雙方填寫的興趣、生活習慣、話題與相處模式計算契合度 */
export function computeCompatibility(profile: Profile): Compatibility {
  const shared = profile.interests.filter((item) => PARTNER.interests.includes(item));
  const sharedTopics = profile.topics.filter((item) => PARTNER.topics.includes(item));
  const interestRatio = clamp(shared.length / Math.max(3, Math.min(profile.interests.length || 1, PARTNER.interests.length)), 0, 1);
  const habitHits = [profile.weekend === PARTNER.weekend, profile.schedule === PARTNER.schedule, profile.chatStyle === PARTNER.chatStyle].filter(Boolean).length;
  const topicRatio = clamp(sharedTopics.length / 3, 0, 1);
  const modeRatio = profile.mode === PARTNER.mode ? 1 : 0.5;
  const raw = interestRatio * 50 + (habitHits / 3) * 20 + topicRatio * 15 + modeRatio * 15;
  const total = clamp(Math.round(60 + raw * 0.39), 60, 99);
  const conditionsMet: string[] = [];
  if (PARTNER.ageOk.includes(profile.age)) conditionsMet.push("年齡區間符合");
  if (PARTNER.areaOk.includes(profile.area)) conditionsMet.push("活動地區符合");
  if (modeRatio === 1) conditionsMet.push("相處模式一致");
  return {
    total,
    shared,
    sharedTopics,
    conditionsMet,
    parts: [
      { label: "興趣共鳴", value: Math.round(interestRatio * 100) },
      { label: "生活步調", value: Math.round((habitHits / 3) * 100) },
      { label: "話題契合", value: Math.round(topicRatio * 100) },
      { label: "相處節奏", value: Math.round(modeRatio * 100) },
    ],
  };
}

// ============================================================================
// 狀態定義
// ============================================================================

export type Screen = "title" | "avatar" | "profile" | "matching" | "chat" | "ended";

export interface LogLine {
  id: number;
  who: Who;
  text: string;
  expr?: Expr;
}

export type Prompt =
  | { kind: "choices"; roundIndex: number }
  | { kind: "free" }
  | { kind: "venues" };

export interface Factors {
  freq: number;
  fit: number;
  dwell: number;
  quest: number;
  boost: number;
}

export type PartnerVenueState = "pending" | "yes" | "hold";

export interface VenueState {
  me: boolean;
  partner: PartnerVenueState;
}

export interface Booking {
  venueId: string;
  slotId: string | null;
  confirmed: boolean;
}

export type EndReason = "user" | "keyword" | "low" | "partner";

export interface GameState {
  screen: Screen;
  avatar: { styleId: string; nickname: string; bio: string };
  profile: Profile;
  errors: { avatar: string; profile: string };
  notice: string;
  match: { compat: Compatibility; me: boolean; partner: boolean } | null;
  affection: number;
  factors: Factors;
  negStreak: number;
  stage: 0 | 1 | 2;
  pendingUnlock: 0 | 1 | 2;
  unlockAt: number;
  queue: LogLine[];
  qi: number;
  log: LogLine[];
  prompt: Prompt | null;
  expr: Expr;
  usedSuggestions: string[];
  usedChoiceIds: string[];
  quests: Record<QuestId, { done: boolean; bonus: number }>;
  hubOpen: boolean;
  venues: Record<string, VenueState>;
  booking: Booking | null;
  booked: boolean;
  confirmEnd: boolean;
  exitHint: boolean;
  lowPrompt: boolean;
  ended: { reason: EndReason; affection: number } | null;
  messagesSent: number;
  seq: number;
}

export const initialState: GameState = {
  screen: "title",
  avatar: { styleId: AVATAR_STYLES[0].id, nickname: "", bio: "" },
  profile: { ...DEFAULT_PROFILE, interests: [], topics: [] },
  errors: { avatar: "", profile: "" },
  notice: "",
  match: null,
  affection: BASE_AFFECTION,
  factors: { freq: 0, fit: 0, dwell: 0, quest: 0, boost: 0 },
  negStreak: 0,
  stage: 0,
  pendingUnlock: 0,
  unlockAt: 0,
  queue: [],
  qi: 0,
  log: [],
  prompt: null,
  expr: "smile",
  usedSuggestions: [],
  usedChoiceIds: [],
  quests: { pair: { done: false, bonus: 0 }, puzzle: { done: false, bonus: 0 }, story: { done: false, bonus: 0 } },
  hubOpen: false,
  venues: {},
  booking: null,
  booked: false,
  confirmEnd: false,
  exitHint: false,
  lowPrompt: false,
  ended: null,
  messagesSent: 0,
  seq: 0,
};

// ============================================================================
// 輔助函式
// ============================================================================

export function levelFor(affection: number): 0 | 1 | 2 {
  if (affection >= STAGE2_AT) return 2;
  if (affection >= STAGE1_AT) return 1;
  return 0;
}

function recalc(state: GameState, factors: Factors): GameState {
  const f: Factors = {
    freq: clamp(factors.freq, 0, FACTOR_CAPS.freq),
    fit: clamp(factors.fit, -40, FACTOR_CAPS.fit),
    dwell: clamp(factors.dwell, 0, FACTOR_CAPS.dwell),
    quest: clamp(factors.quest, 0, FACTOR_CAPS.quest),
    boost: clamp(factors.boost, 0, 100),
  };
  const affection = clamp(Math.round(BASE_AFFECTION + f.freq + f.fit + f.dwell + f.quest + f.boost), 0, 100);
  return { ...state, factors: f, affection };
}

export function renderText(text: string, nickname: string): string {
  return text.split("{nick}").join(nickname || "你");
}

function makeLines(state: GameState, lines: ScriptLine[]): { lines: LogLine[]; seq: number } {
  let seq = state.seq;
  const made = lines.map((line) => {
    seq += 1;
    return { id: seq, who: line.who, text: renderText(line.text, state.avatar.nickname), expr: line.expr };
  });
  return { lines: made, seq };
}

/** 將第一句台詞寫入紀錄並更新目前表情 */
function showLine(state: GameState, line: LogLine | undefined): GameState {
  if (!line) return state;
  return {
    ...state,
    log: [...state.log, line],
    expr: line.who === "partner" && line.expr ? line.expr : state.expr,
  };
}

/** 載入一組新台詞佇列，並依好感度判斷是否跨越門檻而插入解鎖劇情 */
function enqueue(state: GameState, base: ScriptLine[], prompt: Prompt | null): GameState {
  let lines = base;
  let next: GameState = { ...state };
  const level = levelFor(next.affection);
  if (level > next.stage) {
    next = { ...next, stage: level, pendingUnlock: level, unlockAt: base.length };
    lines = [...base, ...(level === 2 ? STAGE2_LINES : STAGE1_LINES)];
    if (level === 2) {
      prompt = { kind: "venues" };
      next.hubOpen = false;
    }
  }
  const made = makeLines(next, lines);
  next = { ...next, queue: made.lines, qi: 0, seq: made.seq, prompt };
  return showLine(next, made.lines[0]);
}

function blockedByUnlock(state: GameState): boolean {
  return state.pendingUnlock > 0 && state.qi >= state.unlockAt;
}

export function currentLine(state: GameState): LogLine | undefined {
  return state.queue[state.qi];
}

/** 是否已到佇列最後一句（此時才顯示選項與輸入） */
export function atLastLine(state: GameState): boolean {
  return state.queue.length === 0 || state.qi >= state.queue.length - 1;
}

export function visibleSuggestions(state: GameState) {
  return SUGGESTIONS.filter((item) => !state.usedSuggestions.includes(item.id)).slice(0, 3);
}

function openingLines(state: GameState, shared: string[]): ScriptLine[] {
  const common = shared.length > 0 ? shared.slice(0, 3).join("、") : "好奇心";
  return [
    { who: "narrator", text: "午後三點，台北。一場突如其來的陣雨，把你帶進了巷弄轉角那間名叫「轉角・雨歇」的咖啡館。" },
    { who: "narrator", text: "玻璃窗上的雨痕把街燈暈成一圈圈暖光，吧台旁飄來手沖咖啡與焦糖肉桂捲的香氣。" },
    { who: "partner", expr: "smile", text: "（從手札裡抬起頭，眼睛彎了彎）啊，你好！其實我也只是客人啦，只是在這裡賴了一下午。" },
    { who: "partner", expr: "happy", text: "這場雨下得好突然呢。你也是進來避雨的嗎？" },
    { who: "system", text: `💡 破冰助手：你們有 ${shared.length} 個共同興趣（${common}）。選一句最像你的話，開始這段故事吧。` },
  ];
}

function startChat(state: GameState): GameState {
  const shared = state.match?.compat.shared ?? [];
  const base: GameState = {
    ...state,
    screen: "chat",
    affection: BASE_AFFECTION,
    factors: { freq: 0, fit: 0, dwell: 0, quest: 0, boost: 0 },
    negStreak: 0,
    stage: 0,
    pendingUnlock: 0,
    unlockAt: 0,
    log: [],
    usedSuggestions: [],
    usedChoiceIds: [],
    quests: { pair: { done: false, bonus: 0 }, puzzle: { done: false, bonus: 0 }, story: { done: false, bonus: 0 } },
    hubOpen: false,
    venues: {},
    booking: null,
    booked: false,
    confirmEnd: false,
    exitHint: false,
    lowPrompt: false,
    ended: null,
    messagesSent: 0,
    seq: 0,
  };
  return enqueue(base, openingLines(base, shared), { kind: "choices", roundIndex: 0 });
}

function withDefaults(state: GameState): GameState {
  const profile: Profile = {
    ...state.profile,
    interests: state.profile.interests.length >= INTEREST_MIN ? state.profile.interests : DEFAULT_PROFILE.interests,
    topics: state.profile.topics.length > 0 ? state.profile.topics : DEFAULT_PROFILE.topics,
  };
  const nickname = sanitizeText(state.avatar.nickname, NICKNAME_MAX).value || "旅人";
  return {
    ...state,
    avatar: { ...state.avatar, nickname },
    profile,
    match: { compat: computeCompatibility(profile), me: true, partner: true },
  };
}

function finishEnd(state: GameState, reason: EndReason): GameState {
  return {
    ...state,
    screen: "ended",
    confirmEnd: false,
    exitHint: false,
    lowPrompt: false,
    hubOpen: false,
    booking: null,
    ended: { reason, affection: state.affection },
  };
}

function nextPromptAfterRound(roundIndex: number): { prompt: Prompt; extra: ScriptLine[] } {
  const next = roundIndex + 1;
  if (next < ROUNDS.length) return { prompt: { kind: "choices", roundIndex: next }, extra: ROUNDS[next].intro };
  return { prompt: { kind: "free" }, extra: AFTER_ROUNDS };
}

/** 套用一則使用者訊息的好感度影響 */
function applyMessage(state: GameState, opts: { fit: number; counts: boolean; negative: boolean }): GameState {
  const factors: Factors = {
    ...state.factors,
    freq: state.factors.freq + (opts.counts ? 2 : 0),
    fit: state.factors.fit + opts.fit,
  };
  let next = recalc(state, factors);
  next = { ...next, messagesSent: next.messagesSent + 1, negStreak: opts.negative ? next.negStreak + 1 : 0 };
  if (opts.negative && (next.negStreak >= 2 || next.affection <= LOW_FLOOR)) next = { ...next, lowPrompt: true };
  return next;
}

// ============================================================================
// 拼圖（雙人協力）
// ============================================================================

export function isPuzzleSolved(order: number[]): boolean {
  return order.every((piece, index) => piece === index);
}

export function swapPieces(order: number[], a: number, b: number): number[] {
  if (a === b || a < 0 || b < 0 || a >= order.length || b >= order.length) return order;
  const next = [...order];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** 夏樹的協力：把第一個放錯位置的拼圖歸位 */
export function partnerAssist(order: number[]): number[] {
  const wrong = order.findIndex((piece, index) => piece !== index);
  if (wrong < 0) return order;
  const from = order.indexOf(wrong);
  return swapPieces(order, wrong, from);
}

export function initialPuzzle(): number[] {
  return [...PUZZLE_START];
}

// ============================================================================
// Reducer
// ============================================================================

export type Action =
  | { type: "START" }
  | { type: "SET_AVATAR"; styleId?: string; nickname?: string; bio?: string }
  | { type: "SUBMIT_AVATAR" }
  | { type: "TOGGLE_INTEREST"; name: string }
  | { type: "TOGGLE_TOPIC"; name: string }
  | { type: "SET_FIELD"; key: "weekend" | "schedule" | "chatStyle" | "mode" | "age" | "area"; value: string }
  | { type: "SUBMIT_PROFILE" }
  | { type: "CONFIRM_MATCH" }
  | { type: "PARTNER_CONFIRM" }
  | { type: "ENTER_CHAT" }
  | { type: "ADVANCE" }
  | { type: "PICK_CHOICE"; id: string }
  | { type: "PICK_SUGGESTION"; id: string }
  | { type: "SEND_TEXT"; text: string }
  | { type: "TICK" }
  | { type: "OPEN_HUB" }
  | { type: "CLOSE_HUB" }
  | { type: "COMPLETE_QUEST"; id: QuestId; bonus: number }
  | { type: "ACK_UNLOCK" }
  | { type: "VENUE_INTEREST"; id: string }
  | { type: "PARTNER_VENUE"; id: string }
  | { type: "OPEN_BOOKING"; id: string }
  | { type: "PICK_SLOT"; slotId: string }
  | { type: "CONFIRM_BOOKING" }
  | { type: "CLOSE_BOOKING" }
  | { type: "REQUEST_END" }
  | { type: "CANCEL_END" }
  | { type: "CONFIRM_END" }
  | { type: "DISMISS_EXIT_HINT" }
  | { type: "COOLDOWN" }
  | { type: "PARTNER_LEAVE" }
  | { type: "DEMO_BOOST"; amount: number }
  | { type: "JUMP"; step: number }
  | { type: "RESTART" };

function findChoice(roundIndex: number, id: string): ChoiceDef | undefined {
  return ROUNDS[roundIndex]?.choices.find((choice) => choice.id === id);
}

export function gameReducer(state: GameState, action: Action): GameState {
  // 結束後鎖定：只允許重新開始，不接受任何新訊息或互動
  if (state.screen === "ended") {
    return action.type === "RESTART" ? { ...initialState, screen: "title" } : state;
  }

  switch (action.type) {
    case "START":
      return { ...state, screen: "avatar" };

    case "SET_AVATAR": {
      const avatar = { ...state.avatar };
      let notice = "";
      if (action.styleId && AVATAR_STYLES.some((style) => style.id === action.styleId)) avatar.styleId = action.styleId;
      if (action.nickname !== undefined) {
        const cleaned = sanitizeText(action.nickname, NICKNAME_MAX, false);
        avatar.nickname = cleaned.value;
        // 輸入框保留使用者尚在輸入的空白，但標籤與尖括號會被移除
        if (cleaned.changed && /[<>]/.test(action.nickname)) notice = "已自動移除不安全字元";
      }
      if (action.bio !== undefined) {
        const cleaned = sanitizeText(action.bio, BIO_MAX, false);
        avatar.bio = cleaned.value;
        if (cleaned.changed && /[<>]/.test(action.bio)) notice = "已自動移除不安全字元";
      }
      return { ...state, avatar, notice, errors: { ...state.errors, avatar: "" } };
    }

    case "SUBMIT_AVATAR": {
      const nickname = sanitizeText(state.avatar.nickname, NICKNAME_MAX).value;
      if (nickname.length < NICKNAME_MIN) {
        return { ...state, errors: { ...state.errors, avatar: `暱稱需為 ${NICKNAME_MIN}–${NICKNAME_MAX} 個字` } };
      }
      return { ...state, avatar: { ...state.avatar, nickname }, screen: "profile", errors: { ...state.errors, avatar: "" } };
    }

    case "TOGGLE_INTEREST": {
      const has = state.profile.interests.includes(action.name);
      const interests = has ? state.profile.interests.filter((item) => item !== action.name) : [...state.profile.interests, action.name];
      return { ...state, profile: { ...state.profile, interests }, errors: { ...state.errors, profile: "" } };
    }

    case "TOGGLE_TOPIC": {
      const has = state.profile.topics.includes(action.name);
      const topics = has ? state.profile.topics.filter((item) => item !== action.name) : [...state.profile.topics, action.name];
      return { ...state, profile: { ...state.profile, topics }, errors: { ...state.errors, profile: "" } };
    }

    case "SET_FIELD":
      return { ...state, profile: { ...state.profile, [action.key]: action.value } };

    case "SUBMIT_PROFILE": {
      if (state.profile.interests.length < INTEREST_MIN) {
        return { ...state, errors: { ...state.errors, profile: `請至少選擇 ${INTEREST_MIN} 個興趣標籤，才能計算配對權重` } };
      }
      if (state.profile.topics.length < 1) {
        return { ...state, errors: { ...state.errors, profile: "請至少選擇 1 個想聊的話題" } };
      }
      return {
        ...state,
        screen: "matching",
        errors: { ...state.errors, profile: "" },
        match: { compat: computeCompatibility(state.profile), me: false, partner: false },
      };
    }

    case "CONFIRM_MATCH":
      return state.match ? { ...state, match: { ...state.match, me: true } } : state;

    case "PARTNER_CONFIRM":
      return state.match && state.match.me ? { ...state, match: { ...state.match, partner: true } } : state;

    case "ENTER_CHAT":
      return state.match?.me && state.match.partner ? startChat(state) : state;

    case "ADVANCE": {
      if (state.screen !== "chat" || blockedByUnlock(state) || atLastLine(state)) return state;
      const qi = state.qi + 1;
      const shown = showLine({ ...state, qi }, state.queue[qi]);
      return shown;
    }

    case "PICK_CHOICE": {
      if (state.screen !== "chat" || state.prompt?.kind !== "choices" || !atLastLine(state) || blockedByUnlock(state)) return state;
      const roundIndex = state.prompt.roundIndex;
      const choice = findChoice(roundIndex, action.id);
      if (!choice || state.usedChoiceIds.includes(choice.id)) return state;
      const interestBonus = choice.interest && state.profile.interests.includes(choice.interest) ? 3 : 0;
      let next = applyMessage(state, { fit: choice.fit + interestBonus, counts: true, negative: false });
      next = { ...next, usedChoiceIds: [...next.usedChoiceIds, choice.id] };
      const after = nextPromptAfterRound(roundIndex);
      const lines: ScriptLine[] = [{ who: "me", text: choice.text }, ...choice.reply];
      // 解鎖劇情需插在回覆之後、下一輪介紹之前
      return enqueueRound(next, lines, after.extra, after.prompt);
    }

    case "PICK_SUGGESTION": {
      if (state.screen !== "chat" || !atLastLine(state) || blockedByUnlock(state)) return state;
      const suggestion = SUGGESTIONS.find((item) => item.id === action.id);
      if (!suggestion || state.usedSuggestions.includes(suggestion.id)) return state;
      let next = applyMessage(state, { fit: suggestion.fit, counts: true, negative: false });
      next = { ...next, usedSuggestions: [...next.usedSuggestions, suggestion.id] };
      return enqueue(next, [{ who: "me", text: suggestion.label }, ...suggestion.reply], state.prompt);
    }

    case "SEND_TEXT": {
      if (state.screen !== "chat" || !atLastLine(state) || blockedByUnlock(state)) return state;
      const cleaned = sanitizeText(action.text, CHAT_MAX);
      if (!cleaned.value) return state;
      const mine: ScriptLine = { who: "me", text: cleaned.value };
      if (detectExit(cleaned.value)) {
        const counted = { ...state, messagesSent: state.messagesSent + 1 };
        return { ...enqueue(counted, [mine, ...EXIT_HINT_LINES], state.prompt), exitHint: true, notice: cleaned.changed ? "已過濾不安全字元" : "" };
      }
      const sentiment = classifyText(cleaned.value);
      const negative = sentiment === "negative";
      const fit = negative ? -12 : sentiment === "positive" ? 5 : 2;
      let next = applyMessage(state, { fit, counts: !negative, negative });
      const pool = negative ? NEGATIVE_REPLIES : sentiment === "positive" ? POSITIVE_REPLIES : NEUTRAL_REPLIES;
      const reply = pool[next.messagesSent % pool.length];
      next = { ...next, notice: cleaned.changed ? "已過濾不安全字元" : "" };
      return enqueue(next, [mine, reply], state.prompt);
    }

    case "TICK": {
      if (state.screen !== "chat") return state;
      return recalc(state, { ...state.factors, dwell: state.factors.dwell + 1 });
    }

    case "OPEN_HUB":
      return state.stage >= 1 ? { ...state, hubOpen: true } : state;

    case "CLOSE_HUB":
      return { ...state, hubOpen: false };

    case "COMPLETE_QUEST": {
      if (state.screen !== "chat" || state.stage < 1 || state.quests[action.id].done) return state;
      const bonus = clamp(Math.round(action.bonus), 0, 20);
      let next = recalc(state, { ...state.factors, quest: state.factors.quest + bonus });
      next = { ...next, quests: { ...next.quests, [action.id]: { done: true, bonus } }, hubOpen: false, negStreak: 0 };
      const titles: Record<QuestId, string> = { pair: "默契二選一", puzzle: "雙人協力拼圖", story: "手札裡的祕密" };
      const reactions: Record<QuestId, ScriptLine> = {
        pair: { who: "partner", expr: "happy", text: "原來我們有這麼多地方想的一樣！之後還要再玩一次嗎？" },
        puzzle: { who: "partner", expr: "happy", text: "我們好像天生就很會互相補位耶。（笑）" },
        story: { who: "partner", expr: "blush", text: "……那些話，我只對你說過。你可要好好保密喔。" },
      };
      const lines: ScriptLine[] = [
        { who: "system", text: `✅ 任務完成：${titles[action.id]}（好感度 +${bonus}）` },
        reactions[action.id],
      ];
      return enqueue(next, lines, state.prompt);
    }

    case "ACK_UNLOCK":
      return { ...state, pendingUnlock: 0 };

    case "VENUE_INTEREST": {
      if (state.screen !== "chat" || state.prompt?.kind !== "venues") return state;
      if (!VENUES.some((venue) => venue.id === action.id)) return state;
      const current = state.venues[action.id] ?? { me: false, partner: "pending" as PartnerVenueState };
      const me = !current.me;
      return { ...state, venues: { ...state.venues, [action.id]: { me, partner: me ? current.partner : "pending" } } };
    }

    case "PARTNER_VENUE": {
      const venue = VENUES.find((item) => item.id === action.id);
      const current = state.venues[action.id];
      if (!venue || !current?.me) return state;
      return { ...state, venues: { ...state.venues, [action.id]: { ...current, partner: venue.partnerWants ? "yes" : "hold" } } };
    }

    case "OPEN_BOOKING": {
      const current = state.venues[action.id];
      if (!current || !current.me || current.partner !== "yes") return state;
      return { ...state, booking: { venueId: action.id, slotId: null, confirmed: false } };
    }

    case "PICK_SLOT":
      return state.booking && !state.booking.confirmed ? { ...state, booking: { ...state.booking, slotId: action.slotId } } : state;

    case "CONFIRM_BOOKING": {
      if (!state.booking || state.booking.confirmed || !state.booking.slotId) return state;
      return { ...state, booking: { ...state.booking, confirmed: true }, booked: true };
    }

    case "CLOSE_BOOKING": {
      if (!state.booking) return state;
      if (!state.booking.confirmed) return { ...state, booking: null };
      const closed = { ...state, booking: null };
      return enqueue(closed, AFTER_BOOKING_LINES, { kind: "free" });
    }

    case "REQUEST_END":
      return { ...state, confirmEnd: true };

    case "CANCEL_END":
      return { ...state, confirmEnd: false };

    case "CONFIRM_END":
      return state.screen === "chat" ? finishEnd(state, state.exitHint ? "keyword" : state.lowPrompt ? "low" : "user") : state;

    case "DISMISS_EXIT_HINT":
      return { ...state, exitHint: false };

    case "COOLDOWN": {
      const calmed = { ...state, lowPrompt: false, negStreak: 0, factors: { ...state.factors, fit: Math.max(state.factors.fit, 0) } };
      return enqueue(recalc(calmed, calmed.factors), COOLDOWN_LINES, state.prompt);
    }

    case "PARTNER_LEAVE": {
      if (state.screen !== "chat") return state;
      const made = makeLines(state, PARTNER_LEAVE_LINES);
      let next: GameState = { ...state, log: [...state.log, ...made.lines], seq: made.seq, expr: "worry" };
      next = finishEnd(next, "partner");
      return next;
    }

    case "DEMO_BOOST": {
      if (state.screen !== "chat") return state;
      const amount = clamp(Math.round(action.amount), 1, 60);
      const next = recalc(state, { ...state.factors, boost: state.factors.boost + amount });
      const prompt = levelFor(next.affection) >= 1 && state.prompt?.kind === "choices" ? { kind: "free" as const } : state.prompt;
      return enqueue(next, [{ who: "system", text: `🛠️ DEMO 工具：好感度快轉 +${amount}` }], prompt);
    }

    case "JUMP": {
      const step = clamp(Math.round(action.step), 0, 6);
      if (step === 0) return { ...state, screen: "avatar", booking: null, hubOpen: false };
      if (step === 1) return { ...state, screen: "profile", booking: null, hubOpen: false };
      const ready = withDefaults(state);
      if (step === 2) return { ...ready, screen: "matching", match: { compat: computeCompatibility(ready.profile), me: false, partner: false }, booking: null, hubOpen: false };
      let chat = startChat(ready);
      if (step === 3) return chat;
      chat = { ...chat, queue: [], qi: 0, log: [] };
      if (step === 4) {
        const boosted = recalc(chat, { ...chat.factors, freq: 6, fit: 22 });
        return enqueue({ ...boosted, usedChoiceIds: ROUNDS.map((round) => round.choices[0].id) }, [{ who: "system", text: "🛠️ DEMO 導覽：已快轉至線上階段。" }], { kind: "free" });
      }
      if (step === 5) {
        const boosted = recalc(chat, { ...chat.factors, freq: 8, fit: 30, quest: 20 });
        const promoted = { ...boosted, stage: 1 as const };
        return enqueue(promoted, [{ who: "system", text: "🛠️ DEMO 導覽：已快轉至實體約會階段。" }], { kind: "free" });
      }
      // step 6：平順退出機制示範，回到可輸入狀態並開啟結束確認
      const boosted = recalc(chat, { ...chat.factors, freq: 8, fit: 30, quest: 20 });
      const promoted = { ...boosted, stage: 2 as const, booked: false };
      return { ...enqueue(promoted, [{ who: "system", text: "🛠️ DEMO 導覽：請在下方輸入「掰掰」或點右上角「結束本輪」，體驗平順退出。" }], { kind: "free" }) };
    }

    case "RESTART":
      return { ...initialState, screen: "title" };

    default:
      return state;
  }
}

/** PICK_CHOICE 專用：回覆之後可能插入解鎖劇情，再接下一輪介紹 */
function enqueueRound(state: GameState, lines: ScriptLine[], extra: ScriptLine[], prompt: Prompt): GameState {
  const level = levelFor(state.affection);
  if (level > state.stage) {
    // 先以 enqueue 處理解鎖（含 STAGE 台詞），再把下一輪介紹附加在後
    const unlocked = enqueue(state, lines, prompt);
    if (unlocked.prompt?.kind === "venues") return unlocked;
    const made = makeLines(unlocked, extra);
    return { ...unlocked, queue: [...unlocked.queue, ...made.lines], seq: made.seq, prompt };
  }
  return enqueue(state, [...lines, ...extra], prompt);
}

/** 目前主要使用者可見的 DEMO 步驟（0–6） */
export function currentStep(state: GameState): number {
  switch (state.screen) {
    case "title":
    case "avatar":
      return 0;
    case "profile":
      return 1;
    case "matching":
      return 2;
    case "ended":
      return 6;
    default:
      return state.stage === 0 ? 3 : state.stage === 1 ? 4 : 5;
  }
}

/** 分數排序後的實體通路（與興趣相符者優先） */
export function rankVenues(profile: Profile) {
  return VENUES.map((venue) => {
    const overlap = venue.tags.filter((tag) => profile.interests.includes(tag)).length;
    const score = clamp(78 + overlap * 9 + (venue.partnerWants ? 6 : 0), 70, 99);
    return { venue, score };
  }).sort((a, b) => b.score - a.score);
}
