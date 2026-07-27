'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

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
const STORAGE_KEY='type-code-progress-v2';
const keys:AxisKey[]=['social','plan','logic','novelty','action','sensitive'];

const axisText:Record<AxisKey,{positive:string;negative:string;strengthP:string;strengthN:string;riskP:string;riskN:string}>={
social:{positive:'人との接点から情報と活力を得る。会話を通して考えを整理し、場を動かす力がある。',negative:'一人で深く考えることで精度を上げる。狭く深い関係を築きやすい。',strengthP:'人を巻き込み、関係を前進させる',strengthN:'観察力が高く、深い信頼を築く',riskP:'人に合わせすぎて自分の疲労を見落とす',riskN:'考えを抱え込み、助けを求めるのが遅れる'},
plan:{positive:'先を見通し、順序と基準を作ることで安定した成果を出す。',negative:'状況に合わせて素早く方針を変えられる。余白と自由度を活かす。',strengthP:'段取り、継続、再現性に強い',strengthN:'変化への対応と発想の転換が速い',riskP:'予定外の変化に強いストレスを感じる',riskN:'締切や優先順位が曖昧になりやすい'},
logic:{positive:'感情に流されず原因と構造を捉える。公平な基準で判断しやすい。',negative:'相手の感情や背景を含めて判断する。人間関係の温度を守る力がある。',strengthP:'問題解決と合理的な意思決定',strengthN:'共感と対人調整に優れる',riskP:'正しさを優先し、気持ちへの配慮が後になる',riskN:'相手を優先しすぎて判断が曖昧になる'},
novelty:{positive:'未知のものに価値を見つけ、試行錯誤から新しい可能性を広げる。',negative:'実績のある方法を磨き、安定性と品質を守る。',strengthP:'企画、発見、変化の起点になれる',strengthN:'品質維持とリスク管理に強い',riskP:'新しさを追い、完成前に次へ移りやすい',riskN:'変化の必要性を感じても動き出しが遅れる'},
action:{positive:'考えながら動き、現実から答えを得る。機会を逃しにくい。',negative:'情報を集めてから動くため、失敗を減らし精度を高められる。',strengthP:'初動と実行力が高い',strengthN:'慎重で完成度の高い判断ができる',riskP:'確認不足で手戻りが起こりやすい',riskN:'最適解を探し続けて着手が遅れる'},
sensitive:{positive:'微細な変化や感情を受け取り、言葉にならないものを察知する。',negative:'感情の波に飲まれにくく、安定して対処できる。',strengthP:'洞察、表現、気配りが深い',strengthN:'冷静さと精神的な安定感がある',riskP:'刺激を受けすぎて疲弊しやすい',riskN:'相手の繊細なサインを見落とすことがある'}
};

function vectorFromNumber(num:number){return keys.map((_,i)=>((num-1)&(1<<(5-i)))?1:-1)}
function codeName(num:number){return {code:`TC-${String(num).padStart(2,'0')}`,name:`${prefixes[Math.floor((num-1)/8)]}${nouns[(num-1)%8]}`}}

function compatibility(base:number[]){
 return Array.from({length:64},(_,i)=>i+1).map(num=>{
  const v=vectorFromNumber(num); let score=56; const reasons:string[]=[];
  const same=(idx:number)=>base[idx]===v[idx];
  if(same(2)){score+=12;reasons.push('判断基準が近く、重要な場面で話が通じやすい');}else{score+=5;reasons.push('論理と共感を補い合い、視野を広げられる');}
  if(same(5)){score+=10;reasons.push('感情の受け取り方が近く、安心感を作りやすい');}else{score+=4;reasons.push('感情の波を一方が支え、関係を安定させやすい');}
  if(same(1)){score+=9;reasons.push('予定や生活リズムを合わせやすい');}else score+=3;
  if(same(0)){score+=7;reasons.push('人付き合いの距離感が近い');}else{score+=5;reasons.push('社交性と静けさを役割分担できる');}
  if(same(3)){score+=5;}else{score+=8;reasons.push('安定志向と好奇心が補完関係になる');}
  if(same(4)){score+=6;}else{score+=8;reasons.push('行動力と慎重さを補い合える');}
  const conflicts=[1,2,5].filter(x=>!same(x)).length;
  const caution=conflicts>=2?'予定・判断・感情表現の違いが重なると、互いに「分かってくれない」と感じやすい。':!same(4)?'決断速度が違うため、急かす側と待たせる側になりやすい。':'似ている分、同じ弱点を強め合う可能性がある。';
  const tip=!same(2)?'結論を出す前に「気持ち」と「事実」を分けて両方確認する。':!same(1)?'予定を固定する部分と自由にする部分を先に決める。':'役割を固定しすぎず、定期的に希望を言葉にする。';
  const info=codeName(num);return {...info,score:Math.min(98,score),reasons:reasons.slice(0,3),caution,tip};
 }).sort((a,b)=>b.score-a.score);
}

function calculate(answers:(number|null)[]){
 const scores=Object.fromEntries(keys.map(k=>[k,0])) as Scores;
 questions.forEach((q,i)=>scores[q.axis.key]+=answers[i]??0);
 const vector=keys.map(k=>scores[k]>=0?1:-1);
 const num=parseInt(vector.map(v=>v>0?'1':'0').join(''),2)+1;
 const info=codeName(num);
 const dominant=[...axes].sort((a,b)=>Math.abs(scores[b.key])-Math.abs(scores[a.key]));
 const strengths=dominant.slice(0,3).map(a=>scores[a.key]>=0?axisText[a.key].strengthP:axisText[a.key].strengthN);
 const risks=dominant.slice(0,3).map(a=>scores[a.key]>=0?axisText[a.key].riskP:axisText[a.key].riskN);
 const profile=axes.map(a=>({axis:a,label:scores[a.key]>=0?a.positive:a.negative,text:scores[a.key]>=0?axisText[a.key].positive:axisText[a.key].negative,rate:Math.round(Math.abs(scores[a.key])/16*100)}));
 const matches=compatibility(vector).filter(m=>m.code!==info.code).slice(0,3);
 const navigator=dominant[0].character;
 const summary=`${profile[0].label}・${profile[2].label}・${profile[4].label}の組み合わせが中心。${profile[1].text}`;
 const stress=`負荷が高まると「${risks[0]}」が出やすい。まず刺激と判断材料を減らし、一度に一つだけ決めると回復しやすい。`;
 const love=scores.sensitive>=0?'相手の言葉や態度を深く受け取る。安心できる説明と一貫した態度を求める。':'過度に感情を揺さぶられない安定した関係を好む。率直で簡潔な対話が合う。';
 const work=`${scores.plan>=0?'目標と役割が明確':'裁量と変化がある'}環境で力を出しやすい。${scores.logic>=0?'改善・分析・設計':'接客・支援・調整'}を含む役割と相性が良い。`;
 const growth=`${scores.action>=0?'動く前に確認項目を一つだけ設ける':'期限を決め、70%の完成度で一度動く'}。${scores.social>=0?'一人で整理する時間も確保する':'考えが固まる前でも信頼できる相手へ共有する'}。`;
 return {...info,num,scores,vector,navigator,summary,strengths,risks,profile,matches,stress,love,work,growth};
}

function CharacterImage({character,className=''}:{character:Character;className?:string}){return <div className={`characterVisual ${className}`} style={{'--accent':character.accent} as React.CSSProperties}><img src={character.image} alt={character.name}/></div>}

export default function Home(){
 const [screen,setScreen]=useState<Screen>('home');const [index,setIndex]=useState(0);const [answers,setAnswers]=useState<(number|null)[]>(Array(48).fill(null));const [result,setResult]=useState<ReturnType<typeof calculate>|null>(null);const [hydrated,setHydrated]=useState(false);
 const current=questions[index];const characters=useMemo(()=>axes.map(a=>a.character),[]);const answeredCount=answers.filter(v=>v!==null).length;
 useEffect(()=>{try{const saved=localStorage.getItem(STORAGE_KEY);if(saved){const p=JSON.parse(saved);if(Array.isArray(p.answers)&&p.answers.length===48){setAnswers(p.answers);setIndex(Math.min(p.index,47));}}}catch{}setHydrated(true)},[]);
 useEffect(()=>{if(hydrated&&screen!=='result')localStorage.setItem(STORAGE_KEY,JSON.stringify({index,answers}))},[hydrated,index,answers,screen]);
 function start(fresh=true){if(fresh){setIndex(0);setAnswers(Array(48).fill(null));setResult(null);localStorage.removeItem(STORAGE_KEY)}setScreen('quiz');scrollTo({top:0,behavior:'smooth'})}
 function answer(value:number){const next=[...answers];next[index]=value;setAnswers(next);navigator.vibrate?.(18);if(index===47){setResult(calculate(next));setScreen('result');localStorage.removeItem(STORAGE_KEY);scrollTo({top:0,behavior:'smooth'})}else setIndex(index+1)}
 function share(){if(!result)return;const text=`私のTYPE CODEは ${result.code}「${result.name}」でした。\n相性TOP1は ${result.matches[0].code}。\n#TYPECODE`;if(navigator.share)navigator.share({title:'TYPE CODE',text,url:location.href}).catch(()=>{});else navigator.clipboard.writeText(`${text}\n${location.href}`).then(()=>alert('結果をコピーしました'))}
 return <main className="app"><div className="ambient ambientOne"/><div className="ambient ambientTwo"/><div className="shell"><header className="brand"><span className="brandMark">TC</span><span>TYPE CODE</span></header><div className="panel"><AnimatePresence mode="wait">
 {screen==='home'&&<motion.section className="page" key="home" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}><div className="eyebrow">64 PERSONALITY TYPES</div><h1 className="heroTitle">人は、<br/><strong>16タイプだけ</strong>では<br/>表せない。</h1><p className="lead">6人のナビゲーターと48問を進み、思考・行動・対人傾向を6軸で分析。相性まで根拠付きで読み解きます。</p><div className="heroStage"><div className="heroGlow"/><div className="heroCharacterRow">{characters.map((c,i)=><motion.div key={c.name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.07*i}}><CharacterImage character={c} className="heroCharacter"/></motion.div>)}</div><div className="heroCaption"><span>MEET THE NAVIGATORS</span><b>6つの視点で、あなたを読み解く。</b></div></div><div className="characterGrid">{characters.map(c=><div className="characterCard" key={c.name}><CharacterImage character={c}/><div><b>{c.name}</b><span>{c.role}</span></div></div>)}</div><div className="stats"><div className="stat"><span>質問数</span><b>48問</b></div><div className="stat"><span>診断結果</span><b>64タイプ</b></div><div className="stat"><span>相性分析</span><b>根拠付き</b></div></div><button className="primary" onClick={()=>start(true)}>無料で診断する<span>→</span></button>{answeredCount>0&&<button className="resume" onClick={()=>start(false)}>前回の続きから再開する（{answeredCount}/48）</button>}<p className="privacyNote">登録不要・診断データはこの端末内だけに保存されます。</p></motion.section>}
 {screen==='quiz'&&<motion.section className="page" key={`q-${index}`} initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-18}}><div className="quizTop"><span>QUESTION {String(index+1).padStart(2,'0')}</span><span>{Math.round((index+1)/48*100)}%</span></div><div className="progress"><div className="progressBar" style={{width:`${(index+1)/48*100}%`}}/></div><div className="guide" style={{'--accent':current.axis.character.accent} as React.CSSProperties}><CharacterImage character={current.axis.character} className="guideImage"/><div><small>{current.axis.character.role}</small><b>{current.axis.character.name}が案内します</b><span>{current.axis.character.line}</span></div></div><div className="questionNumber">{index+1}<span>/48</span></div><h2 className="question">{current.text}</h2><div className="answers">{options.map((o,n)=><motion.button whileTap={{scale:.985}} className="answer" key={o[1]} onClick={()=>answer(o[1])}><span className="answerIndex">{String.fromCharCode(65+n)}</span><span>{o[0]}</span><span className="answerArrow">→</span></motion.button>)}</div><div className="actions"><button className="ghost" disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}>← 前へ戻る</button><button className="ghost" onClick={()=>setScreen('home')}>中断する</button></div></motion.section>}
 {screen==='result'&&result&&<motion.section className="page resultPage" key="result" initial={{opacity:0,scale:.98}} animate={{opacity:1,scale:1}}><div className="eyebrow center">YOUR TYPE CODE</div><div className="resultBadge">ANALYSIS COMPLETE</div><div className="resultCode">{result.code}</div><h1 className="resultTitle">{result.name}</h1><p className="muted">あなた独自の6軸バランスから分析した結果です。</p><div className="resultHero" style={{'--accent':result.navigator.accent} as React.CSSProperties}><CharacterImage character={result.navigator}/><div><small>MATCHED NAVIGATOR</small><b>{result.navigator.name}との一致度が高いタイプ</b><p>{result.summary}</p></div></div>
 <h2 className="sectionTitle">6軸の詳細分析</h2><div className="profileList">{result.profile.map(p=><article className="profileCard" key={p.axis.key}><div className="axisHead"><b>{p.label}</b><span>{p.rate}%</span></div><div className="track"><div className="fill" style={{width:`${Math.max(8,p.rate)}%`}}/></div><p>{p.text}</p></article>)}</div>
 <div className="resultGrid"><article className="resultCard"><h3>強み</h3><ul>{result.strengths.map(x=><li key={x}>{x}</li>)}</ul></article><article className="resultCard"><h3>陥りやすい罠</h3><ul>{result.risks.map(x=><li key={x}>{x}</li>)}</ul></article><article className="resultCard"><h3>ストレス時</h3><p>{result.stress}</p></article><article className="resultCard"><h3>恋愛傾向</h3><p>{result.love}</p></article><article className="resultCard"><h3>仕事適性</h3><p>{result.work}</p></article><article className="resultCard"><h3>成長ポイント</h3><p>{result.growth}</p></article></div>
 <h2 className="sectionTitle">相性が良いTYPE CODE TOP 3</h2><p className="sectionLead">価値観、生活テンポ、感情の扱い、補完性、衝突リスクから総合判定しています。</p><div className="matchList">{result.matches.map((m,i)=><article className="matchCard" key={m.code}><div className="matchTop"><span className="rank">{i+1}</span><div><b>{m.code}</b><h3>{m.name}</h3></div><strong>{m.score}<small>%</small></strong></div><h4>相性が良い根拠</h4><ul>{m.reasons.map(r=><li key={r}>{r}</li>)}</ul><div className="matchNotes"><p><b>注意点</b>{m.caution}</p><p><b>関係を良くするコツ</b>{m.tip}</p></div></article>)}</div>
 <button className="primary" onClick={share}>結果をシェアする<span>↗</span></button><button className="resume" onClick={()=>start(true)}>もう一度診断する</button></motion.section>}
 </AnimatePresence></div></div></main>
}
