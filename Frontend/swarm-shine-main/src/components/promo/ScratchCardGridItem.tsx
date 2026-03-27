import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ScratchCardGridItemProps {
  code: string;
  discount: number;
  minOrder?: number;
  expiry?: string;
  disabled?: boolean;
  isLocked?: boolean;
  startRevealed?: boolean;
  onScratch: () => void;
}

const ScratchCardGridItem: React.FC<ScratchCardGridItemProps> = ({ 
  code, 
  discount, 
  minOrder,
  expiry,
  disabled, 
  isLocked,
  startRevealed,
  onScratch 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);
  const [isRevealed, setIsRevealed] = useState(startRevealed || false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (startRevealed) {
        setIsRevealed(true);
        return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || initializedRef.current) return;

    // Set canvas size once
    const width = 300; // Use fixed size for internal buffer to avoid resize resets
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    // Fill with pattern
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#C0C0C0'); // Silver base
    gradient.addColorStop(0.5, '#E8E8E8'); 
    gradient.addColorStop(1, '#A0A0A0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative pixels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    // Add text overlay
    ctx.fillStyle = '#666';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2);

    initializedRef.current = true;
  }, []); // Only run once on mount

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const checkScratchPercentage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let clearPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) clearPixels++;
        }

        const currentPercentage = (clearPixels / (canvas.width * canvas.height)) * 100;
        if (currentPercentage > 40) { // Lower threshold for better UX
            setIsRevealed(true);
        }
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
        if (isRevealed || disabled) return;
        
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        onScratch(); // Notify parent that scratching has started/happened
        checkScratchPercentage();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (e.buttons === 1) scratch(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        scratch(e);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', scratch);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', scratch, { passive: false });

    return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', scratch);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchstart', scratch);
    };
  }, [isRevealed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({
      title: "Code Copied!",
      description: `${code} is ready to use.`,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`relative aspect-[1.6/1] rounded-2xl overflow-hidden border transition-all duration-500 ${
        isRevealed 
          ? 'border-gold shadow-lg h-auto min-h-[180px]' 
          : isLocked 
            ? 'opacity-40 grayscale blur-[1px] border-border pointer-events-none' 
            : 'bg-card border-border shadow-md hover:border-gold/30'
      }`}
    >
      {/* Revealed Content (Always present underneath the canvas) */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gold/5 via-white to-gold/10 p-4 text-center ${isRevealed ? 'z-30' : 'z-0'}`}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-3"
          >
            <div>
              <div className="text-gold font-bold text-3xl leading-none">{discount}% OFF</div>
              {isRevealed && <p className="text-[9px] text-muted-foreground uppercase tracking-tighter mt-1">Exclusive Discount Revealed</p>}
            </div>

            <div 
              onClick={handleCopy}
              className={`py-2 px-3 bg-white border-2 border-dashed border-gold rounded-xl font-mono text-xl tracking-[0.1em] text-black cursor-pointer hover:bg-gold/5 transition-all shadow-sm flex items-center justify-center gap-2 group/code ${!isRevealed ? 'mx-4' : ''}`}
            >
              <span>{code}</span>
              {isCopied ? <Check className="h-4 w-4 text-green-600 shrink-0" /> : <Copy className="h-3 w-3 opacity-40 group-hover/code:opacity-100 transition-opacity shrink-0" />}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gold/10 max-w-[240px] mx-auto">
              <div className="text-left">
                <p className="text-[8px] uppercase text-muted-foreground font-bold leading-none mb-1">Min. Order</p>
                <p className="text-[10px] font-semibold text-foreground">₹{(minOrder || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase text-muted-foreground font-bold leading-none mb-1">Valid Until</p>
                <p className="text-[10px] font-semibold text-foreground">{expiry ? new Date(expiry).toLocaleDateString() : 'No Expiry'}</p>
              </div>
            </div>

            {isRevealed ? (
                <div className="w-full pt-1">
                  <Button 
                    variant="gold" 
                    size="sm"
                    onClick={handleCopy}
                    className="w-full h-9 font-bold uppercase tracking-widest text-[10px] shadow-sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Coupon
                      </>
                    )}
                  </Button>
                </div>
            ) : (
                <p className="text-[8px] text-muted-foreground animate-pulse mt-1">Scratch to Reveal!</p>
            )}
          </motion.div>
      </div>

      {/* The Scratchable Layer */}
      <canvas 
        ref={canvasRef}
        className={`absolute inset-0 z-10 w-full h-full cursor-crosshair transition-opacity duration-300 ${isRevealed ? 'opacity-0 pointer-events-none invisible' : 'opacity-100'}`}
        style={{ display: isRevealed ? 'none' : 'block' }}
      />
      
      {/* Decorative Border Glow on Hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/30 rounded-2xl transition-colors pointer-events-none z-20" />
    </motion.div>
  );
};

export default ScratchCardGridItem;
