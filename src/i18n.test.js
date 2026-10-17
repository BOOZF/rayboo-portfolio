import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localize } from './i18n.js';

const door = {
  id:'x', title:'Bank Credit-Paper AI', color:'#ff7fc8', tags:['Banking'],
  chapters:[{ title:'The Impact', images:[{ src:'/a.webp', alt:'Chart', kind:'wide' }],
    diagram:{ type:'bars', rows:[{ label:'Extraction', value:80 }, { label:'Matching', value:92, display:'90%+' }] } }],
};

test('translated words replace the English, while images, colours and numbers stay from the original', () => {
  const zh = localize(door, { title:'银行信贷文件 AI', tags:['银行'], chapters:[{ title:'成果', images:[{ alt:'图表' }], diagram:{ rows:[{ label:'抽取' }, { label:'匹配' }] } }] });
  assert.equal(zh.title, '银行信贷文件 AI');
  assert.deepEqual(zh.tags, ['银行']);
  assert.equal(zh.color, '#ff7fc8');
  assert.deepEqual(zh.chapters[0].images[0], { src:'/a.webp', alt:'图表', kind:'wide' });
  assert.deepEqual(zh.chapters[0].diagram, { type:'bars', rows:[{ label:'抽取', value:80 }, { label:'匹配', value:92, display:'90%+' }] });
});

test('anything without a translation keeps its English text', () => {
  assert.deepEqual(localize(door, undefined), door);
  assert.equal(localize(door, { title:'银行' }).chapters[0].title, 'The Impact');
});
