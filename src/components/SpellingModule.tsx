import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../utils/audio';
import {
  Volume2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Play,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import { getSukoonSound } from '../utils/phonics';

export type HarakaType =
  | 'fatha'
  | 'damma'
  | 'kasra'
  | 'sukoon'
  | 'tanween_damma'
  | 'tanween_fatha'
  | 'tanween_kasra';

export interface SpellingWord {
  id: string;
  word: string;
  meaning: string;
  letters: {
    char: string;
    harakaType: HarakaType;
    harakaSymbol: string;
    harakaName: string;
    color: string;
  }[];
}

export const SPELLING_WORDS: SpellingWord[] = [
  {
    id: 'sp-fath',
    word: 'فَتْحٌ',
    meaning: 'فَتْحُ الْأَبْوَابِ وَالْخَيْرَاتِ.',
    letters: [
      { char: 'فَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'تْ', harakaType: 'sukoon', harakaSymbol: 'ْ', harakaName: 'سُكُون (أَتْ)', color: 'text-purple-600 bg-purple-50 border-purple-300' },
      { char: 'حٌ', harakaType: 'tanween_damma', harakaSymbol: 'ٌ', harakaName: 'تَنْوِينُ ضَمّ', color: 'text-blue-600 bg-blue-50 border-blue-300' },
    ],
  },
  {
    id: 'sp-bayt',
    word: 'بَيْتٌ',
    meaning: 'بَيْتٌ دَافِئٌ يَمْلَؤُهُ الْأَمَانُ.',
    letters: [
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'يْ', harakaType: 'sukoon', harakaSymbol: 'ْ', harakaName: 'سُكُون (أَيْ)', color: 'text-purple-600 bg-purple-50 border-purple-300' },
      { char: 'تٌ', harakaType: 'tanween_damma', harakaSymbol: 'ٌ', harakaName: 'تَنْوِينُ ضَمّ', color: 'text-blue-600 bg-blue-50 border-blue-300' },
    ],
  },
  {
    id: 'sp-tamr',
    word: 'تَمْرٌ',
    meaning: 'تَمْرٌ لَذِيذٌ يُعْطِينَا الطَّاقَةَ.',
    letters: [
      { char: 'تَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'مْ', harakaType: 'sukoon', harakaSymbol: 'ْ', harakaName: 'سُكُون (أَمْ)', color: 'text-purple-600 bg-purple-50 border-purple-300' },
      { char: 'رٌ', harakaType: 'tanween_damma', harakaSymbol: 'ٌ', harakaName: 'تَنْوِينُ ضَمّ', color: 'text-blue-600 bg-blue-50 border-blue-300' },
    ],
  },
  {
    id: 'sp-bahr',
    word: 'بَحْرٌ',
    meaning: 'بَحْرٌ أَزْرَقُ وَاسِعٌ وَجَمِيلٌ.',
    letters: [
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'حْ', harakaType: 'sukoon', harakaSymbol: 'ْ', harakaName: 'سُكُون (أَحْ)', color: 'text-purple-600 bg-purple-50 border-purple-300' },
      { char: 'رٌ', harakaType: 'tanween_damma', harakaSymbol: 'ٌ', harakaName: 'تَنْوِينُ ضَمّ', color: 'text-blue-600 bg-blue-50 border-blue-300' },
    ],
  },
  {
    id: 'sp-najm',
    word: 'نَجْمٌ',
    meaning: 'نَجْمٌ يَلْمَعُ فِي السَّمَاءِ لَيْلًا.',
    letters: [
      { char: 'نَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'جْ', harakaType: 'sukoon', harakaSymbol: 'ْ', harakaName: 'سُكُون (أَجْ)', color: 'text-purple-600 bg-purple-50 border-purple-300' },
      { char: 'مٌ', harakaType: 'tanween_damma', harakaSymbol: 'ٌ', harakaName: 'تَنْوِينُ ضَمّ', color: 'text-blue-600 bg-blue-50 border-blue-300' },
    ],
  },
  {
    id: 'sp-habl',
    word: 'حَبْلٌ',
    meaning: 'حَبْلٌ قَوِيٌّ نَلْعَبُ بِهِ وَنَقْفِزُ.',
    letters: [
      { char: 'حَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'بْ', harakaType: 'sukoon', harakaSymbol: 'ْ', harakaName: 'سُكُون (أَبْ)', color: 'text-purple-600 bg-purple-50 border-purple-300' },
      { char: 'لٌ', harakaType: 'tanween_damma', harakaSymbol: 'ٌ', harakaName: 'تَنْوِينُ ضَمّ', color: 'text-blue-600 bg-blue-50 border-blue-300' },
    ],
  },
  {
    id: 'sp-1',
    word: 'فَتَحَ',
    meaning: 'فتح الباب ليدخل النور.',
    letters: [
      { char: 'فَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'تَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'حَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-2',
    word: 'كُتِبَ',
    meaning: 'كُتِبَ الدَّرْسُ فِي الدَّفْتَرِ.',
    letters: [
      { char: 'كُ', harakaType: 'damma', harakaSymbol: 'ُ', harakaName: 'ضَمَّة', color: 'text-blue-600 bg-blue-50 border-blue-300' },
      { char: 'تِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-3',
    word: 'شَرِبَ',
    meaning: 'شَرِبَ الطِّفْلُ الْمَاءَ النَّقِيَّ.',
    letters: [
      { char: 'شَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'رِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-4',
    word: 'قَرَأَ',
    meaning: 'قَرَأَ الْكِتَابَ الْمُفِيدَ.',
    letters: [
      { char: 'قَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'رَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'أَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-5',
    word: 'كَتَبَ',
    meaning: 'كَتَبَ بِالْقَلَمِ خَطًّا جَمِيلًا.',
    letters: [
      { char: 'كَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'تَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-6',
    word: 'جَلَسَ',
    meaning: 'جَلَسَ الطَّالِبُ فِي مَقْعَدِهِ.',
    letters: [
      { char: 'جَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'لَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'سَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-7',
    word: 'لَعِبَ',
    meaning: 'لَعِبَ الْوَلَدُ بِالْكُرَةِ.',
    letters: [
      { char: 'لَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'عِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-8',
    word: 'رَسَمَ',
    meaning: 'رَسَمَ لَوْحَةً مُلَوَّنَةً.',
    letters: [
      { char: 'رَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'سَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'مَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-9',
    word: 'أَكَلَ',
    meaning: 'أَكَلَ التُّفَّاحَةَ اللَّذِيذَةَ.',
    letters: [
      { char: 'أَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'كَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'لَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-10',
    word: 'ذَهَبَ',
    meaning: 'ذَهَبَ إِلَى الْمَدْرَسَةِ بَاكِرًا.',
    letters: [
      { char: 'ذَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'هَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-11',
    word: 'حَمِدَ',
    meaning: 'حَمِدَ اللهَ عَلَى النِّعَمِ.',
    letters: [
      { char: 'حَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'مِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'دَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-12',
    word: 'صَبَرَ',
    meaning: 'صَبَرَ الْجَمَلُ فِي الصَّحْرَاءِ.',
    letters: [
      { char: 'صَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'رَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-13',
    word: 'زَرَعَ',
    meaning: 'زَرَعَ الْفَلَّاحُ الشَّجَرَةَ.',
    letters: [
      { char: 'زَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'رَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'عَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-14',
    word: 'حَصَدَ',
    meaning: 'حَصَدَ الْقَمْحَ الذَّهَبِيَّ.',
    letters: [
      { char: 'حَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'صَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'دَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-15',
    word: 'دَخَلَ',
    meaning: 'دَخَلَ الْبَيْتَ فَرِحًا.',
    letters: [
      { char: 'دَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'خَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'لَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-16',
    word: 'خَرَجَ',
    meaning: 'خَرَجَ لِيَلْعَبَ فِي الْحَدِيقَةِ.',
    letters: [
      { char: 'خَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'رَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'جَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-17',
    word: 'نَظَرَ',
    meaning: 'نَظَرَ إِلَى النُّجُومِ فِي السَّمَاءِ.',
    letters: [
      { char: 'نَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'ظَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'رَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-18',
    word: 'سَمِعَ',
    meaning: 'سَمِعَ صَوْتَ الْعُصْفُورِ الْمُغَرِّدِ.',
    letters: [
      { char: 'سَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'مِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'عَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-19',
    word: 'وَجَدَ',
    meaning: 'وَجَدَ لُعْبَتَهُ فِي الصُّنْدُوقِ.',
    letters: [
      { char: 'وَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'جَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'دَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-20',
    word: 'طَلَبَ',
    meaning: 'طَلَبَ الْمُسَاعَدَةَ بِأَدَبٍ.',
    letters: [
      { char: 'طَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'لَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'بَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-21',
    word: 'عَمِلَ',
    meaning: 'عَمِلَ بِنَشَاطٍ وَإِتْقَانٍ.',
    letters: [
      { char: 'عَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'مِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'لَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-22',
    word: 'فَهِمَ',
    meaning: 'فَهِمَ الدَّرْسَ جَيِّدًا.',
    letters: [
      { char: 'فَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'هِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'مَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-23',
    word: 'رَكِضَ',
    meaning: 'رَكِضَ فِي الْمَلْعَبِ بِسُرْعَةٍ.',
    letters: [
      { char: 'رَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'كِ', harakaType: 'kasra', harakaSymbol: 'ِ', harakaName: 'كَسْرَة', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
      { char: 'ضَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
  {
    id: 'sp-24',
    word: 'صَنَعَ',
    meaning: 'صَنَعَ طَيَّارَةً وَرَقِيَّةً.',
    letters: [
      { char: 'صَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'نَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
      { char: 'عَ', harakaType: 'fatha', harakaSymbol: 'َ', harakaName: 'فَتْحَة', color: 'text-orange-500 bg-orange-50 border-orange-300' },
    ],
  },
];

/**
 * Authentic Arabic Haraka Glyph
 * Renders genuine slanted calligraphic Fatha and Kasra without any baseline dash (شرطة),
 * and an authentic miniature Waw for Damma.
 */
export const HarakaGlyph: React.FC<{
  type: HarakaType;
  className?: string;
}> = ({ type, className = 'w-10 h-7' }) => {
  if (type === 'tanween_damma') {
    return (
      <svg
        viewBox="0 0 54 34"
        className={className}
        fill="currentColor"
        aria-label="تَنْوِينُ ضَمّ"
      >
        {/* Authentic calligraphic Tanween Damm (ضَمَّتَانِ جَمِيلَتَانِ لِتَنْوِينِ الضَّمِّ) */}
        {/* Right Damma */}
        <path
          d="M 39 3 C 34.5 3, 31 6.5, 31 11 C 31 15, 34 17.5, 37.5 17.5 C 39 17.5, 40.5 17, 41.5 16 C 41 19.5, 38.5 23.5, 32 26 C 30.8 26.6, 31.2 28.5, 32.8 28.3 C 40.8 27, 46 20.5, 46 12.5 C 46 7, 43 3, 39 3 Z M 38.5 8 C 40.5 8, 41.8 9.5, 41.8 11.5 C 41.8 13.5, 40.2 14.5, 38.5 14.5 C 36.8 14.5, 35.5 13, 35.5 11.5 C 35.5 9.5, 37 8, 38.5 8 Z"
        />
        {/* Left Damma */}
        <path
          d="M 18 3 C 13.5 3, 10 6.5, 10 11 C 10 15, 13 17.5, 16.5 17.5 C 18 17.5, 19.5 17, 20.5 16 C 20 19.5, 17.5 23.5, 11 26 C 9.8 26.6, 10.2 28.5, 11.8 28.3 C 19.8 27, 25 20.5, 25 12.5 C 25 7, 22 3, 18 3 Z M 17.5 8 C 19.5 8, 20.8 9.5, 20.8 11.5 C 20.8 13.5, 19.2 14.5, 17.5 14.5 C 15.8 14.5, 14.5 13, 14.5 11.5 C 14.5 9.5, 16 8, 17.5 8 Z"
        />
      </svg>
    );
  }
  if (type === 'tanween_fatha') {
    return (
      <svg
        viewBox="0 0 48 34"
        className={className}
        fill="currentColor"
        aria-label="تَنْوِينُ فَتْح"
      >
        <path d="M 36 2 C 38.5 3.5, 39 5.5, 36.5 8 L 18 24 C 15.5 26, 13 25.5, 11.5 23.5 C 10 21.5, 10.5 19, 13 17 L 31.5 1 C 33.5 -1, 35 0.5, 36 2 Z" />
        <path d="M 36 10 C 38.5 11.5, 39 13.5, 36.5 16 L 18 32 C 15.5 34, 13 33.5, 11.5 31.5 C 10 29.5, 10.5 27, 13 25 L 31.5 9 C 33.5 7, 35 8.5, 36 10 Z" />
      </svg>
    );
  }
  if (type === 'tanween_kasra') {
    return (
      <svg
        viewBox="0 0 48 34"
        className={className}
        fill="currentColor"
        aria-label="تَنْوِينُ كَسْر"
      >
        <path d="M 36 2 C 38.5 3.5, 39 5.5, 36.5 8 L 18 24 C 15.5 26, 13 25.5, 11.5 23.5 C 10 21.5, 10.5 19, 13 17 L 31.5 1 C 33.5 -1, 35 0.5, 36 2 Z" />
        <path d="M 36 10 C 38.5 11.5, 39 13.5, 36.5 16 L 18 32 C 15.5 34, 13 33.5, 11.5 31.5 C 10 29.5, 10.5 27, 13 25 L 31.5 9 C 33.5 7, 35 8.5, 36 10 Z" />
      </svg>
    );
  }
  if (type === 'fatha') {
    return (
      <svg
        viewBox="0 0 48 32"
        className={className}
        fill="currentColor"
        aria-label="فَتْحَة"
      >
        {/* Authentic calligraphic slanted Arabic Fatha */}
        <path
          d="M 36 5 C 38.5 6.5, 39 8.5, 36.5 11 L 18 27 C 15.5 29, 13 28.5, 11.5 26.5 C 10 24.5, 10.5 22, 13 20 L 31.5 4 C 33.5 2, 35 3.5, 36 5 Z"
        />
      </svg>
    );
  }
  if (type === 'kasra') {
    return (
      <svg
        viewBox="0 0 48 32"
        className={className}
        fill="currentColor"
        aria-label="كَسْرَة"
      >
        {/* Authentic calligraphic slanted Arabic Kasra */}
        <path
          d="M 36 5 C 38.5 6.5, 39 8.5, 36.5 11 L 18 27 C 15.5 29, 13 28.5, 11.5 26.5 C 10 24.5, 10.5 22, 13 20 L 31.5 4 C 33.5 2, 35 3.5, 36 5 Z"
        />
      </svg>
    );
  }
  if (type === 'damma') {
    return (
      <svg
        viewBox="0 0 42 42"
        className={className}
        fill="currentColor"
        aria-label="ضَمَّة"
      >
        {/* Authentic miniature calligraphic Waw, NO horizontal dash */}
        <path
          d="M 22 7 C 16.5 7, 12 11.5, 12 17 C 12 22, 16 25.5, 20.5 25.5 C 22.5 25.5, 24 25, 25.5 23.5 C 25 28, 22 33, 14 36 C 12.5 36.8, 13 39, 15 38.8 C 25 37, 31 29, 31 19 C 31 12, 27 7, 22 7 Z M 21.5 13 C 24 13, 25.5 15, 25.5 17.5 C 25.5 20, 23.5 21, 21.5 21 C 19 21, 17.5 19, 17.5 17 C 17.5 14.5, 19.5 13, 21.5 13 Z"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 36 36"
      className={className}
      aria-label="سُكُون"
    >
      <circle cx="18" cy="18" r="9" stroke="currentColor" strokeWidth="5" fill="none" />
    </svg>
  );
};

interface SpellingModuleProps {
  speechRate: number;
  onRequireSubscription?: (contentTitle: string) => void;
}

export const SpellingModule: React.FC<SpellingModuleProps> = ({ speechRate, onRequireSubscription }) => {
  const { isContentUnlocked } = useSubscription();
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isAutoSpelling, setIsAutoSpelling] = useState(false);
  const [interactiveSlots, setInteractiveSlots] = useState<number[]>([]);
  const spellRunRef = useRef(0);

  useEffect(() => {
    return () => {
      spellRunRef.current += 1;
      soundManager.stopSpeech();
    };
  }, []);

  const currentWord = SPELLING_WORDS[selectedWordIndex] || SPELLING_WORDS[0];

  const handleSelectWord = (index: number) => {
    if (!isContentUnlocked('spellingCount', index)) {
      soundManager.playPop();
      onRequireSubscription?.(`كَلِمَةُ «${SPELLING_WORDS[index].word}»`);
      return;
    }

    spellRunRef.current += 1;
    soundManager.stopSpeech();
    setSelectedWordIndex(index);
    setActiveStep(null);
    setIsAutoSpelling(false);
    setInteractiveSlots([]);
    soundManager.playPop();
    const word = SPELLING_WORDS[index];
    if (word) {
      soundManager.speakArabic(word.word, speechRate);
    }
  };

  const handleNext = () => {
    const nextIdx = (selectedWordIndex + 1) % SPELLING_WORDS.length;
    if (!isContentUnlocked('spellingCount', nextIdx)) {
      soundManager.playPop();
      onRequireSubscription?.(`كَلِمَةُ «${SPELLING_WORDS[nextIdx].word}»`);
    } else {
      handleSelectWord(nextIdx);
    }
  };

  const handlePrev = () => {
    const prevIdx = (selectedWordIndex - 1 + SPELLING_WORDS.length) % SPELLING_WORDS.length;
    if (!isContentUnlocked('spellingCount', prevIdx)) {
      soundManager.playPop();
      onRequireSubscription?.(`كَلِمَةُ «${SPELLING_WORDS[prevIdx].word}»`);
    } else {
      handleSelectWord(prevIdx);
    }
  };

  const getChunkSpokenText = (letterItem: { char: string; harakaType: string }) => {
    if (letterItem.harakaType === 'sukoon' || letterItem.char.includes('ْ')) {
      return getSukoonSound(letterItem.char);
    }
    return letterItem.char;
  };

  // Play a single letter chunk with its sound
  const playLetterChunk = (index: number) => {
    const item = currentWord.letters[index];
    if (!item) return;

    spellRunRef.current += 1;
    setIsAutoSpelling(false);
    setActiveStep(index);
    soundManager.playPop();
    const spoken = getChunkSpokenText(item);
    soundManager.speakArabic(spoken, speechRate * 0.85, () => {
      setActiveStep((prev) => (prev === index ? null : prev));
    });
  };

  // Step-by-step automatic spelling sequence synchronized to each MP3 completion
  const startSequentialSpelling = async () => {
    if (isAutoSpelling) return;
    const runId = ++spellRunRef.current;
    setIsAutoSpelling(true);

    for (let i = 0; i < currentWord.letters.length; i++) {
      if (spellRunRef.current !== runId) return;
      setActiveStep(i);
      soundManager.playPop();
      await new Promise<void>((resolve) => {
        soundManager.speakArabic(getChunkSpokenText(currentWord.letters[i]), speechRate * 0.85, resolve);
      });
      if (spellRunRef.current !== runId) return;
      await new Promise<void>((resolve) => setTimeout(resolve, 220));
    }

    if (spellRunRef.current !== runId) return;
    setActiveStep(3);
    soundManager.playSuccessChime();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
    });
    await new Promise<void>((resolve) => {
      soundManager.speakArabic(currentWord.word, speechRate, resolve);
    });

    if (spellRunRef.current === runId) {
      setIsAutoSpelling(false);
      setActiveStep(null);
    }
  };

  // Interactive spelling build (child taps 1st, 2nd, 3rd)
  const handleTapLetterSlot = (letterIdx: number) => {
    if (interactiveSlots.includes(letterIdx)) return;

    const nextExpected = interactiveSlots.length;
    if (letterIdx === nextExpected) {
      const runId = ++spellRunRef.current;
      const newSlots = [...interactiveSlots, letterIdx];
      setInteractiveSlots(newSlots);
      setActiveStep(letterIdx);
      soundManager.playPop();
      const spoken = getChunkSpokenText(currentWord.letters[letterIdx]);

      soundManager.speakArabic(spoken, speechRate * 0.85, () => {
        if (spellRunRef.current !== runId) return;
        setActiveStep(null);
        if (newSlots.length === 3) {
          soundManager.playSuccessChime();
          soundManager.speakArabic(`مُمْتَازٌ! كَلِمَةُ ${currentWord.word}!`, speechRate);
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      });
    } else {
      soundManager.playEncouragementChime();
      soundManager.speakArabic('ابْدَأْ بِالْحَرْفِ الْأَوَّلِ ثُمَّ الثَّانِي!', speechRate);
    }
  };

  const resetInteractiveSpelling = () => {
    setInteractiveSlots([]);
    soundManager.playPop();
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Header and Navigation Bar */}
      <div className="bg-white rounded-2xl p-3 px-4 shadow-2xs border border-amber-200 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-xl font-black text-sm md:text-base flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
        >
          <span>الْكَلِمَةُ التَّالِيَةُ</span>
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-black text-amber-950">
            {`الْكَلِمَةُ ${selectedWordIndex + 1} مِنْ ${SPELLING_WORDS.length} (كَلِمَاتٌ ثُلَاثِيَّةٌ)`}
          </span>
        </div>

        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 rounded-xl font-black text-sm md:text-base flex items-center gap-2 cursor-pointer border border-slate-200 transition-all active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
          <span>الْكَلِمَةُ السَّابِقَةُ</span>
        </button>
      </div>

      {/* Main Big Phonics Stage */}
      <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border-2 border-amber-300 space-y-6">
        {/* Full Word in Extra Large Size with Meaning */}
        <div className="text-center bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 md:p-8 rounded-3xl border-2 border-amber-200 relative overflow-hidden">
          <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-1">
            الْكَلِمَةُ الْكَامِلَةُ بِالْحَرَكَاتِ:
          </span>

          <div
            className={`font-black text-amber-950 text-6xl sm:text-7xl md:text-8xl lg:text-9xl tashkeel-display-word select-none py-2 transition-all ${
              activeStep === 3 ? 'scale-105 text-amber-600' : ''
            }`}
          >
            {currentWord.word}
          </div>

          <p className="text-base md:text-lg font-bold text-slate-700 mt-2">
            «{currentWord.meaning}»
          </p>

          <button
            onClick={() => {
              soundManager.playPop();
              soundManager.speakArabic(currentWord.word, speechRate);
            }}
            className="mt-3 px-5 py-2 bg-white hover:bg-amber-100 text-amber-950 font-black text-sm rounded-xl border border-amber-300 shadow-2xs inline-flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>انْطِقِ الْكَلِمَةَ مُجْتَمِعَةً</span>
          </button>
        </div>

        {/* 3-LETTER PHONICS CHUNKS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-black text-slate-800">
              تَهْجِئَةُ الْحُرُوفِ الثَّلَاثَةِ مَعَ حَرَكَاتِهَا:
            </span>
            <span className="text-xs text-amber-700 font-bold">
              اضْغَطْ عَلَى الْحَرْفِ لِيَتَحَرَّكَ وَيَنْطِقَ!
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {currentWord.letters.map((letterItem, idx) => {
              const isActive = activeStep === idx;
              const isKasra = letterItem.harakaType === 'kasra';

              return (
                <div
                  key={idx}
                  onClick={() => playLetterChunk(idx)}
                  className={`p-3 md:p-4 rounded-3xl border-3 flex flex-col items-center justify-between min-h-[200px] md:min-h-[240px] cursor-pointer transition-all shadow-sm relative select-none ${
                    isActive
                      ? `${letterItem.color} ring-4 ring-amber-400 scale-105 shadow-md`
                      : 'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {/* UPPER SLOT: Haraka in Arabic */}
                  <div className="h-12 md:h-14 w-full flex items-center justify-center">
                    {!isKasra && letterItem.harakaType !== 'tanween_kasra' ? (
                      <div
                        className={`flex flex-col items-center justify-center transition-all ${
                          isActive
                            ? 'haraka-animated-up haraka-glow-up scale-125 ' +
                              (letterItem.harakaType === 'tanween_damma'
                                ? 'text-blue-600'
                                : letterItem.harakaType === 'sukoon'
                                ? 'text-purple-600'
                                : 'text-orange-600')
                            : letterItem.harakaType === 'tanween_damma'
                            ? 'text-blue-600'
                            : letterItem.harakaType === 'sukoon'
                            ? 'text-purple-600'
                            : 'text-orange-500'
                        }`}
                        title={
                          letterItem.harakaType === 'tanween_damma'
                            ? 'تَنْوِينُ ضَمّ'
                            : letterItem.harakaType === 'sukoon'
                            ? 'سُكُون'
                            : 'حَرَكَةٌ عُلْوِيَّةٌ'
                        }
                      >
                        <HarakaGlyph
                          type={letterItem.harakaType}
                          className={
                            letterItem.harakaType === 'tanween_damma'
                              ? 'w-12 h-8 md:w-14 md:h-9 text-blue-600'
                              : letterItem.harakaType === 'damma'
                              ? 'w-10 h-10 md:w-12 md:h-12 text-blue-600'
                              : letterItem.harakaType === 'sukoon'
                              ? 'w-8 h-8 md:w-9 md:h-9 text-purple-600'
                              : 'w-12 h-8 md:w-14 md:h-9 text-orange-500'
                          }
                        />
                      </div>
                    ) : (
                      <div className="h-2 w-8 rounded-full bg-slate-100 opacity-20" />
                    )}
                  </div>

                  {/* MIDDLE: Extra Large Letter */}
                  <div className="my-auto py-2 flex items-center justify-center">
                    <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 tashkeel-display-word select-none leading-tight">
                      {letterItem.char}
                    </span>
                  </div>

                  {/* LOWER SLOT: Kasra in Arabic or Tanween / Sukoon Badge */}
                  <div className="h-12 md:h-14 w-full flex items-center justify-center">
                    {letterItem.harakaType === 'tanween_damma' ? (
                      <span className="text-xs font-black text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full shadow-2xs">
                        تَنْوِينُ ضَمٍّ (ـٌ)
                      </span>
                    ) : letterItem.harakaType === 'sukoon' ? (
                      <span className="text-xs font-black text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-full shadow-2xs">
                        صَوْتُهُ: «{getSukoonSound(letterItem.char)}»
                      </span>
                    ) : isKasra ? (
                      <div
                        className={`flex items-center justify-center transition-all ${
                          isActive
                            ? 'haraka-animated-down haraka-glow-down text-emerald-600 scale-125'
                            : 'text-emerald-600'
                        }`}
                        title="حَرَكَةُ الْكَسْرَةِ"
                      >
                        <HarakaGlyph
                          type="kasra"
                          className="w-12 h-8 md:w-14 md:h-9"
                        />
                      </div>
                    ) : (
                      <div className="h-2 w-8 rounded-full bg-slate-100 opacity-20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls for Automated Step-by-Step Spelling */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={startSequentialSpelling}
            disabled={isAutoSpelling}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-2xl font-black text-base md:text-lg shadow-md transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>
              تَهْجِئَةٌ صَوْتِيَّةٌ خَطْوَةً بِخَطْوَةٍ (1 ⬅️ 2 ⬅️ 3)
            </span>
          </button>
        </div>

        {/* INTERACTIVE BUILD CHALLENGE */}
        <div className="bg-amber-50/80 rounded-2xl p-4 md:p-5 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>
                تَحَدِّي التَّهْجِئَةِ: اضْغَطْ عَلَى الْحُرُوفِ بِالتَّرْتِيبِ لِبِنَاءِ الْكَلِمَةِ!
              </span>
            </span>

            {interactiveSlots.length > 0 && (
              <button
                onClick={resetInteractiveSpelling}
                className="text-xs font-black text-slate-600 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إِعَادَةُ التَّهْجِئَةِ</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 md:gap-6 py-2">
            {currentWord.letters.map((letterItem, idx) => {
              const isFilled = interactiveSlots.includes(idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleTapLetterSlot(idx)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-black transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 scale-102 ring-2 ring-emerald-300'
                      : 'bg-white hover:bg-amber-100 border-amber-300 text-amber-950 shadow-2xs'
                  }`}
                >
                  <span className="text-3xl md:text-4xl tashkeel-word">
                    {letterItem.char}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {idx === 0
                      ? 'الْأَوَّل'
                      : idx === 1
                      ? 'الثَّانِي'
                      : 'الثَّالِث'}
                  </span>
                </button>
              );
            })}
          </div>

          {interactiveSlots.length === 3 && (
            <div className="text-center pt-1">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  أَحْسَنْتَ يَا بَطَلُ! لَقَدْ هَجَّأْتَ كَلِمَةَ «${currentWord.word}» بِنَجَاحٍ! 🌟
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sequential Thumbnail Strip */}
      <div className="bg-white rounded-2xl p-2.5 px-3 shadow-2xs border border-amber-200">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {SPELLING_WORDS.map((item, idx) => {
            const isUnlocked = isContentUnlocked('spellingCount', idx);
            return (
              <button
                key={item.id}
                onClick={() => handleSelectWord(idx)}
                className={`relative p-1.5 px-3 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  selectedWordIndex === idx
                    ? 'border-amber-500 bg-amber-100 text-amber-950 font-black ring-1 ring-amber-400'
                    : isUnlocked
                    ? 'border-slate-200 hover:border-amber-300 bg-slate-50/50 text-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400 hover:border-amber-300'
                }`}
              >
                {!isUnlocked && (
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                )}
                <span className="text-sm font-black tashkeel-word">{item.word}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

