"use client";

// 心動迴路 DEMO：標題、化身、偏好、配對、預約憑證與結束畫面

import React, { useEffect, useState } from "react";
import styles from "./prototype.module.css";
import { AVATAR_IMG, CG_IMG, PARTNER_FACE, VENUE_IMG } from "./assets";
import {
  AGE_OPTIONS,
  AREA_OPTIONS,
  AVATAR_STYLES,
  BIO_MAX,
  CHAT_STYLE_OPTIONS,
  INTEREST_MIN,
  INTEREST_OPTIONS,
  LEVEL_NAMES,
  MODE_OPTIONS,
  NICKNAME_MAX,
  PARTNER,
  QUESTS,
  SAFETY_TIPS,
  SCHEDULE_OPTIONS,
  TOPIC_OPTIONS,
  VENUES,
  WEEKEND_OPTIONS,
} from "./content";
import { computeCompatibility } from "./engine";
import type { Action, GameState } from "./engine";

type Dispatch = React.Dispatch<Action>;
type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** 以背景圖呈現的圖像（避免外部載入與 img 警告） */
export function Pic({ src, label, className }: { src: string; label: string; className?: string }) {
  return <span role="img" aria-label={label} className={className} style={{ backgroundImage: `url("${src}")` }} />;
}

function StepHeader({ step, title, sub }: { step: number; title: string; sub: string }) {
  return (
    <header className={styles.stepHeader}>
      <div className={styles.stepDots} aria-label={`第 ${step} 步，共 3 步`}>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`${styles.stepDot} ${n === step ? styles.stepDotOn : n < step ? styles.stepDotDone : ""}`} />
        ))}
      </div>
      <p className={styles.stepKicker}>STEP {step} / 3</p>
      <h2 className={styles.stepTitle}>{title}</h2>
      <p className={styles.stepSub}>{sub}</p>
    </header>
  );
}

// ============================================================================
// 標題畫面
// ============================================================================

export function TitleScreen({ dispatch }: { dispatch: Dispatch }) {
  return (
    <section className={styles.title}>
      <Pic src={CG_IMG.smile} label="夏樹坐在雨天咖啡館的事件插畫" className={styles.titleHero} />
      <div className={styles.titleShade} aria-hidden />
      <div className={styles.titleCopy}>
        <span className={styles.demoBadge}>DEMO · 虛擬化身戀愛養成交友</span>
        <div className={styles.logoMark} aria-hidden>
          ♥
        </div>
        <h1 className={styles.titleMain}>心動迴路</h1>
        <p className={styles.titleEn}>HEARTLINK · AVATAR LOVE SIM</p>
        <p className={styles.titleLead}>先用虛擬化身遇見彼此的心，再一起走向真實世界的約會。</p>
        <ul className={styles.titleFeatures}>
          <li>🎭 虛擬化身守護隱私</li>
          <li>💬 劇情對話化解尷尬</li>
          <li>💗 好感度解鎖線上任務</li>
          <li>🎟️ 實體合作通路約會</li>
        </ul>
        <button onClick={() => dispatch({ type: "START" })} type="button" className={styles.ctaPrimary}>
          開始遊戲 <span aria-hidden>▶</span>
        </button>
        <p className={styles.titleNote}>示範版本：對話、配對與商戶皆為示範資料，不連接外部 AI、金流或真實個資。</p>
      </div>
    </section>
  );
}

// ============================================================================
// 步驟 1：建立虛擬人物
// ============================================================================

export function AvatarScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const current = AVATAR_STYLES.find((item) => item.id === state.avatar.styleId) ?? AVATAR_STYLES[0];
  const vars: CssVars = { "--accent": current.accent };
  return (
    <section className={styles.formScreen}>
      <StepHeader step={1} title="建立你的虛擬人物" sub="先選一個代表自己的化身，再取個暱稱。對方在初期只會看到化身與你的自我介紹。" />
      <div className={styles.twoCol}>
        <aside className={styles.avatarPreview} style={vars}>
          <Pic src={AVATAR_IMG[current.id]} label={`${current.name}化身預覽`} className={styles.portraitBig} />
          <div className={styles.previewName}>{state.avatar.nickname || "你的化身"}</div>
          <p className={styles.previewBio}>{state.avatar.bio || current.tagline}</p>
          <div className={styles.traitRow}>
            {current.traits.map((trait) => (
              <span key={trait} className={styles.trait}>
                {trait}
              </span>
            ))}
          </div>
          <div className={styles.lockBadge}>🔒 真實姓名、電話與精確位置不會公開</div>
        </aside>

        <div className={styles.formCard}>
          <h3 className={styles.fieldTitle}>化身形象</h3>
          <div className={styles.styleGrid}>
            {AVATAR_STYLES.map((item) => (
              <button
                key={item.id}
                onClick={() => dispatch({ type: "SET_AVATAR", styleId: item.id })}
                type="button"
                aria-pressed={item.id === current.id}
                className={`${styles.styleCard} ${item.id === current.id ? styles.styleCardOn : ""}`}
                style={{ "--accent": item.accent } as CssVars}
              >
                <Pic src={AVATAR_IMG[item.id]} label={item.name} className={styles.styleThumb} />
                <span className={styles.styleName}>{item.name}</span>
              </button>
            ))}
          </div>

          <label className={styles.fieldTitle} htmlFor="nickname">
            暱稱 <em>{state.avatar.nickname.length}/{NICKNAME_MAX}</em>
          </label>
          <input
            id="nickname"
            className={styles.textInput}
            value={state.avatar.nickname}
            onChange={(event) => dispatch({ type: "SET_AVATAR", nickname: event.target.value })}
            placeholder="2–12 個字，例如：星河旅人"
            autoComplete="off"
          />

          <label className={styles.fieldTitle} htmlFor="bio">
            一句自我介紹 <em>{state.avatar.bio.length}/{BIO_MAX}</em>
          </label>
          <input
            id="bio"
            className={styles.textInput}
            value={state.avatar.bio}
            onChange={(event) => dispatch({ type: "SET_AVATAR", bio: event.target.value })}
            placeholder="例如：下雨天會繞路去買肉桂捲的人"
            autoComplete="off"
          />

          {state.notice && <p className={styles.noticeText}>🛡️ {state.notice}</p>}
          {state.errors.avatar && (
            <p className={styles.errorText} role="alert">
              {state.errors.avatar}
            </p>
          )}

          <button onClick={() => dispatch({ type: "SUBMIT_AVATAR" })} type="button" className={styles.ctaPrimary}>
            下一步：填寫興趣與條件 <span aria-hidden>▶</span>
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 步驟 2：興趣與擇偶條件
// ============================================================================

function Segmented({ options, value, onPick }: { options: string[]; value: string; onPick: (value: string) => void }) {
  return (
    <div className={styles.segmented} role="radiogroup">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onPick(option)}
          type="button"
          role="radio"
          aria-checked={option === value}
          className={`${styles.segment} ${option === value ? styles.segmentOn : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function ProfileScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const profile = state.profile;
  const compat = computeCompatibility(profile);
  const ready = profile.interests.length >= INTEREST_MIN;
  return (
    <section className={styles.formScreen}>
      <StepHeader step={2} title="填寫興趣與擇偶條件" sub="這些偏好會成為配對權重，也是之後破冰劇情與約會推薦的依據。" />
      <div className={styles.twoCol}>
        <div className={styles.formCard}>
          <h3 className={styles.fieldTitle}>
            興趣標籤 <em>{profile.interests.length}/{INTEREST_OPTIONS.length}（至少 {INTEREST_MIN} 個）</em>
          </h3>
          <div className={styles.chipWrap}>
            {INTEREST_OPTIONS.map((name) => (
              <button
                key={name}
                onClick={() => dispatch({ type: "TOGGLE_INTEREST", name })}
                type="button"
                aria-pressed={profile.interests.includes(name)}
                className={`${styles.chip} ${profile.interests.includes(name) ? styles.chipOn : ""}`}
              >
                {name}
              </button>
            ))}
          </div>

          <h3 className={styles.fieldTitle}>生活習慣</h3>
          <div className={styles.habitGrid}>
            <div>
              <span className={styles.miniLabel}>週末</span>
              <Segmented options={WEEKEND_OPTIONS} value={profile.weekend} onPick={(value) => dispatch({ type: "SET_FIELD", key: "weekend", value })} />
            </div>
            <div>
              <span className={styles.miniLabel}>作息</span>
              <Segmented options={SCHEDULE_OPTIONS} value={profile.schedule} onPick={(value) => dispatch({ type: "SET_FIELD", key: "schedule", value })} />
            </div>
            <div>
              <span className={styles.miniLabel}>聊天風格</span>
              <Segmented options={CHAT_STYLE_OPTIONS} value={profile.chatStyle} onPick={(value) => dispatch({ type: "SET_FIELD", key: "chatStyle", value })} />
            </div>
          </div>

          <h3 className={styles.fieldTitle}>想聊的話題</h3>
          <div className={styles.chipWrap}>
            {TOPIC_OPTIONS.map((name) => (
              <button
                key={name}
                onClick={() => dispatch({ type: "TOGGLE_TOPIC", name })}
                type="button"
                aria-pressed={profile.topics.includes(name)}
                className={`${styles.chip} ${profile.topics.includes(name) ? styles.chipOn : ""}`}
              >
                {name}
              </button>
            ))}
          </div>

          <h3 className={styles.fieldTitle}>期待的相處模式</h3>
          <Segmented options={MODE_OPTIONS} value={profile.mode} onPick={(value) => dispatch({ type: "SET_FIELD", key: "mode", value })} />

          <h3 className={styles.fieldTitle}>擇偶條件</h3>
          <div className={styles.habitGrid}>
            <div>
              <span className={styles.miniLabel}>年齡區間</span>
              <Segmented options={AGE_OPTIONS} value={profile.age} onPick={(value) => dispatch({ type: "SET_FIELD", key: "age", value })} />
            </div>
            <div>
              <span className={styles.miniLabel}>活動地區</span>
              <Segmented options={AREA_OPTIONS} value={profile.area} onPick={(value) => dispatch({ type: "SET_FIELD", key: "area", value })} />
            </div>
          </div>
        </div>

        <aside className={styles.sideCard}>
          <h3 className={styles.fieldTitle}>配對權重預覽</h3>
          <div className={styles.weightTotal}>
            <strong>{ready ? `${compat.total}%` : "—"}</strong>
            <span>{ready ? "與目前候選對象的預估契合度" : `再選 ${INTEREST_MIN - profile.interests.length} 個興趣即可預覽`}</span>
          </div>
          {compat.parts.map((part) => (
            <div key={part.label} className={styles.barRow}>
              <span>{part.label}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${ready ? part.value : 0}%` }} />
              </div>
              <em>{ready ? `${part.value}%` : "—"}</em>
            </div>
          ))}
          <div className={styles.privacyBox}>
            <strong>🔒 隱私與漸進揭露</strong>
            <p>僅「興趣、習慣、話題、相處模式、基本條件」納入配對權重。真實姓名、聯絡方式與精確位置不納入、也不會在破冰階段公開。</p>
          </div>
          {state.errors.profile && (
            <p className={styles.errorText} role="alert">
              {state.errors.profile}
            </p>
          )}
          <button onClick={() => dispatch({ type: "SUBMIT_PROFILE" })} type="button" className={styles.ctaPrimary}>
            開始配對 <span aria-hidden>▶</span>
          </button>
        </aside>
      </div>
    </section>
  );
}

// ============================================================================
// 步驟 3：配對
// ============================================================================

const SCAN_LINES = ["正在比對共同興趣與話題權重…", "分析生活步調與相處模式…", "確認雙方擇偶條件是否相符…"];

export function MatchScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const [phase, setPhase] = useState<"scan" | "found">("scan");
  const [lineIndex, setLineIndex] = useState(0);
  const match = state.match;
  const me = match?.me ?? false;
  const partner = match?.partner ?? false;

  useEffect(() => {
    const done = window.setTimeout(() => setPhase("found"), 2600);
    const ticker = window.setInterval(() => setLineIndex((value) => (value + 1) % SCAN_LINES.length), 850);
    return () => {
      window.clearTimeout(done);
      window.clearInterval(ticker);
    };
  }, []);

  useEffect(() => {
    if (!me || partner) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "PARTNER_CONFIRM" }), 1400);
    return () => window.clearTimeout(timer);
  }, [me, partner, dispatch]);

  const style = AVATAR_STYLES.find((item) => item.id === state.avatar.styleId) ?? AVATAR_STYLES[0];

  if (!match || phase === "scan") {
    return (
      <section className={styles.scanScreen}>
        <div className={styles.radar} aria-hidden>
          <span className={styles.radarRing} />
          <span className={`${styles.radarRing} ${styles.radarRing2}`} />
          <span className={`${styles.radarRing} ${styles.radarRing3}`} />
          <Pic src={AVATAR_IMG[style.id]} label="你的化身" className={styles.radarAvatar} />
        </div>
        <h2 className={styles.scanTitle}>正在尋找與你頻率相近的人…</h2>
        <p className={styles.scanLine}>{SCAN_LINES[lineIndex]}</p>
      </section>
    );
  }

  const compat = match.compat;
  const ringVars: CssVars = { "--pct": compat.total };
  const both = me && partner;
  return (
    <section className={styles.formScreen}>
      <StepHeader step={3} title="找到一位契合的對象" sub="配對需要雙方都按下確認；任何一方都可以選擇略過。" />
      <div className={styles.matchGrid}>
        <div className={styles.matchSide} style={{ "--accent": style.accent } as CssVars}>
          <Pic src={AVATAR_IMG[style.id]} label="你的化身" className={styles.matchPortrait} />
          <strong>{state.avatar.nickname}</strong>
          <span className={`${styles.confirmChip} ${me ? styles.confirmOn : ""}`}>{me ? "✓ 你已確認" : "等待你確認"}</span>
        </div>

        <div className={styles.matchCenter}>
          <div className={styles.ring} style={ringVars}>
            <div className={styles.ringInner}>
              <strong>{compat.total}%</strong>
              <span>契合度</span>
            </div>
          </div>
          {both && <div className={styles.matchBurst}>MATCH!</div>}
        </div>

        <div className={styles.matchSide} style={{ "--accent": "#ff8fb8" } as CssVars}>
          <Pic src={PARTNER_FACE} label={`${PARTNER.name}的化身`} className={styles.matchPortrait} />
          <strong>{PARTNER.name}</strong>
          <span className={`${styles.confirmChip} ${partner ? styles.confirmOn : ""}`}>
            {partner ? "✓ 對方已確認" : me ? "對方確認中…" : "等待對方"}
          </span>
        </div>
      </div>

      <div className={styles.matchDetail}>
        <div>
          <p className={styles.partnerTitle}>
            {PARTNER.name}・{PARTNER.age} 歲　<em>{PARTNER.title}</em>
          </p>
          <div className={styles.chipWrap}>
            {PARTNER.interests.map((name) => (
              <span key={name} className={`${styles.tag} ${compat.shared.includes(name) ? styles.tagShared : ""}`}>
                {compat.shared.includes(name) ? "★ " : ""}
                {name}
              </span>
            ))}
          </div>
          <p className={styles.sharedHint}>
            共同興趣 {compat.shared.length} 個 · 共同話題 {compat.sharedTopics.length} 個 · {compat.conditionsMet.join("、") || "條件部分相符"}
          </p>
          <p className={styles.lockBadge}>🔒 真實姓名・聯絡方式・精確位置：好感度提升後由雙方自行決定是否揭露</p>
        </div>
        <div>
          {compat.parts.map((part) => (
            <div key={part.label} className={styles.barRow}>
              <span>{part.label}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${part.value}%` }} />
              </div>
              <em>{part.value}%</em>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.matchActions}>
        {!me && (
          <>
            <button onClick={() => dispatch({ type: "CONFIRM_MATCH" })} type="button" className={styles.ctaPrimary}>
              💗 我想認識她
            </button>
            <button onClick={() => dispatch({ type: "JUMP", step: 1 })} type="button" className={styles.ctaGhost}>
              再調整一下條件
            </button>
          </>
        )}
        {me && !partner && <p className={styles.waitText}>已送出確認，正在等待夏樹回應…</p>}
        {both && (
          <button onClick={() => dispatch({ type: "ENTER_CHAT" })} type="button" className={styles.ctaPrimary}>
            進入遊戲聊天室 <span aria-hidden>▶</span>
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// 預約引導與優惠憑證
// ============================================================================

/** 依優惠碼產生決定性的示意 QR 圖樣（僅作視覺示意，非可掃描憑證） */
function pseudoQr(code: string): boolean[][] {
  const size = 21;
  let seed = 0;
  for (const ch of code) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const grid: boolean[][] = [];
  for (let y = 0; y < size; y += 1) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      row.push((seed >>> 24) % 2 === 0);
    }
    grid.push(row);
  }
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = edge || core;
      }
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return grid;
}

export function BookingScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const booking = state.booking;
  const [reminder, setReminder] = useState(false);
  if (!booking) return null;
  const venue = VENUES.find((item) => item.id === booking.venueId);
  if (!venue) return null;
  const slot = venue.slots.find((item) => item.id === booking.slotId);

  if (!booking.confirmed) {
    return (
      <div className={styles.modalBack}>
        <div className={styles.bookingCard}>
          <Pic src={VENUE_IMG[venue.id]} label={venue.store} className={styles.bookingHero} />
          <div className={styles.bookingBody}>
            <span className={styles.certBadge}>✔ 認證合作通路</span>
            <h3 className={styles.bookingTitle}>{venue.name}</h3>
            <p className={styles.bookingMeta}>
              {venue.store}・{venue.place}
            </p>
            <h4 className={styles.fieldTitle}>選擇你們都方便的時段</h4>
            <div className={styles.slotRow}>
              {venue.slots.map((item) => (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: "PICK_SLOT", slotId: item.id })}
                  type="button"
                  aria-pressed={booking.slotId === item.id}
                  className={`${styles.slot} ${booking.slotId === item.id ? styles.slotOn : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <h4 className={styles.fieldTitle}>安全小提醒</h4>
            <ul className={styles.tipList}>
              {SAFETY_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <div className={styles.bookingActions}>
              <button onClick={() => dispatch({ type: "CLOSE_BOOKING" })} type="button" className={styles.ctaGhost}>
                返回推薦
              </button>
              <button onClick={() => dispatch({ type: "CONFIRM_BOOKING" })} type="button" className={styles.ctaPrimary} disabled={!booking.slotId}>
                確認預約 <span aria-hidden>▶</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const grid = pseudoQr(venue.coupon.code);
  return (
    <div className={styles.modalBack}>
      <div className={styles.ticketCard}>
        <div className={styles.ticketMain}>
          <span className={styles.certBadge}>✔ 預約引導已建立</span>
          <h3 className={styles.bookingTitle}>{venue.name}</h3>
          <p className={styles.bookingMeta}>
            {venue.store}・{venue.place}
          </p>
          <p className={styles.ticketSlot}>🗓️ {slot?.label}　·　{venue.price}</p>
          <ol className={styles.timeline}>
            {venue.itinerary.map((step) => (
              <li key={step.time}>
                <strong>{step.time}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
          <ul className={styles.tipList}>
            {SAFETY_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className={styles.ticketStub}>
          <svg viewBox="0 0 21 21" className={styles.qr} role="img" aria-label="示意 QR 圖樣（DEMO，不可掃描）" shapeRendering="crispEdges">
            <rect width="21" height="21" fill="#fff" />
            {grid.map((row, y) => row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#2a1730" /> : null)))}
          </svg>
          <p className={styles.couponCode}>{venue.coupon.code}</p>
          <p className={styles.couponDesc}>🎁 {venue.coupon.desc}</p>
          <p className={styles.demoTiny}>DEMO 示意憑證</p>
          <button onClick={() => setReminder((value) => !value)} type="button" className={styles.ctaGhost}>
            {reminder ? "✓ 已加入行程提醒" : "加入行程提醒"}
          </button>
          <button onClick={() => dispatch({ type: "CLOSE_BOOKING" })} type="button" className={styles.ctaPrimary}>
            回到劇情 <span aria-hidden>▶</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 本輪結束
// ============================================================================

const END_TEXT = {
  user: { title: "本輪互動已平順結束", body: "你主動結束了這一輪。系統已關閉對話，雙方都不會再收到或傳送新訊息。" },
  keyword: { title: "已依你的意願結束本輪", body: "偵測到你想離開，系統不做任何挽留，已為你關閉對話。" },
  low: { title: "已為你關閉這一輪互動", body: "互動節奏讓你不太舒服時，隨時都可以停下來。對話已關閉，不會再有後續訊息。" },
  partner: { title: "對方結束了本輪互動", body: "對方表示想先到這邊。系統尊重彼此的選擇，對話已關閉，不會再有後續訊息。" },
};

export function EndedScreen({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const [reviewing, setReviewing] = useState(false);
  const ended = state.ended;
  if (!ended) return null;
  const text = END_TEXT[ended.reason];
  const done = QUESTS.filter((quest) => state.quests[quest.id].done).length;
  return (
    <section className={styles.endScreen}>
      <div className={styles.endCard}>
        <div className={styles.endMoon} aria-hidden>
          🌙
        </div>
        <h2 className={styles.endTitle}>{text.title}</h2>
        <p className={styles.endBody}>{text.body}</p>
        <div className={styles.endStats}>
          <div>
            <strong>{ended.affection}</strong>
            <span>最終好感度</span>
          </div>
          <div>
            <strong>{LEVEL_NAMES[state.stage]}</strong>
            <span>抵達階段</span>
          </div>
          <div>
            <strong>{state.messagesSent}</strong>
            <span>互動訊息</span>
          </div>
          <div>
            <strong>{done}/3</strong>
            <span>完成任務</span>
          </div>
        </div>
        <div className={styles.lockedInput}>
          <input className={styles.textInput} disabled placeholder="🔒 本輪已結束，無法再發送訊息" aria-label="已鎖定的訊息輸入框" />
        </div>
        {reviewing && (
          <ol className={styles.endLog} aria-label="本輪對話紀錄（唯讀）">
            {state.log.map((line) => (
              <li key={line.id} data-who={line.who}>
                <b>{line.who === "partner" ? PARTNER.name : line.who === "me" ? state.avatar.nickname : line.who === "system" ? "系統" : "旁白"}</b>
                <span>{line.text}</span>
              </li>
            ))}
          </ol>
        )}
        <div className={styles.endActions}>
          <button onClick={() => setReviewing((value) => !value)} type="button" className={styles.ctaGhost}>
            {reviewing ? "收合對話紀錄" : "查看對話紀錄（唯讀）"}
          </button>
          <button onClick={() => dispatch({ type: "RESTART" })} type="button" className={styles.ctaPrimary}>
            重新體驗 DEMO ↺
          </button>
        </div>
      </div>
    </section>
  );
}
