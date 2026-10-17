// About-screen and contact content in the page's language (English: profile.en.js, Chinese: profile.zh.js).
import * as en from './profile.en.js';
import * as zh from './profile.zh.js';
import { LANG } from '../i18n.js';

export const { PROFILE, JOURNEY, SKILLS, EDUCATION, HIGHLIGHTS } = LANG === 'zh' ? zh : en;
