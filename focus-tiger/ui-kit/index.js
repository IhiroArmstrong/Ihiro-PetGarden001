/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Tiger UI Kit — entry
 * Import once; registers all custom elements. No bundler required.
 *
 *   <link rel="stylesheet" href="./tokens.css" />
 *   <script type="module" src="./index.js"></script>
 */

import { TigerHud, TIGER_HUD_TAG } from "./components/tiger-hud.js?v=20260721f";
import { StreakMeter, STREAK_METER_TAG } from "./components/streak-meter.js?v=20260721f";
import { PrimaryButton, PRIMARY_BUTTON_TAG } from "./components/primary-button.js?v=20260721f";
import { SecondaryButton, SECONDARY_BUTTON_TAG } from "./components/secondary-button.js?v=20260721f";
import {
  TooltipCard,
  DialogBox,
  TOOLTIP_CARD_TAG,
  DIALOG_BOX_TAG,
} from "./components/tooltip-card.js?v=20260721f";
import {
  NotificationBadge,
  NOTIFICATION_BADGE_TAG,
} from "./components/notification-badge.js?v=20260721f";
import { ProgressBar, PROGRESS_BAR_TAG } from "./components/progress-bar.js?v=20260721f";
import {
  AchievementModal,
  ACHIEVEMENT_MODAL_TAG,
} from "./components/achievement-modal.js?v=20260721f";
import {
  CollectionShelf,
  COLLECTION_SHELF_TAG,
} from "./components/collection-shelf.js?v=20260721f";
import {
  DailyQuestCard,
  DAILY_QUEST_CARD_TAG,
} from "./components/daily-quest-card.js?v=20260721f";

function define(tag, Ctor) {
  if (!customElements.get(tag)) {
    customElements.define(tag, Ctor);
  }
}

define(TIGER_HUD_TAG, TigerHud);
define(STREAK_METER_TAG, StreakMeter);
define(PRIMARY_BUTTON_TAG, PrimaryButton);
define(SECONDARY_BUTTON_TAG, SecondaryButton);
define(TOOLTIP_CARD_TAG, TooltipCard);
define(DIALOG_BOX_TAG, DialogBox);
define(NOTIFICATION_BADGE_TAG, NotificationBadge);
define(PROGRESS_BAR_TAG, ProgressBar);
define(ACHIEVEMENT_MODAL_TAG, AchievementModal);
define(COLLECTION_SHELF_TAG, CollectionShelf);
define(DAILY_QUEST_CARD_TAG, DailyQuestCard);

export {
  TigerHud,
  StreakMeter,
  PrimaryButton,
  SecondaryButton,
  TooltipCard,
  DialogBox,
  NotificationBadge,
  ProgressBar,
  AchievementModal,
  CollectionShelf,
  DailyQuestCard,
};
