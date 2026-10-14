// Bubble order = career order: CMG first, then Huawei. Add or reorder doors here only.
import fnbChatbot from './fnbChatbot.js';
import agentBuilder from './agentBuilder.js';
import madamKwan from './madamKwan.js';
import runForPeace from './runForPeace.js';
import mygov from './mygov.js';
import scada from './scada.js';
import ambank from './ambank.js';
import salesIntel from './salesIntel.js';

export const DOORS = [fnbChatbot, agentBuilder, madamKwan, runForPeace, mygov, scada, ambank, salesIntel]
  .map((d, i) => ({ ...d, num:String(i + 1).padStart(2, '0') }));
