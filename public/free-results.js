(()=>{
  const RESULT_KEY='type-code-last-result-v1';
  const axisKeys=['social','plan','logic','novelty','action','sensitive'];
  const labels={
    social:['交流型','内省型'],plan:['計画型','柔軟型'],logic:['論理型','共感型'],
    novelty:['探索型','安定型'],action:['即行動型','熟考型'],sensitive:['高感受型','安定感情型']
  };
  const details={
    social:{p:['人を巻き込み、関係を前進させる','人に合わせすぎて自分の疲労を見落とす','予定のない一人時間を意識的に確保すると判断が安定します。'],n:['観察力が高く、深い信頼を築く','考えを抱え込み、助けを求めるのが遅れる','結論前でも信頼できる一人へ途中経過を共有すると孤立を防げます。']},
    plan:{p:['段取り、継続、再現性に強い','予定外の変化に強いストレスを感じる','変更可能な範囲を最初に決めておくと、予定外への抵抗が減ります。'],n:['変化への対応と発想の転換が速い','締切や優先順位が曖昧になりやすい','締切だけは固定し、手順は自由にすると完遂しやすくなります。']},
    logic:{p:['問題解決と合理的な意思決定','正しさを優先し、気持ちへの配慮が後になる','解決策の前に「どう感じたか」を一度確認すると伝わり方が改善します。'],n:['共感と対人調整に優れる','相手を優先しすぎて判断が曖昧になる','相手の希望と自分の責任範囲を分けると、抱え込みを減らせます。']},
    novelty:{p:['企画、発見、変化の起点になれる','新しさを追い、完成前に次へ移りやすい','新規着手の条件を「今の案件を一つ完了」にすると成果が残ります。'],n:['品質維持とリスク管理に強い','変化の必要性を感じても動き出しが遅れる','小さな実験として試すと、安全性を保ちながら変化を取り込めます。']},
    action:{p:['初動と実行力が高い','確認不足で手戻りが起こりやすい','実行前に確認項目を一つだけ設けると、速度を落とさず事故を減らせます。'],n:['慎重で完成度の高い判断ができる','最適解を探し続けて着手が遅れる','70％で一度動く期限を決めると、思考の質を成果へ変えられます。']},
    sensitive:{p:['洞察、表現、気配りが深い','刺激を受けすぎて疲弊しやすい','刺激を遮断する時間を予定として確保すると回復が早まります。'],n:['冷静さと精神的な安定感がある','相手の繊細なサインを見落とすことがある','相手の表情だけで判断せず、言葉で確認する習慣が対人精度を上げます。']}
  };
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function getData(){
    try{
      const answers=JSON.parse(localStorage.getItem(RESULT_KEY)||'null');
      if(!Array.isArray(answers)||answers.length!==48)return null;
      const scores=Object.fromEntries(axisKeys.map(k=>[k,0]));
      answers.forEach((v,i)=>{scores[axisKeys[Math.floor(i/8)]]+=Number(v)||0});
      const pos=k=>scores[k]>=0;
      const profile=axisKeys.map(k=>({key:k,label:labels[k][pos(k)?0:1],rate:Math.round(Math.abs(scores[k])/16*100),items:details[k][pos(k)?'p':'n']}));
      const ranked=[...profile].sort((a,b)=>b.rate-a.rate);
      const communication=`伝え方は${pos('logic')?'要点・理由・結論を明確にする':'相手の気持ちと場の空気を優先する'}傾向です。${pos('social')?'会話の途中で考えがまとまりやすい':'考えを整理してから言葉にしたい'}ため、相手には${pos('social')?'反応しながら聞いてもらう':'返答を急かさず待ってもらう'}と本来の力を出しやすくなります。`;
      const love=`恋愛では${pos('sensitive')?'言葉・態度・連絡の一貫性を強く受け取る':'過度に感情を揺さぶられない安定した関係を好む'}タイプです。${pos('plan')?'約束や予定が明確だと安心しやすく':'自由度があり、その時の状況を尊重し合えると心地よく'}、${pos('social')?'日常を共有する頻度':'一人で回復する時間'}も重要です。`;
      const work=`仕事では${pos('plan')?'目標・役割・期限が明確な環境':'裁量があり、状況に合わせて方法を変えられる環境'}で力を発揮します。${pos('logic')?'分析、改善、設計、品質管理':'接客、支援、調整、育成'}と、${pos('novelty')?'新規企画や変化':'安定運用や仕組み化'}を組み合わせた役割が適しています。`;
      return {profile,ranked,communication,love,work};
    }catch{return null}
  }
  function card(tag,title,text){return `<article><span>${tag}</span><h3>${title}</h3><p>${esc(text)}</p></article>`}
  function render(){
    const root=document.querySelector('.freePreview');
    if(!root||root.dataset.expandedFree==='1')return;
    const data=getData();if(!data)return;
    root.dataset.expandedFree='1';
    const oldAxes=root.querySelector('.previewAxes');
    if(oldAxes)oldAxes.remove();
    root.insertAdjacentHTML('beforeend',`
      <h2 class="sectionTitle">無料で見られる分析</h2>
      <div class="detailStack expandedFreeDetails">
        ${card('COMMUNICATION','コミュニケーション',data.communication)}
        ${card('LOVE','恋愛傾向',data.love)}
        ${card('WORK','仕事で力を発揮する環境',data.work)}
      </div>
      <h2 class="sectionTitle">6つの性格軸</h2>
      <div class="previewAxes expandedFreeAxes">${data.profile.map(p=>`<div><b>${esc(p.label)}</b><span>${p.rate}%</span></div>`).join('')}</div>
      <div class="twoColumn expandedFreeSummary">
        <article class="resultCard"><h3>あなたの主な強み</h3><ul>${data.ranked.slice(0,3).map(p=>`<li>${esc(p.items[0])}</li>`).join('')}</ul></article>
        <article class="resultCard"><h3>気をつけたい傾向</h3><ul>${data.ranked.slice(0,2).map(p=>`<li>${esc(p.items[1])}</li>`).join('')}</ul></article>
      </div>
      <h2 class="sectionTitle">今日から使えるアドバイス</h2>
      <div class="growthList expandedFreeAdvice"><div><span>01</span><p>${esc(data.ranked[0].items[2])}</p></div></div>
    `);
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(render));
  observer.observe(document.documentElement,{subtree:true,childList:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();