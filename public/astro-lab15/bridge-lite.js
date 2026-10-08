(function(){
'use strict';
if(!/(^|\.)astro\.space$/i.test(location.hostname)){alert('ASTROのページを表示してから実行してください');return;}
var old=document.getElementById('astro15-lite');
if(old){old.remove();return;}
var root=document.createElement('div');root.id='astro15-lite';
root.style.cssText='position:fixed;z-index:2147483647;top:13%;right:8px;width:230px;max-width:80vw;touch-action:none';
root.innerHTML='<section style="color:#fff;background:#061729f7;font:13px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;border:1px solid #48c7ff;border-radius:15px;box-shadow:0 10px 38px #000b;overflow:hidden"><header id="a15-head" style="padding:9px 10px;background:#174766;display:flex;justify-content:space-between;touch-action:none"><b>15秒研究室｜画面連動</b><button id="a15-close" style="border:0;background:transparent;color:white;font-size:18px">×</button></header><main style="padding:10px"><div id="a15-p" style="font-size:31px;font-weight:800;letter-spacing:1px">---.---</div><div id="a15-state" style="font-weight:800;color:#ffcb66">未接続</div><p id="a15-msg" style="font-size:12px;color:#bed2e6;margin:6px 0">価格を選択し、ASTROの中央の大きな数字をタップ</p><div id="a15-delta" style="font-size:12px;padding:5px 0;color:#8fe9ed">3秒差 --- ｜15秒差 ---</div><button id="a15-pick" style="background:#226cba;color:white;border:0;border-radius:9px;padding:10px;width:100%;font-weight:800;font-size:13px">① 価格を選択する</button><div style="color:#9ebbd0;font-size:10px;margin-top:7px">DOM表示値のみ。取得不能時は停止。注文操作なし。予測精度は未検証。</div></main></section>';
document.body.appendChild(root);
var $=function(id){return root.querySelector('#'+id)},target=null,pick=false,price=null,last=0,history=[];
function quote(el){for(var i=0;el&&i<3;i++,el=el.parentElement){if(root.contains(el))return null;var t=(el.textContent||'').trim();var m=t.match(/^(\d{2,3}\.\d{3})(?:\s*[▲▼↑↓]?)$/);if(!m||Number(m[1])<50||Number(m[1])>300)continue;var r=el.getBoundingClientRect(),sty=getComputedStyle(el);if(r.width<20||r.height<15||r.bottom<0||r.top>innerHeight||sty.display==='none')continue;if(parseFloat(sty.fontSize)<18)continue;return {el:el,p:Number(m[1])};}return null;}
function display(state,msg){$('a15-state').textContent=state;$('a15-msg').textContent=msg;$('a15-state').style.color=state==='監視中'?'#62edc2':'#ffcb66';}
function past(ms){var t=Date.now()-ms;for(var i=history.length-1;i>=0;i--)if(history[i].t<=t&&t-history[i].t<2000)return history[i].p;return null;}
function tick(){if(!target)return;if(!target.isConnected){target=null;price=null;display('取得停止','価格表示要素が消えました。再選択してください');return;}var q=quote(target);if(!q){price=null;display('取得停止','数値を読めません。価格を再選択');return;}
var now=Date.now(),n=q.p;if(n!==price){price=n;last=now;history.push({t:now,p:n});while(history.length&&now-history[0].t>22000)history.shift();}
$('a15-p').textContent=n.toFixed(3);if(now-last>2500){display('見送り','表示価格が2.5秒以上更新されていません');}else{display('監視中','ASTRO表示値を追跡中（約'+((now-last)/1000).toFixed(1)+'秒前に更新）');}
var p3=past(3000),p15=past(15000);$('a15-delta').textContent='3秒差 '+(p3===null?'---':(n-p3).toFixed(3))+' ｜15秒差 '+(p15===null?'---':(n-p15).toFixed(3));}
$('a15-pick').onclick=function(){pick=true;root.style.pointerEvents='none';display('選択待ち','次にASTRO中央の大きな価格をタップ');};
function choose(e){if(!pick||root.contains(e.target))return;pick=false;root.style.pointerEvents='auto';e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();var q=quote(e.target);if(!q){display('取得不可','選択した場所は価格テキストではありません。もう一度選択してください');return;}target=q.el;price=null;history=[];tick();$('a15-pick').textContent='価格を選び直す';}
document.addEventListener('click',choose,true);
var timer=setInterval(tick,250);
$('a15-close').onclick=function(){clearInterval(timer);document.removeEventListener('click',choose,true);root.remove();};
var drag=null,head=$('a15-head');head.addEventListener('pointerdown',function(e){if(e.target.tagName==='BUTTON')return;drag={x:e.clientX,y:e.clientY,l:root.getBoundingClientRect().left,t:root.getBoundingClientRect().top};head.setPointerCapture(e.pointerId);});
head.addEventListener('pointermove',function(e){if(!drag)return;root.style.left=Math.min(innerWidth-70,Math.max(0,drag.l+e.clientX-drag.x))+'px';root.style.top=Math.max(5,drag.t+e.clientY-drag.y)+'px';root.style.right='auto';});
head.addEventListener('pointerup',function(){drag=null;});
})();