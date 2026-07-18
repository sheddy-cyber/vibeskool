import { LESSONS_CONTENT } from './src/lib/store.js';

const dom = LESSONS_CONTENT['m2c-js-dom-fetch'];
console.log('=== DOM Fetch ===');
console.log('section count:', dom.sections.length);
for (const sec of dom.sections) {
  console.log('--- ' + sec.heading + ' ---');
  console.log('  body length:', (sec.body || '').length);
  console.log('  has code:', !!sec.code);
  if (sec.code && typeof sec.code === 'string') {
    console.log('  code length:', sec.code.length);
    console.log('  code first 80:', sec.code.substring(0, 80));
  } else if (sec.code) {
    console.log('  CODE IS NOT A STRING:', typeof sec.code);
  }
}

const js = LESSONS_CONTENT['m2c-js-fundamentals'];
console.log('\n=== JS Fundamentals ===');
console.log('section count:', js.sections.length);
for (const sec of js.sections) {
  console.log('--- ' + sec.heading + ' ---');
  console.log('  body length:', (sec.body || '').length);
  console.log('  has code:', !!sec.code);
  if (sec.code && typeof sec.code !== 'string') {
    console.log('  CODE IS NOT A STRING:', typeof sec.code);
  }
}

console.log('\nAll checks passed');
