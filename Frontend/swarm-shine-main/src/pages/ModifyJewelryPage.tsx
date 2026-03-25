import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById, segmentImage, uploadRefImage, generateDesign } from "@/api/productApi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, CheckCircle2, Pencil, X, Eraser, Trash2, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import productRing from "@/assets/product-ring.jpg";

// ─── Stone images ────────────────────────────────────────────────────────────
import imgDiamond from "@/assets/stones/1-diamond.png";
import imgRuby from "@/assets/stones/2-ruby.jpg";
import imgAmethyst from "@/assets/stones/3-amethyst.jpg";
import imgEmerald from "@/assets/stones/4-emerald.png";
import imgSapphire from "@/assets/stones/5-sapphire.png";
import imgPeridot from "@/assets/stones/6-peridot.jpg";
import imgPearl from "@/assets/stones/7-pearl.png";
import imgTanzanite from "@/assets/stones/8-tanzanite.jpg";
import imgTurquoise from "@/assets/stones/9-turquoise.jpg";
import imgPinkTourmaline from "@/assets/stones/10-pink-tourmaline.png";

// ─── Band images ─────────────────────────────────────────────────────────────
import imgVintageInspired from "@/assets/bands/1-vintage-inspired.png";
import imgElegantPave from "@/assets/bands/2-elegant-pave.png";
import imgBandTextured from "@/assets/bands/3-textured.png";
import imgBandEngraved from "@/assets/bands/4-engraved.png";
import imgBandFiligree from "@/assets/bands/5-filigree.png";
import imgTwisted from "@/assets/bands/6-twisted.png";
import imgBezel from "@/assets/bands/7-bezel.png";
import imgSplitShank from "@/assets/bands/8-split-shank.png";
import imgEternity from "@/assets/bands/9-eternity.png";
import imgBandPatterned from "@/assets/bands/10-patterned.png";

// ─── Chain images ────────────────────────────────────────────────────────────
import imgSnakeChain from "@/assets/chains/1-snake-chain.png";
import imgBoxChain from "@/assets/chains/2-box-chain.png";
import imgCableChain from "@/assets/chains/3-cable-chain.png";
import imgFigaroChain from "@/assets/chains/4-figaro-chain.png";
import imgCurbChain from "@/assets/chains/5-curb-chain.png";
import imgPaperClipChain from "@/assets/chains/6-paper-clip-chain.png";
import imgHermineChain from "@/assets/chains/7-hermine-chain.png";
import imgSingaporeChain from "@/assets/chains/8-singapore-chain.png";
import imgWheatChain from "@/assets/chains/9-wheat-chain.png";
import imgRopeChain from "@/assets/chains/10-rope-chain.png";

// ─── Pendant images ──────────────────────────────────────────────────────────
import imgSolitairePendant from "@/assets/pendants/1-solitaire-pendant.png";
import imgHaloPendant from "@/assets/pendants/2-halo-pendant.png";
import imgNamePendant from "@/assets/pendants/3-name-pendant.png";
import imgHeartPendant from "@/assets/pendants/4-heart-pendant.png";
import imgButterflyPendant from "@/assets/pendants/5-butterfly-pendant.png";
import imgBarPendant from "@/assets/pendants/6-bar-pendant.png";
import imgCoinPendant from "@/assets/pendants/7-coin-pendant.png";
import imgGeometricPendant from "@/assets/pendants/8-geometric-pendant.png";
import imgFlowerPendant from "@/assets/pendants/9-flower-pendant.png";
import imgGodPendant from "@/assets/pendants/10-god-pendant.png";

// ─── Segment swap options per class ────────────────────────────────────────
type SwapOption = {
    label: string;
    color: string;
    image?: string;         // stone image instead of color dot
    icon?: string;          // emoji shown instead of color dot
    needsInput?: boolean;   // triggers text-input step in popup
    inputLabel?: string;    // placeholder for the text input
};

const SWAP_OPTIONS: Record<string, SwapOption[]> = {
    stone: [
        { label: "Diamond", color: "#e8e8e8", image: imgDiamond },
        { label: "Ruby", color: "#c0392b", image: imgRuby },
        { label: "Amethyst", color: "#8e44ad", image: imgAmethyst },
        { label: "Emerald", color: "#27ae60", image: imgEmerald },
        { label: "Sapphire", color: "#2980b9", image: imgSapphire },
        { label: "Peridot", color: "#a8d050", image: imgPeridot },
        { label: "Pearl", color: "#f8f0e8", image: imgPearl },
        { label: "Tanzanite", color: "#6659a0", image: imgTanzanite },
        { label: "Turquoise", color: "#40c0c0", image: imgTurquoise },
        { label: "Pink Tourmaline", color: "#e8478a", image: imgPinkTourmaline },
    ],
    band: [
        { label: "Vintage-Inspired", color: "#c9a96e", image: imgVintageInspired },
        { label: "Elegant Pavé", color: "#e8e8e8", image: imgElegantPave },
        { label: "Textured", color: "#a0a0a0", image: imgBandTextured },
        { label: "Engraved", color: "#b8860b", image: imgBandEngraved },
        { label: "Filigree", color: "#c9a96e", image: imgBandFiligree },
        { label: "Twisted", color: "#d4af37", image: imgTwisted },
        { label: "Bezel", color: "#ffd700", image: imgBezel },
        { label: "Split Shank", color: "#e5e4e2", image: imgSplitShank },
        { label: "Eternity", color: "#f0f0f0", image: imgEternity },
        { label: "Patterned", color: "#8b7355", image: imgBandPatterned },
    ],
    chain: [
        { label: "Snake Chain", color: "#d4af37", image: imgSnakeChain },
        { label: "Box Chain", color: "#e5e4e2", image: imgBoxChain },
        { label: "Cable Chain", color: "#f0f0f0", image: imgCableChain },
        { label: "Figaro Chain", color: "#ffd700", image: imgFigaroChain },
        { label: "Curb Chain", color: "#c0c0c0", image: imgCurbChain },
        { label: "Paper Clip Chain", color: "#b8860b", image: imgPaperClipChain },
        { label: "Hermine Chain", color: "#daa520", image: imgHermineChain },
        { label: "Singapore Chain", color: "#e8e8e8", image: imgSingaporeChain },
        { label: "Wheat Chain", color: "#cd7f32", image: imgWheatChain },
        { label: "Rope Chain", color: "#ffd700", image: imgRopeChain },
    ],
    pendant: [
        { label: "Solitaire Pendant", color: "#e8e8e8", image: imgSolitairePendant },
        { label: "Halo Pendant", color: "#ffd700", image: imgHaloPendant },
        { label: "Name Pendant", color: "#b8860b", image: imgNamePendant, needsInput: true, inputLabel: "Enter the name to engrave" },
        { label: "Heart Pendant", color: "#e74c3c", image: imgHeartPendant },
        { label: "Butterfly Pendant", color: "#9b59b6", image: imgButterflyPendant },
        { label: "Bar Pendant", color: "#c0c0c0", image: imgBarPendant },
        { label: "Coin Pendant", color: "#daa520", image: imgCoinPendant, needsInput: true, inputLabel: "Enter Name or Year for Coin" },
        { label: "Geometric Pendant", color: "#555555", image: imgGeometricPendant, needsInput: true, inputLabel: "Enter Name of Shape" },
        { label: "Flower Pendant", color: "#e91e8c", image: imgFlowerPendant, needsInput: true, inputLabel: "Enter Name of Flower" },
        { label: "God Pendant", color: "#f39c12", image: imgGodPendant, needsInput: true, inputLabel: "Enter Name of God" },
    ],
};

const getSwapOptions = (className: string) => {
    const lower = className.toLowerCase();
    for (const key of Object.keys(SWAP_OPTIONS)) {
        if (lower.includes(key)) return { key, options: SWAP_OPTIONS[key] };
    }
    return { key: "stone", options: SWAP_OPTIONS.stone };
};

// ─── Roboflow colour palette ────────────────────────────────────────────────
const getRoboflowColor = (className: string, index: number) => {
    const palette = [
        { fill: "rgba(112, 0, 255, 0.45)", stroke: "rgb(112, 0, 255)", text: "#ffffff" }, // Stone: Saturated Purple
        { fill: "rgba(0, 255, 208, 0.45)", stroke: "rgb(0, 255, 208)", text: "#000000" },  // Band: Neon Cyan
        { fill: "rgba(0, 255, 208, 0.45)", stroke: "rgb(0, 255, 208)", text: "#000000" },  // Chain: Neon Cyan (Matches Band)
        { fill: "rgba(255, 0, 80, 0.45)", stroke: "rgb(255, 0, 80)", text: "#ffffff" },   // Pendant: Vibrant Pink
        { fill: "rgba(251, 146, 60, 0.45)", stroke: "rgb(251, 146, 60)", text: "#ffffff" }, // Misc: Orange
    ];
    const lower = className.toLowerCase();
    let colorIndex = index;
    if (lower.includes("stone")) colorIndex = 0;
    else if (lower.includes("band")) colorIndex = 1;
    else if (lower.includes("chain")) colorIndex = 2;
    else if (lower.includes("pendant") || lower.includes("ant")) colorIndex = 3;

    return palette[colorIndex % palette.length];
};

const inferClassFromColor = (r: number, g: number, b: number, category: string = "") => {
    const isNecklace = category.toLowerCase().includes("necklace") || category.toLowerCase().includes("pendant");

    // Check against updated Roboflow palette from ref image
    if (Math.abs(r - 112) < 15 && Math.abs(g - 0) < 15 && Math.abs(b - 255) < 15) return "stone";
    if (Math.abs(r - 0) < 15 && Math.abs(g - 255) < 15 && Math.abs(b - 208) < 15) {
        return isNecklace ? "chain" : "band";
    }
    if (Math.abs(r - 255) < 15 && Math.abs(g - 0) < 15 && Math.abs(b - 80) < 15) return "pendant";
    return null;
};

// ─── Point-in-polygon test ──────────────────────────────────────────────────
function pointInPolygon(px: number, py: number, points: { x: number; y: number }[]) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        const intersect = (yi > py) !== (yj > py) &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

// ─── MaskedImage ────────────────────────────────────────────────────────────
interface MaskedImageProps {
    src: string;
    alt: string;
    predictions: any[];
    mode: "done" | "edit";
    activeBrush: string | null;
    brushSize: number;
    clearTrigger: number;
    onSegmentClick: (pred: any, screenX: number, screenY: number) => void;
    category?: string;
}

const MaskedImage = forwardRef<any, MaskedImageProps>(({
    src, alt, predictions, mode, activeBrush, brushSize, clearTrigger, onSegmentClick, category = "",
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const brushCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const isDrawing = useRef(false);

    useImperativeHandle(ref, () => ({
        captureOriginal: async (): Promise<Blob | null> => {
            const img = imgRef.current;
            if (!img) return null;
            const offscreen = document.createElement("canvas");
            offscreen.width = img.clientWidth;
            offscreen.height = img.clientHeight;
            const ctx = offscreen.getContext("2d");
            if (!ctx) return null;
            ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
            return new Promise((resolve) => {
                offscreen.toBlob((blob) => resolve(blob), "image/png");
            });
        },
        captureComposite: async (): Promise<Blob | null> => {
            const img = imgRef.current;
            const aiCanvas = canvasRef.current;
            const brushCanvas = brushCanvasRef.current;
            if (!img || !aiCanvas || !brushCanvas) return null;

            const offscreen = document.createElement("canvas");
            offscreen.width = img.clientWidth;
            offscreen.height = img.clientHeight;
            const ctx = offscreen.getContext("2d");
            if (!ctx) return null;

            ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
            ctx.drawImage(aiCanvas, 0, 0);
            ctx.globalAlpha = 0.45;
            ctx.drawImage(brushCanvas, 0, 0);
            ctx.globalAlpha = 1.0;

            return new Promise((resolve) => {
                offscreen.toBlob((blob) => resolve(blob), "image/png");
            });
        }
    }));

    const drawMasks = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (predictions.length === 0) return;

        const scaleX = img.clientWidth / img.naturalWidth;
        const scaleY = img.clientHeight / img.naturalHeight;
        const usedLabelRegions: { x1: number; y1: number; x2: number; y2: number }[] = [];

        predictions.forEach((pred, idx) => {
            if (!pred.points?.length) return;
            const colors = getRoboflowColor(pred.class, idx);
            ctx.beginPath();
            ctx.moveTo(pred.points[0].x * scaleX, pred.points[0].y * scaleY);
            pred.points.forEach((p: any) => ctx.lineTo(p.x * scaleX, p.y * scaleY));
            ctx.closePath();
            ctx.fillStyle = colors.fill;
            ctx.fill();
            ctx.strokeStyle = colors.stroke;
            ctx.lineWidth = 1;
            ctx.stroke();

            let totalX = 0, totalY = 0;
            pred.points.forEach((p: any) => { totalX += p.x; totalY += p.y; });
            let cX = (totalX / pred.points.length) * scaleX;
            let cY = (totalY / pred.points.length) * scaleY;

            const label = `${pred.class.toLowerCase()} ${(pred.confidence * 100).toFixed(0)}%`;
            ctx.font = "bold 12px Inter, system-ui, sans-serif";
            const m = ctx.measureText(label);
            const bW = m.width + 8, bH = 18;
            let attempts = 0;
            while (attempts < 8) {
                const overlap = usedLabelRegions.some(r =>
                    cX - bW / 2 < r.x2 && cX + bW / 2 > r.x1 &&
                    cY - bH / 2 < r.y2 && cY + bH / 2 > r.y1
                );
                if (!overlap) break;
                cY -= bH + 2;
                attempts++;
            }
            usedLabelRegions.push({ x1: cX - bW / 2, y1: cY - bH / 2, x2: cX + bW / 2, y2: cY + bH / 2 });
            ctx.fillStyle = colors.stroke;
            ctx.fillRect(cX - bW / 2, cY - bH / 2, bW, bH);
            ctx.fillStyle = colors.text;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, cX, cY);
        });
    }, [predictions]);

    const initBrushCanvas = () => {
        const canvas = brushCanvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        const cW = canvas.width, cH = canvas.height;
        const tW = img.clientWidth, tH = img.clientHeight;
        if (cW !== tW || cH !== tH) {
            const tmp = document.createElement("canvas");
            tmp.width = cW; tmp.height = cH;
            const tc = tmp.getContext("2d");
            if (tc) {
                tc.drawImage(canvas, 0, 0);
                canvas.width = tW; canvas.height = tH;
                const cc = canvas.getContext("2d");
                if (cc) cc.drawImage(tmp, 0, 0, cW, cH, 0, 0, tW, tH);
            }
        }
    };

    const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = brushCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let cx: number, cy: number;
        if ("touches" in e.nativeEvent) {
            cx = e.nativeEvent.touches[0].clientX;
            cy = e.nativeEvent.touches[0].clientY;
        } else {
            cx = (e as React.MouseEvent).clientX;
            cy = (e as React.MouseEvent).clientY;
        }
        return { x: cx - rect.left, y: cy - rect.top };
    };

    // ── Edit mode: brush drawing ──────────────────────────────────────────
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== "edit" || !activeBrush) return;
        isDrawing.current = true;
        draw(e);
    };
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current || mode !== "edit" || !activeBrush) return;
        const canvas = brushCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const { x, y } = getMousePos(e);
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        if (activeBrush === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = getRoboflowColor(activeBrush, 0).stroke;
        }
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    };
    const stopDrawing = () => {
        isDrawing.current = false;
        const ctx = brushCanvasRef.current?.getContext("2d");
        if (ctx) ctx.globalCompositeOperation = "source-over";
    };

    // ── Done mode: segment click ──────────────────────────────────────────
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode !== "done") return;
        const img = imgRef.current;
        if (!img) return;
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const scaleX = img.naturalWidth / img.clientWidth;
        const scaleY = img.naturalHeight / img.clientHeight;
        const imgX = clickX * scaleX;
        const imgY = clickY * scaleY;

        let hit: any = null;

        // 1. Try AI polygons first
        for (let i = predictions.length - 1; i >= 0; i--) {
            const pred = predictions[i];
            if (pred.points?.length && pointInPolygon(imgX, imgY, pred.points)) {
                hit = pred;
                break;
            }
        }

        // 2. Fallback to sampling the brush canvas color (for manual edits)
        if (!hit) {
            const brushCtx = brushCanvasRef.current?.getContext("2d");
            if (brushCtx) {
                const pixel = brushCtx.getImageData(clickX, clickY, 1, 1).data;
                if (pixel[3] > 10) { // If there's color (opacity > 10)
                    const className = inferClassFromColor(pixel[0], pixel[1], pixel[2], category);
                    if (className) {
                        hit = { class: className, confidence: 1.0 };
                    }
                }
            }
        }

        if (hit) onSegmentClick(hit, e.clientX, e.clientY);
    };

    useEffect(() => {
        drawMasks();
        const resize = () => { drawMasks(); initBrushCanvas(); };
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, [drawMasks]);

    useEffect(() => {
        const ctx = brushCanvasRef.current?.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, brushCanvasRef.current!.width, brushCanvasRef.current!.height);
    }, [clearTrigger]);

    const interactiveCursor =
        mode === "done" ? "cursor-pointer"
            : mode === "edit" && activeBrush ? "cursor-crosshair touch-none"
                : "pointer-events-none";

    return (
        <div className="relative w-full overflow-hidden">
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                crossOrigin="anonymous"
                onLoad={() => { drawMasks(); initBrushCanvas(); }}
                className="w-full h-auto block select-none"
                draggable={false}
            />
            {/* AI mask overlay (always visible) */}
            <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none" style={{ width: "100%", height: "100%" }} />
            {/* Brush / click interaction overlay */}
            <canvas
                ref={brushCanvasRef}
                className={`absolute top-0 left-0 ${interactiveCursor}`}
                style={{ width: "100%", height: "100%", opacity: 0.45 }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onClick={handleCanvasClick}
            />
        </div>
    );
});

// ─── Segment Options Popup ───────────────────────────────────────────────────
interface SegmentPopupProps {
    pred: any;
    screenX: number;
    screenY: number;
    onClose: () => void;
    onSelect: (className: string, option: SwapOption, userInput?: string) => void;
}

const SegmentPopup = ({ pred, screenX, screenY, onClose, onSelect }: SegmentPopupProps) => {
    const { options } = getSwapOptions(pred.class);
    const popupRef = useRef<HTMLDivElement>(null);

    // Which option requires input (two-step flow)
    const [pendingOption, setPendingOption] = useState<SwapOption | null>(null);
    const [userInput, setUserInput] = useState("");

    // Adjust position so popup stays on screen
    const [pos, setPos] = useState({ x: screenX, y: screenY });
    useEffect(() => {
        if (!popupRef.current) return;
        const pw = popupRef.current.offsetWidth;
        const ph = popupRef.current.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        setPos({
            x: Math.min(screenX + 12, vw - pw - 12),
            y: Math.min(screenY + 12, vh - ph - 12),
        });
    }, [screenX, screenY, pendingOption]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
        };
        setTimeout(() => document.addEventListener("mousedown", handler), 0);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const colors = getRoboflowColor(pred.class, 0);

    const handleOptionClick = (opt: SwapOption) => {
        if (opt.needsInput) {
            setPendingOption(opt);
            setUserInput("");
        } else {
            onSelect(pred.class, opt);
            onClose();
        }
    };

    const handleConfirmInput = () => {
        if (!userInput.trim()) return;
        onSelect(pred.class, pendingOption!, userInput.trim());
        onClose();
    };

    return (
        <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed z-[9999] bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-5 min-w-[240px]"
            style={{ left: pos.x, top: pos.y }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 gap-3">
                <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        {pendingOption ? "Enter Details" : "Change"}
                    </p>
                    <p className="font-bold text-sm capitalize" style={{ color: colors.stroke }}>
                        {pendingOption ? pendingOption.label : pred.class}
                    </p>
                </div>
                <button
                    onClick={() => pendingOption ? setPendingOption(null) : onClose()}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-xl hover:bg-white/5 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {pendingOption ? (
                    /* ── Input step ── */
                    <motion.div
                        key="input-step"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-col gap-3"
                    >
                        <p className="text-[10px] text-muted-foreground font-semibold">
                            {pendingOption.inputLabel}
                        </p>
                        <input
                            autoFocus
                            type="text"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleConfirmInput()}
                            placeholder={pendingOption.inputLabel}
                            className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                        />
                        <button
                            onClick={handleConfirmInput}
                            disabled={!userInput.trim()}
                            className="w-full mt-1 py-2.5 rounded-2xl bg-accent text-white text-[11px] font-black uppercase tracking-widest hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Confirm
                        </button>
                    </motion.div>
                ) : (
                    /* ── Options list ── */
                    <motion.div
                        key="options-list"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.18 }}
                    >
                        {options[0]?.image ? (
                            /* ── Image grid (stones) ── */
                            <div className="grid grid-cols-2 gap-2">
                                {options.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleOptionClick(opt)}
                                        className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl border border-gray-800/60 hover:border-amber-600/60 bg-black/20 hover:bg-black/30 transition-all duration-200 group shadow-md hover:shadow-amber-900/30"
                                    >
                                        <div className="w-full h-16 rounded-xl overflow-hidden transition-all group-hover:scale-105 duration-300">
                                            <img
                                                src={opt.image}
                                                alt={opt.label}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-amber-600 transition-colors text-center leading-tight">
                                            {opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* ── Icon / color list (band, pendant etc.) ── */
                            <div className="flex flex-col gap-2">
                                {options.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleOptionClick(opt)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-transparent hover:border-border hover:bg-white/5 transition-all duration-200 group"
                                    >
                                        {opt.icon ? (
                                            <span className="text-xl w-7 text-center flex-none">{opt.icon}</span>
                                        ) : (
                                            <div
                                                className="w-7 h-7 rounded-full flex-none shadow-md border border-white/10 group-hover:scale-110 transition-transform duration-300"
                                                style={{ backgroundColor: opt.color }}
                                            />
                                        )}
                                        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-left">
                                            {opt.label}
                                        </span>
                                        {opt.needsInput && (
                                            <span className="text-[9px] font-black text-accent/70 uppercase tracking-widest">›</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ModifyJewelryPage = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const { data: product, isLoading: isProductLoading } = useQuery({
        queryKey: ["product", id],
        queryFn: () => getProductById(id || ""),
        enabled: !!id,
    });

    const [predictions, setPredictions] = useState<any[]>([]);
    const [isSegmenting, setIsSegmenting] = useState(false);
    const maskedImageRef = useRef<any>(null);

    // Done / Edit mode
    const [mode, setMode] = useState<"done" | "edit">("done");

    // Edit-mode brush state
    const [activeBrush, setActiveBrush] = useState<string | null>(null);
    const [brushSize, setBrushSize] = useState([16]);
    const [clearTrigger, setClearTrigger] = useState(0);

    // Choices per segment class (e.g. stone: "Diamond")
    const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
    const [visionaryPrompt, setVisionaryPrompt] = useState("");
    const [segmentedRefUrl, setSegmentedRefUrl] = useState<string | null>(null);
    const [originalRefUrl, setOriginalRefUrl] = useState<string | null>(null);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Popup state
    const [popup, setPopup] = useState<{
        pred: any; screenX: number; screenY: number;
    } | null>(null);

    useEffect(() => {
        const fetchSeg = async () => {
            if (product?.image) {
                setIsSegmenting(true);
                try {
                    const res = await segmentImage(product.image);
                    if (res.predictions) setPredictions(res.predictions);
                } catch (e) {
                    console.error("Seg failed", e);
                } finally {
                    setIsSegmenting(false);
                }
            }
        };
        fetchSeg();
    }, [product?.image]);

    const baseImage = product?.image || productRing;

    const handleSegmentClick = (pred: any, sx: number, sy: number) => {
        setPopup({ pred, screenX: sx, screenY: sy });
    };

    const handleSwapSelect = (className: string, option: SwapOption, userInput?: string) => {
        const choiceValue = userInput || option.label;
        setSelectedChoices(prev => ({ ...prev, [className]: choiceValue }));
        console.log("Swap", className, "→", choiceValue);
    };

    const handleGeneratePrompt = async () => {
        if (Object.keys(selectedChoices).length === 0) return;

        // 1. Capture and Upload both Original and Segmented Images
        if (maskedImageRef.current) {
            try {
                // First capture original clean photo
                const originalBlob = await maskedImageRef.current.captureOriginal();
                if (originalBlob) {
                    const resOrig = await uploadRefImage(originalBlob);
                    setOriginalRefUrl(resOrig.imageUrl);
                }

                // Then capture segmented/masked design
                const segmentedBlob = await maskedImageRef.current.captureComposite();
                if (segmentedBlob) {
                    const resSeg = await uploadRefImage(segmentedBlob);
                    setSegmentedRefUrl(resSeg.imageUrl);
                }
            } catch (err) {
                console.error("Capture/Upload failed:", err);
            }
        }

        // 2. Build Text Prompt
        const name = product?.name || "jewelry piece";
        const category = product?.category || "";
        const parts = Object.entries(selectedChoices).map(([className, opt]) =>
            `${opt} ${className}`
        );
        let prompt = `A premium custom ${name} ${category} ${parts.join(", ")}. High-end luxury craftsmanship, 8k resolution, cinematic lighting, professional jewelry photography.`.replace(/\s+/g, ' ');

        setVisionaryPrompt(prev => (prev ? prev + "\n" + prompt : prompt));
    };

    const handleGenerateDesign = async () => {
        if (!visionaryPrompt.trim()) return;
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const res = await generateDesign(visionaryPrompt, segmentedRefUrl || undefined, originalRefUrl || undefined);
            if (res.image_url) {
                setGeneratedImageUrl(res.image_url);
                // Clear segmentation masks from the Original Vision so user can compare both designs cleanly
                setPredictions([]);
                setClearTrigger(prev => prev + 1); // Remove manual brush strokes
                setPopup(null);
                setMode("done");
            }
        } catch (err: any) {
            console.error("Design generation failed:", err);
            setGenerationError(err?.response?.data?.detail || err?.message || "Generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadDesign = async () => {
        if (!generatedImageUrl) return;
        try {
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `swarnim-design-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "Downloaded", description: "Design saved to your device." });
        } catch (error) {
            console.error("Download failed via blob:", error);
            // Fallback for CORS issues
            const a = document.createElement("a");
            a.href = generatedImageUrl;
            a.download = `swarnim-design-${Date.now()}.png`;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handleEditClick = () => {
        setMode("edit");
        setPopup(null);
    };

    const handleDoneClick = () => {
        setMode("done");
        setActiveBrush(null);
        setPopup(null);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-6 max-w-6xl">
                    <Link to={`/product/${id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-10 group">
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium uppercase tracking-widest text-[10px]">Back to Design</span>
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
                            <div>
                                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4 tracking-tighter">Jewelry Atelier</h1>
                                <p className="text-xl text-muted-foreground max-w-2xl font-display">Modify Your Jewelry With Your Own Way</p>
                            </div>

                        </div>

                        {/* Two-column layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            {/* Left Column: Previews & Manual Lab */}
                            <div className="space-y-10">
                                {/* Original Design */}
                                <div className="flex flex-col gap-8">
                                    <div className="group relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-card ring-1 ring-white/10 transition-all duration-500">
                                        <div className="w-full relative">
                                            {isProductLoading ? (
                                                <div className="w-full aspect-square flex flex-col items-center justify-center bg-secondary animate-pulse">
                                                    <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent">Summoning Assets...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="absolute top-8 left-8 z-20 flex flex-col gap-3 pointer-events-none">
                                                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl">
                                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Original Vision</span>
                                                        </div>
                                                        {isSegmenting && (
                                                            <div className="flex items-center gap-3 bg-accent text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl shadow-xl animate-bounce">
                                                                <Sparkles className="h-3.5 w-3.5" />
                                                                AI Analyzing...
                                                            </div>
                                                        )}
                                                        {/* Mode badge */}
                                                        {!isSegmenting && predictions.length > 0 && (
                                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-lg ${mode === "done"
                                                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                                                : "bg-accent/20 border-accent/40 text-accent"
                                                                }`}>
                                                                {mode === "done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                                                                {mode === "done" ? "Click a part to change it" : "Brush mode — paint freely"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <MaskedImage
                                                        ref={maskedImageRef}
                                                        src={baseImage}
                                                        alt={product?.name || "Original Design"}
                                                        predictions={predictions}
                                                        mode={mode}
                                                        activeBrush={activeBrush}
                                                        brushSize={brushSize[0]}
                                                        clearTrigger={clearTrigger}
                                                        onSegmentClick={handleSegmentClick}
                                                        category={product?.category}
                                                    />
                                                </>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between pointer-events-none">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Capture: S-01</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Lab */}
                                <div className="bg-card/40 backdrop-blur-3xl border border-border rounded-[2.5rem] p-6 shadow-2xl">
                                    <div className="flex flex-col gap-5">
                                        {/* Label */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${mode === "edit" ? "bg-accent shadow-accent/50 rotate-3" : "bg-emerald-500 shadow-emerald-500/40"
                                                }`}>
                                                {mode === "edit"
                                                    ? <Pencil className="h-5 w-5" />
                                                    : <CheckCircle2 className="h-5 w-5" />
                                                }
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-2xl tracking-tight">Manual Lab</h3>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1">
                                                    {mode === "done" ? "Click to customise" : "Paint to refine"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Done / Edit buttons */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                variant={mode === "done" ? "default" : "outline"}
                                                size="sm"
                                                id="manual-lab-done-btn"
                                                onClick={handleDoneClick}
                                                className={`rounded-xl gap-2 px-4 h-10 transition-all active:scale-95 ${mode === "done"
                                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-none"
                                                    : "bg-card/60 border-border"
                                                    }`}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[10px]">Done</span>
                                            </Button>
                                            <Button
                                                variant={mode === "edit" ? "default" : "outline"}
                                                size="sm"
                                                id="manual-lab-edit-btn"
                                                onClick={handleEditClick}
                                                className={`rounded-xl gap-2 px-4 h-10 transition-all active:scale-95 ${mode === "edit"
                                                    ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/30 border-none"
                                                    : "bg-card/60 border-border"
                                                    }`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-[10px]">Edit</span>
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={handleGeneratePrompt}
                                                className="rounded-xl gap-2 px-4 h-10 bg-gradient-to-r from-accent/20 to-transparent border-accent/20 hover:border-accent/40 text-accent transition-all active:scale-95 group shadow-md"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Generate</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* ── Edit mode brush controls ── */}
                                    <AnimatePresence>
                                        {mode === "edit" && (
                                            <motion.div
                                                key="edit-controls"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-t border-white/5 pt-6 mt-4 space-y-6">
                                                    {/* Brush size status bar - Compact */}
                                                    <div className="flex items-center justify-between bg-secondary/20 px-4 py-2 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Brush Size</p>
                                                            <span className="text-sm font-mono font-black text-accent">{brushSize[0]}PX</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Active</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        {/* Material Brushes - Tighter Grid */}
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                                                Materials
                                                                <span className="flex-1 h-px bg-border/30" />
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {[...new Set(predictions.map(p => p.class))].map((cl: string, idx: number) => {
                                                                    const col = getRoboflowColor(cl, idx);
                                                                    const isA = activeBrush === cl;
                                                                    return (
                                                                        <button
                                                                            key={cl}
                                                                            onClick={() => setActiveBrush(isA ? null : cl)}
                                                                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 ${isA
                                                                                ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent/20"
                                                                                : "border-border bg-card/40 hover:border-accent/30"
                                                                                }`}
                                                                        >
                                                                            <div
                                                                                className="w-5 h-5 rounded-full flex-none"
                                                                                style={{ backgroundColor: col.stroke }}
                                                                            />
                                                                            <span className={`text-[9px] font-black uppercase tracking-wider truncate ${isA ? "text-accent" : "text-muted-foreground"
                                                                                }`}>{cl}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Brush Dynamics - Slimmed down */}
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                                                Size Settings
                                                                <span className="flex-1 h-px bg-border/30" />
                                                            </p>
                                                            <div className="bg-secondary/10 p-4 rounded-2xl border border-white/5 flex items-center gap-6">
                                                                <div className="w-12 h-12 rounded-xl border border-border bg-card/60 flex items-center justify-center flex-none">
                                                                    <div
                                                                        className="rounded-full opacity-60"
                                                                        style={{
                                                                            width: `${Math.max(4, Math.min(brushSize[0], 36))}px`,
                                                                            height: `${Math.max(4, Math.min(brushSize[0], 36))}px`,
                                                                            backgroundColor: activeBrush === "eraser" ? "white" : (activeBrush ? getRoboflowColor(activeBrush, 0).stroke : "rgba(255,255,255,0.1)"),
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Slider value={brushSize} onValueChange={setBrushSize} max={100} min={1} step={1} className="flex-1" />
                                                            </div>
                                                        </div>

                                                        {/* Utility Tools - Side by Side buttons */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Button
                                                                variant={activeBrush === "eraser" ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setActiveBrush(activeBrush === "eraser" ? null : "eraser")}
                                                                className={`h-12 rounded-xl gap-2 transition-all ${activeBrush === "eraser" ? "bg-accent text-white" : "bg-card/40"
                                                                    }`}
                                                            >
                                                                <Eraser className="h-4 w-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Eraser</span>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setClearTrigger(prev => prev + 1)}
                                                                className="h-12 rounded-xl gap-2 border-destructive/20 hover:bg-destructive/5 text-destructive transition-all group"
                                                            >
                                                                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Clear</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Right Column: Results & Prompt */}
                            <div className="space-y-10">
                                {/* New Design */}
                                <div className="flex flex-col gap-8">
                                    <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl border border-dashed border-accent/30 bg-card/40 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500 aspect-square flex flex-col items-center justify-center text-center p-10">
                                        <div className="absolute top-8 left-8 z-20">
                                            <div className="bg-accent/10 backdrop-blur-xl border border-accent/20 px-4 py-2 rounded-2xl">
                                                <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">New Design Vision</span>
                                            </div>
                                        </div>

                                        {isGenerating ? (
                                            /* Loading State */
                                            <div className="space-y-6 flex flex-col items-center">
                                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-white shadow-2xl shadow-accent/20 animate-pulse">
                                                    <Sparkles className="h-10 w-10 animate-spin" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.3em]">AI is crafting your design...</p>
                                                    <p className="text-[10px] text-muted-foreground">This may take up to 2 minutes</p>
                                                </div>
                                                <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '70%' }} />
                                                </div>
                                            </div>
                                        ) : generatedImageUrl ? (
                                            /* Generated Image */
                                            <>
                                                <img
                                                    src={generatedImageUrl}
                                                    alt="AI Generated Design"
                                                    className="w-full h-full object-contain rounded-[2rem] absolute inset-0 p-2"
                                                />
                                                <div className="absolute top-8 right-8 z-20">
                                                    <Button variant="secondary" size="icon" className="w-12 h-12 rounded-xl shadow-xl hover:bg-white text-accent hover:text-accent border border-accent/20 bg-white/90 backdrop-blur-md transition-all group/dl" onClick={handleDownloadDesign} title="Download Design">
                                                        <Download className="h-5 w-5 group-hover/dl:-translate-y-0.5 transition-transform" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            /* Placeholder State */
                                            <div className="space-y-6 max-w-xs flex flex-col items-center">
                                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-white shadow-2xl shadow-accent/20 group-hover:scale-110 transition-transform duration-700">
                                                    <Sparkles className="h-10 w-10 animate-pulse" />
                                                </div>
                                                {generationError && (
                                                    <p className="text-destructive text-xs font-semibold px-4 py-2 bg-destructive/10 rounded-xl">{generationError}</p>
                                                )}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent/5 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Visionary Prompt UI */}
                                <div className="bg-card/40 backdrop-blur-3xl border border-border rounded-[2.5rem] p-6 shadow-2xl">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold shadow-2xl border border-gold/20">
                                                <Sparkles className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-2xl tracking-tight text-black">Visionary Prompt</h3>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1">
                                                    Prompt Engineering
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <Textarea
                                                    placeholder="E.g., Transform this ring into 18k Rose Gold with intricate filigree details..."
                                                    id="visionary-prompt-input"
                                                    value={visionaryPrompt}
                                                    onChange={(e) => setVisionaryPrompt(e.target.value)}
                                                    className="min-h-[100px] bg-secondary/20 border-border/50 rounded-2xl p-4 text-sm focus:ring-accent/30 transition-all resize-none placeholder:text-muted-foreground/30"
                                                />
                                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                                    <span className="text-[8px] font-black uppercase text-accent tracking-widest">AI Ready</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reference Images Thumbnails - Compact Grid */}
                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        <AnimatePresence>
                                            {originalRefUrl && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative group p-2.5 bg-secondary/30 rounded-2xl border border-white/5 flex items-center gap-3"
                                                >
                                                    <div className="relative cursor-pointer" onClick={() => { setLightboxUrl(originalRefUrl); setShowLightbox(true); }}>
                                                        <img
                                                            src={originalRefUrl}
                                                            alt="Original Reference"
                                                            className="w-10 h-10 rounded-lg object-cover border border-white/20 shadow-lg group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-accent/70">Ref 1</span>
                                                        <span className="text-[8px] text-muted-foreground uppercase font-black opacity-60 truncate">Clean Photo</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setOriginalRefUrl(null)}
                                                        className="ml-auto p-1.5 hover:bg-destructive/10 rounded-lg transition-colors group/del"
                                                    >
                                                        <X className="w-3.5 h-3.5 text-muted-foreground group-hover/del:text-destructive" />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {segmentedRefUrl && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative group p-2.5 bg-secondary/30 rounded-2xl border border-white/5 flex items-center gap-3"
                                                >
                                                    <div className="relative cursor-pointer" onClick={() => { setLightboxUrl(segmentedRefUrl); setShowLightbox(true); }}>
                                                        <img
                                                            src={segmentedRefUrl}
                                                            alt="Mask Reference"
                                                            className="w-10 h-10 rounded-lg object-cover border border-white/20 shadow-lg group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-accent">Ref 2</span>
                                                        <span className="text-[8px] text-muted-foreground uppercase font-black opacity-60 truncate">Design Mask</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setSegmentedRefUrl(null)}
                                                        className="ml-auto p-1.5 hover:bg-destructive/10 rounded-lg transition-colors group/del"
                                                    >
                                                        <X className="w-3.5 h-3.5 text-muted-foreground group-hover/del:text-destructive" />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex justify-center flex-col items-center gap-5 pt-5">
                                        <Button
                                            variant="gold"
                                            size="lg"
                                            className="text-lg w-full py-7 h-auto rounded-[2rem] shadow-xl hover:shadow-gold/40 transition-all group overflow-hidden relative"
                                            onClick={handleGenerateDesign}
                                            disabled={isGenerating || !visionaryPrompt.trim()}
                                        >
                                            <Sparkles className={`h-5 w-5 mr-3 ${isGenerating ? 'animate-spin' : 'group-hover:animate-spin'}`} />
                                            {isGenerating ? 'Generating...' : 'Generate Design'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </main>
            <Footer />

            {/* Segment Options Popup */}
            <AnimatePresence>
                {popup && (
                    <SegmentPopup
                        pred={popup.pred}
                        screenX={popup.screenX}
                        screenY={popup.screenY}
                        onClose={() => setPopup(null)}
                        onSelect={handleSwapSelect}
                    />
                )}
            </AnimatePresence>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {showLightbox && lightboxUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 md:p-20"
                    >
                        {/* Header Area */}
                        <div className="flex items-center justify-between w-full max-w-5xl mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent/20 rounded-2xl border border-accent/30">
                                    <Sparkles className="w-6 h-6 text-accent" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-display font-bold text-white tracking-tight">Active Reference Preview</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">
                                        {lightboxUrl === originalRefUrl ? "Clean Original Photo" : "High Precision Segmentation"}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLightbox(false)}
                                className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95"
                            >
                                <span className="text-[12px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">Close Preview</span>
                                <X className="w-5 h-5 text-white/50 group-hover:text-white" />
                            </button>
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 shadow-3xl bg-card/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={lightboxUrl}
                                alt="High Precision Reference"
                                className="w-full h-auto max-h-[75vh] object-contain block mx-auto"
                            />
                        </motion.div>

                        {/* Overlay Close Trigger (allows clicking outside to close) */}
                        <div
                            className="absolute inset-0 -z-10"
                            onClick={() => setShowLightbox(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModifyJewelryPage;
