// Run after npm install with a local preview; optionally pass the full game URL.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const base = process.argv[2] || 'http://127.0.0.1:4175/apps/games/Random%20Event%20Dice/index.html';
const out = fileURLToPath(new URL('../output/playwright/dice-3d', import.meta.url));
fs.mkdirSync(out, {recursive:true});
const browser = await chromium.launch({channel:process.env.DICE_BROWSER_CHANNEL || 'chrome',headless:true});
const checks=[]; const errors=[];
async function check(name, fn) { await fn(); checks.push(name); console.log('PASS',name); }
async function setup(options={}) {
 const context=await browser.newContext({viewport:{width:390,height:844},...options});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-15T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-15T12:00:01Z'));
 await page.goto(base);
 await page.evaluate(()=>{game.settings.eventDefinitions=[];game.updateSettings('seed',42);game.settings.soundEnabled=false;});
 return {page,context};
}
const state=p=>p.evaluate(()=>JSON.parse(render_game_to_text()));
try {
 let {page:p,context:c}=await setup();
 await check('3D default and six physical faces per die', async()=>{
  assert.equal((await state(p)).display,'3d'); assert.equal(await p.locator('.die-face').count(),12);
 });
 await p.locator('#start-btn').click();
 const expected=await p.evaluate(()=>game.samplePool.samples.slice(0,12));
 await check('Result and analytics wait for the 650ms landing',async()=>{
  await p.locator('[data-dice-display="3d"]').click();assert.equal((await state(p)).totalRolls,0);
  await p.clock.runFor(649);assert.equal((await state(p)).totalRolls,0);
  await p.clock.runFor(1);assert.deepEqual((await state(p)).dice,expected[0]);assert.equal((await state(p)).totalRolls,1);
 });
 await check('Next roll starts on the configured one-second cadence',async()=>{
  await p.clock.runFor(349);assert.equal((await state(p)).state,'settled');
  await p.clock.runFor(1);assert.equal((await state(p)).state,'rolling');
  await p.clock.runFor(650);assert.deepEqual((await state(p)).dice,expected[1]);
 });
 await check('All six results put the matching face toward the viewer',async()=>{
  for(let value=1;value<=6;value++) {
   const front=await p.evaluate(value=>{game.diceDisplay.settle([value,value]);const cube=document.querySelector('.die-cube');const face=cube.querySelector('.face-'+value);const matrix=new DOMMatrix(getComputedStyle(cube).transform).multiply(new DOMMatrix(getComputedStyle(face).transform));return matrix.m33;},value);
   assert.ok(front>.999);
  }
 });
 await p.locator('#stop-btn').click();
 await check('Pause freezes a pending roll; resume reveals it once',async()=>{
  await p.locator('#start-btn').click();await p.clock.runFor(200);await p.locator('#start-btn').click();
  assert.equal((await state(p)).state,'paused');
  await p.clock.runFor(5000);assert.equal((await state(p)).totalRolls,0);
  const playStates=await p.evaluate(()=>game.diceDisplay.animations.map(a=>a.playState));assert.ok(playStates.every(s=>s==='paused'));
  await p.locator('#start-btn').click();await p.clock.runFor(449);assert.equal((await state(p)).totalRolls,0);
  await p.clock.runFor(1);assert.equal((await state(p)).totalRolls,1);assert.deepEqual((await state(p)).dice,expected[0]);
 });
 await check('Stop cancels pending reveal and event callbacks',async()=>{
  await p.clock.runFor(350);assert.equal((await state(p)).state,'rolling');
  await p.locator('#stop-btn').click();const stopped=await state(p);await p.clock.runFor(5000);
  assert.deepEqual(await state(p),stopped);assert.equal(await p.locator('.is-rolling').count(),0);
 });
 await check('Event appears only at landing; reset hold survives pause/resume',async()=>{
  await p.evaluate(()=>{game.settings.eventDefinitions=[{rules:[]}];game.settings.resetDuration=1000;});
  await p.locator('#start-btn').click();await p.clock.runFor(649);assert.equal((await state(p)).event,false);
  await p.clock.runFor(1);assert.equal((await state(p)).event,true);assert.equal((await state(p)).totalRolls,1);
  await p.clock.runFor(200);await p.locator('#start-btn').click();await p.clock.runFor(5000);
  assert.equal((await state(p)).totalRolls,1);assert.equal((await state(p)).event,true);
  await p.locator('#start-btn').click();await p.clock.runFor(799);assert.equal((await state(p)).event,true);
  await p.clock.runFor(1);assert.equal((await state(p)).state,'settled');await p.clock.runFor(350);assert.equal((await state(p)).state,'rolling');await p.clock.runFor(650);assert.equal((await state(p)).totalRolls,2);
 });
 await p.locator('#stop-btn').click();
 await check('2D reveals instantly at 100ms intervals without lost samples',async()=>{
  await p.locator('[data-dice-display="2d"]').click();
  await p.evaluate(()=>{game.settings.eventDefinitions=[];game.updateSettings('interval',100);});
  await p.locator('#start-btn').click();assert.deepEqual((await state(p)).dice,expected[0]);
  await p.clock.runFor(900);assert.equal((await state(p)).totalRolls,10);assert.deepEqual((await state(p)).dice,expected[9]);
  assert.equal(await p.locator('.die-face').count(),0);assert.equal(await p.locator('.is-rolling').count(),0);
 });
 await p.locator('#stop-btn').click();
 await check('2D preference survives reload',async()=>{await p.reload();assert.equal((await state(p)).display,'2d');});
 await p.locator('[data-dice-display="3d"]').click();
 await p.evaluate(()=>{game.settings.eventDefinitions=[];game.updateSettings('seed',42);game.updateSettings('interval',100);});
 await check('3D also settles at 100ms cadence with the same seeded results',async()=>{
  await p.locator('#start-btn').click();await p.clock.runFor(972);
  assert.equal((await state(p)).totalRolls,10);assert.deepEqual((await state(p)).dice,expected[9]);
 });
 await p.locator('#stop-btn').click();
 await check('Changing to 2D mid-roll commits that sample exactly once',async()=>{
  await p.evaluate(()=>game.updateSettings('interval',1000));await p.locator('#start-btn').click();await p.clock.runFor(200);
  await p.locator('[data-dice-display="2d"]').click();assert.equal((await state(p)).totalRolls,1);
  await p.clock.runFor(799);assert.equal((await state(p)).totalRolls,1);
  await p.clock.runFor(1);assert.equal((await state(p)).totalRolls,2);
 });
 await p.locator('#stop-btn').click();
 await check('Ten custom-sided numbered blocks support results up to 100',async()=>{
  await p.locator('[data-dice-display="3d"]').click();
  await p.evaluate(()=>{game.updateSettings('diceCount',10);game.updateSettings('diceSides',100);game.samplePool.samples[0]=Array(10).fill(100);game.diceValues=Array(10).fill(100);game.renderDice();});
  assert.equal(await p.locator('.die-3d').count(),10);assert.equal(await p.locator('.numbered-face').count(),60);
  assert.ok((await p.locator('#dice-display-hint').textContent()).includes('numbered'));
  await p.setViewportSize({width:320,height:740});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:out+'/custom-320.png',fullPage:true});
 });
 await c.close();
 ({page:p,context:c}=await setup({reducedMotion:'reduce'}));
 await check('Reduced motion retains 3D without tumbling or a reveal delay',async()=>{
  await p.locator('#start-btn').click();assert.equal((await state(p)).totalRolls,1);
  assert.equal(await p.locator('.die-3d').count(),2);assert.equal(await p.evaluate(()=>game.diceDisplay.animations.length),0);
 });
 await c.close();
 ({page:p,context:c}=await setup());
 await check('Skip completes the in-flight sample before the remaining pool',async()=>{
  await p.evaluate(()=>{game.samplePool.samples=game.samplePool.samples.slice(0,8);});
  await p.locator('#start-btn').click();await p.clock.runFor(100);await p.evaluate(()=>game.skipToEnd());
  assert.equal((await state(p)).totalRolls,8);assert.equal((await state(p)).state,'idle');
  await p.clock.runFor(5000);assert.equal((await state(p)).totalRolls,8);
 });
 await check('Expired game cancels pending motion and can extend',async()=>{
  await p.evaluate(()=>{game.startGame();game.handleGameExpired();});await p.clock.runFor(1000);
  assert.equal((await state(p)).state,'idle');assert.equal(await p.locator('.is-rolling').count(),0);
  await p.locator('#extend-btn').click();assert.equal((await state(p)).state,'rolling');assert.equal((await state(p)).remainingSeconds,600);
 });
 await c.close();
 ({page:p,context:c}=await setup());
 await check('Rapid repeated event holds preserve interval and active countdown',async()=>{
  await p.locator('[data-dice-display="2d"]').click();
  await p.evaluate(()=>{game.settings.duration=1;game.updateSettings('interval',100);game.settings.resetDuration=100;game.settings.eventDefinitions=[{rules:[]}];});
  await p.locator('#start-btn').click();await p.clock.runFor(10000);
  assert.equal((await state(p)).totalRolls,51);assert.equal((await state(p)).remainingSeconds,55);
 });
 await c.close();
 ({page:p,context:c}=await setup());
 await check('Pausing before an event landing preserves the remaining interval afterward',async()=>{
  await p.evaluate(()=>{game.settings.eventDefinitions=[{rules:[]}];game.settings.resetDuration=1000;});
  await p.locator('#start-btn').click();await p.clock.runFor(200);await p.locator('#start-btn').click();
  await p.clock.runFor(5000);await p.locator('#start-btn').click();await p.clock.runFor(450);
  assert.equal((await state(p)).state,'event');await p.clock.runFor(1000);assert.equal((await state(p)).state,'settled');
  await p.clock.runFor(349);assert.equal((await state(p)).state,'settled');await p.clock.runFor(1);assert.equal((await state(p)).state,'rolling');
 });
 await c.close();
 // Real-time browser pass for motion, themes, viewport layouts, and keyboard control.
 c=await browser.newContext({viewport:{width:390,height:844}});p=await c.newPage();
 p.on('pageerror',e=>errors.push(e.message));await p.goto(base);
 await p.evaluate(()=>{game.settings.eventDefinitions=[];game.updateSettings('seed',42);game.settings.soundEnabled=false;});
 await check('Real-time tumble changes transform and lands on the result',async()=>{
  await p.locator('#start-btn').click();await p.waitForTimeout(100);
  const first=await p.locator('.die-cube').first().evaluate(e=>getComputedStyle(e).transform);
  await p.screenshot({path:out+'/rolling-390.png',fullPage:true});await p.waitForTimeout(80);
  const second=await p.locator('.die-cube').first().evaluate(e=>getComputedStyle(e).transform);assert.notEqual(first,second);
  await p.waitForFunction(()=>game.analytics.totalRolls>=1);await p.locator('#start-btn').click();
  await p.screenshot({path:out+'/settled-light-390.png',fullPage:true});
 });
 await p.locator('#stop-btn').click();
 await check('Light/dark at 320, 390, 1440 remain contained with 44px mode controls',async()=>{
  for(const width of [320,390,1440]) for(const theme of ['light','dark']) {
   await p.setViewportSize({width,height:900});await p.locator('#appearance-select').selectOption(theme);await p.waitForTimeout(100);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const buttons=await p.locator('[data-dice-display]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));assert.ok(buttons.every(h=>h>=44));
   if(width!==320) await p.screenshot({path:out+`/settled-${theme}-${width}.png`,fullPage:true});
  }
 });
 await check('Mode control works with keyboard and has visible focus',async()=>{
  const mode=p.locator('[data-dice-display="2d"]');await mode.focus();await p.keyboard.press('Enter');
  assert.equal((await state(p)).display,'2d');assert.equal(await mode.getAttribute('aria-pressed'),'true');
  assert.notEqual(await mode.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  await p.setViewportSize({width:320,height:740});await p.screenshot({path:out+'/fast-2d-dark-320.png',fullPage:true});
 });
 await check('200% text zoom preserves control and page width',async()=>{
  await p.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 });
 await c.close();
 assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/verification.json',JSON.stringify({checks,errors},null,2));
 console.log(JSON.stringify({passed:checks.length,errors}));
} finally { await browser.close(); }
