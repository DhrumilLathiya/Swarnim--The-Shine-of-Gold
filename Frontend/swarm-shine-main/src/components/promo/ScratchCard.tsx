import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScratchCardProps {
  code: string;
  discount: number;
  onClose: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ code, discount, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (match container)
    canvas.width = 300;
    canvas.height = 180;

    // Fill with pattern or solid silver color
    ctx.fillStyle = '#C0C0C0'; // Silver
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some "texture"
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, 2, 2);
    }

    // Add text overlay
    ctx.fillStyle = '#666';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 + 5);

    const checkScratchPercentage = () => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let clearPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) clearPixels++;
        }

        const currentPercentage = (clearPixels / (canvas.width * canvas.height)) * 100;
        setPercentage(currentPercentage);

        if (currentPercentage > 60) {
            setIsRevealed(true);
        }
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
        if (isRevealed) return;
        
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

        setIsScratched(true);
        checkScratchPercentage();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (e.buttons === 1) scratch(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        scratch(e);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isRevealed]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl border-4 border-gold/20"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors z-10"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-gold/10 mb-6">
                <Gift className="h-8 w-8 text-gold" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">Special Surprise!</h3>
            <p className="text-muted-foreground mb-8 text-sm">Scratch the card below to reveal your exclusive discount code!</p>

            <div className="relative w-[300px] h-[180px] mx-auto rounded-xl overflow-hidden shadow-inner bg-muted group cursor-crosshair">
                {/* Underneath (The Revealed Content) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-6">
                    <div className="text-gold font-bold text-4xl mb-2">{discount}% OFF</div>
                    <div className="py-2 px-6 bg-white border-2 border-dashed border-gold rounded-lg font-mono text-2xl tracking-widest text-black select-all">
                        {code}
                    </div>
                    <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Copy and use at checkout</p>
                </div>

                {/* The Scratchable Layer */}
                <canvas 
                    ref={canvasRef}
                    className={`absolute inset-0 transition-opacity duration-700 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                />
            </div>

            {isRevealed && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                    <Button 
                      variant="gold" 
                      className="w-full h-12 text-lg font-bold"
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        onClose();
                      }}
                    >
                        Copy Discount & Close
                    </Button>
                </motion.div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default ScratchCard;
