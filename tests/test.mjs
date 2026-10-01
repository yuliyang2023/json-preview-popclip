import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.join(root, 'JSONPreview.popclipext');
const template = fs.readFileSync(path.join(pkg, 'preview.html'), 'utf8');
function page(source, html = template.replace('__JSON_BASE64__', Buffer.from(source).toString('base64'))) {
  function element() {
    return { children: [], style: {}, value: '2', textContent: '',
      append(...nodes) { this.children.push(...nodes); },
      replaceChildren(...nodes) { this.children = nodes; },
      addEventListener(name, fn) { this[name] = fn; } };
  }
  const nodes = Object.fromEntries(['indent','code','status','error','main'].map(id => [id, element()]));
  const document = { getElementById: id => nodes[id], querySelector: id => nodes[id],
    createElement: element, createDocumentFragment: element, createTextNode: text => ({textContent:text}) };
  const context = vm.createContext({document, TextDecoder, TextEncoder, Uint8Array, atob});
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  return {context, nodes};
}
for (const source of ['{}','[]','true','false','null','-12.5e+3','"中文😀"','{"a":[{},[],{"b":[1,2]}],"c":null}']) {
  const {context, nodes} = page(source);
  assert.equal(nodes.error.textContent, '');
  for (const spaces of [2,4]) {
    const result = vm.runInContext(`formatTokens(tokenize(source),${spaces}).join("\\n")`, context);
    assert.deepEqual(JSON.parse(result), JSON.parse(source));
  }
  nodes.indent.value = '4'; nodes.indent.change();
  assert.match(nodes.status.textContent, /行/);
}
const precise = '{"n":9007199254740993123,"n":1e+99,"negative":-0,"escaped":"\\u4f60"}';
const formatted = vm.runInContext('formatTokens(tokenize(source),2).join("\\n")', page(precise).context);
for (const token of ['9007199254740993123','1e+99','-0','\\u4f60']) assert(formatted.includes(token));
assert.equal((formatted.match(/"n"/g)||[]).length, 2);
for (const source of ['', '{"a":}', '[1,]', '{"a":1} trailing', '{/*comment*/}', 'NaN']) {
  const {nodes} = page(source);
  assert.equal(nodes.main.hidden, true); assert.equal(nodes.indent.disabled, true);
  assert.match(nodes.error.textContent, /无法解析/);
}
const malicious = '{"text":"</script><img src=x onerror=alert(1)> 中文😀 ` $(echo unsafe)"}';
const rendered = template.replace('__JSON_BASE64__', Buffer.from(malicious).toString('base64'));
assert.equal((rendered.match(/<script>/g)||[]).length, 1);
assert.equal((rendered.match(/<\/script>/g)||[]).length, 1);
assert(!rendered.includes('<img'));
assert.equal(vm.runInContext('source', page(malicious).context), malicious);
const config = JSON.parse(fs.readFileSync(path.join(pkg, 'Config.json'), 'utf8'));
for (const item of [config, ...config.actions]) { assert(!('before' in item)); assert(!('after' in item)); }
const shell = spawnSync('/bin/sh', ['-n', path.join(pkg, 'preview.sh')], {encoding:'utf8'});
assert.equal(shell.status, 0, shell.stderr);
if (process.platform === 'darwin') {
  const run = spawnSync('/usr/bin/osascript', ['-l','JavaScript',path.join(pkg,'render.js'),path.join(pkg,'preview.html')], {
    encoding:'utf8', env:{...process.env, POPCLIP_TEXT:malicious} });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(vm.runInContext('source',page(malicious,run.stdout).context),malicious);
  console.log('PASS macOS JXA renderer / UTF-8 / safe embedding');
}
console.log('PASS formatting / precision / duplicate keys / invalid JSON / indentation / HTML isolation / clipboard config / shell syntax');
