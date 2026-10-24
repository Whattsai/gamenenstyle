"use client";

// 心動迴路：虛擬化身戀愛養成交友 DEMO（MVP-001）
// 全程為結構化 Mock / Fixture：不連外部 AI、不處理金流、不收集真實個資。

import React, { useEffect, useReducer, useRef, useState } from "react";
import styles from "./prototype.module.css";
import { AVATAR_IMG, BG_CAFE, CG_IMG, PARTNER_FACE, VENUE_IMG } from "./assets";
import { AVATAR_STYLES, FACTOR_CAPS, LEVEL_NAMES, PARTNER, ROUNDS, STAGE1_AT, STAGE2_AT, STEP_LABELS } from "./content";
import type { Expr } from "./content";
import {
  atLastLine,
  currentLine,
  currentStep,
  gameReducer,
  initialState,
  rankVenues,
  renderText,
  visibleSuggestions,
} from "./engine";
import type { Action, GameState } from "./engine";
import { HubOverlay } from "./quests";
import { AvatarScreen, BookingScreen, EndedScreen, MatchScreen, Pic, ProfileScreen, TitleScreen } from "./screens";

type Dispatch = React.Dispatch<Action>;
type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

// ============================================================================
// 打字機效果：點擊對話框可立即顯示全文；系統偏好減少動態時直接顯示
// ============================================================================

function useTypewriter(text: string, key: number) {
  const [progress, setProgress] = useState({ key, count: 0 });
  useEffect(() => {
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProgress({ key, count: text.length });
      return undefined;
    }
    let count = 0;
    setProgress({ key, count: 0 });
    const timer = window.setInterval(() => {
      count += 1;
      setProgress({ key, count });
      if (count >= text.length) window.clearInterval(timer);
    }, 26);
    return () => window.clearInterval(timer);
  }, [text, key]);
  const count = progress.key === key ? progress.count : 0;
  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    finish: () => setProgress({ key, count: text.length }),
  };
}

// ============================================================================
// DEMO 導覽：依原始需求六步流程快速前往，並提供展示輔助工具
// ============================================================================

function DemoGuide({ state, dispatch, onClose }: { state: GameState; dispatch: Dispatch; onClose: () => void }) {
  const current = currentStep(state);
  return (
    <aside className={styles.guide} role="dialog" aria-label="DEMO 導覽">
      <header className={styles.guideHead}>
        <strong>🎬 DEMO 導覽</strong>
        <button onClick={onClose} type="button" className={styles.iconBtn} aria-label="關閉導覽">
          ✕
        </button>
      </header>
      <p className={styles.guideSub}>依原始需求的流程逐步展示，可點選任一步驟快速前往。</p>
      <ol className={styles.guideList}>
        {STEP_LABELS.map((label, index) => (
          <li key={label}>
            <button
              onClick={() => {
                dispatch({ type: "JUMP", step: index });
                onClose();
              }}
              type="button"
              aria-current={index === current ? "step" : undefined}
              className={`${styles.guideStep} ${index === current ? styles.guideStepOn : ""}`}
            >
              <span className={styles.guideNum}>{index < current ? "✓" : index + 1}</span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={styles.guideTools}>
        <p>展示輔助</p>
        <button onClick={() => dispatch({ type: "DEMO_BOOST", amount: 15 })} type="button" className={styles.toolBtn}>
          好感度 +15
        </button>
        <button onClick={() => dispatch({ type: "PARTNER_LEAVE" })} type="button" className={styles.toolBtn}>
          模擬對方想結束
        </button>
        <button
          onClick={() => {
            dispatch({ type: "RESTART" });
            onClose();
          }}
          type="button"
          className={styles.toolBtn}
        >
          重新開始
        </button>
      </div>
    </aside>
  );
}

// ============================================================================
// 劇情聊天室（核心 ADV 畫面）
// ============================================================================

function ChatScreen({ state, dispatch, onGuide }: { state: GameState; dispatch: Dispatch; onGuide: () => void }) {
  const line = currentLine(state);
  const last = atLastLine(state);
  const style = AVATAR_STYLES.find((item) => item.id === state.avatar.styleId) ?? AVATAR_STYLES[0];
  const { shown, done, finish } = useTypewriter(line?.text ?? "", line?.id ?? 0);
  const [draft, setDraft] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [factorsOpen, setFactorsOpen] = useState(false);
  const [lockHint, setLockHint] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string; up: boolean } | null>(null);
  const previous = useRef(state.affection);
  const logEnd = useRef<HTMLLIElement | null>(null);

  const unlockBlocked = state.pendingUnlock > 0 && state.qi >= state.unlockAt;
  const ready = last && done && !unlockBlocked;
  const showLow = state.lowPrompt && ready && !state.confirmEnd;

  // 好感度變化浮動提示
  useEffect(() => {
    const diff = state.affection - previous.current;
    previous.current = state.affection;
    if (diff === 0) return undefined;
    setToast({ id: Date.now(), text: `${diff > 0 ? "+" : ""}${diff}`, up: diff > 0 });
    const timer = window.setTimeout(() => setToast(null), 1700);
    return () => window.clearTimeout(timer);
  }, [state.affection]);

  // 停留時間納入好感度（每 10 秒一次）
  useEffect(() => {
    const timer = window.setInterval(() => dispatch({ type: "TICK" }), 10000);
    return () => window.clearInterval(timer);
  }, [dispatch]);

  // 對方對實體活動的回應（模擬雙方確認）
  const pendingVenues = Object.entries(state.venues)
    .filter(([, value]) => value.me && value.partner === "pending")
    .map(([id]) => id)
    .join(",");
  useEffect(() => {
    if (!pendingVenues) return undefined;
    const ids = pendingVenues.split(",");
    const timer = window.setTimeout(() => ids.forEach((id) => dispatch({ type: "PARTNER_VENUE", id })), 1200);
    return () => window.clearTimeout(timer);
  }, [pendingVenues, dispatch]);

  useEffect(() => {
    if (logOpen) logEnd.current?.scrollIntoView({ block: "end" });
  }, [logOpen, state.log.length]);

  useEffect(() => {
    if (!lockHint) return undefined;
    const timer = window.setTimeout(() => setLockHint(false), 2400);
    return () => window.clearTimeout(timer);
  }, [lockHint]);

  const advance = () => {
    if (!done) finish();
    else if (!last) dispatch({ type: "ADVANCE" });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready || !draft.trim()) return;
    dispatch({ type: "SEND_TEXT", text: draft });
    setDraft("");
  };

  const speaker = line?.who === "partner" ? PARTNER.name : line?.who === "me" ? state.avatar.nickname : line?.who === "system" ? "系統" : "";
  const avatarVars: CssVars = { "--accent": style.accent };
  const choiceRound = state.prompt?.kind === "choices" ? ROUNDS[state.prompt.roundIndex] : null;
  const venues = rankVenues(state.profile);

  return (
    <section className={styles.chat}>
      <div className={styles.cgStack} role="img" aria-label={`${PARTNER.name}坐在雨天咖啡館的事件插畫`}>
        {(Object.keys(CG_IMG) as Expr[]).map((expr) => (
          <span key={expr} aria-hidden className={`${styles.cg} ${expr === state.expr ? styles.cgOn : ""} ${line?.who === "me" ? styles.cgDim : ""}`} style={{ backgroundImage: `url("${CG_IMG[expr]}")` }} />
        ))}
      </div>
      <div className={styles.rain} aria-hidden />
      <div className={styles.vignette} aria-hidden />

      {/* 頂部 HUD：好感度、階段、功能入口 */}
      <header className={styles.hud}>
        <div className={styles.hudLeft}>
          <Pic src={PARTNER_FACE} label={`${PARTNER.name}頭像`} className={styles.hudFace} />
          <div className={styles.hudInfo}>
            <div className={styles.hudName}>
              {PARTNER.name}
              <span className={styles.levelBadge}>
                LV.{state.stage + 1} {LEVEL_NAMES[state.stage]}
              </span>
            </div>
            <button onClick={() => setFactorsOpen((value) => !value)} type="button" className={styles.gauge} aria-expanded={factorsOpen} aria-label={`好感度 ${state.affection}，點擊查看明細`}>
              <span className={styles.gaugeHeart} aria-hidden>
                ♥
              </span>
              <span className={styles.gaugeTrack}>
                <span className={styles.gaugeFill} style={{ width: `${state.affection}%` }} />
                <i className={styles.gaugeTick} style={{ left: `${STAGE1_AT}%` }} />
                <i className={styles.gaugeTick} style={{ left: `${STAGE2_AT}%` }} />
              </span>
              <b>{state.affection}</b>
            </button>
            <span className={styles.gaugeNote}>
              線上階段 {STAGE1_AT} · 實體約會 {STAGE2_AT}
            </span>
            {toast && (
              <span key={toast.id} className={`${styles.deltaToast} ${toast.up ? styles.deltaUp : styles.deltaDown}`}>
                {toast.text} ♥
              </span>
            )}
          </div>
        </div>

        <div className={styles.hudTitle}>CHAPTER 1 · 轉角・雨歇咖啡館</div>

        <div className={styles.hudRight}>
          <button
            onClick={() => (state.stage < 1 ? setLockHint(true) : dispatch({ type: "OPEN_HUB" }))}
            type="button"
            aria-disabled={state.stage < 1}
            className={`${styles.hudBtn} ${state.stage < 1 ? styles.hudLocked : ""}`}
          >
            {state.stage < 1 ? "🔒" : "🎮"} 任務中心
          </button>
          <button onClick={() => setLogOpen(true)} type="button" className={styles.hudBtn}>
            📜 紀錄
          </button>
          <button onClick={onGuide} type="button" className={styles.hudBtn}>
            🎬 導覽
          </button>
          <button onClick={() => dispatch({ type: "REQUEST_END" })} type="button" className={`${styles.hudBtn} ${styles.hudExit}`}>
            🚪 結束本輪
          </button>
        </div>
      </header>

      {factorsOpen && (
        <div className={styles.factors} role="status">
          <strong>好感度明細</strong>
          {(
            [
              ["回應頻率", state.factors.freq, FACTOR_CAPS.freq],
              ["選項契合", Math.max(0, state.factors.fit), FACTOR_CAPS.fit],
              ["停留互動", state.factors.dwell, FACTOR_CAPS.dwell],
              ["任務默契", state.factors.quest, FACTOR_CAPS.quest],
            ] as [string, number, number][]
          ).map(([label, value, cap]) => (
            <div key={label} className={styles.barRow}>
              <span>{label}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${Math.min(100, (value / cap) * 100)}%` }} />
              </div>
              <em>{value}</em>
            </div>
          ))}
          <small>依雙方回應頻率、選項互動契合度與停留時長即時計算。</small>
        </div>
      )}

      {lockHint && <div className={styles.lockHint}>🔒 好感度達 {STAGE1_AT} 後解鎖線上任務中心</div>}

      {line?.who === "me" && (
        <div className={styles.bust} style={avatarVars}>
          <Pic src={AVATAR_IMG[style.id]} label={`${state.avatar.nickname}的化身`} className={styles.bustPic} />
        </div>
      )}

      <div className={styles.dock}>
        {/* 破冰選項（避免尷尬，也可以自行輸入） */}
        {ready && choiceRound && (
          <div className={styles.choices}>
            <p className={styles.choiceTitle}>💬 {choiceRound.title}・選一句你想說的話</p>
            {choiceRound.choices.map((choice) => {
              const mine = choice.interest ? state.profile.interests.includes(choice.interest) : false;
              return (
                <button key={choice.id} onClick={() => dispatch({ type: "PICK_CHOICE", id: choice.id })} type="button" className={styles.choice}>
                  <span className={styles.choiceTag}>{choice.tag}</span>
                  <span className={styles.choiceText}>{renderText(choice.text, state.avatar.nickname)}</span>
                  {mine && <span className={styles.choiceMine}>✨ 你的興趣・{choice.interest}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* 實體約會推薦卡 */}
        {ready && state.prompt?.kind === "venues" && (
          <div className={styles.venuePanel}>
            <header className={styles.venueHead}>
              <strong>🎟️ 實體約會推薦・認證合作通路</strong>
              <span>依雙方興趣排序，只顯示經認證的合作商戶；雙方都有興趣才會產生預約引導。</span>
            </header>
            <div className={styles.venueGrid}>
              {venues.map(({ venue, score }) => {
                const status = state.venues[venue.id];
                return (
                  <article key={venue.id} className={styles.venueCard}>
                    <Pic src={VENUE_IMG[venue.id]} label={venue.store} className={styles.venuePic} />
                    <div className={styles.venueBody}>
                      <div className={styles.venueTop}>
                        <span className={styles.certBadge}>✔ 認證合作</span>
                        <span className={styles.venueScore}>契合 {score}%</span>
                      </div>
                      <h4 className={styles.venueName}>
                        <small>{venue.kind}</small>
                        {venue.name}
                      </h4>
                      <p className={styles.venueMeta}>{venue.store}・{venue.place}</p>
                      <p className={styles.venueMeta}>{venue.theme}</p>
                      <p className={styles.venueIntro}>{venue.intro}</p>
                      <p className={styles.coupon}>🎁 優惠碼 <b>{venue.coupon.code}</b>・{venue.coupon.desc}</p>
                      <div className={styles.venueState}>
                        <span className={`${styles.confirmChip} ${status?.me ? styles.confirmOn : ""}`}>{status?.me ? "✓ 你有興趣" : "尚未表態"}</span>
                        {status?.me && status.partner === "pending" && <span className={styles.confirmChip}>{PARTNER.name} 思考中…</span>}
                        {status?.me && status.partner === "yes" && <span className={`${styles.confirmChip} ${styles.confirmOn}`}>✓ {PARTNER.name}也有興趣</span>}
                        {status?.me && status.partner === "hold" && <span className={styles.confirmChip}>{PARTNER.name} 想先保留</span>}
                      </div>
                      {status?.partner === "hold" && <p className={styles.holdNote}>{venue.holdNote}</p>}
                      <div className={styles.venueActions}>
                        <button onClick={() => dispatch({ type: "VENUE_INTEREST", id: venue.id })} type="button" className={styles.ctaGhost}>
                          {status?.me ? "取消興趣" : "我有興趣"}
                        </button>
                        {status?.me && status.partner === "yes" && (
                          <button onClick={() => dispatch({ type: "OPEN_BOOKING", id: venue.id })} type="button" className={styles.ctaPrimary}>
                            查看預約引導 <span aria-hidden>▶</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* 離場語境偵測：友善提示，不挽留 */}
        {state.exitHint && ready && (
          <div className={styles.exitBanner} role="alert">
            <span>🛡️ 偵測到你可能想結束互動。你可以隨時離開，不需要任何理由。</span>
            <div>
              <button onClick={() => dispatch({ type: "REQUEST_END" })} type="button" className={styles.ctaPrimary}>
                結束本輪互動
              </button>
              <button onClick={() => dispatch({ type: "DISMISS_EXIT_HINT" })} type="button" className={styles.ctaGhost}>
                我只是隨口說說
              </button>
            </div>
          </div>
        )}

        {/* 對話框 */}
        <div
          className={styles.dialog}
          role="button"
          tabIndex={0}
          aria-label="對話框，點擊繼續"
          data-who={line?.who}
          onClick={advance}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              advance();
            }
          }}
        >
          {speaker && <span className={styles.nameplate}>{speaker}</span>}
          <p className={styles.dialogText}>
            {shown}
            {!done && <span className={styles.caret} aria-hidden />}
          </p>
          {done && !last && (
            <span className={styles.nextMark} aria-hidden>
              ▼
            </span>
          )}
        </div>

        {/* 自由輸入與建議話題 */}
        {ready && state.prompt?.kind === "free" && (
          <div className={styles.suggestRow}>
            {visibleSuggestions(state).map((item) => (
              <button key={item.id} onClick={() => dispatch({ type: "PICK_SUGGESTION", id: item.id })} type="button" className={styles.suggest}>
                💬 {item.label}
              </button>
            ))}
          </div>
        )}
        <form className={styles.inputRow} onSubmit={submit}>
          <input
            className={styles.chatInput}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!ready}
            maxLength={120}
            placeholder={ready ? "也可以自己輸入想說的話…" : "點擊對話框繼續劇情…"}
            aria-label="輸入對話內容"
            autoComplete="off"
          />
          <button type="submit" className={styles.sendBtn} disabled={!ready || !draft.trim()}>
            送出
          </button>
        </form>
        <p className={styles.hint}>輸入「掰掰」「不想繼續」，或隨時點右上角「結束本輪」，都能平順結束；系統不會挽留。</p>
      </div>

      {/* 好感度升級與階段解鎖 */}
      {unlockBlocked && (
        <div className={styles.modalBack}>
          <div className={styles.levelUp}>
            <div className={styles.levelBurst} aria-hidden />
            <p className={styles.levelKicker}>LEVEL UP</p>
            <h3 className={styles.levelTitle}>
              {state.pendingUnlock === 2 ? "實體約會階段解鎖！" : "線上階段解鎖！"}
            </h3>
            <p className={styles.levelSub}>好感度已達 {state.pendingUnlock === 2 ? STAGE2_AT : STAGE1_AT}，關係進入「{LEVEL_NAMES[state.pendingUnlock]}」</p>
            <ul className={styles.levelList}>
              {state.pendingUnlock === 2 ? (
                <>
                  <li>🎟️ 劇情自然帶出實體活動推薦</li>
                  <li>🏪 認證合作商戶與專屬優惠碼</li>
                  <li>🗓️ 雙方確認後產生預約引導</li>
                </>
              ) : (
                <>
                  <li>💞 雙人默契二選一</li>
                  <li>🧩 雙人協力拼圖任務</li>
                  <li>📖 支線劇情「手札裡的祕密」</li>
                </>
              )}
            </ul>
            <button onClick={() => dispatch({ type: "ACK_UNLOCK" })} type="button" className={styles.ctaPrimary}>
              繼續劇情 <span aria-hidden>▶</span>
            </button>
          </div>
        </div>
      )}

      {/* 好感度過低：提供冷卻或結束 */}
      {showLow && (
        <div className={styles.modalBack}>
          <div className={styles.confirmCard}>
            <h3 className={styles.confirmTitle}>要先冷卻一下嗎？</h3>
            <p className={styles.confirmBody}>最近的互動讓好感度偏低。你可以先放慢節奏，也可以直接結束本輪，不需要勉強自己。</p>
            <div className={styles.confirmActions}>
              <button onClick={() => dispatch({ type: "COOLDOWN" })} type="button" className={styles.ctaGhost}>
                冷卻一下，慢慢來
              </button>
              <button onClick={() => dispatch({ type: "REQUEST_END" })} type="button" className={styles.ctaPrimary}>
                結束本輪互動
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 結束本輪二次確認 */}
      {state.confirmEnd && (
        <div className={styles.modalBack}>
          <div className={styles.confirmCard}>
            <h3 className={styles.confirmTitle}>確定要結束本輪互動嗎？</h3>
            <p className={styles.confirmBody}>結束後對話會立即關閉，雙方都無法再發送新訊息，也不會有任何後續打擾。</p>
            <div className={styles.confirmActions}>
              <button onClick={() => dispatch({ type: "CANCEL_END" })} type="button" className={styles.ctaGhost}>
                再想想
              </button>
              <button onClick={() => dispatch({ type: "CONFIRM_END" })} type="button" className={styles.ctaDanger}>
                確定結束
              </button>
            </div>
          </div>
        </div>
      )}

      {state.hubOpen && <HubOverlay state={state} dispatch={dispatch} />}
      {state.booking && <BookingScreen state={state} dispatch={dispatch} />}

      {logOpen && (
        <aside className={styles.logDrawer} role="dialog" aria-label="對話紀錄">
          <header className={styles.guideHead}>
            <strong>📜 對話紀錄</strong>
            <button onClick={() => setLogOpen(false)} type="button" className={styles.iconBtn} aria-label="關閉紀錄">
              ✕
            </button>
          </header>
          <ol className={styles.logList}>
            {state.log.map((item) => (
              <li key={item.id} data-who={item.who}>
                <b>{item.who === "partner" ? PARTNER.name : item.who === "me" ? state.avatar.nickname : item.who === "system" ? "系統" : "旁白"}</b>
                <span>{item.text}</span>
              </li>
            ))}
            <li ref={logEnd} aria-hidden />
          </ol>
        </aside>
      )}
    </section>
  );
}

// ============================================================================
// 根元件：依狀態機切換畫面
// ============================================================================

export default function HeartLinkPrototype() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [guideOpen, setGuideOpen] = useState(false);
  const { screen } = state;
  const scrollable = screen === "avatar" || screen === "profile" || screen === "matching" || screen === "ended";

  return (
    <div className={styles.root} data-screen={screen}>
      <div className={styles.backdrop} style={{ backgroundImage: `url("${BG_CAFE}")` }} aria-hidden />
      <div className={styles.backdropShade} aria-hidden />
      <div className={styles.sparkles} aria-hidden />

      <div className={`${styles.view} ${scrollable ? styles.viewScroll : ""}`}>
        {screen === "title" && <TitleScreen dispatch={dispatch} />}
        {screen === "avatar" && <AvatarScreen state={state} dispatch={dispatch} />}
        {screen === "profile" && <ProfileScreen state={state} dispatch={dispatch} />}
        {screen === "matching" && <MatchScreen state={state} dispatch={dispatch} />}
        {screen === "chat" && <ChatScreen state={state} dispatch={dispatch} onGuide={() => setGuideOpen(true)} />}
        {screen === "ended" && <EndedScreen state={state} dispatch={dispatch} />}
      </div>

      {screen !== "chat" && (
        <button onClick={() => setGuideOpen(true)} type="button" className={styles.guideFab}>
          🎬 DEMO 導覽
        </button>
      )}
      {guideOpen && <DemoGuide state={state} dispatch={dispatch} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
