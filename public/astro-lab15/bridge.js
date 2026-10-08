/* ASTRO 15秒研究室 — Safari on-page quote observer. Locally reads only visible text. No API/orders/network. */
(() => {
 'use strict';
 if(!/(^|\.)astro\.space$/i.test(location.hostname)){
   alert('ASTROのWebページを開いてから実行してください。');return;
 }
 if(window.__astro15Bridge){window.__astro15Bridge.toggle();return;}
 const KEY='astro15_visual_bridge_v1';
 const tnow=()=>Date.now(),rnd=n=>Math.round(n*1000)/1000;
 const max=(n,a,b)=>Math.min(b,Math.max(a,n));
 const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const parsed=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}})();
 const ticks=[], forecasts=[], trades=Array.isArray(parsed.trades)?parsed.trades.slice(-250):[];
 const app={start:tnow(),current:null,lastChanged:0,lastRead:0,hold:0,enabled:false,visible:true,matched:0,locked:false,picking:false,source:'auto',misses:0};
 const root=document.createElement('div');root.id='astro15-visual-bridge';root.style.cssText='position:fixed;z-index:2147483635;top:40vh;right:8px;width:min(245px,67vw);touch-action:none';
 const sh=root.attachShadow({mode:'open'});
 sh.innerHTML=`<style>
 :host{all:initial}*{box-sizing:border-box}article{font:13px/1.45 -apple-system,BlinkMacSystemFont,"Hiragino Sans",sans-serif;color:#f4f8ff;background:#081827f5;border:1px solid #397ca3;border-radius:16px;box-shadow:0 10px 33px #000a;overflow:hidden;backdrop-filter:blur(10px)}header{background:#123652;padding:9px 10px;display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:move;touch-action:none}header b{font-size:13px}button{font:inherit;cursor:pointer;border-radius:7px;border:1px solid #42708a;background:#1d4260;color:#fff;padding:5px 8px;min-height:29px}.hdrbtn{padding:1px 7px;min-height:27px}main{padding:10px}.price{font:750 26px/1.1 -apple-system,BlinkMacSystemFont,monospace;letter-spacing:.01em}.meta{font-size:11px;color:#a4cde4;margin:4px 0 8px}.state{font-weight:850;text-align:center;border-radius:10px;padding:10px 4px;font-size:21px;color:#f8db8d;background:#4a3925}.state.up{color:#67f8c9;background:#0a4138}.state.down{color:#ff94a5;background:#522d3d}.reason{font-size:12px;color:#d7e7f3;line-height:1.45;margin-top:7px}.stats{display:flex;gap:5px;margin:7px 0}.stat{flex:1;background:#112d44;border-radius:8px;padding:6px 3px;text-align:center;font-size:11px}.stat b{font-size:13px;display:block}.actions{display:flex;gap:5px;margin-top:7px}.actions button{flex:1;min-width:0;font-size:11px;padding:7px 3px}.note{border-top:1px solid #35556c;margin-top:8px;padding-top:6px;color:#a9c4db;font-size:10px}.toggle{display:flex;align-items:center;gap:5px;font-size:11px;margin-top:8px}.toggle input{accent-color:#36dfaf}.mini{padding:9px 10px;display:flex;align-items:center;justify-content:space-between}.mini span{color:#f8d88a}.hidden{display:none!important}.bad{color:#ff9baf}.good{color:#7df1c7}.draw{height:12px;width:12px;border-radius:4px;background:#1b546a}.feedback{display:flex;gap:4px;margin-top:7px}.feedback button{flex:1;font-size:11px}#info{display:none;white-space:pre-wrap;font-size:10px;line-height:1.6;margin-top:5px;background:#102941;padding:6px;border-radius:7px}</style>
 <article><header id='drag'><b>◈ ASTRO 15秒研究室</b><div><button class='hdrbtn' id='mini'>－</button><button class='hdrbtn' id='close'>×</button></div></header><main id='main'><div class='price' id='price'>価格を検索中</div><div class='meta' id='fresh'>表示価格を確認しています</div><div id='state' class='state'>見送り</div><div id='reason' class='reason'>取得できるか確認中</div><div class='stats'><div class='stat'>3秒差<b id='m3'>--</b></div><div class='stat'>15秒差<b id='m15'>--</b></div><div class='stat'>参考検証<b id='metric'>0件</b></div></div><div class='actions'><button id='where'>価格を固定</button><button id='export'>CSV保存</button><button id='why'>状態確認</button></div><label class='toggle'><input type='checkbox' id='capture'/> 自分で押したHIGH/LOWだけ記録</label><div id='feedback' class='feedback hidden'><button id='win'>当たり</button><button id='lose'>はずれ</button></div><div id='info'></div><div class='note'>価格を固定するまでは検証を開始しません。表示値は約定・正式判定価格とは限りません。自動発注・外部送信なし。</div></main><div id='miniView' class='mini hidden'><span id='miniText'>見送り</span><button id='restore'>開く</button></div></article>`;
 document.body.appendChild(root);
 const $=id=>sh.getElementById(id);
 const show=(text,good=false)=>{$('reason').textContent=text;$('reason').className='reason '+(good?'good':'')};
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({trades:trades.slice(-250)}))}catch{}};
 const exportCsv=()=>{
  const rows=[['時刻','方向','開始表示価格','15秒後表示価格','参考判定','デモ実結果','価格取得元']];
  for(const r of trades) rows.push([new Date(r.at).toISOString(),r.dir,r.entry??'',r.end??'',r.result||'未確定',r.confirm||'未確認','画面DOM']);
  for(const r of forecasts)if(r.matured)rows.push([new Date(r.at).toISOString(),r.dir,r.entry,r.end,r.result,'参考検証','画面DOM']);
  const csv=rows.map(a=>a.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='astro15-'+new Date().toISOString().slice(0,10)+'.csv';root.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
 };
 const strictPrice=el=>{
  if(!el||!document.documentElement.contains(el)||root.contains(el))return null;
  const raw=(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ');
  const nums=[...raw.matchAll(/(?:^|[^\d])((?:\d{2,3})\.\d{3})(?!\d)/g)].map(x=>Number(x[1]));
  // One visible USD/JPY quote per selected element; reject a chart axis with many prices.
  if(nums.length!==1||raw.length>35||!(nums[0]>50&&nums[0]<300))return null;
  const style=getComputedStyle(el),rect=el.getBoundingClientRect();
  if(style.display==='none'||style.visibility==='hidden'||rect.width<5||rect.height<5||rect.right<0||rect.left>innerWidth||rect.top<0||rect.top>innerHeight)return null;
  return {price:nums[0],node:null,el,rect,size:parseFloat(style.fontSize)||12,score:99999};
 };
 const detector=()=>{
  if(app.locked){
   const q=strictPrice(app.selector);
   if(q)return q;
   app.misses++;return null;  // NEVER substitute a different number when the fixed element disappears.
  }
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node,best=null,bScore=-Infinity,count=0,cands=0;
  while((node=walker.nextNode())&&count++<2500){
   const el=node.parentElement;if(!el||root.contains(el))continue;
   const value=(node.textContent||'').trim();if(value.length>38||!value)continue;
   const matches=[...value.matchAll(/(?:^|[^\d])((?:\d{2,3})\.\d{3})(?!\d)/g)];if(!matches.length)continue;
   const st=getComputedStyle(el);if(st.display==='none'||st.visibility==='hidden'||+st.opacity===0)continue;
   const rg=document.createRange();rg.selectNodeContents(node);const rect=rg.getBoundingClientRect();if(rect.width<5||rect.height<5||rect.bottom<100||rect.top>innerHeight-100||rect.right<0||rect.left>innerWidth)continue;
   const size=Number.parseFloat(st.fontSize)||12;for(const m of matches){
    const price=Number(m[1]);if(!(price>50&&price<300))continue;cands++;
    const center=(rect.left+rect.right)/2;
    let score=size*4-Math.abs(center-innerWidth/2)*.14-Math.abs(rect.top-innerHeight*.29)*.018;
    if(rect.left>innerWidth*.75)score-=65;
    if(/(?:USD\s*\/\s*JPY|\u7c73\u30c9\u30eb)/i.test(el.parentElement?.innerText||''))score+=5;
    if(app.selector&&el===app.selector)score+=32;
    if(score>bScore){best={price,node,el,rect,size,score};bScore=score}
   }
  }
  // Fallback: prices rendered across multiple nested text spans.
  if(!best){
   const els=document.querySelectorAll('span,div,b,strong,p,h1,h2');let n=0;
   for(const el of els){if(n++>1300)break;if(root.contains(el))continue;
    const val=(el.textContent||'').trim();if(val.length>22||!/(?:\d{2,3})\.\d{3}/.test(val))continue;
    const st=getComputedStyle(el),size=parseFloat(st.fontSize)||12;
    const rect=el.getBoundingClientRect();if(size<18||rect.width<5||rect.height<5||rect.top<100||rect.top>innerHeight-100)continue;
    const m=val.match(/((?:\d{2,3})\.\d{3})(?!\d)/);if(!m)continue;
    const price=Number(m[1]);if(!(price>50&&price<300))continue;
    const center=(rect.left+rect.right)/2,score=size*4-Math.abs(center-innerWidth/2)*.14-Math.abs(rect.top-innerHeight*.29)*.018;
    cands++;if(score>bScore){best={price,node:null,el,rect,size,score};bScore=score}
   }
  }
  app.matched=cands;return best;
 };
 const selectPrice=()=>{
  const c=detector();if(c&&c.size>=18){app.selector=c.el;app.current=c.price;app.lastChanged=tnow();app.lastRead=tnow();return true}return false;
 };
 const sampleAt=(s)=>{
  const target=tnow()-s*1000;for(let i=ticks.length-1;i>=0;i--){if(ticks[i].t<=target&&target-ticks[i].t<1700)return ticks[i].p}return NaN;
 };
 const wilson=(w,n)=>{if(!n)return 0;const z=1.96,p=w/n;return (p+z*z/(2*n)-z*Math.sqrt((p*(1-p)+z*z/(4*n))/n))/(1+z*z/n)};
 const assess=()=>{
  const elapsed=(tnow()-app.start)/1000,age=tnow()-app.lastChanged;
  if(app.current===null)return ['見送り','ASTROの表示価格を検出できません。価格を選択してください。',''];
  if(age>1800)return ['見送り','価格の更新が停止中・取得間隔が不足',''];
  if(elapsed<90)return ['見送り','データ収集中：あと'+Math.ceil(90-elapsed)+'秒',''];
  const a=ticks.filter(x=>x.t>=tnow()-15000),rate=a.length/15;
  if(rate<.8)return ['見送り','15秒間の価格更新回数が足りません',''];
  const r3=app.current-sampleAt(3),r5=app.current-sampleAt(5),r10=app.current-sampleAt(10),r15=app.current-sampleAt(15);
  if(![r3,r5,r10,r15].every(Number.isFinite))return ['見送り','短期価格データが不足しています',''];
  const seq=[r3,r5,r10,r15],pos=seq.filter(x=>x>0.001).length,neg=seq.filter(x=>x<-.001).length;
  let path=0;for(let i=1;i<a.length;i++)path+=Math.abs(a[i].p-a[i-1].p);
  const chop=path/Math.max(.0005,Math.abs(a[a.length-1].p-a[0].p));
  if(chop>5)return ['見送り','細かい反転が多いレンジ',''];
  const long=Math.abs(r15)>0.030;if(long)return ['見送り','15秒間の価格変化が急激',''];
  const side=pos===4&&r5>.002?'上':neg===4&&r5<-.002?'下':null;
  if(!side)return ['見送り','3・5・10・15秒の方向が揃っていない',''];
  return ['見送り',side+'向きの動きが観測されています（参考傾向・精度未検証）',side];
 };
 let nextForecast=0;
 const onQuote=()=>{
  const now=tnow();if(document.hidden)return;
  const c=detector();app.lastRead=now;
  if(!c||c.size<18){app.current=null;return}
  if(!app.locked)app.selector=c.el;
  const price=rnd(c.price);
  if(app.current===price)return;
  app.current=price;app.lastChanged=now;ticks.push({t:now,p:price});
  while(ticks.length&&ticks[0].t<now-110000)ticks.shift();
  const [state,msg,side]=assess();
  if(!app.locked)return; // Auto-detected prices are for initial discovery only.
  if(side&&now>=nextForecast){forecasts.push({at:now,dir:side,entry:price,target:now+15000,matured:false});nextForecast=now+15000}
  for(const r of forecasts){if(r.matured||now<r.target)continue;
   if(now>r.target+1600){r.matured=true;r.invalid=true;continue}
   r.end=price;r.result=r.entry===price?'同値':r.dir===(price>r.entry?'上':'下')?'的中':'不的中';r.matured=true;
  }
  for(const r of trades){if(r.result||now<r.at+15000)continue;
   if(now>r.at+1600){r.result='検証不可';continue}
   r.end=price;r.result=r.entry===price?'同値':r.dir===(price>r.entry?'上':'下')?'参考的中':'参考不的中';
   app.hold=trades.indexOf(r);$('feedback').classList.remove('hidden');save();
  }
 };
 const render=()=>{
  const current=app.current,age=tnow()-app.lastChanged,rest=assess();
  $('price').textContent=current===null?'価格未検出':current.toFixed(3);
  $('fresh').textContent=current===null?(app.locked?'固定価格を読めません。価格を固定し直してください。':app.matched+'候補（未確認）'):'最終変化 '+(age/1000).toFixed(1)+'秒前 · '+(app.locked?'本人が指定した画面価格':'自動検出・未確認');
  $('state').textContent=rest[0];$('state').className='state';
  show(rest[1]);$('m3').textContent=Number.isFinite(sampleAt(3))&&current!==null?(current-sampleAt(3)).toFixed(3):'--';
  $('m15').textContent=Number.isFinite(sampleAt(15))&&current!==null?(current-sampleAt(15)).toFixed(3):'--';
  const good=forecasts.filter(x=>x.matured&&!x.invalid);const win=good.filter(x=>x.result==='的中').length;
  $('metric').textContent=good.length?(good.length+'件 / '+(win/good.length*100).toFixed(0)+'%'):'0件';
  $('miniText').textContent=(current===null?'価格なし':current.toFixed(3))+' · '+rest[0];
  $('info').textContent='価格検出方式 '+(app.locked?'本人がタップして固定':'自動候補・未確認')+'\nDOM候補 '+app.matched+'件\n固定対象の読取失敗 '+app.misses+'回\n履歴 '+ticks.length+'件\n15秒の参考検証 '+good.length+'件\n95%下限 '+(wilson(win,good.length)*100).toFixed(1)+'%\n※ ASTROの正式な約定・判定価格ではありません。';
 };
 let lastScan=0;
 const scan=()=>{if(document.hidden)return;const now=tnow();if(now-lastScan<180)return;lastScan=now;try{onQuote()}catch(e){$('info').textContent='抽出エラー: '+String(e).slice(0,120)}};
 const observer=new MutationObserver(scan);observer.observe(document.documentElement,{childList:true,characterData:true,subtree:true});
 const timer=setInterval(()=>{scan();render();if(!document.contains(root)&&document.body)document.body.appendChild(root)},500);
 const onClick=e=>{
  if(!app.enabled||root.contains(e.target))return;
  const el=e.target.closest('button,[role="button"]');if(!el)return;
  const word=(el.innerText||el.textContent||'').trim().toUpperCase();
  if(word!=='HIGH'&&word!=='LOW')return;
  if(app.current===null||tnow()-app.lastChanged>1800)return;
  trades.push({at:tnow(),dir:word==='HIGH'?'上':'下',entry:app.current,end:null,result:null,confirm:null});if(trades.length>250)trades.shift();save();
 };
 document.addEventListener('click',onClick,true);
 const finish=()=>{clearInterval(timer);observer.disconnect();document.removeEventListener('click',onClick,true);root.remove();delete window.__astro15Bridge};
 $('capture').onchange=()=>app.enabled=$('capture').checked;
 $('export').onclick=exportCsv;
 $('where').onclick=()=>{
  if(app.picking)return;
  app.picking=true;
  const cover=document.createElement('div');
  cover.setAttribute('role','dialog');cover.setAttribute('aria-label','USD/JPY価格を選択');
  cover.style.cssText='position:fixed;inset:0;z-index:2147483646;background:rgba(3,10,25,.12);cursor:crosshair;touch-action:manipulation';
  const instruction=document.createElement('div');
  instruction.textContent='ASTRO画面の大きなUSD/JPY価格を1回タップ（注文ボタンは押さない）';
  instruction.style.cssText='position:absolute;top:calc(env(safe-area-inset-top,0px) + 90px);left:12px;right:12px;background:#0a263d;color:white;text-align:center;padding:13px;border-radius:12px;font:600 13px/1.5 -apple-system,sans-serif;border:1px solid #4fe0ff';
  cover.appendChild(instruction);
  const cancel=document.createElement('button');cancel.textContent='中止';
  cancel.style.cssText='position:absolute;bottom:120px;left:35%;width:30%;padding:14px;border:0;border-radius:10px;color:white;background:#294561;font-size:16px';
  cover.appendChild(cancel);
  const done=()=>{cover.remove();app.picking=false};cancel.onclick=e=>{e.stopPropagation();done()};
  cover.addEventListener('click',e=>{
    if(e.target===cancel||e.target===instruction)return;
    e.stopPropagation();e.preventDefault();
    cover.style.pointerEvents='none';
    const target=document.elementFromPoint(e.clientX,e.clientY);
    cover.style.pointerEvents='auto';
    let picked=null,el=target;
    for(let level=0;el&&level<5;level++,el=el.parentElement){
      picked=strictPrice(el);if(picked&&picked.size>=16)break;
      picked=null;
    }
    done();
    if(!picked){
      app.misses++;
      alert('選択した場所から3桁のUSD/JPY価格を読めません。価格がCanvas描画の場合、ページの文字情報だけでは取得できません。');return;
    }
    app.selector=picked.el;app.locked=true;app.source='manual-tap';app.current=null;
    app.start=tnow();app.lastChanged=0;ticks.length=0;forecasts.length=0;nextForecast=0;
    onQuote();render();
    alert('監視価格を '+picked.price.toFixed(3)+' に固定しました。90秒間データを収集し、固定した数字だけを追跡します。');
  },{capture:true});
  document.body.appendChild(cover);
 };

 $('why').onclick=()=>$('info').style.display=$('info').style.display==='block'?'none':'block';
 $('mini').onclick=()=>{$('main').classList.add('hidden');$('miniView').classList.remove('hidden')};
 $('restore').onclick=()=>{$('main').classList.remove('hidden');$('miniView').classList.add('hidden')};
 $('close').onclick=finish;
 $('win').onclick=()=>{if(trades[app.hold])trades[app.hold].confirm='当たり';$('feedback').classList.add('hidden');save()};
 $('lose').onclick=()=>{if(trades[app.hold])trades[app.hold].confirm='はずれ';$('feedback').classList.add('hidden');save()};
 let dragging=null;
 $('drag').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging={x:e.clientX,y:e.clientY,top:root.offsetTop,left:root.getBoundingClientRect().left};$('drag').setPointerCapture(e.pointerId)});
 $('drag').addEventListener('pointermove',e=>{if(!dragging)return;root.style.left=max(dragging.left+e.clientX-dragging.x,0,innerWidth-root.offsetWidth)+'px';root.style.top=max(dragging.top+e.clientY-dragging.y,0,innerHeight-60)+'px';root.style.right='auto'});
 $('drag').addEventListener('pointerup',()=>dragging=null);
 window.__astro15Bridge={toggle:()=>root.style.display=root.style.display==='none'?'block':'none',stop:finish,diagnostics:()=>({version:'v0.4',locked:app.locked,current:app.current,candidates:app.matched,ticks:ticks.length,forecasts:forecasts.length,misses:app.misses,hostname:location.hostname})};
 onQuote();render();
})();