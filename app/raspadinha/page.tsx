'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './page.module.css';

type PrizeType = {
    value: number;
    symbol: string;
    label: string;
};

type Item = {
    id: number;
    symbol: string;
    isWinner: boolean;
};

const PRIZES: PrizeType[] = [
    { value: 50, symbol: '☂️', label: '50% OFF' }, // Frevo Umbrella (Rare)
    { value: 20, symbol: '🎭', label: '20% OFF' }, // Mask
    { value: 10, symbol: '🥁', label: '10% OFF' }, // Drum
    { value: 5, symbol: '🥥', label: '5% OFF' },   // Coconut
];

const FILLERS = ['☀️', '🌴', '💃', '🎺', '🦀', '🌊'];

export default function RaspadinhaPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ticketId, setTicketId] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [scratchProgress, setScratchProgress] = useState(0);

    // Flow State
    const [step, setStep] = useState<'scratch' | 'claim' | 'validate' | 'success' | 'lose'>('scratch');
    const [result, setResult] = useState<{ type: 'win' | 'lose'; prize?: PrizeType } | null>(null);

    // Form State
    const [userName, setUserName] = useState('');
    const [validationCode, setValidationCode] = useState('');
    const [validationError, setValidationError] = useState(false);

    useEffect(() => {
        generateTicket();
    }, []);

    const getHourlyCode = () => {
        const now = new Date();
        const seed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash % 10000).toString().padStart(4, '0');
    };

    const generateTicket = () => {
        const randomId = Math.floor(100000 + Math.random() * 900000);
        setTicketId(`${randomId}`);
        setScratchProgress(0);
        setIsRevealed(false);
        setStep('scratch');
        setUserName('');
        setValidationCode('');
        setValidationError(false);

        // 3% chance to win
        const isWinner = Math.random() < 0.03;
        let selectedPrize: PrizeType | null = null;
        let gridItems: string[] = [];

        if (isWinner) {
            const isGrandPrize = Math.random() < 0.01;
            if (isGrandPrize) selectedPrize = PRIZES[0];
            else {
                const r = Math.random();
                if (r < 0.2) selectedPrize = PRIZES[1];
                else if (r < 0.5) selectedPrize = PRIZES[2];
                else selectedPrize = PRIZES[3];
            }

            setResult({ type: 'win', prize: selectedPrize });
            gridItems = Array(3).fill(selectedPrize.symbol);
            for (let i = 0; i < 6; i++) {
                gridItems.push(FILLERS[Math.floor(Math.random() * FILLERS.length)]);
            }
        } else {
            setResult({ type: 'lose' });
            const pool = [...FILLERS, ...PRIZES.map(p => p.symbol)];
            for (let i = 0; i < 9; i++) {
                gridItems.push(pool[Math.floor(Math.random() * pool.length)]);
            }
        }

        gridItems = gridItems.sort(() => Math.random() - 0.5);

        setItems(gridItems.map((symbol, index) => ({
            id: index,
            symbol,
            isWinner: isWinner && selectedPrize ? symbol === selectedPrize.symbol : false
        })));

        setTimeout(initCanvas, 50);
    };

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
        }

        // Reset any inline styles from previous game
        canvas.style.opacity = '1';
        canvas.style.display = 'block';

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#9E9E9E');
        gradient.addColorStop(0.5, '#F5F5F5');
        gradient.addColorStop(1, '#9E9E9E');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#C0C0C0';
        for (let i = 0; i < 300; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }

        ctx.fillStyle = '#555';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 12);
        ctx.fillText('RASPE AQUI', 0, 0);
        ctx.restore();
    }, []);

    const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            const touch = e.touches[0];
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        } else {
            if ((e as React.MouseEvent).buttons !== 1) return;
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        if (Math.random() < 0.1) checkProgress();
    };

    const checkProgress = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        let transparent = 0;
        for (let i = 0; i < data.length; i += 4 * 40) {
            if (data[i + 3] < 128) transparent++;
        }

        const total = data.length / (4 * 40);
        const pct = (transparent / total) * 100;

        setScratchProgress(pct);
        if (pct > 40 && !isRevealed) {
            setIsRevealed(true);
        }
    };

    const handleRevealButton = () => {
        // Transition to next step
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.opacity = '0';
            setTimeout(() => canvas.style.display = 'none', 500);
        }

        setTimeout(() => {
            if (result?.type === 'win') {
                setStep('claim');
            } else {
                setStep('lose');
            }
        }, 600);
    };

    const handleClaim = () => {
        if (!userName.trim()) {
            alert('Por favor, digite seu nome!');
            return;
        }

        const phone = '558183920320';
        const msg = `Olá! Acabei de ganhar na Raspadinha da Sorte da OlindAki! 🎉\n\nNome: *${userName}*\nTicket: *${ticketId}*\nPrêmio: *${result?.prize?.label}*\nData: ${new Date().toLocaleString()}\n\nPor favor, valide meu prêmio!`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

        window.open(url, '_blank');
        setStep('validate');
    };

    const handleValidation = () => {
        const validCode = getHourlyCode();
        const MASTER_CODE = '9999';

        if (validationCode.trim() === validCode || validationCode.trim() === MASTER_CODE) {
            setStep('success');
            setValidationError(false);
        } else {
            getHourlyCode(); // just to double check logic if debugging
            setValidationError(true);
            setValidationCode('');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>☂️</div>
                    <h1>Raspinha<br />da Sorte</h1>
                </div>
                <div className={styles.headerCurvedBorder}></div>
            </header>

            <main className={styles.main}>
                <div className={styles.ticketSection}>
                    <div className={styles.ticketLabel}>
                        OLINDAKI • #{ticketId}
                    </div>

                    <div className={styles.scratchCardContainer}>
                        <div className={styles.gridContainer}>
                            {items.map((item) => (
                                <div key={item.id} className={`${styles.gridItem} ${(step === 'success' || step === 'claim' || step === 'validate') && item.isWinner ? styles.winnerItem : ''}`}>
                                    <span className={styles.symbol}>{item.symbol}</span>
                                </div>
                            ))}
                        </div>

                        <canvas
                            ref={canvasRef}
                            className={styles.scratchCanvas}
                            style={{ display: step === 'scratch' ? 'block' : 'none' }}
                            onMouseMove={handleScratch}
                            onTouchMove={handleScratch}
                            onMouseDown={handleScratch}
                        />

                        {!isRevealed && scratchProgress < 5 && step === 'scratch' && (
                            <div className={styles.fingerHint}>👆</div>
                        )}

                        {isRevealed && step === 'scratch' && (
                            <div className={styles.btnOverlay}>
                                <button className={styles.revealBtn} onClick={handleRevealButton}>
                                    🎁 VER MEU PRÊMIO!
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.timestamp}>
                        {new Date().toLocaleDateString('pt-BR')} • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </main>

            {step !== 'scratch' && (
                <div className={styles.resultModalOverlay}>
                    <div className={styles.resultModal}>
                        <div className={styles.confetti} />

                        {step === 'lose' && (
                            <>
                                <h2 className={styles.loseTitle}>Quase lá...</h2>
                                <div className={styles.loseIcon}>😅</div>
                                <p className={styles.loseText}>Não foi dessa vez!<br />Mas o carnaval continua.</p>
                                <button className={styles.secondaryBtn} onClick={generateTicket}>
                                    Nova Raspadinha
                                </button>
                            </>
                        )}

                        {step === 'claim' && result?.type === 'win' && (
                            <>
                                <h2 className={styles.winTitle}>PARABÉNS!</h2>
                                <div className={styles.winIcon}>🎉</div>
                                <p className={styles.winText}>Você ganhou<br /><strong>{result.prize?.label}</strong></p>

                                <div className={styles.inputGroup}>
                                    <label>Digite seu Nome:</label>
                                    <input
                                        type="text"
                                        placeholder="Seu nome completo"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                    />
                                </div>

                                <button className={styles.whatsappBtn} onClick={handleClaim}>
                                    Validar no WhatsApp 📱
                                </button>
                                <p className={styles.smallHint}>Obrigatório para retirar o prêmio.</p>
                            </>
                        )}

                        {step === 'validate' && (
                            <>
                                <h2 className={styles.winTitle}>VALIDAÇÃO</h2>
                                <p className={styles.winSub}>Peça para o dono digitar a senha:</p>

                                <div className={styles.inputGroup}>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        placeholder="Senha do Lojista"
                                        maxLength={6}
                                        value={validationCode}
                                        onChange={(e) => setValidationCode(e.target.value)}
                                    />
                                    {validationError && (
                                        <span className={styles.validationError}>Senha incorreta!</span>
                                    )}
                                </div>

                                <button className={styles.primaryBtn} onClick={handleValidation}>
                                    Confirmar Validação
                                </button>
                            </>
                        )}

                        {step === 'success' && result?.type === 'win' && (
                            <>
                                <h2 className={styles.winTitle}>VALIDADO!</h2>
                                <div className={styles.winIcon}>✅</div>
                                <p className={styles.winText}>Prêmio Liberado:<br /><strong>{result.prize?.label}</strong></p>
                                <p className={styles.winSub}>Mostre ao caixa:</p>
                                <div className={styles.couponCode}>{ticketId}-VIP</div>

                                <button className={styles.primaryBtn} onClick={() => window.print()}>
                                    🖨️ Salvar/Imprimir
                                </button>
                                <button className={styles.secondaryBtn} onClick={generateTicket}>
                                    Nova Raspadinha
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
