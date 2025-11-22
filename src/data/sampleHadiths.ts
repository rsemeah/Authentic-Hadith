import { Hadith } from '../utilities/types';

// Sample hadith dataset for offline UI demos
export const sampleHadiths: Hadith[] = [
  {
    id: 'bukhari-1',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Actions are judged by intentions, and every person will be rewarded according to their intention.',
    collection: 'Sahih al-Bukhari',
    reference: 'Book 1, Hadith 1',
    narrator: 'Umar ibn al-Khattab',
    topics: ['intentions', 'sincerity', 'faith'],
    grade: 'Sahih',
    explanation: 'This fundamental hadith emphasizes that the value of deeds depends on the intention behind them.'
  },
  {
    id: 'bukhari-2',
    arabic: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ',
    translation: 'Islam is built upon five pillars: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing prayer, paying zakat, performing Hajj, and fasting in Ramadan.',
    collection: 'Sahih al-Bukhari',
    reference: 'Book 2, Hadith 7',
    narrator: 'Abdullah ibn Umar',
    topics: ['five pillars', 'fundamentals', 'worship'],
    grade: 'Sahih',
    explanation: 'This hadith outlines the five pillars that form the foundation of Islamic practice.'
  },
  {
    id: 'muslim-1',
    arabic: 'مَنْ غَشَّنَا فَلَيْسَ مِنَّا',
    translation: 'Whoever deceives us is not one of us.',
    collection: 'Sahih Muslim',
    reference: 'Book 1, Hadith 164',
    narrator: 'Abu Huraira',
    topics: ['honesty', 'business ethics', 'character'],
    grade: 'Sahih',
    explanation: 'This hadith strongly condemns deception and emphasizes the importance of honesty in all dealings.'
  },
  {
    id: 'muslim-2',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    translation: 'Religion is sincerity and sincere advice.',
    collection: 'Sahih Muslim',
    reference: 'Book 1, Hadith 95',
    narrator: 'Tamim al-Dari',
    topics: ['sincerity', 'advice', 'brotherhood'],
    grade: 'Sahih',
    explanation: 'This hadith teaches that the essence of religion is to be sincere and to give sincere advice to others.'
  },
  {
    id: 'tirmidhi-1',
    arabic: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنْ الْمُؤْمِنِ الضَّعِيفِ',
    translation: 'The strong believer is better and more beloved to Allah than the weak believer.',
    collection: 'Jami` at-Tirmidhi',
    reference: 'Book 33, Hadith 2664',
    narrator: 'Abu Huraira',
    topics: ['strength', 'faith', 'character'],
    grade: 'Hasan',
    explanation: 'This hadith encourages believers to develop strength in faith, character, and capabilities.'
  },
  {
    id: 'abudawud-1',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best among you are those who learn the Quran and teach it.',
    collection: 'Sunan Abi Dawud',
    reference: 'Book 3, Hadith 1452',
    narrator: 'Uthman ibn Affan',
    topics: ['knowledge', 'teaching', 'quran'],
    grade: 'Sahih',
    explanation: 'This hadith highlights the virtue of learning and teaching the Quran.'
  },
  {
    id: 'bukhari-3',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translation: 'None of you truly believes until he loves for his brother what he loves for himself.',
    collection: 'Sahih al-Bukhari',
    reference: 'Book 2, Hadith 12',
    narrator: 'Anas ibn Malik',
    topics: ['brotherhood', 'compassion', 'faith'],
    grade: 'Sahih',
    explanation: 'This hadith teaches the importance of wishing well for others as we wish for ourselves.'
  },
  {
    id: 'muslim-3',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    translation: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
    collection: 'Sahih Muslim',
    reference: 'Book 1, Hadith 74',
    narrator: 'Abu Huraira',
    topics: ['speech', 'manners', 'faith'],
    grade: 'Sahih',
    explanation: 'This hadith emphasizes the importance of controlling one\'s speech and speaking only good.'
  },
  {
    id: 'bukhari-4',
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    translation: 'Purity is half of faith.',
    collection: 'Sahih Muslim',
    reference: 'Book 2, Hadith 432',
    narrator: 'Abu Malik al-Ashari',
    topics: ['purification', 'faith', 'cleanliness'],
    grade: 'Sahih',
    explanation: 'This hadith highlights the spiritual and physical importance of purification in Islam.'
  },
  {
    id: 'tirmidhi-2',
    arabic: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ',
    translation: 'Indeed, Allah loves that when one of you does something, he does it with excellence.',
    collection: 'Jami` at-Tirmidhi',
    reference: 'Hadith 1631',
    narrator: 'Aisha',
    topics: ['excellence', 'work', 'character'],
    grade: 'Hasan',
    explanation: 'This hadith teaches the importance of doing work with excellence and perfection.'
  },
  {
    id: 'abudawud-2',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever takes a path seeking knowledge, Allah will make easy for him the path to Paradise.',
    collection: 'Sunan Abi Dawud',
    reference: 'Book 25, Hadith 3634',
    narrator: 'Abu Huraira',
    topics: ['knowledge', 'seeking knowledge', 'paradise'],
    grade: 'Sahih',
    explanation: 'This hadith emphasizes the great reward for those who seek knowledge.'
  },
  {
    id: 'bukhari-5',
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    translation: 'A Muslim is one from whose tongue and hand other Muslims are safe.',
    collection: 'Sahih al-Bukhari',
    reference: 'Book 2, Hadith 9',
    narrator: 'Abdullah ibn Amr',
    topics: ['character', 'safety', 'community'],
    grade: 'Sahih',
    explanation: 'This hadith defines a true Muslim as one who causes no harm to others through words or actions.'
  }
];

// Topics extracted from sample hadiths
export const sampleTopics = [
  {
    id: 'intentions',
    name: 'Intentions & Sincerity',
    description: 'Hadiths about the importance of intentions and sincerity in actions',
    hadithCount: 3,
    hadithIds: ['bukhari-1', 'muslim-2', 'muslim-1']
  },
  {
    id: 'faith',
    name: 'Faith & Belief',
    description: 'Core teachings about Islamic faith and belief',
    hadithCount: 5,
    hadithIds: ['bukhari-2', 'tirmidhi-1', 'bukhari-3', 'muslim-3', 'bukhari-4']
  },
  {
    id: 'knowledge',
    name: 'Knowledge & Learning',
    description: 'Hadiths encouraging seeking and sharing knowledge',
    hadithCount: 2,
    hadithIds: ['abudawud-1', 'abudawud-2']
  },
  {
    id: 'character',
    name: 'Character & Ethics',
    description: 'Teachings on moral character and ethical behavior',
    hadithCount: 5,
    hadithIds: ['muslim-1', 'muslim-2', 'tirmidhi-1', 'tirmidhi-2', 'bukhari-5']
  },
  {
    id: 'worship',
    name: 'Worship & Practice',
    description: 'Hadiths about acts of worship and religious practices',
    hadithCount: 2,
    hadithIds: ['bukhari-2', 'bukhari-4']
  },
  {
    id: 'speech',
    name: 'Speech & Communication',
    description: 'Guidance on proper speech and communication',
    hadithCount: 2,
    hadithIds: ['muslim-3', 'bukhari-5']
  }
];
