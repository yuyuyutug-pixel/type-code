'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type AxisKey='social'|'plan'|'logic'|'novelty'|'action'|'sensitive';
type Character={name:string;role:string;image:string;line:string;accent:string};
type Axis={key:AxisKey;positive:string;negative:string;character:Character;questions:string[]};
type Screen='home'|'quiz'|'result';

const axes:Axis[]=[
{key:'social',positive:'交流型',negative:'内省型',character:{name:'EMA',role:'共感・交流',image:'/characters/ema.svg',line:'人との距離感を見ていくね。',accent:'#ec7ca5'},questions:['予定のない休日は誰かを誘う。','初対面でも自分から話せる。','大人数で過ごした後も誰かと話したい。','店員におすすめを聞ける。','SNSへ出来事をすぐ投稿する。','沈黙が続くと自分から話題を出す。','知らない人の中でも比較的落ち着ける。','一人の時間が続くと誰かと話したくなる。']},
{key:'plan',positive:'計画型',negative:'柔軟型',character:{name:'AXIS',role:'計画・管理',image:'/characters/axis.svg',line:'予定の立て方を確認するよ。',accent:'#6682df'},questions:['旅行前に大まかな予定を決めたい。','締切より前から作業を始める。','買い物前に必要な物を整理する。','急な予定変更が続くと疲れる。','身の回りを定期的に整理する。','複数の作業は順番に片付けたい。','予約できるものは先に予約したい。','その日の気分だけでは行動を決めない。']},
{key:'logic',positive:'論理型',negative:'共感型',character:{name:'LOG',role:'論理・分析',image:'/characters/log.svg',line:'判断するときの基準を見よう。',accent:'#7764dc'},questions:['相談を受けると解決方法を考える。','筋が通っていれば自分と違う意見も認める。','買い物では比較や性能を重視する。','感情的な場面でも原因を整理しようとする。','説明には理由や根拠が欲しい。','慰めるだけより改善方法を伝えたい。','多数派の意見でも疑問があれば調べる。','好き嫌いより合理性を優先することがある。']},
{key:'novelty',positive:'探索型',negative:'安定型',character:{name:'NOVA',role:'探究・好奇心',image:'/characters/nova.svg',line:'新しさとの付き合い方を探ろう。',accent:'#e7a33f'},questions:['新商品や新サービスを試したい。','目的地まで知らない道を通ることがある。','いつもの店でも違うメニューを頼みたい。','急な誘いでも面白そうなら参加する。','新しい趣味を始めることが多い。','変化が少ない状態が続くと退屈する。','話題になっているものは一度試したい。','説明を読むより触りながら覚えたい。']},
{key:'action',positive:'即行動型',negative:'熟考型',character:{name:'PULSE',role:'行動・実行',image:'/characters/pulse.svg',line:'動き出す速さを見ていくよ。',accent:'#4fbe98'},questions:['迷ったら一度動いて確かめる。','失敗した後の切り替えが早い。','必要だと思えばその日に始める。','欲しい物を見つけてから購入までが早い。','トラブルが起きたらすぐ対処する。','未完成でも一度形にしてみる。','人に任せるより自分で進めたい。','不安があってもチャンスなら動く。']},
{key:'sensitive',positive:'高感受型',negative:'安定感情型',character:{name:'LUMI',role:'感受性・直感',image:'/characters/lumi.svg',line:'感情の受け取り方を見よう。',accent:'#ae70d4'},questions:['送る前にLINEの文章を何度か読み返す。','声や表情の小さな変化に気づく。','言われた言葉を後から思い返す。','場の空気を読みすぎて疲れることがある。','映画や音楽で強く感動する。','返信の遅さや短さが気になることがある。','人が無理をしていると気づきやすい。','寝る前にその日の出来事を振り返る。']}
];
const questions=axes.flatMap(axis=>axis.questions.map(text=>({text,axis})));
const options=[['かなり当てはまる',2],['少し当てはまる',1],['あまり当てはまらない',-1],['ほとんど当てはまらない',-2]] as const;
const prefixes=['静かな','鋭い','柔らかな','大胆な','自由な','慎重な','熱を秘めた','揺るがない'];
const nouns=['観察者','設計者','調整役','開拓者','探究者','実行者','共鳴者','指揮者'];
const KEY='type-code-progress-v2';

function Avatar({character,className=''}:{character:Character;className?:string}){return <div className={`avatar ${className}`} style={{'--accent':character.accent} as React.CSSProperties}><img src={character.image} alt={`${character.name} ナビゲーター`}/></div>}

function calculate(answers:(number|null)[]){
 const scores=Object.fromEntries(axes.map(a=>[a.key,0])) as Record<AxisKey,number>;
 questions.forEach((q,i)=>scores[q.axis.key]+=answers[i]??0);
 const bits=axes.map(a=>scores[a.key]>=0?'1':'0').join('');
 const number=parseInt(bits,2)+1;
 const code=`TC-${String(number).padStart(2,'0')}`;
 const name=`${prefixes[Math.floor((number-1)/8)]}${nouns[(number-1)%8]}`;
 const strongest=[...axes].sort((a,b)=>Math.abs(scores[b.key])-Math.abs(scores[a.key]));
 const navigator=strongest[0].character;
 const labels=strongest.slice(0,3).map(a=>scores[a.key]>=0?a.positive:a.negative);
 return {scores,code,name,navigator,summary:`「${labels[0]}」「${labels[1]}」「${labels[2]}」が特に強く表れています。`,strength:`${labels[0]}の資質を中心に、状況を読みながら自分なりの進め方を作れること。`,caution:'得意な判断方法に寄りすぎると、反対側の価値観を見落とすことがあります。',love:scores.sensitive>=0?'相手の小さな変化を受け取り、信頼した人へ深く向き合います。':'安定した距離感を保ちながら、穏やかな関係を育てます。',work:`${scores.plan>=0?'目標と役割が明確':'裁量と変化がある'}で、${scores.logic>=0?'分析や改善':'対人理解や調整'}が評価される環境。`};
}

export default function Page(){
 const [screen,setScreen]=useState<Screen>('home');
 const [index,setIndex]=useState(0);
 const [answers,setAnswers]=useState<(number|null)[]>(Array(48).fill(null));
 const [result,setResult]=useState<ReturnType<typeof calculate>|null>(null);
 const [ready,setReady]=useState(false);
 const characters=useMemo(()=>axes.map(a=>a.character),[]);
 const current=questions[index];
 const answered=answers.filter(v=>v!==null).length;
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const data=JSON.parse(raw);if(Array.isArray(data.answers)&&data.answers.length===48){setAnswers(data.answers);setIndex(Math.min(data.index??0,47));}}}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready&&screen!=='result')localStorage.setItem(KEY,JSON.stringify({index,answers}))},[ready,index,answers,screen]);
 const go=(next:Screen)=>{setScreen(next);window.scrollTo({top:0,behavior:'smooth'})};
 const start=(fresh:boolean)=>{if(fresh){setIndex(0);setAnswers(Array(48).fill(null));setResult(null);localStorage.removeItem(KEY)}go('quiz')};
 const answer=(value:number)=>{const next=[...answers];next[index]=value;setAnswers(next);navigator.vibrate?.(16);if(index===47){setResult(calculate(next));localStorage.removeItem(KEY);go('result')}else setIndex(index+1)};
 const share=async()=>{if(!result)return;const text=`私のTYPE CODEは ${result.code}「${result.name}」でした。\n#TYPECODE #人は16タイプでは表せない`;try{if(navigator.share)await navigator.share({title:'TYPE CODE',text,url:location.href});else{await navigator.clipboard.writeText(`${text}\n${location.href}`);alert('結果をコピーしました')}}catch{}};
 return <main className="app"><div className="orb one"/><div className="orb two"/><div className="shell"><header className="brand"><span>TC</span>TYPE CODE</header><div className="panel"><AnimatePresence mode="wait">
 {screen==='home'&&<motion.section key="home" className="page" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}><p className="eyebrow">64 PERSONALITY TYPES</p><h1 className="heroTitle">人は、<br/><strong>16タイプだけ</strong>では<br/>表せない。</h1><p className="lead">6人のナビゲーターと48問を進み、思考・行動・対人傾向を6軸で分析。あなた固有のTYPE CODEを見つけます。</p><div className="heroStage"><div className="heroRow">{characters.map((c,i)=><motion.div key={c.name} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}><Avatar character={c}/></motion.div>)}</div><div className="heroCaption"><small>MEET THE NAVIGATORS</small><b>6つの視点で、あなたを読み解く。</b></div></div><div className="navigatorGrid">{characters.map(c=><div className="navigatorCard" key={c.name}><Avatar character={c}/><b>{c.name}</b><span>{c.role}</span></div>)}</div><div className="stats"><div><small>質問数</small><b>48問</b></div><div><small>診断結果</small><b>64タイプ</b></div><div><small>所要時間</small><b>約5分</b></div></div><button className="primary" onClick={()=>start(true)}>無料で診断する <span>→</span></button>{answered>0&&<button className="resume" onClick={()=>start(false)}>前回の続きから再開（{answered}/48）</button>}<p className="note">登録不要。回答はこの端末内だけに保存されます。</p></motion.section>}
 {screen==='quiz'&&<motion.section key={`q${index}`} className="page" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-18}}><div className="quizTop"><span>QUESTION {String(index+1).padStart(2,'0')}</span><span>{Math.round((index+1)/48*100)}%</span></div><div className="progress"><i style={{width:`${(index+1)/48*100}%`}}/></div><div className="guide" style={{'--accent':current.axis.character.accent} as React.CSSProperties}><Avatar character={current.axis.character}/><div><small>{current.axis.character.role}</small><b>{current.axis.character.name}が案内します</b><span>{current.axis.character.line}</span></div></div><div className="questionNo">{index+1}<span>/48</span></div><h2 className="question">{current.text}</h2><div className="answers">{options.map(([label,value],i)=><motion.button whileTap={{scale:.985}} className="answer" key={value} onClick={()=>answer(value)}><em>{String.fromCharCode(65+i)}</em><span>{label}</span><b>→</b></motion.button>)}</div><div className="actions"><button disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}>← 前へ戻る</button><button onClick={()=>go('home')}>中断する</button></div></motion.section>}
 {screen==='result'&&result&&<motion.section key="result" className="page result" initial={{opacity:0,scale:.98}} animate={{opacity:1,scale:1}}><p className="eyebrow center">YOUR TYPE CODE</p><div className="complete">ANALYSIS COMPLETE</div><div className="code">{result.code}</div><h1>{result.name}</h1><p className="center muted">あなた独自の6軸バランスを持つタイプ。</p><div className="resultHero"><Avatar character={result.navigator}/><div><small>MATCHED NAVIGATOR</small><b>{result.navigator.name}との一致度が高いタイプ</b><p>{result.summary}</p></div></div><h2 className="sectionTitle">6 AXIS PROFILE</h2>{axes.map(a=>{const score=result.scores[a.key];const rate=Math.round(Math.abs(score)/16*100);return <div className="axis" key={a.key}><div><b>{score>=0?a.positive:a.negative}</b><span>{rate}%</span></div><div className="track"><i style={{width:`${Math.max(8,rate)}%`}}/></div></div>})}<div className="resultGrid"><article><small>STRENGTH</small><h3>強み</h3><p>{result.strength}</p></article><article><small>CAUTION</small><h3>注意点</h3><p>{result.caution}</p></article><article><small>LOVE</small><h3>恋愛</h3><p>{result.love}</p></article><article><small>WORK</small><h3>仕事・環境</h3><p>{result.work}</p></article></div><button className="primary" onClick={share}>結果をシェアする <span>↗</span></button><button className="resume" onClick={()=>start(true)}>もう一度診断する</button></motion.section>}
 </AnimatePresence></div></div></main>
}