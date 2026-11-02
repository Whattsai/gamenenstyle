// 心動迴路 DEMO：靜態美術素材（由 Next.js 靜態匯入，不使用外部網址）

import avatarForest from "./assets/avatar-forest.jpg";
import avatarMoon from "./assets/avatar-moon.jpg";
import avatarSakura from "./assets/avatar-sakura.jpg";
import avatarSun from "./assets/avatar-sun.jpg";
import bgCafe from "./assets/bg-cafe.jpg";
import bgEscape from "./assets/bg-escape.jpg";
import bgWorkshop from "./assets/bg-workshop.jpg";
import natsukiBlush from "./assets/natsuki-blush.jpg";
import natsukiFace from "./assets/natsuki-face.jpg";
import natsukiHappy from "./assets/natsuki-happy.jpg";
import natsukiSmile from "./assets/natsuki-smile.jpg";
import natsukiWorry from "./assets/natsuki-worry.jpg";
import type { Expr } from "./content";

export const AVATAR_IMG: Record<string, string> = {
  sun: avatarSun.src,
  moon: avatarMoon.src,
  sakura: avatarSakura.src,
  forest: avatarForest.src,
};

export const CG_IMG: Record<Expr, string> = {
  smile: natsukiSmile.src,
  blush: natsukiBlush.src,
  happy: natsukiHappy.src,
  worry: natsukiWorry.src,
};

export const VENUE_IMG: Record<string, string> = {
  escape: bgEscape.src,
  craft: bgWorkshop.src,
  cafe: bgCafe.src,
};

export const BG_CAFE = bgCafe.src;
export const PARTNER_FACE = natsukiFace.src;
