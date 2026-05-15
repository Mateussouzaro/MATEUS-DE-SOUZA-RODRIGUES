import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Flame, 
  Target, 
  ShieldAlert, 
  Crosshair, 
  Download, 
  Cpu, 
  Gauge, 
  RefreshCw, 
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  Check,
  Zap,
  Smartphone,
  PlayCircle,
  HelpCircle,
  Upload,
  Video,
  Trophy,
  Swords,
  Gamepad2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

// Weapon data layout
interface WeaponConfig {
  id: string;
  name: string;
  type: "SMG" | "Shotgun" | "Rifle" | "Pistol" | "Sniper";
  icon: string;
  sensi: number; // 0 to 200
  puxada: "Suave" | "Rápida" | "Violenta";
}

// User-created or Preset profiles
interface SensiProfile {
  id: string;
  name: string;
  brand: string;
  model: string;
  dpi: number;
  sensiSettings: {
    geral: number;
    redDot: number;
    mira2x: number;
    mira4x: number;
    miraAwm: number;
    olhadinha: number;
  };
  weapons: WeaponConfig[];
}

const DEFAULT_WEAPONS: WeaponConfig[] = [
  { id: "m1014", name: "M1014 (Doze Velha)", type: "Shotgun", icon: "🎴", sensi: 192, puxada: "Violenta" },
  { id: "m1887", name: "M1887 (Doze Nova)", type: "Shotgun", icon: "⚡", sensi: 185, puxada: "Violenta" },
  { id: "mp40", name: "MP40 (SMG)", type: "SMG", icon: "💥", sensi: 174, puxada: "Rápida" },
  { id: "ump", name: "UMP (SMG)", type: "SMG", icon: "🔥", sensi: 168, puxada: "Rápida" },
  { id: "deagle", name: "Desert Eagle (One Tap)", type: "Pistol", icon: "🔫", sensi: 180, puxada: "Suave" },
  { id: "ak47", name: "AK-47 (Rifle)", type: "Rifle", icon: "🛡️", sensi: 125, puxada: "Suave" },
  { id: "scar", name: "SCAR (Rifle)", type: "Rifle", icon: "🎯", sensi: 138, puxada: "Suave" },
  { id: "awm", name: "AWM (Scope)", type: "Sniper", icon: "👁️", sensi: 82, puxada: "Suave" }
];

const INITIAL_PROFILES: SensiProfile[] = [
  {
    id: "pro-capa-facil",
    name: "🔥 BUG DE SENSI - 100% CAPA",
    brand: "Xiaomi",
    model: "Poco F5 Pro",
    dpi: 720,
    sensiSettings: { geral: 195, redDot: 190, mira2x: 182, mira4x: 175, miraAwm: 95, olhadinha: 120 },
    weapons: DEFAULT_WEAPONS.map(w => ({ ...w, sensi: w.id === "deagle" ? 198 : w.id === "mp40" ? 185 : w.id === "m1014" ? 196 : w.sensi }))
  },
  {
    id: "nobru-rush",
    name: "👑 SENSI NOBRU APELÃO",
    brand: "Apple iPhone",
    model: "15 Pro Max",
    dpi: 620,
    sensiSettings: { geral: 172, redDot: 165, mira2x: 154, mira4x: 148, miraAwm: 85, olhadinha: 100 },
    weapons: DEFAULT_WEAPONS.map(w => ({ ...w, sensi: w.sensi - 10 }))
  },
  {
    id: "camp-estavel",
    name: "📋 PADRÃO CAMPEONATO (ESTÁVEL)",
    brand: "Samsung",
    model: "S23 Ultra",
    dpi: 480,
    sensiSettings: { geral: 132, redDot: 128, mira2x: 120, mira4x: 110, miraAwm: 70, olhadinha: 85 },
    weapons: DEFAULT_WEAPONS.map(w => ({ ...w, sensi: w.sensi - 25 }))
  }
];

export default function App() {
  // Profiles State
  const [profiles, setProfiles] = useState<SensiProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>("pro-capa-facil");
  const [newProfileName, setNewProfileName] = useState<string>("");

  // Tab systems
  const [activeLeftTab, setActiveLeftTab] = useState<"device" | "injector" | "video">("injector");

  // Simulated Pro Tweaks (Xit, Regedit, No Recoil, Anti-ban)
  const [cheatXitActive, setCheatXitActive] = useState<boolean>(false);
  const [regeditActive, setRegeditActive] = useState<boolean>(false);
  const [noRecoilActive, setNoRecoilActive] = useState<boolean>(false);
  const [antibanActive, setAntibanActive] = useState<boolean>(true); // default to true for "Safety First" feeling!
  const [selectedRegeditTarget, setSelectedRegeditTarget] = useState<"android" | "ios" | "pc">("android");
  
  // Injection Process simulates
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [injectProgress, setInjectProgress] = useState<number>(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "IPZ SENSIPRO Neural-Guard v5.0 inicializado com sucesso.",
    "Status: Pronto para calibrar e otimizar."
  ]);

  // Video Analysis State
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [isDraggingVideo, setIsDraggingVideo] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [detectedCrosshair, setDetectedCrosshair] = useState<string>("Mira no Peito");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Live Training Ground State
  const [testWeaponId, setTestWeaponId] = useState<string>("mp40");
  const [userDragSpeed, setUserDragSpeed] = useState<number>(120); // 0 to 200 slider simulating drag speed
  const [lastShotResult, setLastShotResult] = useState<{ result: string; damage: number; type: "peito" | "capa" | "passou"; id: number } | null>(null);
  const [testHistory, setTestHistory] = useState<Array<{ weapon: string; type: "capa" | "peito" | "passou"; dmg: number }>>([]);
  const [isShootingAnimation, setIsShootingAnimation] = useState<boolean>(false);

  // General state triggers
  const [isFullRedPreset, setIsFullRedPreset] = useState<boolean>(false);
  const [capaPopupCount, setCapaPopupCount] = useState<number>(0);
  const [showGlobalCapa, setShowGlobalCapa] = useState<boolean>(false);

  // Gemini AI advice states
  const [aiResponseText, setAiResponseText] = useState<string>("").slice(); // keeping type compatible
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string }>>([
    { role: "model", text: "Salve capudo! Sou o treinador IPZ SENSIPRO AI. Ajuste sua sensibilidade acima e clique em 'Analisar com IA' ou tire suas dúvidas sobre DPI e velocidade do botão de atirar aqui!" }
  ]);

  // Push secure log helper
  const addConsoleLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setConsoleLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  };

  // Track active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Sync general sliders to current profile
  const setGeneralSensi = (field: keyof SensiProfile["sensiSettings"], value: number) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          sensiSettings: {
            ...p.sensiSettings,
            [field]: value
          }
        };
      }
      return p;
    }));
  };

  // Sync specific weapon slider in active profile
  const setWeaponSensi = (weaponId: string, value: number) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          weapons: p.weapons.map(w => w.id === weaponId ? { ...w, sensi: value } : w)
        };
      }
      return p;
    }));
  };

  // Profile management interactions
  const handleCreateProfile = () => {
    if (!newProfileName.trim()) {
      alert("Digite um nome para o perfil!");
      return;
    }
    const newId = "custom-" + Date.now();
    const newProf: SensiProfile = {
      id: newId,
      name: `📂 ${newProfileName.toUpperCase()}`,
      brand: activeProfile.brand,
      model: activeProfile.model,
      dpi: activeProfile.dpi,
      sensiSettings: { ...activeProfile.sensiSettings },
      weapons: activeProfile.weapons.map(w => ({ ...w }))
    };
    setProfiles(prev => [...prev, newProf]);
    setActiveProfileId(newId);
    setNewProfileName("");
    
    setChatMessages(prev => [
      ...prev,
      { role: "user", text: `Criado perfil: ${newProfileName}` },
      { role: "model", text: `Perfil "${newProfileName}" criado com sucesso! Agora você pode calibrar cada arma individualmente para este perfil de forma exclusiva.` }
    ]);
  };

  const handleDeleteProfile = (idToDelete: string) => {
    if (profiles.length <= 1) {
      alert("Você precisa manter pelo menos um perfil de sensibilidade ativo!");
      return;
    }
    setProfiles(prev => prev.filter(p => p.id !== idToDelete));
    if (activeProfileId === idToDelete) {
      const remaining = profiles.filter(p => p.id !== idToDelete);
      setActiveProfileId(remaining[0].id);
    }
  };

  // Device parameter changes on active profile
  const updateDeviceField = (field: "brand" | "model" | "dpi", value: any) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleSimulatedInjection = () => {
    setIsInjecting(true);
    setInjectProgress(0);
    const initialText = "Iniciando injeção de calibradores neurais avançados (Sensi, Regedit, No-Recoil)...";
    addConsoleLog(initialText);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 14) + 8;
      if (progress >= 100) {
        setInjectProgress(100);
        setIsInjecting(false);
        clearInterval(interval);
        addConsoleLog("SISTEMA DE TRAPAÇA COGNITIVA [ATIVADO]!");
        addConsoleLog("Módulos de Regedit Mobile injetados com resposta em 1ms.");
        addConsoleLog("Estabilizador NO-RECOIL acoplado perfeitamente nas armas.");
        addConsoleLog("STATUS ANTIBAN: Certificado de BYPASS v12 autenticado e ativo [100% SEGURO].");
        
        // Toggle everything to true
        setCheatXitActive(true);
        setRegeditActive(true);
        setNoRecoilActive(true);
        setAntibanActive(true);
        
        // Show Capudos pop
        setCapaPopupCount(c => c + 1);
        setShowGlobalCapa(true);
        setTimeout(() => setShowGlobalCapa(false), 900);
      } else {
        setInjectProgress(progress);
        const logSteps = [
          "Buscando pointers da engine do jogo no buffer...",
          "Ajustando escala de DPI virtual de subida e compensação...",
          "Carregando tabelas de interpolação XML do Regedit...",
          "Anulando eixos de espalhamento horizontal de tiro (No-Recoil)...",
          "Acionando chave anti-detecção virtual (Antiban Bypass)...",
          "Configurando sensibilidade geral automatizada para 100% cabeça..."
        ];
        const stepMsg = logSteps[Math.floor((progress / 100) * logSteps.length)];
        addConsoleLog(stepMsg);
      }
    }, 150);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        alert("Apenas arquivos de vídeo são suportados (.mp4, .mkv, .webm etc.)!");
        return;
      }
      setVideoFileName(file.name);
      const url = URL.createObjectURL(file);
      setSelectedVideoUrl(url);
      addConsoleLog(`[Video Scanner] Arquivo "${file.name}" carregado (${(file.size / (1024 * 1024)).toFixed(2)} MB). Pronto para varredura.`);
    }
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        alert("Por favor, solte apenas arquivos de vídeo!");
        return;
      }
      setVideoFileName(file.name);
      const url = URL.createObjectURL(file);
      setSelectedVideoUrl(url);
      addConsoleLog(`[Video Scanner] Arrastado: "${file.name}" carregado (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
    }
  };

  const handleVideoSelectDemoClip = () => {
    setVideoFileName("Demonstracao_Gameplay_FF_Nobru_Style.mp4");
    // Using a sample public standard loopable mp4 so they can watch gameplay logic scanner
    setSelectedVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-touching-screen-34444-large.mp4");
    addConsoleLog("[Video Scanner] Clipe de Demonstração SensiPro FF carregado.");
  };

  const handleClearVideo = () => {
    setVideoFileName("");
    setSelectedVideoUrl("");
    setDetectedCrosshair("Mira no Peito");
    addConsoleLog("[Video Scanner] Clipe de vídeo liberado.");
  };

  const runVideoAnalysis = () => {
    if (!selectedVideoUrl) {
      alert("Por favor, selecione ou envie uma gameplay de vídeo primeiro!");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    addConsoleLog(`[Scanner FF] Iniciando varredura espectral no clipe: "${videoFileName}"`);

    const interval = setInterval(() => {
      setAnalysisProgress(p => {
        const nextProgress = p + Math.floor(Math.random() * 12) + 6;
        if (nextProgress >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          const outcomes = [
            "Mira grudando no peitão (Calibrar puxada)",
            "Tiros espalhando da cabeça (Reduzir mira geral)",
            "Mira passando da cabeça do boneco (Aumentar DPI)"
          ];
          const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
          setDetectedCrosshair(chosen);
          
          // Boost values as an automated recommendation
          setGeneralSensi("geral", Math.min(200, activeProfile.sensiSettings.geral + 12));
          setGeneralSensi("redDot", Math.min(200, activeProfile.sensiSettings.redDot + 8));
          
          addConsoleLog(`[Scanner] Análise concluída no vídeo de treino!`);
          addConsoleLog(`[Scanner Resultado] Recuo detectado: ${chosen}`);
          addConsoleLog(`[Calibragem Neural] Ajustado com sucesso (+12 Geral e +8 RedDot no Perfil)`);
          
          triggerAiCalibratorText();
          return 100;
        }
        
        // Dynamic logging steps
        const stages = [
          "Diferenciando pixels da cabeça e silhueta do oponente...",
          "Calculando ângulo e velocidade da subida de mira...",
          "Convertendo vetores de arrasto físico para DPI virtual...",
          "Eliminando distorções e frames duplicados do gravador...",
          "Construindo curva corretora de sensibilidade dinâmica..."
        ];
        const activeStage = stages[Math.floor((nextProgress / 100) * stages.length)];
        addConsoleLog(`[Scanner Conectado] ${activeStage} (${Math.min(100, nextProgress)}%)`);
        
        return nextProgress;
      });
    }, 300);
  };

  // Direct custom trigger sound using core Web Audio API synthesis
  const synthesiseBeep = (type: "capa" | "peito") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === "capa") {
        // High pitched crisp impact ding
        osc.type = "sine";
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else {
        // Heavy low body blow sound
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (_) {}
  };

  // Perform Shooting Practice Calculations inside app
  const triggerShotTest = () => {
    setIsShootingAnimation(true);
    
    // Calculate if it hits standard peito, capa or passed head based on:
    // 1. Weapon sensitivity configured in active profile (0-200)
    // 2. Player drag speed selected (0-200 slider)
    const testedWeapon = activeProfile.weapons.find(w => w.id === testWeaponId) || activeProfile.weapons[0];
    const weaponSensiValue = testedWeapon.sensi;
    
    let resultType: "peito" | "capa" | "passou";
    let damage = 31;
    let label = "💥 PEITO";

    // Dynamic enhancements from active simulated tweaks
    if (cheatXitActive) {
      // 100% Locked headshot!
      resultType = "capa";
      damage = Math.floor(Math.random() * 50) + 480; // massive visual damage lock
      label = `🔴 XIT AUTO-AIM LOCK: 100% CAPA ATIVO`;
      synthesiseBeep("capa");
      setCapaPopupCount(c => c + 1);
      setShowGlobalCapa(true);
      setTimeout(() => setShowGlobalCapa(false), 850);
      addConsoleLog(`[Aim Lock] Disparo efetuado com XIT ativado. Alvo Travado.`);
    } else {
      let comboPower = weaponSensiValue + userDragSpeed;
      
      // Simulated REGEDIT increases accuracy sweet spot significantly
      if (regeditActive) {
        // Boosts standard values to perfect sweet spot if close, or guarantees 90% headshot accuracy
        comboPower = 300; 
        addConsoleLog(`[Regedit Optimizer] Suavização de pixels ativa. Alinhamento perfeito.`);
      }
      
      // Simulated NO-RECOIL holds crosshair firmly on the head constraint, stopping it from passing head
      if (noRecoilActive && comboPower > 350) {
        comboPower = 315;
        addConsoleLog(`[No Recoil] Estabilizador atenuou 100% da dispersão vertical.`);
      }

      if (comboPower < 260) {
        resultType = "peito";
        damage = Math.floor(Math.random() * 15) + 32; // basic body hit
        label = `PEITO (Arraste muito fraco ou Sensi baixa)`;
        synthesiseBeep("peito");
        addConsoleLog(`[Treino] Tiro no peito com ${testedWeapon.name}. Aumente a velocidade ou a Sensi!`);
      } else if (comboPower >= 260 && comboPower <= 350) {
        resultType = "capa";
        damage = Math.floor(Math.random() * 60) + 240; // RED CAPA CRITICAL!
        label = `🔥 100% CAPA (Vermelho!)`;
        synthesiseBeep("capa");
        setCapaPopupCount(c => c + 1);
        setShowGlobalCapa(true);
        setTimeout(() => setShowGlobalCapa(false), 850);
        addConsoleLog(`[Treino] SUCESSO! 100% CAPA VERMELHO de ${testedWeapon.name}!`);
      } else {
        resultType = "passou";
        damage = 0; // missed shot entirely passing over head
        label = `💨 PASSOU DA CABEÇA (Sensi muito alta ou Puxada violenta)`;
        addConsoleLog(`[Treino] Mira passou da cabeça do oponente. Reduza a Sensi ou a puxada!`);
      }
    }

    const shotId = Date.now();
    setLastShotResult({ result: label, damage, type: resultType, id: shotId });
    setTestHistory(prev => [{ weapon: testedWeapon.name, type: resultType, dmg: damage }, ...prev.slice(0, 7)]);
    
    setTimeout(() => {
      setIsShootingAnimation(false);
    }, 300);
  };

  // Super master Full Vermelho auto adjustment
  const actuateFullRedUltra = () => {
    setIsFullRedPreset(true);
    
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          dpi: 780,
          sensiSettings: {
            geral: 198,
            redDot: 195,
            mira2x: 188,
            mira4x: 182,
            miraAwm: 115,
            olhadinha: 130
          },
          weapons: p.weapons.map(w => ({
            ...w,
            sensi: Math.min(200, Math.round(w.sensi * 1.06 + 10))
          }))
        };
      }
      return p;
    }));

    // Auto update user slide drag speed to simulate absolute perfection
    setUserDragSpeed(135); 
    setCapaPopupCount(c => c + 1);
    setShowGlobalCapa(true);
    setTimeout(() => setShowGlobalCapa(false), 900);

    setChatMessages(prev => [
      ...prev,
      { role: "user", text: "Ativar calibrador FULL VERMELHO 100% CAPA" },
      { role: "model", text: "💥 ABSOLUTAMENTE REGULADO! A sensi geral foi travada em 198 e seu DPI foi calibrado para 780 DPI. Suas armas receberam micro-ajustes térmicos para otimização em formato J. Tente treinar no simulador de puxada abaixo agora!" }
    ]);
  };

  // API Call to Gemini
  const triggerAiCalibratorText = async () => {
    setIsAiLoading(true);
    const apiKey = process.env.GEMINI_API_KEY || "";
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é o IPZ SENSIPRO AI Coach de Free Fire. Analise as configurações a seguir e forneça um treinamento rápido, direto e cheio de gírias de Free Fire (como 'capudo', 'puxada', 'sensi', 'subir mira') sobre como o jogador pode dar 100% capa.
      Celular: ${activeProfile.brand} ${activeProfile.model} com DPI atual de ${activeProfile.dpi}.
      Configurações globais de 0 a 200: Geral ${activeProfile.sensiSettings.geral}, Mira RedDot ${activeProfile.sensiSettings.redDot}.
      Resultado do scanner: ${detectedCrosshair}.
      Cite o comportamento das armas Desert Eagle, MP40 e M1014 baseado nas sensibilidades do perfil. Seja curto e direto em no máximo 150 palavras.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      if (response && response.text) {
        setAiResponseText(response.text);
        setChatMessages(prev => [
          ...prev,
          { role: "model", text: response.text }
        ]);
      }
    } catch (_) {
      const fallback = `🔥 IPZ SENSIPRO AI [OFFLINE MODE]: No seu ${activeProfile.brand} ${activeProfile.model}, com DPI ${activeProfile.dpi}, recomendo diminuir seu botão de atirar para 48%. Sua sensi Geral de ${activeProfile.sensiSettings.geral} está excelente. Para a MP40 faça a puxada meia-lua rápida. Já para a Desert Eagle dê um toque seco subindo o dedão para a diagonal superior! Defina a velocidade de ponteiro no máximo.`;
      setAiResponseText(fallback);
      setChatMessages(prev => [
        ...prev,
        { role: "model", text: fallback }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Free-form chat assistant execution
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;

    const userText = aiPromptInput;
    setChatMessages(prev => [...prev, { role: "user", text: userText }]);
    setAiPromptInput("");
    setIsAiLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é o IPZ SENSIPRO AI Coach especializado em calibração de Free Fire mobile. O usuário perguntou: "${userText}". Responda em Português do Brasil com dicas de treino práticas, recomendação de DPI de 0 a 200 e segredos do botão de disparo. Seja muito motivador.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      if (response && response.text) {
        setChatMessages(prev => [...prev, { role: "model", text: response.text }]);
      }
    } catch (_) {
      setChatMessages(prev => [
        ...prev,
        { role: "model", text: "Para dominar o capa de SMG (UMP/MP40), posicione o analógico bem fixo e suba o botão de tiro suavemente a princípio. Quanto mais longe o oponente, menor força sua puxada requer!" }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Game mode AI calibration generator
  const handleGameModeSensi = async (mode: "rankeada" | "x1" | "4v4") => {
    setIsAiLoading(true);
    
    // Add user request to chat stream
    const userText = `Gerar sensibilidade dinâmica calibrada por IA focada no modo ${mode.toUpperCase()}`;
    setChatMessages(prev => [...prev, { role: "user", text: userText }]);
    
    // Setup predefined highly optimized configs for target mode state changes
    const configUpdates = {
      rankeada: {
        title: "🏆 RANKED TACTICAL (DPI 840)",
        geral: 184,
        redDot: 188,
        mira2x: 194,
        mira4x: 189,
        miraAwm: 92,
        olhadinha: 110,
        dpiChange: 840,
        logs: [
          "[IPZ AI] Inicializando protocolo de calibração dinâmica RANKEADA...",
          "[IPZ AI] Amplificando estabilizadores de mira em distâncias longas (Mira 2X/4X)...",
          "[IPZ AI] Sintonizando compensador dinâmico de recuo para fuzis de assalto...",
          "[IPZ AI] Calibragem concluída: Geral 184, RedDot 188, DPI 840."
        ],
        weaponUpdates: { ak47: 175, scar: 182, awm: 135, m1014: 155, m1887: 158, mp40: 172, ump: 178, deagle: 168 }
      },
      x1: {
        title: "⚔️ ONE-TAP CLOSE COMBAT (DPI 960)",
        geral: 200,
        redDot: 200,
        mira2x: 175,
        mira4x: 170,
        miraAwm: 75,
        olhadinha: 140,
        dpiChange: 960,
        logs: [
          "[IPZ AI] Ativando algoritmo dinâmico de X1 de alta velocidade...",
          "[IPZ AI] Sincronizando atraso zero de clique para Desert Eagle One-Tap...",
          "[IPZ AI] Reduzindo arrasto de mira branca fora da silhueta...",
          "[IPZ AI] Calibragem concluída: Geral 200, RedDot 200, DPI 960."
        ],
        weaponUpdates: { deagle: 200, m1014: 198, m1887: 195, ak47: 135, scar: 142, awm: 80, mp40: 182, ump: 180 }
      },
      "4v4": {
        title: "🔥 CONTRA SQUAD AGGRESSIVE RUSH (DPI 780)",
        geral: 194,
        redDot: 192,
        mira2x: 185,
        mira4x: 178,
        miraAwm: 86,
        olhadinha: 125,
        dpiChange: 780,
        logs: [
          "[IPZ AI] Sintonizando calibrador de velocidade para 4v4 (CS)...",
          "[IPZ AI] Otimizando curva de puxada rápida para SMGs (UMP/MP40)...",
          "[IPZ AI] Minimizando espalhamento dinâmico em disparos contínuos...",
          "[IPZ AI] Calibragem concluída: Geral 194, RedDot 192, DPI 780."
        ],
        weaponUpdates: { mp40: 196, ump: 194, deagle: 188, m1014: 185, m1887: 187, ak47: 148, scar: 156, awm: 90 }
      }
    };

    const upd = configUpdates[mode];
    
    // Update active profile states
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          dpi: upd.dpiChange,
          sensiSettings: {
            geral: upd.geral,
            redDot: upd.redDot,
            mira2x: upd.mira2x,
            mira4x: upd.mira4x,
            miraAwm: upd.miraAwm,
            olhadinha: upd.olhadinha
          },
          weapons: p.weapons.map(w => {
            const newSensi = upd.weaponUpdates[w.id as keyof typeof upd.weaponUpdates];
            return newSensi !== undefined ? { ...w, sensi: newSensi } : w;
          })
        };
      }
      return p;
    }));

    // Post logs sequentially to console
    upd.logs.forEach((logMessage, index) => {
      setTimeout(() => {
        addConsoleLog(logMessage);
      }, index * 200);
    });

    // Custom tactical synth sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (_) {}

    try {
      const apiKey = process.env.GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é o IPZ SENSIPRO AI Coach de Free Fire. O usuário solicitou calibrar sensibilidade para o modo ${mode.toUpperCase()} (Rankeada: tático/sobrevivência/longrange; X1: velocidade extrema/one-tap Desert/Shotgun; 4v4: rush agressivo de SMG UMP/MP40).
      
      Gere uma resposta tática em português do Brasil, explicando que você reconfigurou automaticamente o perfil dele para a especificação do modo com:
      - Sensi Geral: ${upd.geral}
      - RedDot: ${upd.redDot}
      - DPI recomendada: ${upd.dpiChange} DPI
      - Sensibilidades das armas de rush/longo alcance otimizadas.

      Diga gírias como "full vermelho", "capudo", "trilhares", "movimentação insana", "puxada perfeita" e dê 1 dica prática e de ouro para amassar nesse modo de jogo, além de parabenizar por usar a IA do IPZ SENSIPRO. Seja direto no máximo em 130 palavras.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      if (response && response.text) {
        setChatMessages(prev => [...prev, { role: "model", text: response.text }]);
      }
    } catch (_) {
      // Offline fallback selection
      let fallbackText = "";
      if (mode === "rankeada") {
        fallbackText = `🏆 Perfil RANKEADA Aplicado! Sensi Geral regulada para ${upd.geral}, RedDot ${upd.redDot} e calibrado em ${upd.dpiChange} DPI. Ajuste perfeito de estabilizadores de fuzil. Dica: Para longa distância, não dê puxadas fortes. Dê rajadas de 3 a 4 tiros segurando levemente o botão de disparo para manter a precisão dinâmica!`;
      } else if (mode === "x1") {
        fallbackText = `⚔️ Perfil X1 ATIVADO! Ajustado a Sensi Geral no talo (${upd.geral}), RedDot ${upd.redDot} e ${upd.dpiChange} DPI. Perfeito para a Desert Eagle e Shotguns One-Tap. Dica: Faça a puxada em formato de 'meia-lua' ou em 'J' ultra rápido partindo do peito do oponente para a cabeça!`;
      } else {
        fallbackText = `🔥 Perfil 4v4 RUSH carregado! Sensi Geral ${upd.geral} e cano calibrado com ${upd.dpiChange} DPI. Ajuste sob medida para SMGs (UMP e MP40). Dica: Avance com analógico travado, solte o analógico e suba o dedo com força média no peitoral do inimigo que ele vai desconfigurar com 3 trilhares na cara!`;
      }
      setChatMessages(prev => [...prev, { role: "model", text: fallbackText }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans flex flex-col relative selection:bg-red-600 selection:text-white">
      
      {/* GLOBAL FULL RED CRITICAL CELEBRATION EFFECT */}
      <AnimatePresence>
        {showGlobalCapa && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <motion.div 
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [1, 1.4, 0.95], opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center relative bg-red-600/20 backdrop-blur-md border-2 border-red-500 px-12 py-8 rounded-3xl shadow-[0_0_60px_rgba(255,0,0,0.8)]"
            >
              <span className="text-red-500 text-xs font-mono tracking-widest block mb-1">🎯 NERVE RECOIL LOCK ACTIVE</span>
              <h1 className="font-sans font-black text-6xl text-red-500 leading-none tracking-tighter">FULL VERMELHO</h1>
              <h2 className="text-2xl font-bold italic text-white uppercase tracking-wider mt-2">100% CAPA ATIVADO</h2>
              <div className="absolute -top-3 -right-3 bg-red-600 text-white font-mono text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-lg font-bold">
                {capaPopupCount}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <header className="h-20 bg-[#0D0E11] border-b border-[#222226] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 bg-gradient-to-br from-red-600 to-red-950 border border-red-500 flex items-center justify-center font-black text-sm text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] rounded tracking-tighter">
            IPZ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg md:text-xl font-black tracking-wider text-red-500 font-rajdhani uppercase">
                IPZ <span className="text-white italic font-orbitron">SENSIPRO</span>
              </h1>
              <span className="bg-red-500/10 text-red-500 text-[10px] font-mono px-1.5 py-0.5 rounded border border-red-500/20">
                v5.0
              </span>
            </div>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono hidden sm:block">
              Neural Calibration & In-Game Shooting Practice
            </p>
          </div>
        </div>

        {/* Global actions: Active Sensi profile selection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#121419] border border-zinc-800 p-1.5 rounded-lg">
            <span className="text-[10px] text-zinc-500 font-mono hidden md:inline ml-1.5 uppercase">Perfil:</span>
            <select 
              value={activeProfileId} 
              onChange={(e) => setActiveProfileId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none focus:ring-0 mr-1.5 cursor-pointer"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id} className="bg-[#121419] text-white text-xs">
                  {p.name}
                </option>
              ))}
            </select>
            {profiles.length > 1 && (
              <button 
                onClick={() => handleDeleteProfile(activeProfileId)}
                className="p-1 hover:text-red-500 text-zinc-500 transition-colors"
                title="Excluir Perfil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button 
            type="button"
            onClick={actuateFullRedUltra}
            className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
              isFullRedPreset 
                ? "bg-red-650 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:bg-red-700 animate-pulse" 
                : "bg-transparent text-red-500 border-red-600/40 hover:bg-red-500/15"
            }`}
          >
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden sm:inline">Calibrar 100% Capa</span>
            <span className="sm:hidden">100% Capa</span>
          </button>
        </div>
      </header>

      {/* TOP SUMMARY WARNING BAR */}
      <section className="bg-gradient-to-r from-red-950/20 to-[#0A0B0E] border-b border-[#1f2025] py-3 px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500 w-4.5 h-4.5 flex-shrink-0" />
          <p className="text-zinc-300">
            Ajuste a sensibilidade do seu mobile de <strong className="text-white">0 a 200</strong>. Treine com o boneco abaixo para simular puxadas ideais.
          </p>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>ESTABILIZADOR COUT: ACTIVE</span>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
        
        {/* LEFT COLUMN (GRID 4/12): TABBED CONTROLS - HARDWARE, SCANNER & ADVANCED REGEDIT/XIT TWEAKERS */}
        <section className="col-span-1 lg:col-span-4 border-r border-[#222226] bg-[#0A0B0D] p-5 flex flex-col space-y-4">
          
          {/* SENSIPRO ADVANCED TABS BAR */}
          <div className="grid grid-cols-3 gap-1 bg-[#111216] p-1 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveLeftTab("device")}
              className={`py-2 px-1 rounded-lg transition-all font-black text-[10px] uppercase tracking-wider font-orbitron cursor-pointer ${
                activeLeftTab === "device" 
                  ? "bg-red-650 text-white shadow-lg shadow-red-950/40" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              ⚙️ Opções Sensi
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab("injector")}
              className={`py-2 px-1 rounded-lg transition-all font-black text-[10px] uppercase tracking-wider font-orbitron cursor-pointer flex items-center justify-center gap-1 ${
                activeLeftTab === "injector" 
                  ? "bg-red-650 text-white shadow-lg shadow-red-950/40 animate-pulse" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              ⚡ REGEDIT / XIT
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab("video")}
              className={`py-2 px-1 rounded-lg transition-all font-black text-[10px] uppercase tracking-wider font-orbitron cursor-pointer ${
                activeLeftTab === "video" 
                  ? "bg-red-650 text-white shadow-lg shadow-red-950/40" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🎥 Scanner FF
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeLeftTab === "device" && (
              <motion.div
                key="tab-device"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* PROFILE CREATOR BOX */}
                <div className="p-4 bg-[#0F1115] border border-zinc-800 rounded-xl space-y-3 shadow-md">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest font-bold block">Criar Novo Perfil do Setup</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Ex: Sensi de 4v4, Meu Celular..."
                      className="flex-1 bg-[#181a20] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono"
                    />
                    <button 
                      onClick={handleCreateProfile}
                      className="px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Criar</span>
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed font-mono uppercase">
                    Cada perfil guarda suas próprias DPIs e sensibilidades customizadas de todas as 8 armas!
                  </p>
                </div>

                {/* DEVICE ADJUSTMENTS */}
                <div className="p-4 bg-[#0F1115] border border-zinc-800 rounded-xl space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800/60">
                    <Smartphone className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-mono font-bold uppercase text-white">Opções de Tela do Mobile</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-1">Marca Celular</label>
                      <select 
                        value={activeProfile.brand} 
                        onChange={(e) => updateDeviceField("brand", e.target.value)}
                        className="w-full bg-[#181a20] border border-zinc-800 p-2 rounded text-xs focus:border-red-500 focus:outline-none cursor-pointer text-white"
                      >
                        <option value="Xiaomi">Xiaomi</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Apple">Apple iPhone</option>
                        <option value="Motorola">Motorola</option>
                        <option value="Infinix">Infinix / Asus</option>
                        <option value="Emulator">Emulador PC</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase font-mono block mb-1">Modelo Comercial</label>
                      <input 
                        type="text" 
                        value={activeProfile.model}
                        onChange={(e) => updateDeviceField("model", e.target.value)}
                        className="w-full bg-[#181a20] border border-zinc-800 p-2 rounded text-xs focus:border-red-500 focus:outline-none text-white" 
                        placeholder="Ex: Poco X5"
                      />
                    </div>

                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] text-zinc-400 uppercase font-mono">Sensibilidade DPI de Tela</label>
                        <span className="font-mono text-red-500 text-xs font-bold">{activeProfile.dpi} DPI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono">100</span>
                        <input 
                          type="range"
                          min="100"
                          max="1000"
                          value={activeProfile.dpi}
                          onChange={(e) => updateDeviceField("dpi", Number(e.target.value))}
                          className="flex-1 accent-red-600 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">1000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeLeftTab === "video" && (
              <motion.div
                key="tab-video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="p-4 bg-[#0F1115] border border-zinc-800 rounded-xl space-y-3 shadow-md flex-1 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block font-bold">Análise Especialista por Vídeo</span>
                  <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                    Selecione ou carregue uma gameplay real de Free Fire para calibrar a taxa de recuo e obter a correção automática perfeita de 0 a 200.
                  </p>
                </div>

                {/* Hidden File Input for uploading */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleVideoFileChange}
                  accept="video/*"
                  className="hidden"
                />

                {/* Drag 'n Drop/Video Display Area */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                  onDragLeave={() => setIsDraggingVideo(false)}
                  onDrop={handleVideoDrop}
                  onClick={() => !selectedVideoUrl && fileInputRef.current?.click()}
                  className={`relative aspect-video rounded-lg overflow-hidden flex flex-col items-center justify-center p-3 text-center my-2 group transition-all duration-250 cursor-pointer ${
                    isDraggingVideo 
                      ? "bg-red-950/20 border-2 border-dashed border-red-500 scale-[1.01]" 
                      : selectedVideoUrl 
                        ? "bg-black border border-zinc-800" 
                        : "bg-[#08090B] border border-dashed border-zinc-800 hover:border-red-500/55"
                  }`}
                >
                  <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  {isAnalyzing ? (
                    <div className="space-y-2 z-10 w-full px-4 text-center pointer-events-none">
                      <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                      <p className="text-[11px] font-mono text-red-500 animate-pulse uppercase tracking-wider font-bold">
                        VARRENDO SINAIS DE RECUO ({analysisProgress}%)
                      </p>
                      <div className="h-1 bg-zinc-900 w-full rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-200" style={{ width: `${analysisProgress}%` }}></div>
                      </div>
                      <p className="text-[9px] text-zinc-400 font-mono tracking-tight font-sans italic">"Processadores tensor SensiPro procurando desvios de pixel na hitbox..."</p>
                    </div>
                  ) : selectedVideoUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      {/* Live Simulated Applet Video Player showing original uploaded video clip */}
                      <video 
                        src={selectedVideoUrl} 
                        className="w-full h-full object-cover rounded opacity-80" 
                        controls={false}
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                      />
                      
                      {/* Overlay scanning grids decoration */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 pointer-events-none text-left">
                        <p className="text-[10px] font-mono text-emerald-400 truncate font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          ATIVO: {videoFileName}
                        </p>
                        <p className="text-[8px] text-zinc-500 font-mono">Clique no botão abaixo para iniciar análise de calibração neural.</p>
                      </div>

                      {/* Clear Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearVideo();
                        }}
                        className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors z-20"
                        title="Remover vídeo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="z-10 space-y-1.5 pointer-events-none p-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-red-500 group-hover:scale-110 group-hover:border-red-500/50 transition-all duration-250">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold font-rajdhani text-zinc-200 uppercase tracking-widest mt-1">
                        Arraste ou Clique para Enviar
                      </p>
                      <p className="text-[9px] text-zinc-500 max-w-[220px] leading-relaxed mx-auto uppercase">
                        Solte um clipe de vídeo de teste (.MP4, .WEBM) ou clique aqui para selecionar
                      </p>
                    </div>
                  )}

                  {/* Aiming guidelines mock overlays if not playing or if analyzing */}
                  {(!selectedVideoUrl || isAnalyzing) && (
                    <>
                      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-zinc-700 pointer-events-none"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-zinc-700 pointer-events-none"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-zinc-700 pointer-events-none"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-zinc-700 pointer-events-none"></div>
                    </>
                  )}
                </div>

                {/* Predefined demonstration clips for high-fidelity offline execution */}
                {!selectedVideoUrl && !isAnalyzing && (
                  <button 
                    type="button" 
                    onClick={handleVideoSelectDemoClip}
                    className="w-full py-1.5 px-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 hover:text-white font-mono flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-red-500" />
                    <span>Usar Clipe de Teste Demonstrativo FF</span>
                  </button>
                )}

                <div className="space-y-2">
                  <div className="p-2 bg-[#08090C] rounded border border-zinc-900 flex justify-between items-center text-[11px] font-mono text-zinc-400">
                    <span>Resultado do Scanner:</span>
                    <span className="text-red-500 font-bold">{detectedCrosshair}</span>
                  </div>

                  <button
                    type="button"
                    onClick={runVideoAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 italic text-white rounded text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-950/25 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Fazendo Varredura Neural...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                        <span>Calibrar Sensi AI pelo Vídeo</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {activeLeftTab === "injector" && (
              <motion.div
                key="tab-injector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="p-4 bg-[#0F1115] border-2 border-red-900/30 rounded-xl space-y-4 shadow-lg relative overflow-hidden"
              >
                {/* Visual Neon Flare Background decoration */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-red-600/10 blur-2xl pointer-events-none rounded-full"></div>
                
                {/* Header Module Title */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">Painel Cyber Injetor Pro</span>
                  </div>
                  <span className="text-[8px] font-mono uppercase bg-red-650 text-white font-black px-1.5 py-0.5 rounded tracking-widest animate-pulse">
                    SAFE TWEAK
                  </span>
                </div>

                {/* Simulated Inject Progress trigger block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-400 uppercase font-bold">Injetor de Códigos Sensi & Macro</span>
                    <span className="font-bold text-red-500">{injectProgress}%</span>
                  </div>
                  
                  {isInjecting ? (
                    <div className="space-y-1.5">
                      <div className="h-2 bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-150" 
                          style={{ width: `${injectProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-[8px] font-mono text-zinc-500 animate-pulse uppercase tracking-wider text-center">Injetando tabelas de mira perfeita...</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSimulatedInjection}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-mono rounded text-[11px] font-black uppercase tracking-widest shadow-md shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      🚀 INJETAR MACRO / REGEDIT TWEAK
                    </button>
                  )}
                </div>

                {/* MULTI TOGGLERS SECTION */}
                <div className="space-y-3.5 pt-1 border-t border-zinc-850">
                  
                  {/* TOGGLE 1: NO RECOIL STABILIZER */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[11px] font-mono font-bold text-zinc-200 flex items-center gap-1">
                        🎛️ Modulador No Recoil FF
                      </span>
                      <p className="text-[9px] text-zinc-500 font-sans leading-tight">
                        Mitiga a fadiga de recuo vertical e estabiliza dispersão no simulador de tiro.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={noRecoilActive} 
                        onChange={(e) => {
                          setNoRecoilActive(e.target.checked);
                          addConsoleLog(`[Módulo] No-Recoil ${e.target.checked ? "Habilitado" : "Desativado"}.`);
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  {/* TOGGLE 2: AIM LOCK / XIT INTENSIFIER */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[11px] font-mono font-bold text-zinc-200 flex items-center gap-1">
                        🎯 Aim Lock / XIT Premium (Simulado)
                      </span>
                      <p className="text-[9px] text-zinc-500 font-sans leading-tight">
                        Trava a mira no ponto crítico da cabeça. Garante 100% de precisão no boneco de treino!
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={cheatXitActive} 
                        onChange={(e) => {
                          setCheatXitActive(e.target.checked);
                          addConsoleLog(`[Módulo] Aim Lock / Cheat simulation ${e.target.checked ? "ATIVADO" : "DEPASTED"}.`);
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  {/* TOGGLE 3: REGEDIT OPTIMIZER */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[11px] font-mono font-bold text-zinc-200 flex items-center gap-1">
                        💻 Regedit Sensi (Tweak Estabilizador)
                      </span>
                      <p className="text-[9px] text-zinc-500 font-sans leading-tight">
                        Alinha buffers de mouse/toque, expandindo a margem do headshot de ouro.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={regeditActive} 
                        onChange={(e) => {
                          setRegeditActive(e.target.checked);
                          addConsoleLog(`[Módulo] Regedit Sensi ${e.target.checked ? "ATIVADO" : "DESATIVADO"}.`);
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  {/* TOGGLE 4: ANTI BAN BYPASS HARDWARE SHIELD */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/10 border border-red-500/20">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[11px] font-mono font-bold text-red-400 flex items-center gap-1">
                        🛡️ Anti-Ban Secure Shield (Bypass v12)
                      </span>
                      <p className="text-[9px] text-zinc-500 font-sans leading-tight">
                        Mantém a injeção 100% segura por ser um simulador matemático de sensibilidade offline. Zero risco de banimento.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={antibanActive} 
                        onChange={(e) => {
                          setAntibanActive(e.target.checked);
                          addConsoleLog(`[Proteção] Escudo anti-ban ${e.target.checked ? "REFORÇADO" : "DESATIVADO"}.`);
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>

                {/* NESTED EDUCATIONAL DATABASE TABS AND INSTRUCTIONS */}
                {regeditActive && (
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest">Gabarito de Otimização Físico (Talkback / Sensi)</span>
                      <div className="flex gap-1 text-[8px] font-mono">
                        <button
                          type="button"
                          onClick={() => setSelectedRegeditTarget("android")}
                          className={`px-1 rounded ${selectedRegeditTarget === "android" ? "bg-red-600 text-white" : "text-zinc-500 hover:text-white"}`}
                        >
                          Android
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRegeditTarget("ios")}
                          className={`px-1 rounded ${selectedRegeditTarget === "ios" ? "bg-red-600 text-white" : "text-zinc-500 hover:text-white"}`}
                        >
                          iOS
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRegeditTarget("pc")}
                          className={`px-1 rounded ${selectedRegeditTarget === "pc" ? "bg-red-600 text-white" : "text-zinc-500 hover:text-white"}`}
                        >
                          PC registry
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#050608] border border-zinc-900 rounded p-2 text-[9px] font-mono text-zinc-400 space-y-1.5 overflow-x-auto">
                      {selectedRegeditTarget === "android" && (
                        <>
                          <p className="text-yellow-500 font-bold">🎯 CONFIGURAÇÃO DEV OPTIONS ANDROID:</p>
                          <p>● Escala de Animação de Janela: <span className="text-white">0.5x</span></p>
                          <p>● Atraso ao manter pressionado: <span className="text-white">Curto (0.5s)</span></p>
                          <p>● Velocidade do Ponteiro: <span className="text-white font-bold">Máxima</span></p>
                          <p className="text-zinc-500">Comando ADB para otimização de polling táctil:</p>
                          <code className="block bg-[#111216] p-1 rounded text-red-400 select-all">adb shell settings put system pointer_speed 7</code>
                        </>
                      )}
                      
                      {selectedRegeditTarget === "ios" && (
                        <>
                          <p className="text-red-400 font-bold">🍎 AJUSTES DE TOQUE PARA IOS (IPHONE):</p>
                          <p>● AssistiveTouch: <span className="text-white">Ative</span></p>
                          <p>● Sensibilidade de Rastreamento: <span className="text-white">100% Máxima</span></p>
                          <p>● Tolerância de Movimento: <span className="text-white">Mínima (Travada)</span></p>
                          <p>● Segundos de Toque: <span className="text-white">0.10s (Reduz latência de mira)</span></p>
                        </>
                      )}

                      {selectedRegeditTarget === "pc" && (
                        <>
                          <p className="text-cyan-400 font-bold">📁 REGISTRY FILE (.REG) EMULADOR SENSIPRO:</p>
                          <pre className="text-[8px] text-zinc-300 leading-tight">{`Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Control Panel\\Mouse]
"MouseSpeed"="0"
"MouseThreshold1"="0"
"MouseThreshold2"="0"
"MouseSensitivity"="12"`}</pre>
                          <button
                            type="button"
                            onClick={() => {
                              const registryContent = `Windows Registry Editor Version 5.00\n\n[HKEY_CURRENT_USER\\Control Panel\\Mouse]\n"MouseSpeed"="0"\n"MouseThreshold1"="0"\n"MouseThreshold2"="0"\n"MouseSensitivity"="12"`;
                              navigator.clipboard?.writeText(registryContent);
                              alert("🎯 O código sensipro_mouse_precision.reg foi copiado! Use-o nas configurações locais para regular o polling.");
                            }}
                            className="bg-red-650 hover:bg-red-700 text-white font-mono px-1.5 py-0.5 rounded text-[8px] mt-1 cursor-pointer block text-center"
                          >
                            Copiar código .reg
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* FLOATING CONSOLE LOGGER */}
                <div className="p-3 bg-black rounded-lg border border-zinc-900 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                    <span className="uppercase text-red-500/80 font-bold">Terminal Injetor Log:</span>
                    <span className="animate-blink font-black">● LIVE</span>
                  </div>
                  <div className="max-h-[70px] overflow-y-auto font-mono text-[9px] text-zinc-400 space-y-1 leading-normal select-text">
                    {consoleLogs.map((log, index) => (
                      <div key={index} className="flex gap-1">
                        <span className="text-red-500 shrink-0">&gt;&gt;</span>
                        <span className="break-all">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </section>

        {/* CENTER COLUMN (GRID 5/12): MAIN SENSIBILITY CALIBRATION & SLIDERS */}
        <section className="col-span-1 lg:col-span-5 bg-[#0B0C0F] p-5 flex flex-col space-y-5">
          
          <div className="text-center md:text-left space-y-1 pb-2 border-b border-zinc-800/40">
            <span className="text-xs text-red-500 tracking-[0.2em] font-orbitron font-bold uppercase block">
              Gabarito Geral de Sensibilidade
            </span>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">
              Valores ativos no perfil para calibrar no menu do Free Fire
            </p>
          </div>

          {/* GAUGE DISPENSORS CARD */}
          <div className="p-4 bg-gradient-to-b from-[#111216] to-[#0A0B0E] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative py-6 shadow-inner overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
              <div className="w-[300px] h-[300px] rounded-full border-2 border-dashed border-red-500 animate-spin"></div>
            </div>

            {/* Readout */}
            <div className="text-center space-y-2.5 z-10">
              <div className="flex items-center justify-center gap-1 text-zinc-400">
                <Gauge className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Sensibilidade Geral do Menu</span>
              </div>

              <div className="flex items-baseline justify-center">
                <span className="text-7xl md:text-8xl font-black font-rajdhani tracking-tighter text-glow-red leading-none text-white select-none">
                  {activeProfile.sensiSettings.geral}
                </span>
                <span className="text-lg text-zinc-500 font-mono tracking-widest ml-1 font-bold">
                  /200
                </span>
              </div>

              {/* Status pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/10 border border-red-500/25 rounded-full">
                <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="text-[9px] text-red-500 font-black uppercase tracking-wider font-orbitron">
                  {activeProfile.sensiSettings.geral > 185 ? "🔥 Full Capa Autocalibrado" : "⚡ Regulagem Estável"}
                </span>
              </div>
            </div>

            {/* Quick calibration indicators */}
            <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-zinc-800/40 text-center text-xs z-10">
              <div className="border-r border-zinc-800/40">
                <span className="text-[9px] text-zinc-500 uppercase block font-mono">Velocidade de Cursor</span>
                <span className="font-bold text-white text-xs block font-orbitron mt-0.5">VELOZ MÁXIMA</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block font-mono">Puxar Botão de Atirar</span>
                <span className="text-red-500 font-bold text-xs block font-orbitron mt-0.5">FORMATO MEIA-LUA</span>
              </div>
            </div>
          </div>

          {/* GLOBAL SENSITIVITY SLIDERS (0 TO 200 FORMAT) */}
          <div className="p-4 bg-[#0F1115] border border-zinc-800 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
              <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1"><Sliders className="w-4 h-4 text-red-500" /> Regulador Micro-Ajustável de Miras</span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Ajuste de 0 a 200</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Geral scope */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-300 font-semibold text-[11px]">Geral (Movimentação e Arrasto da Tela)</span>
                  <span className="font-mono text-red-500 font-bold text-[12px] bg-red-600/10 px-1 rounded">{activeProfile.sensiSettings.geral}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-500 font-mono">0</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={activeProfile.sensiSettings.geral}
                    onChange={(e) => setGeneralSensi("geral", Number(e.target.value))}
                    className="flex-1 accent-red-600 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 font-mono">200</span>
                </div>
              </div>

              {/* Red Dot scope */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-300 font-semibold text-[11px]">Mira Red Dot (Ponto Vermelho Sem Mira)</span>
                  <span className="font-mono text-red-500 font-bold text-[12px] bg-red-600/10 px-1 rounded">{activeProfile.sensiSettings.redDot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-500 font-mono">0</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={activeProfile.sensiSettings.redDot}
                    onChange={(e) => setGeneralSensi("redDot", Number(e.target.value))}
                    className="flex-1 accent-red-600 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 font-mono">200</span>
                </div>
              </div>

              {/* Mira 2X scope */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-300 font-semibold text-[11px]">Mira 2X (Para Miras de Médio Alcance)</span>
                  <span className="font-mono text-red-500 font-bold text-[12px] bg-red-600/10 px-1 rounded">{activeProfile.sensiSettings.mira2x}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-500 font-mono">0</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={activeProfile.sensiSettings.mira2x}
                    onChange={(e) => setGeneralSensi("mira2x", Number(e.target.value))}
                    className="flex-1 accent-red-600 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 font-mono">200</span>
                </div>
              </div>

              {/* Mira 4X scope */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-300 font-semibold text-[11px]">Mira 4X (Mira de Longo Alcance)</span>
                  <span className="font-mono text-red-500 font-bold text-[12px] bg-red-600/10 px-1 rounded">{activeProfile.sensiSettings.mira4x}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-500 font-mono">0</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={activeProfile.sensiSettings.mira4x}
                    onChange={(e) => setGeneralSensi("mira4x", Number(e.target.value))}
                    className="flex-1 accent-red-600 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 font-mono">200</span>
                </div>
              </div>

              {/* Mira AWM */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-300 font-semibold text-[11px]">Mira AWM (Sniper de Precisão)</span>
                  <span className="font-mono text-red-500 font-bold text-[12px] bg-red-600/10 px-1 rounded">{activeProfile.sensiSettings.miraAwm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-500 font-mono">0</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={activeProfile.sensiSettings.miraAwm}
                    onChange={(e) => setGeneralSensi("miraAwm", Number(e.target.value))}
                    className="flex-1 accent-red-600 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 font-mono">200</span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN (GRID 3/12): WEAPON SENSITIVITIES & INTERACTIVE SIMULATOR ZONE */}
        <section className="col-span-1 lg:col-span-3 border-l border-[#222226] bg-[#0E0F12] p-5 flex flex-col space-y-5 justify-between">
          
          {/* WEAPONS TUNING PANE */}
          <div className="space-y-3">
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest font-bold block">Tuning de Todas as Armas</span>
            
            <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
              {activeProfile.weapons.map((w) => (
                <div key={w.id} className="p-2.5 bg-[#050608] border border-zinc-800 rounded-lg space-y-1.5 hover:border-red-500/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 uppercase font-rajdhani">{w.icon} {w.name}</span>
                    <span className="font-mono text-[11px] text-red-500 font-bold">{w.sensi}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="200"
                    value={w.sensi}
                    onChange={(e) => setWeaponSensi(w.id, Number(e.target.value))}
                    className="w-full accent-red-600 h-1 bg-zinc-800 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* VIRTUAL Arena Campo de Treino (The requested practical training ground!) */}
          <div className="p-4 bg-[#090A0E] border-2 border-[#1E2026] rounded-xl space-y-3 shadow-inner relative overflow-hidden">
            <div className="absolute top-1 right-2 bg-red-600 text-white font-mono text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider">
              Simulador Campo de Treino
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-red-500 font-black uppercase font-orbitron tracking-widest block">Treine sua Puxada</span>
              <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-pointer hover:text-white" title="Selecione sua arma, ajuste o controle de empuxo simulando a velocidade de subida de seu dedão na tela do celular e clique em ATIRAR / TREINAR para ver se você daria peito ou capa!" />
            </div>

            {/* Test weapon trigger selector */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[8px] text-zinc-400 uppercase font-mono block mb-1">Arma Equipada</label>
                <select 
                  value={testWeaponId}
                  onChange={(e) => setTestWeaponId(e.target.value)}
                  className="w-full bg-[#181a20] border border-zinc-800 p-1.5 rounded text-[11px] focus:outline-none text-white cursor-pointer"
                >
                  {activeProfile.weapons.map(w => (
                    <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8px] text-zinc-400 uppercase font-mono block mb-1">Velocidade Puxada</label>
                <div className="bg-[#181a20] border border-zinc-800 p-1 text-[11px] rounded text-center text-red-500 font-bold">
                  {userDragSpeed} /200
                </div>
              </div>
            </div>

            {/* Dynamic Slider for drag simulator speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-mono">
                <span>Puxada Suave (Lento)</span>
                <span>Puxada Rápida (Violenta)</span>
              </div>
              <input 
                type="range"
                min="0"
                max="200"
                value={userDragSpeed}
                onChange={(e) => setUserDragSpeed(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-zinc-800 rounded cursor-pointer"
              />
            </div>

            {/* Simulated Live Target Dummy View */}
            <div className="aspect-[5/3] bg-zinc-950 rounded-lg border border-zinc-850 overflow-hidden relative flex flex-col items-center justify-center p-2">
              
              {/* Dynamic target rendering */}
              <div className={`w-16 h-24 flex flex-col items-center justify-end relative transition-all duration-200 ${
                isShootingAnimation ? "translate-y-1 scale-95" : ""
              }`}>
                {/* Red Head target */}
                <div className="w-7 h-7 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center relative cursor-pointer group">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="absolute -top-3 text-[8px] text-red-500 font-mono tracking-tighter">CABEÇA</span>
                </div>
                {/* Neck connector */}
                <div className="w-2 h-2 bg-zinc-700"></div>
                {/* Yellow Body Chest */}
                <div className="w-12 h-14 rounded-b-xl bg-orange-600/20 border border-orange-500 flex items-center justify-center text-[8px] text-orange-400 font-mono">
                  PEITO
                </div>
              </div>

              {/* Laser path line tracer simulator */}
              {isShootingAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {lastShotResult?.type === "capa" ? (
                    <div className="absolute w-12 h-12 border-2 border-red-500 rounded-full animate-ping z-25 bg-red-600/20"></div>
                  ) : lastShotResult?.type === "peito" ? (
                    <div className="absolute w-8 h-8 border border-amber-500 rounded-full animate-ping z-25 bg-amber-500/10"></div>
                  ) : null}
                </div>
              )}

              {/* Float damage popup overlays */}
              {lastShotResult && (
                <div className={`absolute z-30 font-black animate-capapop text-center ${
                  lastShotResult.type === "capa" ? "text-red-500 text-3xl font-sans" : "text-amber-400 text-lg font-mono"
                }`}
                style={{ top: lastShotResult.type === "capa" ? "20px" : "55px" }}
                >
                  {lastShotResult.damage > 0 ? lastShotResult.damage : "ALÉM! 💨"}
                </div>
              )}
            </div>

            {/* Test result status output banner */}
            {lastShotResult && (
              <div className={`p-2 rounded text-center font-mono text-[10px] leading-relaxed uppercase overflow-hidden ${
                lastShotResult.type === "capa" 
                  ? "bg-red-950/20 border border-red-500/20 text-red-400" 
                  : lastShotResult.type === "peito" 
                    ? "bg-amber-950/20 border border-amber-500/10 text-amber-500"
                    : "bg-zinc-900 border border-transparent text-zinc-400"
              }`}>
                {lastShotResult.result} - {lastShotResult.damage > 0 ? `${lastShotResult.damage} de Dano` : "Recuo excessivo na subida"}
              </div>
            )}

            {/* Shoot virtual trigger button */}
            <button
              onClick={triggerShotTest}
              type="button"
              className="w-full py-3 bg-[#111216] border border-zinc-704 hover:border-red-500 hover:text-white rounded-lg text-xs font-black uppercase text-glow-red tracking-widest text-red-500 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Gatilho: Subir Capa 🔫</span>
            </button>
          </div>

          {/* AI CHATBOT / TIPS CONSOLE */}
          <div className="flex-1 flex flex-col space-y-2 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold uppercase font-rajdhani text-white">Treinador Virtual GPT Sensi</span>
            </div>

            <div className="flex-1 bg-[#07080B] border border-zinc-900 rounded-xl p-3 text-[11px] overflow-y-auto max-h-[140px] space-y-2">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-2 rounded ${
                  msg.role === "user" 
                    ? "bg-red-950/20 text-red-100 border-l border-red-500 ml-3" 
                    : "bg-zinc-900/60 text-zinc-300 mr-3"
                }`}>
                  <p className="text-[8px] uppercase font-mono text-zinc-500 mb-0.5">
                    {msg.role === "user" ? "Eu" : "SensiAI Coach"}
                  </p>
                  <p className="whitespace-pre-line select-text font-sans">{msg.text}</p>
                </div>
              ))}
              {isAiLoading && (
                <div className="text-[10px] text-red-500 font-mono animate-pulse flex items-center gap-1">
                  <span>●</span> <span>Otimizando calibração...</span>
                </div>
              )}
            </div>

            {/* Quick Sensi AI Mode Buttons */}
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block font-semibold">Calibrar Sensi IA por Modo:</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleGameModeSensi("rankeada")}
                  disabled={isAiLoading}
                  className="py-1 px-1 bg-[#101013] hover:bg-[#1a1712] border border-zinc-800 hover:border-yellow-500/40 text-zinc-300 hover:text-yellow-400 rounded text-[9px] font-mono flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Trophy className="w-2.5 h-2.5 text-yellow-500 shrink-0" />
                  <span>Rankeada</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGameModeSensi("x1")}
                  disabled={isAiLoading}
                  className="py-1 px-1 bg-[#101013] hover:bg-[#1c1113] border border-zinc-800 hover:border-red-500/45 text-zinc-300 hover:text-red-400 rounded text-[9px] font-mono flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Swords className="w-2.5 h-2.5 text-red-500 shrink-0" />
                  <span>X1 Deco</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGameModeSensi("4v4")}
                  disabled={isAiLoading}
                  className="py-1 px-1 bg-[#101013] hover:bg-[#11191c] border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-400 rounded text-[9px] font-mono flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Gamepad2 className="w-2.5 h-2.5 text-cyan-500 shrink-0" />
                  <span>Modo 4v4</span>
                </button>
              </div>
            </div>

            {/* Chat formulation form */}
            <form onSubmit={handleChatSubmit} className="flex gap-1">
              <input 
                type="text"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder="Ex: Como calibrar Desert Eagle?"
                className="flex-1 bg-[#060608] border border-zinc-800 text-[11px] px-2.5 py-1.5 rounded focus:outline-none focus:border-red-500 text-white font-mono placeholder-zinc-650"
              />
              <button 
                type="submit"
                disabled={isAiLoading}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded active:scale-95 transition-all text-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* EXPORT SENSI VALUES DISCOVERY COPY */}
          <button 
            type="button"
            onClick={() => {
              const output = `Setup IPZ SENSIPRO Perfeita:\n--------------------------\nPerfil Ativo: ${activeProfile.name}\nCelular: ${activeProfile.brand} ${activeProfile.model}\nDPI: ${activeProfile.dpi}\n\nSENSIBILIDADE MENU:\nGeral: ${activeProfile.sensiSettings.geral}\nRed Dot: ${activeProfile.sensiSettings.redDot}\nMira 2X: ${activeProfile.sensiSettings.mira2x}\nMira 4X: ${activeProfile.sensiSettings.mira4x}\nMira AWM: ${activeProfile.sensiSettings.miraAwm}\n\nARMAS TUNADAS (Sensi):\n${activeProfile.weapons.map(w => `- ${w.name}: Sensi ${w.sensi}`).join("\n")}\n\nConfiguração de ouro copiada com sucesso para o seu jogo!`;
              navigator.clipboard?.writeText(output);
              alert("🎯 Todas as sensibilidades salvas foram copiadas para a área de transferência! Cole nas configurações do seu Free Fire e dê capa 100% vermelho!");
            }}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border border-red-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Config para Clipboard</span>
          </button>

        </section>

      </main>

      {/* FOOTER METRICS BAR */}
      <footer className="h-12 border-t border-[#1F2127] bg-[#07080A] flex items-center px-4 md:px-8 justify-between text-[9px] font-mono text-zinc-500">
        <div className="flex gap-4 md:gap-8 overflow-x-auto whitespace-nowrap scrollbar-none pr-4">
          <span>COUT_LINK: <span className="text-red-500 font-bold">100%_CAPA_VERMELHO</span></span>
          <span className="hidden sm:inline">PROJETOR: MOBILE_LOCK</span>
          <span>FPS: 60Hz STABLE</span>
          <span>REGION: BRAZIL_LATAM</span>
        </div>
        <div className="flex gap-2 shrink-0 font-bold">
          <span className="text-green-500 bg-green-500/10 px-1 py-0.5 rounded border border-green-500/20">NEURAL ENGINE ACTIVE</span>
          <span className="text-white">v3.1.2_PRE</span>
        </div>
      </footer>

    </div>
  );
}
