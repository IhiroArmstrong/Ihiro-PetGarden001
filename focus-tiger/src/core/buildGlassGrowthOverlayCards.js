/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { CO_PRACTICE_GIFT_ART_SURFACE_ENABLED } from './coPracticeGiftArtCatalog.js';
import { assertGlassGrowthOverlayCardOrder } from './glassGrowthOverlayCardRegistry.js';

export function buildGlassGrowthOverlayCards(d) {
  const cards = [
    {
      id: 'support',
      ui: d.bootMomentHosts.supportYinModalUI,
      close: () => d.bootMomentHosts.supportYinModalUI.close()
    },
    { id: 'quote', ui: d.dailyZenQuoteCardUI, close: () => d.dailyZenQuoteCardUI.close() },
    {
      id: 'contemplative-inquiry',
      ui: d.contemplativeInquiryUI,
      close: () => d.contemplativeInquiryUI.close()
    },
    {
      id: 'mustard-seed',
      ui: d.mustardSeedSealCardUI,
      close: () => d.mustardSeedSealCardUI.close()
    },
    {
      id: 'practice-imprint',
      ui: d.practiceImprintCardUI,
      close: () => d.practiceImprintCardUI.close()
    },
    ...(CO_PRACTICE_GIFT_ART_SURFACE_ENABLED
      ? [
          {
            id: 'co-practice-gift-art',
            ui: d.coPracticeGiftArtCardUI,
            close: () => d.coPracticeGiftArtCardUI.close()
          }
        ]
      : []),
    {
      id: 'wallpapers',
      ui: d.digitalWallpapersCardUI,
      close: () => d.digitalWallpapersCardUI.close()
    },
    {
      id: 'art-collection',
      ui: d.artCollectionPanelUI,
      close: () => d.artCollectionPanelUI.close()
    },
    { id: 'sanctuary', ui: d.sanctuaryUnlockUI, close: () => d.sanctuaryUnlockUI.close() },
    {
      id: 'membership',
      ui: d.membershipUnlockUI,
      close: () => d.membershipUnlockUI.close()
    },
    { id: 'tip', ui: d.tipJarUI, close: () => d.tipJarUI.close() },
    {
      id: 'newsletter',
      ui: d.newsletterCaptureUI,
      close: () => d.newsletterCaptureUI.close()
    },
    { id: 'confide', ui: d.confideToYinUI, close: () => d.confideToYinUI.close() },
    {
      id: 'daily-noticing',
      ui: d.dailyNoticingUI,
      close: () => d.dailyNoticingUI?.close()
    },
    { id: 'cinema', ui: d.zenCinemaCardUI, close: () => d.zenCinemaCardUI.close() },
    {
      id: 'ground-exercise',
      ui: d.groundExerciseChoiceUI,
      close: () => d.groundExerciseChoiceUI?.close()
    },
    {
      id: 'guided-meditation',
      ui: d.guidedMeditationUI,
      close: () => d.guidedMeditationUI?.close()
    },
    {
      id: 'moments',
      ui: d.bootMomentHosts.fiveMomentsCompassUI,
      close: () => d.bootMomentHosts.fiveMomentsCompassUI.close()
    },
    {
      id: 'cold-start-goal',
      ui: d.coldStartGoalCardUI,
      close: () => d.coldStartGoalCardUI.close()
    },
    { id: 'journey', ui: d.journeyLogUI, close: () => d.journeyLogUI.close() },
    { id: 'help-center', ui: d.helpCenterUI, close: () => d.helpCenterUI.close() },
    {
      id: 'growth-journey',
      ui: d.growthJourneyDetailUI,
      close: () => d.growthJourneyDetailUI?.close()
    },
    {
      id: 'presence',
      ui: d.presenceSignalsPanelUI,
      close: () => d.presenceSignalsPanelUI.close()
    },
    {
      id: 'yin-memory',
      ui: d.yinPersonalMemoryUI,
      close: () => d.yinPersonalMemoryUI.close()
    },
    { id: 'yin-coin', ui: d.yinCoinPanelUI, close: () => d.yinCoinPanelUI?.close() },
    ...d.preferenceBackupPanels.overlayCards,
    {
      id: 'practice-study',
      ui: d.practiceStudyConsentPanelUI,
      close: () => d.practiceStudyConsentPanelUI.closePanel()
    },
    {
      id: 'quiet-together',
      ui: d.quietTogetherPanelUI,
      close: () => d.quietTogetherPanelUI.closePanel()
    },
    {
      id: 'focus-circle',
      ui: d.focusCirclePanelUI,
      close: () => d.focusCirclePanelUI.closePanel()
    }
  ];
  assertGlassGrowthOverlayCardOrder(cards.map((card) => card.id));
  return cards;
}