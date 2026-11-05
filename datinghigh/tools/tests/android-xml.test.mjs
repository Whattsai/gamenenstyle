import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decodeXmlAttribute} from '../../tests/e2e/android/support.mjs';

test('native XML labels decode decimal and hexadecimal emoji once without treating escaped entities as markup',()=>{
 assert.equal(decodeXmlAttribute('&#128274; AI 客製化（目前免費）'),'🔒 AI 客製化（目前免費）');
 assert.equal(decodeXmlAttribute('&#x1F512; &lt; &gt; &apos; &quot; &amp;'),'🔒 < > \' " &');
 assert.equal(decodeXmlAttribute('&amp;quot; &amp;#128274;'),'&quot; &#128274;');
 assert.equal(decodeXmlAttribute('&#1114112; &#xD800;'),'&#1114112; &#xD800;');
});
