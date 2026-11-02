import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const appDir = new URL("../app/", import.meta.url);

test("prototype keeps DEMO boundary and no secrets/payment", () => {
  const files = ["page.tsx", "engine.ts", "screens.tsx", "quests.tsx", "content.ts", "assets.ts"];
  for (const file of files) {
    const content = fs.readFileSync(new URL(file, appDir), "utf8");
    assert.doesNotMatch(content, /fetch\(|payment|checkout|stripe|paypal|process\.env|token|secret|apiKey/i);
  }
  const page = fs.readFileSync(new URL("page.tsx", appDir), "utf8");
  assert.match(page, /DEMO/);
});

test("prototype covers all 6 MVP core requirements", () => {
  const content = fs.readFileSync(new URL("content.ts", appDir), "utf8");
  const engine = fs.readFileSync(new URL("engine.ts", appDir), "utf8");
  const screens = fs.readFileSync(new URL("screens.tsx", appDir), "utf8");
  const quests = fs.readFileSync(new URL("quests.tsx", appDir), "utf8");

  // 1. 虛擬化身與隱私防護
  assert.match(content, /AVATAR_STYLES/);
  assert.match(screens, /AvatarScreen/);
  assert.match(engine, /sanitizeText/);

  // 2. 深度興趣、擇偶條件與配對權重
  assert.match(content, /INTEREST_OPTIONS/);
  assert.match(engine, /computeCompatibility/);
  assert.match(screens, /ProfileScreen/);

  // 3. 雙方確認配對
  assert.match(screens, /MatchScreen/);
  assert.match(engine, /CONFIRM_MATCH/);
  assert.match(engine, /PARTNER_CONFIRM/);

  // 4. 劇情破冰、虛擬人物對話框與預設選項
  assert.match(content, /ROUNDS/);
  assert.match(content, /ICEBREAKER|ROUND|SUGGESTIONS/);
  assert.match(engine, /PICK_CHOICE/);

  // 5. 好感度指標與雙階段解鎖（線上任務 + 實體商戶）
  assert.match(content, /STAGE1_AT/);
  assert.match(content, /STAGE2_AT/);
  assert.match(quests, /PairQuest/);
  assert.match(quests, /PuzzleQuest/);
  assert.match(quests, /StoryQuest/);
  assert.match(content, /VENUES/);
  assert.match(screens, /BookingScreen/);

  // 6. 平順退出防護與離場語境
  assert.match(content, /EXIT_KEYWORDS/);
  assert.match(engine, /detectExit/);
  assert.match(screens, /EndedScreen/);
});

test("all anime CG and avatar assets exist and valid", () => {
  const assetsDir = new URL("assets/", appDir);
  const required = [
    "avatar-forest.jpg",
    "avatar-moon.jpg",
    "avatar-sakura.jpg",
    "avatar-sun.jpg",
    "bg-cafe.jpg",
    "bg-escape.jpg",
    "bg-workshop.jpg",
    "natsuki-blush.jpg",
    "natsuki-face.jpg",
    "natsuki-happy.jpg",
    "natsuki-smile.jpg",
    "natsuki-worry.jpg",
  ];
  for (const name of required) {
    const file = new URL(name, assetsDir);
    const stats = fs.statSync(file);
    assert.ok(stats.isFile(), `${name} must be a file`);
    assert.ok(stats.size > 5000, `${name} must be greater than 5KB (was ${stats.size})`);
  }
});
