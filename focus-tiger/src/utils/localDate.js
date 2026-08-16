/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 使用用户本地时区生成自然日键，避免 UTC 日期在本地午夜附近提前换日。
 * ReminderQuota、DailyCompletion、Honesty Check-in 等共用此函数，勿各自再造一套。
 *
 * @param {Date} [date]
 * @returns {string} YYYY-MM-DD
 */
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
