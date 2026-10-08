(()=>{
if(!/(^|\.)astro\.space$/i.test(location.hostname)){alert('ASTROの画面で起動してください');return;}
const old=document.getElementById('astro15-v09');if(old){old.remove();return;}
const root=document.createElement('aside');root.id='astro15-v09';root.style.cssText='position:fixed;right:9px;top:43%;z-index:2147483647;width:254px;max-width:79vw;color:#fff;background:#07192ff5;border:2px solid #48dcfa;border-radius:16px;font:13px -apple-system,sans-serif;box-shadow:0 12px 30px #0009;overflow:hidden';
root.innerHTML='<div id="as-head" style="background:#165071;padding:10px 12px;font-weight:750;touch-action:none">15秒研究室｜取得診断 <button id="as-close" style="float:right;background:transparent;color:#fff;border:0;font-size:20px">×</button></div><div style="padding:13px"><div id="as-price" style="font-size:34px;font-weight:800;font-variant-numeric:tabular-nums">---.---</div><div id="as-status" style="font-weight:750;color:#ff9aaf">価格を検索中</div><div id="as-delta" style="color:#90dbf3;margin-top:9px">3秒 --- / 15秒 ---</div><div id="as-msg" style="line-height:1.6;margin-top:9px;font-size:11px;color:#c1d5e6">HTML・SVG・分割テキストを検査中</div><button id="as-diag" style="margin-top:10px;padding:9px;width:100%;border-radius:9px;color:#fff;background:#215985;border:1px solid #48dcfa">原因を診断する</button><div id="as-result" style="margin-top:8px;white-space:pre-wrap;font-size:10px;color:#d5e4f4"></div></div>';
document.body.append(root);
const $=s=>root.querySelector('#as-'+s), logs=[], rx=/(\d{2,3})[.．](\d{3})/g;
let previous=null,lastChange=Date.now(),firstStable=null,fail=0,scanInfo={};
function css(el){try{return getComputedStyle(el)}catch{return null}}
function rectOf(el){const rect=el.getBoundingClientRect();return rect&&rect.width&&rect.height?rect:null}
function seek(){
 const vw=innerWidth,vh=innerHeight,items=[],all=[...document.querySelectorAll('body *')],canvases=all.filter(x=>x.tagName==='CANVAS');let visibleMatches=0;
 for(const el of all){
  if(root.contains(el)||el===root)continue;
  const tag=el.tagName;if(['SCRIPT','STYLE','NOSCRIPT','INPUT','TEXTAREA','OPTION'].includes(tag))continue;
  const r=rectOf(el);if(!r||r.top<vh*.09||r.top>vh*.60||r.bottom<0||r.left>vw||r.right<0)continue;
  const st=css(el);if(!st||st.visibility==='hidden'||st.display==='none'||Number(st.opacity)===0)continue;
  let str=String(el.textContent||'').replace(/[\s\u200b\u200e\u200f]/g,'').replace(/[−＋]/g,'-');
  if(str.length>55)continue;
  const matches=[...str.matchAll(rx)];if(!matches.length)continue;
  visibleMatches+=matches.length;
  const descendants=[...el.children];if(descendants.some(c=>{const text=(c.textContent||'').replace(/\s/g,'');return /\d{2,3}[.．]\d{3}/.test(text)&&text.length<35}))continue;
  let size=parseFloat(st.fontSize)||0;
  for(const ch of el.querySelectorAll('*')){const childS=css(ch);if(childS)size=Math.max(size,parseFloat(childS.fontSize)||0)}
  const mx=(r.left+r.right)/2,my=(r.top+r.bottom)/2;
  const posPenalty=Math.abs(mx-vw*.50)*.24+Math.abs(my-vh*.245)*.29;
  if(size<23)continue;
  const score=size*3.5-posPenalty-(str.length-7)*.5;
  for(const m of matches){const v=Number(m[1]+'.'+m[2]);if(v<50||v>300)continue;items.push({el,value:v,score,size,rect:r,tag})}
 }
 items.sort((a,b)=>b.score-a.score);
 scanInfo={elements:all.length,canvases:canvases.length,htmlMatches:visibleMatches,candidates:items.length,top:items.slice(0,3).map(x=>x.value.toFixed(3)+'/'+x.tag+'/'+Math.round(x.size))};
 return items[0]||null;
}
function ago(dt,now){const t=now-dt;for(let i=logs.length-1;i>=0;i--)if(logs[i].t<=t)return now-dt-logs[i].t<1100?logs[i].v:null;return null}
function loop(){if(!root.isConnected){clearInterval(timer);return}const now=Date.now(),cand=seek();if(!cand){fail++;if(fail>2){$('price').textContent='---.---';$('status').textContent='取得できません';$('status').style.color='#ff9aaf';$('delta').textContent='3秒 --- / 15秒 ---';$('msg').textContent=scanInfo.canvases?'Canvasが '+scanInfo.canvases+' 個あります。数字が画像描画ならHTMLから読み取れません。':'HTMLに価格候補が見つかりません。診断を押して確認してください。'}return}
 fail=0;const v=cand.value;
 if(previous!==null&&Math.abs(v-previous)>.5){$('status').textContent='異常な価格差：監視停止';$('msg').textContent='誤った価格の可能性があります。診断を押してください。';logs.length=0;previous=null;return}
 if(previous!==v){previous=v;lastChange=now;firstStable=null} else if(!firstStable)firstStable=now;
 logs.push({t:now,v});while(logs.length&&now-logs[0].t>32000)logs.shift();
 $('price').textContent=v.toFixed(3);$('status').textContent=firstStable?'価格取得中':'価格を確認中';$('status').style.color='#4de3b4';
 const d=ms=>{const p=ago(ms,now);return p===null?'---':(v-p>=0?'+':'')+(v-p).toFixed(3)};
 $('delta').textContent='3秒 '+d(3000)+' / 15秒 '+d(15000);
 $('msg').textContent=now-lastChange>7000?'7秒以上価格変化なし。更新停止の可能性があります。':'ASTRO画面の表示価格を追跡。予測の的中率は未検証です。';
}
const timer=setInterval(loop,450);loop();
$('diag').onclick=()=>{$('result').textContent='HTML候補 '+scanInfo.htmlMatches+'件／採用可能 '+scanInfo.candidates+'件\nCanvas '+scanInfo.canvases+'個／DOM '+scanInfo.elements+'要素\n上位 '+scanInfo.top.join(' , ')+'\n判定: '+(scanInfo.candidates?'数字の選択条件を確認':'DOMから価格を読み取れない可能性')};
$('close').onclick=()=>{clearInterval(timer);root.remove()};
let drag=null;const head=$('head');head.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=root.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};head.setPointerCapture(e.pointerId)});head.addEventListener('pointermove',e=>{if(!drag)return;root.style.left=Math.max(0,Math.min(innerWidth-70,drag.left+e.clientX-drag.x))+'px';root.style.top=Math.max(40,Math.min(innerHeight-70,drag.top+e.clientY-drag.y))+'px';root.style.right='auto'});head.addEventListener('pointerup',()=>drag=null);
})();