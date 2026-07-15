/**
 * CharacterConfig —— 角色/装扮外观配置与素材路径拼接的**唯一出口**。
 *
 * 架构意图（本阶段只做解耦，不做换装功能）：
 * - 情绪触发链路（EmotionController → 序列名）与「用什么角色/装扮渲染」彻底分离；
 * - 素材路径的角色/装扮段不硬编码在任何调用方，未来换装 =
 *   `setActiveAppearance()` + 新素材目录 + 选择 UI，不改触发逻辑与播放器。
 *
 * 素材路径规范（权威定义见 ARCHITECTURE.md「2D 序列素材路径规范」）：
 *   public/sprites/{characterId}/{outfitId}/{animationName}/frame_{NNN}.png
 *   - 三段均为 kebab-case；帧名统一 frame_001.png 起、3 位零填充、连续编号。
 */

/** 默认角色（当前唯一角色：小老虎） */
export const DEFAULT_CHARACTER_ID = 'tiger-cub';
/** 默认装扮（当前唯一装扮：僧袍） */
export const DEFAULT_OUTFIT_ID = 'monk-robe-default';

/** 帧文件名零填充位数 */
const FRAME_PAD = 3;

let activeCharacterId = DEFAULT_CHARACTER_ID;
let activeOutfitId = DEFAULT_OUTFIT_ID;

/**
 * @returns {{ characterId: string, outfitId: string }} 当前生效外观
 */
export function getActiveAppearance() {
  return { characterId: activeCharacterId, outfitId: activeOutfitId };
}

/**
 * 切换生效外观。预留给未来换装功能；本阶段无任何 UI 调用。
 * 切换后需由调用方对精灵播放器重新 preload 以载入新装扮素材。
 * @param {{ characterId?: string, outfitId?: string }} appearance
 */
export function setActiveAppearance({ characterId, outfitId } = {}) {
  if (characterId && typeof characterId === 'string') {
    activeCharacterId = characterId;
  }
  if (outfitId && typeof outfitId === 'string') {
    activeOutfitId = outfitId;
  }
}

/**
 * 拼接单帧素材运行时 URL。
 * @param {string} animationName 动作名（kebab-case，如 'wave-hello'）
 * @param {number} frameNumber 1 基帧号
 * @param {{ characterId?: string, outfitId?: string }} [overrides] 缺省用当前生效外观
 * @returns {string} 如 '/sprites/tiger-cub/monk-robe-default/wave-hello/frame_008.png'
 */
export function buildFramePath(animationName, frameNumber, overrides = {}) {
  const characterId = overrides.characterId ?? activeCharacterId;
  const outfitId = overrides.outfitId ?? activeOutfitId;
  const frame = String(frameNumber).padStart(FRAME_PAD, '0');
  return `/sprites/${characterId}/${outfitId}/${animationName}/frame_${frame}.png`;
}

/**
 * 拼接一个动作的全部有序帧路径（1 基连续编号）。
 * @param {string} animationName
 * @param {number} frameCount
 * @param {{ characterId?: string, outfitId?: string }} [overrides]
 * @returns {string[]}
 */
export function buildFramePaths(animationName, frameCount, overrides = {}) {
  const paths = [];
  for (let i = 1; i <= frameCount; i++) {
    paths.push(buildFramePath(animationName, i, overrides));
  }
  return paths;
}
