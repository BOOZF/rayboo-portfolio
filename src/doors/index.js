// Bubble order = career order: first job first, then the current one. Add or reorder doors here only.
import fnbChatbot from './fnbChatbot.js';
import agentBuilder from './agentBuilder.js';
import madamKwan from './madamKwan.js';
import runForPeace from './runForPeace.js';
import mygov from './mygov.js';
import scada from './scada.js';
import ambank from './ambank.js';
import salesIntel from './salesIntel.js';
import ZH from './zh.js';
import { LANG, localize } from '../i18n.js';

export const DOORS = [fnbChatbot, agentBuilder, madamKwan, runForPeace, mygov, scada, ambank, salesIntel]
  .map((d, i) => ({ ...(LANG === 'zh' ? localize(d, ZH[d.id]) : d), num:String(i + 1).padStart(2, '0') }));
