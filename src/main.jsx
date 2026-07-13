import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

const STORAGE_KEY = "flash_english_v1"; // 進捗 (learned フラグ) とフレーズ一覧の保存先

const CheckIcon = ({ active }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-200"}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ResetIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-indigo-600" : "text-slate-300"}>
    <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
  </svg>
);

const FileUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DEFAULT_DATA = [
  ["My research can be broadly summarized as the study of exoplanets.", "私の研究は、概ね系外惑星の研究と要約できます。"],
  ["The detection of small signals in the data was a challenge.", "データの中から小さな信号を検出することは困難でした。"],
  ["Accurate characterization of the host star is essential.", "主星の正確な特性評価は不可欠です。"],
  ["Thank you for giving me the opportunity to present today.", "本日は発表の機会をいただきありがとうございます。"],
  ["He eventually passed the oral exam after much preparation.", "準備を重ねた結果、彼は最終的に口頭試験に合格しました。"],
  ["He used to stay for a few months to collaborate with our group.", "彼はかつて、私たちのグループと共同研究するために数ヶ月間滞在していました。"],
  ["We are looking for someone to collaborate with on this project.", "このプロジェクトで共同研究してくれる人を探しています。"],
  ["I'd like to talk about some recent results from our observations.", "私たちの観測による最近の結果についてお話ししたいと思います。"],
  ["Please let me know if I am sitting in the way of the screen.", "画面を遮る場所に座っていたら教えてください。"],
  ["The students were split into two groups for the workshop.", "ワークショップのために、学生たちは2つのグループに分けられました。"],
  ["The actual observation season starts next month.", "実際の観測シーズンは来月から始まります。"],
  ["I received the emails, but they were mostly empty or corrupted.", "メールは届きましたが、ほとんど空か文字化けしていました。"],
  ["I think the connection issue might be on my side.", "接続の問題は、おそらくこちら側に原因があると思います。"],
  ["Broadly speaking, there are two types of gas giants.", "広義には、ガス惑星には2つのタイプがあります。"],
  ["These are tentative results and need further verification.", "これらは暫定的な結果であり、さらなる検証が必要です。"],
  ["The outermost planet in the system has a very long period.", "その系の最も外側にある惑星は、非常に長い周期を持っています。"],
  ["The satellite data provided a new perspective on the rings.", "衛星データは、環に関する新しい視点をもたらしました。"],
  ["The rapid expansion of the gas was unexpected.", "ガスの急速な膨張は予想外でした。"],
  ["If you convert these units to SI, the value remains consistent.", "これらの単位をSI単位に換算しても、値は一致します。"],
  ["The temperature does not remain constantly across the surface.", "表面全体の温度が一定に保たれているわけではありません。"],
  ["The orbital velocity is a function of the distance from the star.", "軌道速度は、主星からの距離の関数です。"],
  ["The orbital period of this satellite is about ten days.", "この衛星の軌道周期は約10日です。"],
  ["A big assumption we are making here is the constant density.", "ここでの大きな仮定は、密度が一定であるということです。"],
  ["The discovery in itself is significant for the field.", "その発見それ自体が、この分野にとって重要です。"],
  ["The mass changes as a function of the planet's age.", "質量は惑星の年齢に応じて変化します。"],
  ["This model might be more relevant for close-in planets.", "このモデルは、主星に近い惑星により関連があるかもしれません。"],
  ["The simple approximation worked well for my purpose.", "単純な近似が、私の目的にはうまく機能しました。"],
  ["That's where you get your initial parameters from, right?", "そこから初期パラメータを取得したのですね？"],
  ["I decided to split the group to cover more ground.", "より多くの範囲をカバーするために、グループを分けることにしました。"],
  ["The feedback can be broadly summarized into three points.", "フィードバックは概ね3つのポイントに要約できます。"],
  ["The planet is located very close in to its parent star.", "その惑星は主星の非常に近くに位置しています。"],
  ["If the assumption is wrong, we get massive problems with the fit.", "もし仮定が間違っていれば、適合に大きな問題が生じます。"],
  ["The data covers the whole range of visible light.", "そのデータは可視光の全範囲をカバーしています。"],
  ["A little expansion in the model helped fit the outliers.", "モデルを少し拡張することで、外れ値に適合させることができました。"],
  ["We need to convert it to a more usable format.", "より使いやすい形式に変換する必要があります。"],
  ["The behavior varies across the different types of stars.", "その挙動は星の種類によって異なります。"],
  ["The chemical composition is not constant across the disk.", "化学組成は円盤全体で一定ではありません。"],
  ["Is that where you got the tentative value from?", "そこからその暫定値を得たのですか？"],
  ["Since then, we have found many more similar systems.", "それ以来、私たちは多くの同様の系を発見しました。"],
  ["This is just a preliminary result, not an offer of a final theory.", "これは予備的な結果であり、最終的な理論を提示するものではありません。"],
  ["They are basically measuring the tidal effects on the moon.", "彼らは基本的に、月への潮汐効果を測定しています。"],
  ["The outer satellite orbits at a much slower pace.", "外側の衛星ははるかに遅いペースで公転しています。"],
  ["The process is so quick that we cannot observe it directly.", "そのプロセスは非常に速いため、直接観察することはできません。"],
  ["The measured value is not consistent with previous studies.", "測定値は以前の研究と一致していません。"],
  ["The proposed schema simplifies the complex interactions.", "提案されたスキームは、複雑な相互作用を簡略化します。"],
  ["Anyway, let's move on to the next slide.", "とにかく、次のスライドに進みましょう。"],
  ["I can see that this approach has several advantages.", "このアプローチにはいくつかの利点があることがわかります。"],
  ["The point we are making here is that gravity is key.", "ここで私たちが主張しているのは、重力が鍵であるということです。"],
  ["We decided to opt for a more complex simulation.", "より複雑なシミュレーションを選択することにしました。"],
  ["The calibration worked well for the entire dataset.", "キャリブレーションはデータセット全体に対してうまく機能しました。"],
].map((d, i) => ({ id: i + 1, en: d[0], ja: d[1], learned: false }));

const App = () => {
  const [activeTab, setActiveTab] = useState("training");
  const [items, setItems] = useState(DEFAULT_DATA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [status, setStatus] = useState("待機中");
  const [isThinking, setIsThinking] = useState(false);
  const [isReadingEn, setIsReadingEn] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedJaVoice, setSelectedJaVoice] = useState("");
  const [selectedEnVoice, setSelectedEnVoice] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [listeningText, setListeningText] = useState("");

  const synth = window.speechSynthesis;
  const timerRef = useRef(null);
  const isPlayingRef = useRef(false);
  const currentIdxRef = useRef(-1);
  const playPhaseRef = useRef("ja"); // "ja" = 日本語から / "en" = 英語音声から
  const fileInputRef = useRef(null);
  const mainContentRef = useRef(null);
  const cardRefs = useRef([]);

  // --- 最新値を保持する ref（再帰する runTraining が古い closure を掴まないようにするため）---
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const voicesRef = useRef(voices);
  voicesRef.current = voices;
  const jaVoiceRef = useRef(selectedJaVoice);
  jaVoiceRef.current = selectedJaVoice;
  const enVoiceRef = useRef(selectedEnVoice);
  enVoiceRef.current = selectedEnVoice;

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
      } catch (e) {
        /* 壊れていれば default のまま */
      }
    }

    const loadVoices = () => {
      const v = synth.getVoices();
      if (v.length > 0) {
        setVoices(v);
        setSelectedJaVoice((prev) => prev || v.find((x) => x.lang.startsWith("ja"))?.name || "");
        setSelectedEnVoice((prev) => prev || v.find((x) => x.lang.startsWith("en"))?.name || "");
      }
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      synth.cancel();
      clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      cardRefs.current = cardRefs.current.slice(0, items.length);
    }
  }, [items]);

  // 自動スクロール（読み上げ中のカードが上から2番目に来る位置へ）
  useEffect(() => {
    if (currentIndex !== -1 && cardRefs.current[currentIndex] && mainContentRef.current) {
      const container = mainContentRef.current;
      const target = currentIndex > 0 ? cardRefs.current[currentIndex - 1].offsetTop - 20 : 0;
      container.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [currentIndex]);

  const speak = (text, lang, voiceName, rate = 1) =>
    new Promise((resolve) => {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = voicesRef.current.find((v) => v.name === voiceName);
      if (voice) u.voice = voice;
      u.lang = lang;
      u.rate = rate;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      synth.speak(u);
    });

  const findNextIndex = (startIndex, includeCurrent = false) => {
    const list = itemsRef.current;
    if (includeCurrent && startIndex >= 0 && startIndex < list.length && !list[startIndex].learned) return startIndex;
    for (let i = startIndex + 1; i < list.length; i++) if (!list[i].learned) return i;
    for (let i = 0; i <= startIndex && i < list.length; i++) if (!list[i].learned) return i;
    return -1;
  };

  const runTraining = async (index, startPhase = "ja") => {
    if (!isPlayingRef.current || index === -1) return;

    currentIdxRef.current = index;
    setCurrentIndex(index);
    const item = itemsRef.current[index];
    if (!item) return;

    if (startPhase === "ja") {
      playPhaseRef.current = "ja";
      setIsReadingEn(false);
      setIsThinking(false);
      setStatus("日本語読み上げ中...");

      const ok = await speak(item.ja, "ja", jaVoiceRef.current, 1.2);
      if (!ok || !isPlayingRef.current) return;

      setStatus("思考時間...");
      setIsThinking(true);
      playPhaseRef.current = "en";

      const waitTime = Math.max(2000, item.en.length * 90 + 1000);
      await new Promise((r) => (timerRef.current = setTimeout(r, waitTime)));
      setIsThinking(false);
      if (!isPlayingRef.current) return;
    }

    // --- 英語フェーズ（startPhase === "en" ならここから直接始まる）---
    playPhaseRef.current = "en";
    setIsThinking(false);
    setIsReadingEn(true);
    setStatus("英語読み上げ中...");

    const okEn = await speak(item.en, "en", enVoiceRef.current, 1.0);
    if (!okEn || !isPlayingRef.current) return;

    setStatus("次へ...");
    await new Promise((r) => (timerRef.current = setTimeout(r, 1500)));
    if (!isPlayingRef.current) return;

    const next = findNextIndex(index);
    if (next !== -1) {
      runTraining(next, "ja");
    } else {
      finishAll();
    }
  };

  const startTraining = (idx = -1, phase = "ja") => {
    const targetIdx = idx !== -1 ? idx : findNextIndex(currentIdxRef.current, true);
    if (targetIdx === -1) {
      setStatus("未習得なし");
      return;
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
    runTraining(targetIdx, phase);
  };

  // STOP = 「答えを見る」操作。停止した時点で英文は表示されるので、
  // 再開(START)時は Thinking time を挟まず、そのカードの英語音声から始める。
  const stopTraining = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    synth.cancel();
    clearTimeout(timerRef.current);
    setIsThinking(false);
    setIsReadingEn(true); // 英文を表示（意図的挙動）
    if (currentIdxRef.current !== -1) {
      playPhaseRef.current = "en"; // ← 再開時は英語音声から
      setStatus("答え表示中 / STARTで英語音声");
    } else {
      playPhaseRef.current = "ja";
      setStatus("停止中");
    }
  };

  // 全カード完了時: 次に START を押したら最初から選び直せるよう state をリセット
  const finishAll = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    synth.cancel();
    clearTimeout(timerRef.current);
    setIsThinking(false);
    setIsReadingEn(true);
    currentIdxRef.current = -1;
    playPhaseRef.current = "ja";
    setStatus("全フレーズ完了");
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopTraining();
      return;
    }
    // カード未選択なら必ず日本語フェーズから。
    // 選択済み（= 直前に STOP して英文が見えている）なら playPhaseRef に従う（通常 "en"）。
    if (currentIdxRef.current === -1) startTraining(-1, "ja");
    else startTraining(currentIdxRef.current, playPhaseRef.current);
  };

  // カードをタップした場合は「そのカードを日本語から」やり直す
  const handleCardTap = (idx) => {
    stopTraining();
    currentIdxRef.current = idx;
    playPhaseRef.current = "ja";
    startTraining(idx, "ja");
  };

  const toggleItemLearned = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, learned: !item.learned } : item)));
  };

  const handleImportTSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const rows = String(event.target.result).split(/\r?\n/).filter((row) => row.trim() !== "");
      const newItems = rows
        .map((row, index) => {
          const columns = row.split(/\t/);
          return { id: Date.now() + index, en: (columns[0] || "").trim(), ja: (columns[1] || "").trim(), learned: false };
        })
        .filter((item) => item.ja && item.en);
      if (newItems.length > 0) {
        stopTraining();
        currentIdxRef.current = -1;
        playPhaseRef.current = "ja";
        setItems(newItems);
        setCurrentIndex(-1);
        setShowImportModal(false);
        setStatus("待機中");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 同じファイルを再選択できるように
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-900">
      <header className="bg-white border-b p-4 shadow-sm z-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-black text-indigo-700 italic tracking-tighter">FLASH ENGLISH</h1>
            <div className="flex gap-2 items-center">
              <button onClick={() => setShowImportModal(true)} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors" title="TSVインポート">
                <FileUpIcon />
              </button>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => { setActiveTab("training"); stopTraining(); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "training" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>英作文</button>
                <button onClick={() => { setActiveTab("listening"); stopTraining(); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "listening" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>リスニング</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="text-[10px] p-2 border rounded bg-slate-50 font-bold" value={selectedJaVoice} onChange={(e) => setSelectedJaVoice(e.target.value)}>
              {voices.filter((v) => v.lang.startsWith("ja")).map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
            <select className="text-[10px] p-2 border rounded bg-slate-50 font-bold" value={selectedEnVoice} onChange={(e) => setSelectedEnVoice(e.target.value)}>
              {voices.filter((v) => v.lang.startsWith("en")).map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 pb-64 bg-slate-100 scroll-container relative">
        <div className="max-w-2xl mx-auto">
          {activeTab === "training" ? (
            <div className="space-y-3 relative">
              <div className="mb-4 text-center">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Research Dataset</h2>
              </div>
              {items.map((item, idx) => {
                const isActive = currentIndex === idx;
                const shouldBlur = isActive && isPlaying && isThinking;
                const canShowText = isActive && isReadingEn;

                return (
                  <div
                    key={item.id}
                    ref={(el) => (cardRefs.current[idx] = el)}
                    onClick={() => handleCardTap(idx)}
                    className={`p-5 rounded-2xl border-2 bg-white transition-all cursor-pointer ${isActive ? "border-indigo-500 shadow-xl scale-[1.01] z-10" : "border-transparent shadow-sm opacity-90"} ${item.learned && !isActive ? "opacity-40 grayscale" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`text-[10px] font-black mb-1 ${isActive ? "text-indigo-400" : "text-slate-400"}`}>PHRASE {idx + 1}</p>
                        <p className={`text-lg font-bold leading-tight mb-3 ${item.learned && !isActive ? "line-through" : ""}`}>{item.ja}</p>
                        <div className="min-h-[1.5rem] flex items-center flex-wrap gap-2 relative">
                          <p className={`text-xl font-black text-indigo-700 tracking-tight transition-all duration-300 ${canShowText && !shouldBlur ? "blur-0 opacity-100 translate-y-0" : "blur-xl opacity-0 translate-y-2 select-none"}`}>
                            {item.en}
                          </p>
                          {isActive && isThinking && isPlaying && (
                            <div className="absolute left-0 text-indigo-400 text-[10px] font-black animate-pulse-fast uppercase flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                              Translating...
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleItemLearned(item.id); }} className="p-1">
                        <CheckIcon active={item.learned} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-50">
              <textarea value={listeningText} onChange={(e) => setListeningText(e.target.value)} className="w-full h-80 p-2 text-lg font-medium border-none outline-none bg-transparent resize-none" placeholder="英文をここに貼り付けてください..."></textarea>
              <button onClick={() => speak(listeningText, "en", enVoiceRef.current, 1)} className="w-full mt-4 py-5 rounded-3xl bg-indigo-600 text-white font-black text-xl shadow-lg">PLAY TEXT</button>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 p-6 border-t shadow-2xl z-40 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 tracking-widest h-4 uppercase">
            <span>{status}</span>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{items.filter((i) => i.learned).length}/{items.length} COMPLETED</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (window.confirm("進捗をリセットしますか？")) {
                  stopTraining();
                  currentIdxRef.current = -1;
                  playPhaseRef.current = "ja";
                  setItems((prev) => prev.map((i) => ({ ...i, learned: false })));
                  setStatus("待機中");
                }
              }}
              className="p-4 rounded-2xl border bg-slate-50 active:scale-95 transition-colors"
              title="進捗リセット"
            >
              <ResetIcon active={items.some((i) => i.learned)} />
            </button>
            <button onClick={togglePlay} className={`flex-1 py-5 rounded-3xl text-white font-black text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${isPlaying ? "bg-rose-500" : "bg-indigo-600"}`}>
              {isPlaying ? (
                <>
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-white animate-pulse"></div>
                    <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  STOP
                </>
              ) : (
                "START TRAINING"
              )}
            </button>
          </div>
        </div>
      </footer>

      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-black mb-2 text-indigo-700 tracking-tighter">IMPORT FILE</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium italic">対応: TSV / TXT<br />形式: 英語 [タブ] 日本語</p>
            <input type="file" accept=".tsv,.txt" className="hidden" ref={fileInputRef} onChange={handleImportTSV} />
            <div className="flex flex-col gap-3">
              <button onClick={() => fileInputRef.current.click()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg transition-all active:scale-95 uppercase tracking-widest">Select File</button>
              <button onClick={() => setShowImportModal(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

createRoot(document.getElementById("root")).render(<App />);
