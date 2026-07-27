'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

type AxisKey = 'social' | 'plan' | 'logic' | 'novelty' | 'action' | 'sensitive';
type Character = { name: string; role: string; image: string; line: string };
type Axis = { key: AxisKey; positive: string; negative: string; character: Character; questions: string[] };

const axes: Axis[] = [
  { key:'social', positive:'交流型', negative:'内省型', character:{name:'EMA',role:'共感・交流',image:'/characters/ema.png',line:'人との距離感を見ていくね。'}, questions:['予定のない休日は誰かを誘う。','初対面でも自分から話せる。','大人数で過ごした後も誰かと話したい。','店員におすすめを聞ける。','SNSへ出来事をすぐ投稿する。','沈黙が続くと自分から話題を出す。','知らない人の中でも比較的落ち着ける。','一人の時間が続くと誰かと話したくなる。']},
  { key:'plan', positive:'計画型', negative:'柔軟型', character:{name:'AXIS',role:'計画・管理',image:'/characters/axis.png',line:'予定の立て方を確認するよ。'}, questions:['旅行前に大まかな予定を決めたい。','締切より前から作業を始める。','買い物前に必要な物を整理する。','急な予定変更が続くと疲れる。','身の回りを定期的に整理する。','複数の作業は順番に片付けたい。','予約できるものは先に予約したい。','その日の気分だけでは行動を決めない。']},
  { key:'logic', positive:'論理型', negative:'共感型', character:{name:'LOG',role:'論理・分析',image:'/characters/log.png',line:'判断するときの基準を見よう。'}, questions:['相談を受けると解決方法を考える。','筋が通っていれば自分と違う意見も認める。','買い物では比較や性能を重視する。','感情的な場面でも原因を整理しようとする。','説明には理由や根拠が欲しい。','慰めるだけより改善方法を伝えたい。','多数派の意見でも疑問があれば調べる。','好き嫌いより合理性を優先することがある。']},
  { key:'novelty', positive:'探索型', negative:'安定型', character:{name:'NOVA',role:'探究・好奇心',image:'/characters/nova.png',line:'新しさとの付き合い方を探ろう。'}, questions:['新商品や新サービスを試したい。','目的地まで知らない道を通ることがある。','いつもの店でも違うメニューを頼みたい。','急な誘いでも面白そうなら参加する。','新しい趣味を始めることが多い。','変化が少ない状態が続くと退屈する。','話題になっているものは一度試したい。','説明を読むより触りながら覚えたい。']},
  { key:'action', positive:'即行動型', negative:'熟考型', character:{name:'PULSE',role:'行動・実行',image:'/characters/pulse.png',line:'動き出す速さを見ていくよ。'}, questions:['迷ったら一度動いて確かめる。','失敗した後の切り替えが早い。','必要だと思えばその日に始める。','欲しい物を見つけてから購入までが早い。','トラブルが起きたらすぐ対処する。','未完成でも一度形にしてみる。','人に任せるより自分で進めたい。','不安があってもチャンスなら動く。']},
  { key:'sensitive', positive:'高感受型', negative:'安定感情型', character:{name:'LUMI',role:'感受性・直感',image:'/characters/lumi.png',line:'感情の受け取り方を見よう。'}, questions:['送る前にLINEの文章を何度か読み返す。','声や表情の小さな変化に気づく。','言われた言葉を後から思い返す。','場の空気を読みすぎて疲れることがある。','映画や音楽で強く感動する。','返信の遅さや短さが気になることがある。','人が無理をしていると気づきやすい。','寝る前にその日の出来事を振り返る。']}
];

const questions = axes.flatMap(axis => axis.questions.map(text => ({ text, axis })));
const options = [
  {label:'かなり当てはまる',value:2},
  {label:'少し当てはまる',value:1},
  {label:'あまり当てはまらない',value:-1},
  {label:'ほとんど当てはまらない',value:-2}
];
const prefixes = ['静かな','鋭い','柔らかな','大胆な','自由な','慎重な','熱を秘めた','揺るがない'];
const nouns = ['観察者','設計者','調整役','開拓者','探究者','実行者','共鳴者','指揮者'];

export default function Home() {
  const [screen,setScreen] = useState<'home'|'quiz'|'result'>('home');
  const [index,setIndex] = useState(0);
  const [answers,setAnswers] = useState<(number|null)[]>(Array(48).fill(null));
  const [result,setResult] = useState<null | ReturnType<typeof calculate>>(null);
  const current = questions[index];

  const characters = useMemo(() => axes.map(a => a.character), []);

  function start(){ setIndex(0); setAnswers(Array(48).fill(null)); setResult(null); setScreen('quiz'); window.scrollTo(0,0); }
  function answer(value:number){
    const next=[...answers]; next[index]=value; setAnswers(next);
    if(index===47){ const calculated=calculate(next); setResult(calculated); setScreen('result'); window.scrollTo(0,0); }
    else setIndex(index+1);
  }

  return <main className="app"><div className="shell"><header className="brand">TYPE CODE</header><div className="panel"><AnimatePresence mode="wait">
    {screen==='home' && <motion.section className="page" key="home" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
      <div className="eyebrow">64 PERSONALITY TYPES</div>
      <h1 className="heroTitle">人は、<br/><strong>16タイプだけ</strong>では<br/>表せない。</h1>
      <p className="lead">6人のナビゲーターと48問を進み、思考・行動・対人傾向を6軸で分析。あなた固有のTYPE CODEを見つけます。</p>
      <div className="heroMedia"><img src="/characters/group.jpg" alt="TYPE CODEの6人のナビゲーター"/></div>
      <div className="characterGrid">{characters.map(c=><div className="characterCard" key={c.name}><div className="characterImage"><img src={c.image} alt={c.name}/></div><b>{c.name}</b></div>)}</div>
      <div className="stats"><div className="stat"><span>質問数</span><b>48問</b></div><div className="stat"><span>診断結果</span><b>64タイプ</b></div><div className="stat"><span>所要時間</span><b>約5分</b></div></div>
      <button className="primary" onClick={start}>無料で診断する</button>
    </motion.section>}

    {screen==='quiz' && <motion.section className="page" key={`q-${index}`} initial={{opacity:0,x:22}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-18}}>
      <div className="quizTop"><span>{index+1} / 48</span><span>{Math.round((index+1)/48*100)}%</span></div>
      <div className="progress"><div className="progressBar" style={{width:`${(index+1)/48*100}%`}}/></div>
      <div className="guide"><div className="guideImage"><img src={current.axis.character.image} alt={current.axis.character.name}/></div><div><small>{current.axis.character.role}</small><b>{current.axis.character.name}が案内します</b><span>{current.axis.character.line}</span></div></div>
      <h2 className="question">{current.text}</h2>
      <div className="answers">{options.map(o=><motion.button whileTap={{scale:.985}} className="answer" key={o.value} onClick={()=>answer(o.value)}>{o.label}</motion.button>)}</div>
      <div className="actions"><button className="ghost" disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}>前へ戻る</button><button className="ghost" onClick={()=>setScreen('home')}>最初へ</button></div>
    </motion.section>}

    {screen==='result' && result && <motion.section className="page" key="result" initial={{opacity:0,scale:.98}} animate={{opacity:1,scale:1}}>
      <div className="eyebrow">YOUR TYPE CODE</div><div className="resultCode">{result.code}</div><h1 className="resultTitle">{result.name}</h1><p className="muted">あなた独自の6軸バランスを持つタイプ。</p>
      <div className="resultHero"><img src={result.navigator.image} alt={result.navigator.name}/><div><b>{result.navigator.name}との一致度が高いタイプ</b><p>{result.summary}</p></div></div>
      {axes.map(a=>{const score=result.scores[a.key];const rate=Math.round(Math.abs(score)/16*100);return <div className="axis" key={a.key}><div className="axisHead"><b>{score>=0?a.positive:a.negative}</b><span>{rate}%</span></div><div className="track"><div className="fill" style={{width:`${Math.max(8,rate)}%`}}/></div></div>})}
      <div className="resultGrid"><div className="resultCard"><b>強み</b><p>{result.strength}</p></div><div className="resultCard"><b>注意点</b><p>{result.weakness}</p></div><div className="resultCard"><b>恋愛</b><p>{result.love}</p></div><div className="resultCard"><b>仕事</b><p>{result.work}</p></div></div>
      <textarea className="shareBox" readOnly value={`私のTYPE CODEは ${result.code}「${result.name}」でした。\n#TYPECODE #人は16タイプでは表せない`}/><div style={{height:12}}/><button className="primary" onClick={async()=>{const text=`私のTYPE CODEは ${result.code}「${result.name}」でした。`;if(navigator.share) await navigator.share({title:'TYPE CODE',text,url:location.href});else await navigator.clipboard.writeText(`${text}\n${location.href}`)}}>結果をシェアする</button><div style={{height:12}}/><button className="ghost" onClick={start}>もう一度診断する</button>
    </motion.section>}
  </AnimatePresence></div></div></main>;
}

function calculate(values:(number|null)[]){
  const scores:Record<AxisKey,number>={social:0,plan:0,logic:0,novelty:0,action:0,sensitive:0};
  questions.forEach((q,i)=>scores[q.axis.key]+=values[i]??0);
  const bits=axes.map(a=>scores[a.key]>=0?'1':'0').join('');
  const number=parseInt(bits,2)+1;
  const code=`TC-${String(number).padStart(2,'0')}`;
  const name=`${prefixes[Math.floor((number-1)/8)]}${nouns[(number-1)%8]}`;
  const strongest=[...axes].sort((a,b)=>Math.abs(scores[b.key])-Math.abs(scores[a.key]));
  const navigator=strongest[0].character;
  const traits=strongest.slice(0,3).map(a=>scores[a.key]>=0?a.positive:a.negative);
  return {
    code,name,scores,navigator,
    summary:`「${traits[0]}」「${traits[1]}」「${traits[2]}」の傾向が強く、状況に応じて自分の判断軸を使い分けます。`,
    strength:scores.action>=0?'決断後の初動が速く、周囲を前へ進められる。':'情報を整理し、見落としを減らしてから動ける。',
    weakness:scores.sensitive>=0?'周囲の反応を受け取りすぎて消耗しやすい。':'自分の平静さが、相手には淡白に見えることがある。',
    love:scores.social>=0?'会話と共有を重ねながら親密さを育てる。':'狭く深い関係を好み、信頼後は一途に向き合う。',
    work:`${scores.plan>=0?'目標と役割が明確な環境':'裁量があり変化へ対応できる環境'}で、${scores.logic>=0?'分析・改善':'対人理解・調整'}を活かしやすい。`
  };
}
