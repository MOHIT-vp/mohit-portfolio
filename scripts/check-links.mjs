#!/usr/bin/env node
/**
 * Request every external link in the content file and report its HTTP status.
 * LinkedIn and X often refuse automated requests (999 / 403); those are reported
 * as "blocked for bots" rather than broken, and need a manual click to confirm.
 */
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../src/content/site.ts', import.meta.url), 'utf8');
const urls = [...new Set([...src.matchAll(/https:\/\/[^'"\s)]+/g)].map((m) => m[0]))];
const botWalled = /linkedin\.com|x\.com/;

let broken = 0;
for (const url of urls) {
  let status;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (link check)' } });
    status = res.status;
  } catch (e) {
    status = `error ${e.cause?.code ?? e.message}`;
  }
  const ok = status === 200;
  const walled = !ok && botWalled.test(url);
  if (!ok && !walled) broken++;
  console.log(`${ok ? 'OK     ' : walled ? 'BOTWALL' : 'BROKEN '} ${status}  ${url}`);
}
console.log(broken ? `\n${broken} broken` : '\nno broken links');
process.exit(broken ? 1 : 0);
