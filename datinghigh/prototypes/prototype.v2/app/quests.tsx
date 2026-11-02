"use client";

// 心動迴路 DEMO：線上任務中心（默契二選一、雙人協力拼圖、支線劇情）

import React, { useEffect, useRef, useState } from "react";
import styles from "./prototype.module.css";
import { CG_IMG } from "./assets";
import { PAIR_QUESTIONS, PARTNER, QUESTS, STORY_QUEST_NODES } from "./content";
import type { QuestId } from "./content";
import { initialPuzzle, isPuzzleSolved, partnerAssist, swapPieces } from "./engine";
import type { Action, GameState } from "./engine";

type Dispatch = React.Dispatch<Action>;

interface QuestProps {
  onDone: (bonus: number) => void;
  onBack: () => void;
}

// ----------------------------------------------------------------------------
// 默契二選一
// ----------------------------------------------------------------------------

function PairQuest({ onDone, onBack }: QuestProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [matches, setMatches] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = PAIR_QUESTIONS[index];

  const choose = (side: "a" | "b") => {
    if (picked) return;
    setPicked(side);
    if (side === question.partner) setMatches((value) => value + 1);
  };

  const next = () => {
    if (index + 1 >= PAIR_QUESTIONS.length) setFinished(true);
    else {
      setIndex((value) => value + 1);
      setPicked(null);
    }
  };

  const bonus = 6 + matches * 2;
  const percent = Math.round((matches / PAIR_QUESTIONS.length) * 100);

  if (finished) {
    return (
      <div className={styles.questBody}>
        <h4 className={styles.questHeading}>默契指數 {percent}%</h4>
        <p className={styles.questText}>你們在 {PAIR_QUESTIONS.length} 題中有 {matches} 題選了同一邊。不同的選擇，也是更了解彼此的機會。</p>
        <button onClick={() => onDone(bonus)} type="button" className={styles.ctaPrimary}>
          領取好感度 +{bonus} 💗
        </button>
      </div>
    );
  }

  return (
    <div className={styles.questBody}>
      <p className={styles.questStep}>第 {index + 1} / {PAIR_QUESTIONS.length} 題</p>
      <h4 className={styles.questHeading}>{question.q}</h4>
      <div className={styles.pairGrid}>
        {(["a", "b"] as const).map((side) => (
          <button
            key={side}
            onClick={() => choose(side)}
            type="button"
            disabled={picked !== null}
            className={`${styles.pairCard} ${picked === side ? styles.pairMine : ""} ${picked && question.partner === side ? styles.pairPartner : ""}`}
          >
            <span className={styles.pairLetter}>{side.toUpperCase()}</span>
            <span>{question[side]}</span>
            {picked === side && <em className={styles.pairTagMine}>你的選擇</em>}
            {picked && question.partner === side && <em className={styles.pairTagPartner}>{PARTNER.name}的選擇</em>}
          </button>
        ))}
      </div>
      {picked ? (
        <div className={styles.questFoot}>
          <p className={styles.questText}>{picked === question.partner ? "💞 心有靈犀！你們選了同一個答案。" : "🌗 各有各的喜好，下一題再試試看。"}</p>
          <button onClick={next} type="button" className={styles.ctaPrimary}>
            {index + 1 >= PAIR_QUESTIONS.length ? "看結果" : "下一題"} <span aria-hidden>▶</span>
          </button>
        </div>
      ) : (
        <p className={styles.questText}>你與{PARTNER.name}同時作答，選擇後才會揭曉對方的答案。</p>
      )}
      <button onClick={onBack} type="button" className={styles.linkBtn}>
        放棄並返回任務中心
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 雙人協力拼圖
// ----------------------------------------------------------------------------

function PuzzleQuest({ onDone, onBack }: QuestProps) {
  const [order, setOrder] = useState<number[]>(() => initialPuzzle());
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("先點一塊，再點另一塊交換位置。每次你動手後，夏樹會幫你補上一塊。");
  const timer = useRef<number | null>(null);
  const solved = isPuzzleSolved(order);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const pick = (position: number) => {
    if (busy || solved) return;
    if (selected === null) {
      setSelected(position);
      return;
    }
    if (selected === position) {
      setSelected(null);
      return;
    }
    const swapped = swapPieces(order, selected, position);
    setOrder(swapped);
    setSelected(null);
    setMoves((value) => value + 1);
    if (isPuzzleSolved(swapped)) {
      setNote("完成！最後一塊是你放上去的。");
      return;
    }
    setBusy(true);
    setNote(`${PARTNER.name}正在補位…`);
    timer.current = window.setTimeout(() => {
      const assisted = partnerAssist(swapped);
      setOrder(assisted);
      setBusy(false);
      setNote(isPuzzleSolved(assisted) ? `完成！${PARTNER.name}補上了最後一塊。` : `${PARTNER.name}幫你把一塊放回原位了！換你囉。`);
    }, 800);
  };

  return (
    <div className={styles.questBody}>
      <h4 className={styles.questHeading}>把回憶拼回來</h4>
      <p className={styles.questText}>{note}</p>
      <div className={styles.puzzle} role="group" aria-label="雙人協力拼圖">
        {order.map((piece, position) => (
          <button
            key={position}
            onClick={() => pick(position)}
            type="button"
            aria-label={`第 ${position + 1} 格`}
            className={`${styles.tile} ${selected === position ? styles.tileSel : ""} ${piece === position ? styles.tileOk : ""}`}
            style={{
              backgroundImage: `url("${CG_IMG.happy}")`,
              backgroundSize: "300% 200%",
              backgroundPosition: `${(piece % 3) * 50}% ${Math.floor(piece / 3) * 100}%`,
            }}
          />
        ))}
      </div>
      <p className={styles.questStep}>已交換 {moves} 次</p>
      {solved ? (
        <button onClick={() => onDone(12)} type="button" className={styles.ctaPrimary}>
          領取好感度 +12 💗
        </button>
      ) : (
        <button onClick={onBack} type="button" className={styles.linkBtn}>
          放棄並返回任務中心
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 支線劇情
// ----------------------------------------------------------------------------

function StoryQuest({ onDone, onBack }: QuestProps) {
  const [index, setIndex] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [finished, setFinished] = useState(false);
  const node = STORY_QUEST_NODES[index];

  const choose = (optionIndex: number) => {
    const option = node.options[optionIndex];
    setReply(option.reply);
    setPoints((value) => value + option.points);
  };

  const next = () => {
    if (index + 1 >= STORY_QUEST_NODES.length) setFinished(true);
    else {
      setIndex((value) => value + 1);
      setReply(null);
    }
  };

  if (finished) {
    return (
      <div className={styles.questBody}>
        <h4 className={styles.questHeading}>支線劇情完成：手札裡的祕密</h4>
        <p className={styles.questText}>你們分享了彼此心裡的小祕密。這段只屬於你們兩個人的故事，會被好好記住。</p>
        <button onClick={() => onDone(points + 2)} type="button" className={styles.ctaPrimary}>
          領取好感度 +{points + 2} 💗
        </button>
      </div>
    );
  }

  return (
    <div className={styles.questBody}>
      <p className={styles.questStep}>支線 {index + 1} / {STORY_QUEST_NODES.length}</p>
      <div className={styles.storyBox}>
        {node.intro.map((line) => (
          <p key={line.text} className={line.who === "narrator" ? styles.storyNarr : styles.storyLine}>
            {line.who === "partner" ? <b>{PARTNER.name}：</b> : null}
            {line.text}
          </p>
        ))}
        {reply && (
          <p className={styles.storyReply}>
            <b>{PARTNER.name}：</b>
            {reply}
          </p>
        )}
      </div>
      {reply ? (
        <button onClick={next} type="button" className={styles.ctaPrimary}>
          {index + 1 >= STORY_QUEST_NODES.length ? "完成支線" : "繼續"} <span aria-hidden>▶</span>
        </button>
      ) : (
        <div className={styles.storyChoices}>
          {node.options.map((option, optionIndex) => (
            <button key={option.text} onClick={() => choose(optionIndex)} type="button" className={styles.choice}>
              {option.text}
            </button>
          ))}
        </div>
      )}
      <button onClick={onBack} type="button" className={styles.linkBtn}>
        放棄並返回任務中心
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 任務中心
// ----------------------------------------------------------------------------

export function HubOverlay({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const [active, setActive] = useState<QuestId | null>(null);
  const finish = (id: QuestId) => (bonus: number) => dispatch({ type: "COMPLETE_QUEST", id, bonus });
  const back = () => setActive(null);

  return (
    <div className={styles.modalBack}>
      <div className={styles.hubCard}>
        <header className={styles.hubHeader}>
          <div>
            <p className={styles.stepKicker}>ONLINE STAGE</p>
            <h3 className={styles.hubTitle}>線上任務中心</h3>
          </div>
          <button onClick={() => dispatch({ type: "CLOSE_HUB" })} type="button" className={styles.iconBtn} aria-label="關閉任務中心">
            ✕
          </button>
        </header>
        {active === null && (
          <div className={styles.hubList}>
            {QUESTS.map((quest) => {
              const done = state.quests[quest.id].done;
              return (
                <button
                  key={quest.id}
                  onClick={() => setActive(quest.id)}
                  type="button"
                  disabled={done}
                  className={`${styles.hubItem} ${done ? styles.hubDone : ""}`}
                >
                  <span className={styles.hubIcon}>{quest.icon}</span>
                  <span className={styles.hubText}>
                    <strong>{quest.title}</strong>
                    <small>{quest.kind}・{quest.desc}</small>
                  </span>
                  <span className={styles.hubState}>{done ? `已完成 +${state.quests[quest.id].bonus}` : "開始 ▶"}</span>
                </button>
              );
            })}
            <p className={styles.questText}>完成任務可提升好感度；好感度達 75 後，劇情會自然帶出實體約會推薦。</p>
          </div>
        )}
        {active === "pair" && <PairQuest onDone={finish("pair")} onBack={back} />}
        {active === "puzzle" && <PuzzleQuest onDone={finish("puzzle")} onBack={back} />}
        {active === "story" && <StoryQuest onDone={finish("story")} onBack={back} />}
      </div>
    </div>
  );
}
