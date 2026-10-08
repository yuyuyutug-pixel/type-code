/* ASTRO 15秒研究室 v0.7 | visual price observer only | no orders, no requests */
(function () {
  'use strict';
  if (!/(^|\.)astro\.space$/i.test(location.hostname)) {
    alert('ASTROの取引画面で起動してください'); return;
  }
  if (window.__astroLab15 && window.__astroLab15.stop) window.__astroLab15.stop();
  var old = document.getElementById('astro15-v07'); if (old) old.remove();
  var panel = document.createElement('div'); panel.id = 'astro15-v07';
  panel.style.cssText = 'position:fixed!important;z-index:2147483647!important;top:53%!important;left:8px!important;width:215px!important;max-width:68vw!important;touch-action:pan-y!important;pointer-events:auto!important';
  var ui = panel.attachShadow({mode:'open'});
  ui.innerHTML = `<style>
  :host{all:initial}*{box-sizing:border-box}article{color:#eef8ff;background:#071929f6;font:12px/1.45 -apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;border:1px solid #51d7ee;border-radius:15px;overflow:hidden;box-shadow:0 12px 36px #000b}header{background:#134763;padding:8px;display:flex;justify-content:space-between;align-items:center;touch-action:none}header b{font-size:12px}button{font:inherit;color:#fff;background:#1c4c70;border:1px solid #3d7594;border-radius:9px;min-height:44px;padding:7px;cursor:pointer}header button{min-height:32px;min-width:30px;background:transparent;border:0;font-size:17px;padding:1px}main{padding:11px}.price{font-size:29px;font-weight:820;letter-spacing:1px;line-height:1.2;font-variant-numeric:tabular-nums}.status{font-size:15px;font-weight:850;color:#ffc766;margin-top:4px}.detail{color:#a9cde1;margin-top:6px;font-size:11px}.deltas{color:#95e4f2;margin-top:9px;border-top:1px solid #24475a;padding-top:7px}.buttons{display:flex;gap:6px;margin-top:10px}.buttons button{flex:1}.note{font-size:10px;color:#799db7;margin-top:9px}.mini{padding:8px 10px;display:none}.info{display:none;font-size:10px;color:#b9dce9;white-space:pre-line;border-top:1px solid #274c65;margin-top:9px;padding-top:8px}.ok{color:#58ecc4}.warn{color:#ffc766}.bad{color:#ff929d}</style>
  <article><header id='drag'><b>15秒研究室 <small>v0.7</small></b><div><button id='min' aria-label='最小化'>－</button><button id='close' aria-label='閉じる'>×</button></div></header>
  <main id='main'><div class='price' id='price'>---.---</div><div class='status' id='state'>価格を探しています</div><div class='detail' id='msg'>ASTRO中央の価格を自動検出中</div><div class='deltas' id='delta'>3秒差 --- ｜15秒差 ---</div><div class='buttons'><button id='retry'>再検出</button><button id='diag'>診断</button></div><div class='info' id='info'></div><div class='note'>ASTRO画面の表示文字だけを監視。取得できなければ停止。自動注文・勝率保証なし。</div></main>
  <div class='mini' id='mini'><b id='miniText'>15秒研究室</b> <button id='restore'>開く</button></div></article>`;
  document.body.appendChild(panel);
  var $=id=>ui.getElementById(id);
  var chosen=null, lastPrice=null, lastChange=0, ticks=[], scanCount=0, duplicate=0, status='SEARCH', reason='', misses=0, moved=0, lastPosition=null, interval=0, alive=true, hiddenSince=0, attempted=0;
  var max=Math.max, min=Math.min;
  function visible(el) {
    if(!el || panel.contains(el) || el.closest('#astro15-v07')) return false;
    var st=getComputedStyle(el),r=el.getBoundingClientRect();
    return st.display!=='none' && st.visibility!=='hidden' && +st.opacity!==0 && r.width>25 && r.height>16 && r.bottom>innerHeight*.09 && r.top<innerHeight*.69 && r.right>0 && r.left<innerWidth;
  }
  function clean(s){return String(s||'').replace(/[\s\u00a0\u200b]/g,'').replace(/[▲▼△▽↑↓↗↘＋+−-]+$/g,'');}
  function priceOf(s) {var m=clean(s).match(/^(\d{2,3}\.\d{3})$/);if(!m)return null;var n=Number(m[1]);return n>=50&&n<=300?n:null;}
  function describe(el){
    if(!visible(el))return null;
    var raw=el.textContent||'',val=priceOf(raw);if(val===null)return null;
    var st=getComputedStyle(el),size=parseFloat(st.fontSize)||0;
    for(var ch of el.children||[]) if(ch.children.length<3)size=max(size,parseFloat(getComputedStyle(ch).fontSize)||0);
    if(size<24)return null;
    var r=el.getBoundingClientRect(), cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2;
    if(cx<innerWidth*.16||cx>innerWidth*.84||cy<innerHeight*.13||cy>innerHeight*.61)return null;
    var score=size*6-Math.abs(cx-innerWidth*.5)*.28-Math.abs(cy-innerHeight*.28)*.18;
    if(r.width>innerWidth*.86)score-=35;
    return {el:el,price:val,x:cx,y:cy,font:size,score:score};
  }
  function candidates(){
    var found=[],seen=new Set(),list=document.querySelectorAll('span,div,p,b,strong,h1,h2,h3,output,text');
    var total=min(3000,list.length);scanCount=total;
    for(var i=0;i<total;i++){
      var el=list[i]; if(seen.has(el)||panel.contains(el))continue;
      var raw=el.textContent||'';if(raw.length>32||raw.length<6)continue;
      if(!/(\d{2,3})\s*\.\s*(\d{3})/.test(raw))continue;
      var c=describe(el);if(c){found.push(c);seen.add(el);}
    }
    found.sort((a,b)=>b.score-a.score);
    // Ignore nested duplicate DOM candidates representing exactly the same visual price.
    var distinct=[];
    for(var x of found){if(!distinct.some(y=>Math.abs(x.x-y.x)<12 && Math.abs(x.y-y.y)<12 && x.price===y.price))distinct.push(x);}
    duplicate=distinct.length;
    return distinct;
  }
  function setState(s,message){status=s;reason=message;$('state').textContent=s;$('state').className='status '+(s==='価格取得中'?'ok':s==='取得停止'?'bad':'warn');$('msg').textContent=message;}
  function resetSamples(){ticks=[];lastPrice=null;lastChange=0;}
  function bind(q){chosen=q;lastPosition={x:q.x,y:q.y,font:q.font};resetSamples();misses=0;moved++;setState('価格取得中','ASTROの表示値を監視。3秒・15秒のデータ収集中');}
  function selectBest(){
    var choices=candidates();if(!choices.length)return null;
    var best=choices[0];
    if(choices.length>1&&Math.abs(choices[0].score-choices[1].score)<15&&choices[0].price!==choices[1].price)return null;
    return best;
  }
  function recover(){
    var choices=candidates();
    if(!choices.length)return false;
    var picked=choices[0];
    // Auto-recover only near the same screen position and font size, not from chart axis labels.
    if(lastPosition){picked=choices.find(c=>Math.abs(c.x-lastPosition.x)<95&&Math.abs(c.y-lastPosition.y)<80&&Math.abs(c.font-lastPosition.font)<22);}
    if(!picked)return false;
    chosen=picked;lastPosition={x:picked.x,y:picked.y,font:picked.font};moved++;misses=0;return true;
  }
  function lookup(ms,now){var target=now-ms;for(var i=ticks.length-1;i>=0;i--){if(ticks[i].t<=target && target-ticks[i].t<2400)return ticks[i].p;}return null;}
  function update(){
    if(!alive||document.hidden)return;
    var now=Date.now();
    if(!chosen){
      if(now-attempted<900)return;attempted=now;
      var found=selectBest();if(!found){
        setState(lastPosition?'取得停止':'取得待ち',document.querySelectorAll('canvas').length?'中央の価格をHTMLとして検出できません。画像描画の可能性があります。':'中央価格の文字が見つかりません。診断で確認できます。');return;
      }
      if(lastPosition && (Math.abs(found.x-lastPosition.x)>95 || Math.abs(found.y-lastPosition.y)>80 || Math.abs(found.font-lastPosition.font)>22)){
        setState('取得停止','以前の価格と位置が異なります。別の数字へ自動切替しません。');return;
      }bind(found);
    }
    var current=describe(chosen.el);
    if(!current||Math.abs(current.x-lastPosition.x)>95||Math.abs(current.y-lastPosition.y)>80){
      misses++;
      if(misses<3)return;
      if(now-attempted<900){setState('取得待ち','画面更新中。価格要素を確認しています');return;}
      attempted=now;
      if(!recover()){
        chosen=null;resetSamples();setState('取得停止','価格の表示方式が変わりました。誤った数字を使わず停止しています。');$('price').textContent='---.---';$('delta').textContent='3秒差 --- ｜15秒差 ---';return;
      }
      current=describe(chosen.el);
    }
    if(!current)return;
    misses=0;
    var n=current.price;
    if(lastPrice!==null && Math.abs(n-lastPrice)>.15){
      chosen=null;resetSamples();setState('取得停止','価格が不自然に飛んだため停止。別の数字を読んだ可能性があります。');return;
    }
    if(lastPrice!==n){lastPrice=n;lastChange=now;ticks.push({t:now,p:n});if(ticks.length>700)ticks.shift();}
    ticks=ticks.filter(t=>now-t.t<35000);
    $('price').textContent=n.toFixed(3);
    var age=now-lastChange;
    if(age>3500)setState('取得待ち','表示値が3.5秒以上変わっていません。判定に使用しません。');
    else if(ticks.length<3 || now-ticks[0].t<15000)setState('価格取得中','ASTRO価格を追跡中。履歴を収集中');
    else setState('価格取得中','表示値を追跡中（最終変化 '+(age/1000).toFixed(1)+'秒前）');
    var t3=lookup(3000,now),t15=lookup(15000,now);
    $('delta').textContent='3秒差 '+(t3===null?'---':(n-t3).toFixed(3))+' ｜15秒差 '+(t15===null?'---':(n-t15).toFixed(3));
    $('miniText').textContent=n.toFixed(3)+' ｜'+status;
  }
  function detail(){
    var canvas=document.querySelectorAll('canvas').length,iframes=document.querySelectorAll('iframe').length;
    $('info').textContent='検査した要素 '+scanCount+'\n中央価格候補 '+duplicate+'\nCanvas '+canvas+'個 / iframe '+iframes+'個\n監視データ '+ticks.length+'件\n検出再接続 '+max(0,moved-1)+'回\n状態 '+status+'\n'+reason+'\n\n※ 勝率・売買方向はまだ計算しません。';
    $('info').style.display=$('info').style.display==='block'?'none':'block';
  }
  function stop(){alive=false;clearInterval(interval);document.removeEventListener('visibilitychange',visibility);panel.remove();delete window.__astroLab15;}
  function visibility(){if(document.hidden)hiddenSince=Date.now();else if(hiddenSince){resetSamples();hiddenSince=0;setState('取得待ち','Safari復帰後の古い値は使わず再収集します');}}
  $('retry').onclick=()=>{chosen=null;lastPosition=null;resetSamples();attempted=0;misses=0;setState('再検出中','ASTRO中央の価格を探します');update();};
  $('diag').onclick=detail;
  $('close').onclick=stop;
  $('min').onclick=()=>{$('main').style.display='none';$('mini').style.display='block';};
  $('restore').onclick=()=>{$('mini').style.display='none';$('main').style.display='block';};
  var dragging=null,bar=$('drag');
  bar.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging={x:e.clientX,y:e.clientY,left:panel.getBoundingClientRect().left,top:panel.getBoundingClientRect().top};bar.setPointerCapture(e.pointerId);});
  bar.addEventListener('pointermove',e=>{if(!dragging)return;panel.style.left=max(0,min(innerWidth-panel.offsetWidth,dragging.left+e.clientX-dragging.x))+'px';panel.style.top=max(0,min(innerHeight-90,dragging.top+e.clientY-dragging.y))+'px';panel.style.right='auto';});
  bar.addEventListener('pointerup',()=>dragging=null);
  document.addEventListener('visibilitychange',visibility);
  window.__astroLab15={stop:stop,update:update};
  interval=setInterval(update,240);update();
})();