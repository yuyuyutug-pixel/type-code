'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

type AxisKey='social'|'plan'|'logic'|'novelty'|'action'|'sensitive';
type Character={name:string;role:string;image:string;line:string;accent:string};
type Axis={key:AxisKey;positive:string;negative:string;character:Character;questions:string[]};
type Screen='home'|'quiz'|'result';
type Scores=Record<AxisKey,number>;
type Match={code:string;name:string;score:number;reasons:string[];caution:string;tip:string};

const axes:Axis[]=[
 {key:'social',positive:'交流型',negative:'内省型',character:{name:'EMA',role:'共感・交流',image:'/characters/ema.svg',line:'人との距離感を見ていくね。',accent:'#ff8fb1'},questions:['予定のない休日は誰かを誘う。','初対面でも自分から話せる。','大人数で過ごした後も誰かと話したい。','店員におすすめを聞ける。','SNSへ出来事をすぐ投稿する。','沈黙が続くと自分から話題を出す。','知らない人の中でも比較的落ち着ける。','一人の時間が続くと誰かと話したくなる。']},
 {key:'plan',positive:'計画型',negative:'柔軟型',character:{name:'AXIS',role:'計画・管理',image:'/characters/axis.svg',line:'予定の立て方を確認するよ。',accent:'#6f8cff'},questions:['旅行前に大まかな予定を決めたい。','締切より前から作業を始める。','買い物前に必要な物を整理する。','急な予定変更が続くと疲れる。','身の回りを定期的に整理する。','複数の作業は順番に片付けたい。','予約できるものは先に予約したい。','その日の気分だけでは行動を決めない。']},
 {key:'logic',positive:'論理型',negative:'共感型',character:{name:'LOG',role:'論理・分析',image:'/characters/log.svg',line:'判断するときの基準を見よう。',accent:'#8269ff'},questions:['相談を受けると解決方法を考える。','筋が通っていれば自分と違う意見も認める。','買い物では比較や性能を重視する。','感情的な場面でも原因を整理しようとする。','説明には理由や根拠が欲しい。','慰めるだけより改善方法を伝えたい。','多数派の意見でも疑問があれば調べる。','好き嫌いより合理性を優先することがある。']},
 {key:'novelty',positive:'探索型',negative:'安定型',character:{name:'NOVA',role:'探究・好奇心',image:'/characters/nova.svg',line:'新しさとの付き合い方を探ろう。',accent:'#f6a447'},questions:['新商品や新サービスを試したい。','目的地まで知らない道を通ることがある。','いつもの店でも違うメニューを頼みたい。','急な誘いでも面白そうなら参加する。','新しい趣味を始めることが多い。','変化が少ない状態が続くと退屈する。','話題になっているものは一度試したい。','説明を読むより触りながら覚えたい。']},
 {key:'action',positive:'即行動型',negative:'熟考型',character:{name:'PULSE',role:'行動・実行',image:'/characters/pulse.svg',line:'動き出す速さを見ていくよ。',accent:'#58cda6'},questions:['迷ったら一度動いて確かめる。','失敗した後の切り替えが早い。','必要だと思えばその日に始める。','欲しい物を見つけてから購入までが早い。','トラブルが起きたらすぐ対処する。','未完成でも一度形にしてみる。','人に任せるより自分で進めたい。','不安があってもチャンスなら動く。']},
 {key:'sensitive',positive:'高感受型',negative:'安定感情型',character:{name:'LUMI',role:'感受性・直感',image:'/characters/lumi.svg',line:'感情の受け取り方を見よう。',accent:'#b96cff'},questions:['送る前にLINEの文章を何度か読み返す。','声や表情の小さな変化に気づく。','言われた言葉を後から思い返す。','場の空気を読みすぎて疲れることがある。','映画や音楽で強く感動する。','返信の遅さや短さが気になることがある。','人が無理をしていると気づきやすい。','寝る前にその日の出来事を振り返る。']}
];

const questions=axes.flatMap(axis=>axis.questions.map(text=>({text,axis})));
const options=[['かなり当てはまる',2],['少し当てはまる',1],['あまり当てはまらない',-1],['ほとんど当てはまらない',-2]] as const;
const prefixes=['静かな','鋭い','柔らかな','大胆な','自由な','慎重な','熱を秘めた','揺るがない'];
const nouns=['観察者','設計者','調整役','開拓者','探究者','実行者','共鳴者','指揮者'];
const STORAGE_KEY='type-code-progress-v4';
const RESULT_KEY='type-code-last-result-v1';
const PREMIUM_KEY='type-code-premium-v1';
const keys:AxisKey[]=['social','plan','logic','novelty','action','sensitive'];

const axisText:Record<AxisKey,{positive:string;negative:string;strengthP:string;strengthN:string;riskP:string;riskN:string;tipP:string;tipN:string}>={
 social:{positive:'人との接点から情報と活力を得ます。会話の中で考えがまとまり、場を前へ動かす力があります。',negative:'一人で考える時間から精度と落ち着きを得ます。広く浅くより、狭く深い信頼関係を築きます。',strengthP:'人を巻き込み、関係を前進させる',strengthN:'観察力が高く、深い信頼を築く',riskP:'人に合わせすぎて自分の疲労を見落とす',riskN:'考えを抱え込み、助けを求めるのが遅れる',tipP:'予定のない一人時間を意識的に確保すると判断が安定します。',tipN:'結論前でも信頼できる一人へ途中経過を共有すると孤立を防げます。'},
 plan:{positive:'先を見通して順序と基準を作ることで、安定した成果を出します。約束や締切への信頼性が高い傾向です。',negative:'状況に合わせて素早く方針を変え、余白と自由度を活かします。予定外の出来事にも適応しやすい傾向です。',strengthP:'段取り、継続、再現性に強い',strengthN:'変化への対応と発想の転換が速い',riskP:'予定外の変化に強いストレスを感じる',riskN:'締切や優先順位が曖昧になりやすい',tipP:'変更可能な範囲を最初に決めておくと、予定外への抵抗が減ります。',tipN:'締切だけは固定し、手順は自由にすると長所を保ったまま完遂できます。'},
 logic:{positive:'感情に流されず、原因と構造を捉えます。公平な基準と説明可能な根拠を重視します。',negative:'相手の感情や背景を含めて判断します。正解だけでなく、関係の温度と納得感を守ります。',strengthP:'問題解決と合理的な意思決定',strengthN:'共感と対人調整に優れる',riskP:'正しさを優先し、気持ちへの配慮が後になる',riskN:'相手を優先しすぎて判断が曖昧になる',tipP:'解決策の前に「どう感じたか」を一度確認すると伝わり方が大きく改善します。',tipN:'相手の希望と自分の責任範囲を分けると、抱え込みを減らせます。'},
 novelty:{positive:'未知のものに価値を見つけ、試行錯誤から可能性を広げます。新しい企画や変化の起点になれます。',negative:'実績のある方法を磨き、安定性と品質を守ります。再現できる仕組みを育てる力があります。',strengthP:'企画、発見、変化の起点になれる',strengthN:'品質維持とリスク管理に強い',riskP:'新しさを追い、完成前に次へ移りやすい',riskN:'変化の必要性を感じても動き出しが遅れる',tipP:'新規着手の条件を「今の案件を一つ完了」にすると成果が残ります。',tipN:'小さな実験として試すと、安全性を保ちながら変化を取り込めます。'},
 action:{positive:'考えながら動き、現実の反応から答えを得ます。初動が速く、機会を逃しにくいタイプです。',negative:'情報を集めてから動くため、失敗を減らし判断精度を高めます。重要局面で慎重さが強みになります。',strengthP:'初動と実行力が高い',strengthN:'慎重で完成度の高い判断ができる',riskP:'確認不足で手戻りが起こりやすい',riskN:'最適解を探し続けて着手が遅れる',tipP:'実行前に確認項目を一つだけ設けると、速度を落とさず事故を減らせます。',tipN:'70%で一度動く期限を決めると、思考の質を成果へ変えられます。'},
 sensitive:{positive:'微細な変化や感情を受け取り、言葉にならないものを察知します。洞察や表現に深みが出ます。',negative:'感情の波に飲まれにくく、安定して対処します。緊張場面でも平常心を保ちやすい傾向です。',strengthP:'洞察、表現、気配りが深い',strengthN:'冷静さと精神的な安定感がある',riskP:'刺激を受けすぎて疲弊しやすい',riskN:'相手の繊細なサインを見落とすことがある',tipP:'刺激を遮断する時間を予定として確保すると回復が早まります。',tipN:'相手の表情だけで判断せず、言葉で確認する習慣が対人精度を上げます。'}
};

function vectorFromNumber(num:number){return keys.map((_,i)=>((num-1)&(1<<(5-i)))?1:-1)}
function codeName(num:number){return {code:`TC-${String(num).padStart(2,'0')}`,name:`${prefixes[Math.floor((num-1)/8)]}${nouns[(num-1)%8]}`}}

function compatibility(base:number[]){
 return Array.from({length:64},(_,i)=>i+1).map(num=>{
  const v=vectorFromNumber(num);let score=56;const reasons:string[]=[];const same=(idx:number)=>base[idx]===v[idx];
  if(same(2)){score+=12;reasons.push('判断基準が近く、重要な場面で結論の理由を共有しやすい');}else{score+=5;reasons.push('論理と共感を補い合い、一人では見えない視点を持てる');}
  if(same(5)){score+=10;reasons.push('感情の受け取り方が近く、安心の作り方を理解しやすい');}else{score+=4;reasons.push('感情の波を一方が受け止め、もう一方が安定させられる');}
  if(same(1)){score+=9;reasons.push('予定の立て方と生活テンポを合わせやすい');}else score+=3;
  if(same(0)){score+=7;reasons.push('人付き合いの距離感と回復方法が近い');}else{score+=5;reasons.push('社交性と静けさを役割分担できる');}
  if(same(3))score+=5;else{score+=8;reasons.push('安定志向と好奇心が補完関係になる');}
  if(same(4))score+=6;else{score+=8;reasons.push('行動力と慎重さを補い合える');}
  const conflicts=[1,2,5].filter(x=>!same(x)).length;
  const caution=conflicts>=2?'予定・判断・感情表現の違いが同時に出ると、互いに「分かってくれない」と感じやすくなります。':!same(4)?'決断速度が違うため、急かす側と待たせる側になりやすい関係です。':'似ている分、同じ弱点を同時に強める可能性があります。';
  const tip=!same(2)?'結論を出す前に「気持ち」と「事実」を分けて、両方を順番に確認してください。':!same(1)?'予定を固定する部分と自由にする部分を最初に分けてください。':'役割を固定しすぎず、定期的に希望と負担を言葉にしてください。';
  return {...codeName(num),score:Math.min(98,score),reasons:reasons.slice(0,3),caution,tip};
 }).sort((a,b)=>b.score-a.score);
}

function calculate(answers:(number|null)[]){
 const scores=Object.fromEntries(keys.map(k=>[k,0])) as Scores;
 questions.forEach((q,i)=>scores[q.axis.key]+=answers[i]??0);
 const vector=keys.map(k=>scores[k]>=0?1:-1);
 const num=parseInt(vector.map(v=>v>0?'1':'0').join(''),2)+1;
 const info=codeName(num);
 const dominant=[...axes].sort((a,b)=>Math.abs(scores[b.key])-Math.abs(scores[a.key]));
 const profile=axes.map(a=>{const positive=scores[a.key]>=0;return {axis:a,label:positive?a.positive:a.negative,text:positive?axisText[a.key].positive:axisText[a.key].negative,rate:Math.round(Math.abs(scores[a.key])/16*100),strength:positive?axisText[a.key].strengthP:axisText[a.key].strengthN,risk:positive?axisText[a.key].riskP:axisText[a.key].riskN,tip:positive?axisText[a.key].tipP:axisText[a.key].tipN};});
 const strengths=dominant.slice(0,4).map(a=>scores[a.key]>=0?axisText[a.key].strengthP:axisText[a.key].strengthN);
 const risks=dominant.slice(0,4).map(a=>scores[a.key]>=0?axisText[a.key].riskP:axisText[a.key].riskN);
 const matches=compatibility(vector).filter(m=>m.code!==info.code).slice(0,3);
 const navigator=dominant[0].character;const s=(k:AxisKey)=>scores[k]>=0;
 const summary=`${profile[0].label}・${profile[2].label}・${profile[4].label}が中心です。${profile[1].text}`;
 const core=`あなたは、${s('social')?'人とのやり取り':'自分の内側での整理'}を通して状況を理解し、${s('logic')?'根拠と構造':'感情と背景'}を基準に判断します。${s('action')?'動きながら精度を上げる':'十分に見通してから動く'}ため、周囲からは「${s('action')?'決断が速い':'慎重で落ち着いている'}人」と見られやすいでしょう。`;
 const communication=`伝え方は${s('logic')?'要点・理由・結論を明確にする':'相手の気持ちと場の空気を優先する'}傾向です。${s('social')?'会話の途中で考えがまとまりやすい':'考えを整理してから言葉にしたい'}ため、相手には${s('social')?'反応しながら聞いてもらう':'返答を急かさず待ってもらう'}と本来の力を出しやすくなります。`;
 const love=`恋愛では${s('sensitive')?'言葉・態度・連絡の一貫性を強く受け取る':'過度に感情を揺さぶられない安定した関係を好む'}タイプです。${s('plan')?'約束や予定が明確だと安心しやすく':'自由度があり、その時の状況を尊重し合えると心地よく'}、${s('social')?'日常を共有する頻度':'一人で回復する時間'}も重要です。愛情確認の方法を相手任せにせず、具体的な言葉で合意すると長続きします。`;
 const work=`仕事では${s('plan')?'目標・役割・期限が明確な環境':'裁量があり、状況に合わせて方法を変えられる環境'}で力を発揮します。${s('logic')?'分析、改善、設計、品質管理':'接客、支援、調整、育成'}と、${s('novelty')?'新規企画や変化':'安定運用や仕組み化'}を組み合わせた役割が適しています。`;
 const leadership=`人を率いる場面では、${s('social')?'前に立って方向を示す':'少人数の信頼関係から影響を広げる'}スタイルです。${s('logic')?'判断基準を共有する':'メンバーの納得感を整える'}ことでチームが動きます。弱点は${s('plan')?'変更への余白が小さくなること':'基準が曖昧になりやすいこと'}です。`;
 const stress=`負荷が高まると「${risks[0]}」と「${risks[1]}」が同時に出やすくなります。${s('sensitive')?'刺激や相手の反応を過剰に拾い':'自分は平気だと判断して疲労の兆候を見落とし'}、${s('action')?'急いで処理しようとする':'考え続けて動けなくなる'}可能性があります。`;
 const recovery=[s('sensitive')?'通知・会話・音を減らし、30分だけ刺激を遮断する':'体調と疲労を言葉で点検し、休む基準を数値化する',s('plan')?'今日決めなくてよい項目を分け、予定を組み直す':'やることを3つ以内に絞り、終了時刻だけ固定する',s('social')?'信頼できる相手に事実と気持ちを分けて話す':'一人で整理した後、結論前の段階で一人に共有する'];
 const growth=[profile[0].tip,profile[2].tip,profile[4].tip];
 return {...info,num,scores,vector,navigator,summary,profile,strengths,risks,matches,core,communication,love,work,leadership,stress,recovery,growth};
}

function CharacterImage({character,className=''}:{character:Character;className?:string}){return <div className={`characterVisual ${className}`}><img src={character.image} alt={character.name}/></div>}

export default function Home(){
 const [screen,setScreen]=useState<Screen>('home');const [index,setIndex]=useState(0);const [answers,setAnswers]=useState<(number|null)[]>(Array(48).fill(null));const [result,setResult]=useState<ReturnType<typeof calculate>|null>(null);const [hydrated,setHydrated]=useState(false);const [premium,setPremium]=useState(false);const [paying,setPaying]=useState(false);const [paymentMessage,setPaymentMessage]=useState('');const premiumRef=useRef<HTMLDivElement|null>(null);const current=questions[index];const characters=useMemo(()=>axes.map(a=>a.character),[]);const answeredCount=answers.filter(v=>v!==null).length;

 useEffect(()=>{let savedResult:(number|null)[]|null=null;try{setPremium(localStorage.getItem(PREMIUM_KEY)==='unlocked');const storedResult=localStorage.getItem(RESULT_KEY);if(storedResult){const parsed=JSON.parse(storedResult);if(Array.isArray(parsed)&&parsed.length===48)savedResult=parsed;}const saved=localStorage.getItem(STORAGE_KEY);if(saved){const p=JSON.parse(saved);if(Array.isArray(p.answers)&&p.answers.length===48){setAnswers(p.answers);setIndex(Math.min(p.index,47));}}}catch{}setHydrated(true);const params=new URLSearchParams(location.search);const sessionId=params.get('session_id');if(params.get('payment')==='success'&&sessionId){if(savedResult){setAnswers(savedResult);setResult(calculate(savedResult));setScreen('result');}setPaymentMessage('購入情報を確認しています…');fetch('/api/verify-payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId})}).then(r=>r.json()).then(data=>{if(data.unlocked){localStorage.setItem(PREMIUM_KEY,'unlocked');setPremium(true);setPaymentMessage('購入完了。診断結果の続きから詳細分析を表示しています。');history.replaceState({},'',location.pathname);setTimeout(()=>premiumRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),250);}else setPaymentMessage('支払いを確認できませんでした。');}).catch(()=>setPaymentMessage('購入確認中に通信エラーが発生しました。'));}else if(params.get('payment')==='cancelled'){if(savedResult){setAnswers(savedResult);setResult(calculate(savedResult));setScreen('result');}setPaymentMessage('購入はキャンセルされました。診断結果は保持されています。');history.replaceState({},'',location.pathname);}},[]);
 useEffect(()=>{if(hydrated&&screen!=='result')localStorage.setItem(STORAGE_KEY,JSON.stringify({index,answers}))},[hydrated,index,answers,screen]);
 function start(fresh=true){if(fresh){setIndex(0);setAnswers(Array(48).fill(null));setResult(null);localStorage.removeItem(STORAGE_KEY)}setScreen('quiz');scrollTo({top:0,behavior:'smooth'})}
 function answer(value:number){const next=[...answers];next[index]=value;setAnswers(next);navigator.vibrate?.(18);if(index===47){const calculated=calculate(next);setResult(calculated);setScreen('result');localStorage.setItem(RESULT_KEY,JSON.stringify(next));localStorage.removeItem(STORAGE_KEY);scrollTo({top:0,behavior:'smooth'})}else setIndex(index+1)}
 async function buyPremium(){if(!result)return;localStorage.setItem(RESULT_KEY,JSON.stringify(answers));setPaying(true);setPaymentMessage('');try{const response=await fetch('/api/create-checkout-session',{method:'POST'});const data=await response.json();if(!response.ok||!data.url)throw new Error(data.error||'決済を開始できませんでした。');location.href=data.url;}catch(error){setPaymentMessage(error instanceof Error?error.message:'決済を開始できませんでした。');setPaying(false)}}
 function share(){if(!result)return;const text=`私のTYPE CODEは ${result.code}「${result.name}」でした。\n#TYPECODE`;if(navigator.share)navigator.share({title:'TYPE CODE',text,url:location.href}).catch(()=>{});else navigator.clipboard.writeText(`${text}\n${location.href}`).then(()=>alert('結果をコピーしました'))}

 return <main className="app"><div className="ambient ambientOne"/><div className="ambient ambientTwo"/><div className="shell"><header className="brand"><span className="brandMark">TC</span><span>TYPE CODE</span></header>{paymentMessage&&<div className={`paymentNotice ${premium?'success':''}`}>{paymentMessage}</div>}<div className="panel"><AnimatePresence mode="wait">
 {screen==='home'&&<motion.section className="page" key="home" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}><div className="eyebrow">64 PERSONALITY TYPES</div><h1 className="heroTitle">人は、<br/><strong>16タイプだけ</strong>では<br/>表せない。</h1><p className="lead">6つの軸と48問から、思考・行動・対人関係を64タイプで分析。相性まで根拠付きで読み解きます。</p><div className="heroStage"><div className="heroGlow"/><div className="heroCharacterRow">{characters.map((c,i)=><motion.div key={c.name} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.06*i}}><CharacterImage character={c} className="heroCharacter"/></motion.div>)}</div><div className="heroCaption"><span>MEET THE NAVIGATORS</span><b>6つの視点で、あなたを読み解く。</b></div></div><div className="axisOverview">{axes.map(a=><div className="axisChip" key={a.key}><span style={{background:a.character.accent}}/><div><b>{a.character.name}</b><small>{a.role}</small></div></div>)}</div><div className="stats"><div className="stat"><span>質問数</span><b>48問</b></div><div className="stat"><span>診断結果</span><b>64タイプ</b></div><div className="stat"><span>詳細分析</span><b>買い切り200円</b></div></div><button className="primary" onClick={()=>start(true)}>無料で診断する<span>→</span></button>{answeredCount>0&&<button className="resume" onClick={()=>start(false)}>前回の続きから再開する（{answeredCount}/48）</button>}<p className="privacyNote">診断とTYPE CODEの確認は無料。詳細分析のみ200円の買い切りです。</p></motion.section>}
 {screen==='quiz'&&<motion.section className="page" key={`q-${index}`} initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-18}}><div className="quizTop"><span>QUESTION {String(index+1).padStart(2,'0')}</span><span>{Math.round((index+1)/48*100)}%</span></div><div className="progress"><div className="progressBar" style={{width:`${(index+1)/48*100}%`}}/></div><div className="guide"><CharacterImage character={current.axis.character} className="guideImage"/><div><small>{current.axis.character.role}</small><b>{current.axis.character.name}が案内します</b><span>{current.axis.character.line}</span></div></div><div className="questionNumber">{index+1}<span>/48</span></div><h2 className="question">{current.text}</h2><div className="answers">{options.map((o,n)=><motion.button whileTap={{scale:.985}} className="answer" key={o[1]} onClick={()=>answer(o[1])}><span className="answerIndex">{String.fromCharCode(65+n)}</span><span className="answerLabel">{o[0]}</span><span className="answerArrow">→</span></motion.button>)}</div><div className="actions"><button className="ghost" disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}>← 前へ戻る</button><button className="ghost" onClick={()=>setScreen('home')}>中断する</button></div></motion.section>}
 {screen==='result'&&result&&<motion.section className="page resultPage" key="result" initial={{opacity:0,scale:.985}} animate={{opacity:1,scale:1}}><div className="eyebrow center">YOUR TYPE CODE</div><div className="resultBadge">ANALYSIS COMPLETE</div><div className="resultCode">{result.code}</div><h1 className="resultTitle">{result.name}</h1><p className="muted">あなた独自の6軸バランスから分析した結果です。</p><div className="resultHero"><CharacterImage character={result.navigator}/><div><small>MATCHED NAVIGATOR</small><b>{result.navigator.name}との一致度が高いタイプ</b><p>{result.summary}</p></div></div>
 {!premium&&<><div className="freePreview"><span>無料結果</span><h2>あなたの中心傾向</h2><p>{result.core}</p><div className="previewAxes">{result.profile.slice(0,2).map(p=><div key={p.axis.key}><b>{p.label}</b><span>{p.rate}%</span></div>)}</div></div><section className="paywall"><div className="paywallIcon">✓</div><div className="eyebrow center">ONE-TIME PURCHASE</div><h2>詳細分析をすべて解除</h2><div className="price"><strong>200</strong><span>円</span></div><p>決済後はこの診断結果へ自動で戻り、そのまま続きを表示します。診断のやり直しはありません。</p><div className="unlockGrid"><span>6軸の詳細解説</span><span>深層性格分析</span><span>恋愛・仕事適性</span><span>ストレス回復法</span><span>相性TOP3</span><span>根拠・注意点・改善策</span></div><button className="primary purchaseButton" disabled={paying} onClick={buyPremium}>{paying?'決済ページを準備中…':'200円で詳細を見る'}<span>→</span></button><small>Stripeの安全な決済画面へ移動します。買い切り・追加課金なし。</small></section></>}
 {premium&&<div ref={premiumRef} className="premiumContent"><div className="premiumBadge">PREMIUM UNLOCKED</div><section className="deepIntro"><span>DEEP PROFILE</span><h2>あなたの性格構造</h2><p>{result.core}</p></section><h2 className="sectionTitle">6軸の詳細分析</h2><div className="profileList">{result.profile.map(p=><article className="profileCard" key={p.axis.key}><div className="axisHead"><div><small>{p.axis.character.role}</small><b>{p.label}</b></div><span>{p.rate}%</span></div><div className="track"><div className="fill" style={{width:`${Math.max(8,p.rate)}%`}}/></div><p>{p.text}</p><div className="axisDetail"><p><b>強み</b>{p.strength}</p><p><b>注意点</b>{p.risk}</p><p><b>活かし方</b>{p.tip}</p></div></article>)}</div><h2 className="sectionTitle">場面別の深層分析</h2><div className="detailStack"><article><span>COMMUNICATION</span><h3>コミュニケーション</h3><p>{result.communication}</p></article><article><span>LOVE</span><h3>恋愛・パートナーシップ</h3><p>{result.love}</p></article><article><span>WORK</span><h3>仕事・適職環境</h3><p>{result.work}</p></article><article><span>LEADERSHIP</span><h3>リーダーシップ</h3><p>{result.leadership}</p></article></div><div className="twoColumn"><article className="resultCard"><h3>主要な強み</h3><ul>{result.strengths.map(x=><li key={x}>{x}</li>)}</ul></article><article className="resultCard"><h3>陥りやすい盲点</h3><ul>{result.risks.map(x=><li key={x}>{x}</li>)}</ul></article></div><h2 className="sectionTitle">ストレス反応と回復設計</h2><article className="stressCard"><h3>負荷が高いときに起こること</h3><p>{result.stress}</p><h4>回復のための3ステップ</h4><ol>{result.recovery.map(x=><li key={x}>{x}</li>)}</ol></article><h2 className="sectionTitle">成長を加速させる行動</h2><div className="growthList">{result.growth.map((x,i)=><div key={x}><span>{String(i+1).padStart(2,'0')}</span><p>{x}</p></div>)}</div><h2 className="sectionTitle">相性が良いTYPE CODE TOP 3</h2><p className="sectionLead">価値観、生活テンポ、感情の扱い、補完性、衝突リスクを6軸で総合判定しています。</p><div className="matchList">{result.matches.map((m,i)=><article className="matchCard" key={m.code}><div className="matchTop"><span className="rank">{i+1}</span><div><b>{m.code}</b><h3>{m.name}</h3></div><strong>{m.score}<small>%</small></strong></div><h4>相性が良い根拠</h4><ul>{m.reasons.map(r=><li key={r}>{r}</li>)}</ul><div className="matchNotes"><p><b>注意点</b>{m.caution}</p><p><b>関係を良くするコツ</b>{m.tip}</p></div></article>)}</div></div>}
 <button className="primary resultAction" onClick={share}>結果をシェアする<span>↗</span></button><button className="resume" onClick={()=>start(true)}>もう一度診断する</button></motion.section>}
 </AnimatePresence></div></div></main>;
}