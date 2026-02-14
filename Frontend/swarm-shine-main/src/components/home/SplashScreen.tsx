import { motion } from "framer-motion";

const SplashScreen = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Luxurious burgundy/wine gradient background matching website theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-wine via-wine-light/20 to-wine" 
        style={{
          background: "linear-gradient(135deg, hsl(345 40% 18%) 0%, hsl(345 35% 28%) 50%, hsl(345 40% 15%) 100%)"
        }}
      />
      
      {/* Subtle golden overlay shimmer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, hsl(40 65% 50% / 0.08) 0%, transparent 70%)"
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Elegant golden wave lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(40 65% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(40 65% 50%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(40 65% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((y, i) => (
          <motion.line
            key={i}
            x1="0%"
            y1={`${y * 100}%`}
            x2="100%"
            y2={`${y * 100}%`}
            stroke="url(#waveGradient)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: 0.3 + i * 0.2, ease: "easeOut" }}
          />
        ))}
      </svg>

      {/* Floating golden orbs */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 60 + i * 15,
            height: 60 + i * 15,
            background: `radial-gradient(circle, hsl(40 65% 50% / 0.12) 0%, transparent 70%)`,
            top: `${10 + (i % 4) * 25}%`,
            left: `${5 + (i % 5) * 20}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.5, 0.3, 0.5],
            scale: [0.8, 1, 0.9, 1],
            y: [0, -30, 0, -15, 0],
            x: [0, 15, 0, -15, 0],
          }}
          transition={{
            duration: 8 + i,
            delay: i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Central content */}
      <div className="relative flex flex-col items-center z-10">
        
        {/* Large Unique Diamond/Lotus Emblem */}
        <motion.div
          className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Outer rotating ornate ring */}
          <motion.div
            className="absolute w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <linearGradient id="ringGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(40 65% 50%)" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="hsl(42 70% 65%)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(40 65% 50%)" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="200" r="190" fill="none" stroke="url(#ringGradient1)" strokeWidth="1" strokeDasharray="6 12" />
              <circle cx="200" cy="200" r="175" fill="none" stroke="hsl(40 65% 50%)" strokeWidth="0.5" strokeOpacity="0.4" />
            </svg>
          </motion.div>

          {/* Secondary counter-rotating ring */}
          <motion.div
            className="absolute w-[85%] h-[85%]"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="200" cy="200" r="180" fill="none" stroke="hsl(40 65% 55%)" strokeWidth="0.5" strokeDasharray="3 15" strokeOpacity="0.6" />
            </svg>
          </motion.div>

          {/* Large ornate petal/ray elements */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-full"
              style={{ transform: `rotate(${i * 30}deg)` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 1 + i * 0.1 }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <linearGradient id={`petalGrad${i}`} x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="hsl(42 70% 65%)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(40 65% 50%)" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M200 30 Q220 80 200 130 Q180 80 200 30"
                  fill={`url(#petalGrad${i})`}
                  stroke="hsl(42 70% 60%)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1.5 + i * 0.08 }}
                />
              </svg>
            </motion.div>
          ))}

          {/* Inner glowing aura */}
          <motion.div
            className="absolute w-60 h-60 md:w-72 md:h-72 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            style={{
              background: "radial-gradient(circle, hsl(40 65% 50% / 0.25) 0%, hsl(40 65% 50% / 0.1) 40%, transparent 70%)",
              boxShadow: "0 0 100px hsl(40 65% 50% / 0.4), inset 0 0 60px hsl(40 65% 50% / 0.15)",
            }}
          />

          {/* Large central diamond emblem */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0, rotate: -360 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 2, delay: 2, type: "spring", stiffness: 60 }}
          >
            <svg width="160" height="160" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(44 75% 75%)" />
                  <stop offset="30%" stopColor="hsl(42 70% 60%)" />
                  <stop offset="70%" stopColor="hsl(40 65% 50%)" />
                  <stop offset="100%" stopColor="hsl(36 55% 35%)" />
                </linearGradient>
                <linearGradient id="diamondHighlight" x1="0%" y1="0%" x2="50%" y2="50%">
                  <stop offset="0%" stopColor="hsl(44 80% 85%)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <filter id="diamondGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="innerShadow">
                  <feOffset dx="2" dy="2" />
                  <feGaussianBlur stdDeviation="2" result="offset-blur" />
                  <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                  <feFlood floodColor="hsl(36 50% 25%)" floodOpacity="0.4" result="color" />
                  <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                  <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                </filter>
              </defs>
              
              {/* Main diamond shape */}
              <motion.polygon
                points="100,15 170,60 170,140 100,185 30,140 30,60"
                fill="url(#diamondGradient)"
                filter="url(#diamondGlow)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 2.5 }}
              />
              
              {/* Diamond outline */}
              <motion.polygon
                points="100,15 170,60 170,140 100,185 30,140 30,60"
                fill="none"
                stroke="hsl(44 75% 75%)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 2.2 }}
              />

              {/* Highlight overlay */}
              <polygon
                points="100,15 170,60 100,100 30,60"
                fill="url(#diamondHighlight)"
              />
              
              {/* Inner facet lines */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1.5, delay: 3.5 }}
              >
                <line x1="100" y1="15" x2="100" y2="185" stroke="hsl(44 70% 75%)" strokeWidth="1" />
                <line x1="30" y1="60" x2="170" y2="140" stroke="hsl(44 70% 75%)" strokeWidth="0.8" />
                <line x1="170" y1="60" x2="30" y2="140" stroke="hsl(44 70% 75%)" strokeWidth="0.8" />
                <line x1="30" y1="100" x2="170" y2="100" stroke="hsl(44 70% 75%)" strokeWidth="0.5" />
                {/* Center point */}
                <circle cx="100" cy="100" r="6" fill="hsl(44 80% 80%)" opacity="0.8" />
                <circle cx="100" cy="100" r="3" fill="hsl(44 85% 90%)" />
              </motion.g>

              {/* Inner diamond reflection */}
              <motion.polygon
                points="100,45 130,70 130,130 100,155 70,130 70,70"
                fill="none"
                stroke="hsl(44 70% 70%)"
                strokeWidth="0.5"
                strokeOpacity="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 4 }}
              />
            </svg>

            {/* Large sparkle effects around diamond */}
            {[
              { top: "-20px", right: "-10px", delay: 4.5, size: "w-5 h-5" },
              { top: "40%", left: "-25px", delay: 5, size: "w-4 h-4" },
              { bottom: "-15px", right: "20px", delay: 5.5, size: "w-4 h-4" },
              { top: "20px", left: "30%", delay: 6, size: "w-3 h-3" },
              { bottom: "30%", right: "-20px", delay: 6.5, size: "w-3 h-3" },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute ${pos.size}`}
                style={{ top: pos.top, right: pos.right, bottom: pos.bottom, left: pos.left }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                transition={{ duration: 1.5, delay: pos.delay, repeat: Infinity, repeatDelay: 3 }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 0 L12 24 M0 12 L24 12" stroke="hsl(44 80% 80%)" strokeWidth="2" />
                  <path d="M4 4 L20 20 M20 4 L4 20" stroke="hsl(44 80% 80%)" strokeWidth="1.5" opacity="0.7" />
                </svg>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Brand name with elegant typography */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 4, ease: "easeOut" }}
        >
          {/* Decorative flourish */}
          <motion.div
            className="flex items-center justify-center gap-6 mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 4.5 }}
          >
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <motion.div
              className="w-2.5 h-2.5 rotate-45"
              style={{ background: "hsl(40 65% 50%)" }}
              animate={{ rotate: [45, 90, 45] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-wide">
            <motion.span
              className="inline-block"
              style={{ color: "hsl(30 20% 95%)" }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 5 }}
            >
              Swar
            </motion.span>
            <motion.span
              className="inline-block"
              style={{ color: "hsl(40 65% 55%)" }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 5.3 }}
            >
              nim
            </motion.span>
          </h1>

          <motion.p
            className="mt-5 text-sm tracking-[0.5em] uppercase font-light"
            style={{ color: "hsl(30 20% 80%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 6 }}
          >
            The Shine of Gold
          </motion.p>

          {/* Bottom decorative line */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 6.5 }}
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/60" />
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "hsl(40 65% 50%)" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/60" />
          </motion.div>
        </motion.div>

        {/* Elegant loading bar */}
        <motion.div
          className="mt-10 w-40 h-0.5 bg-white/10 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 7 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(40 65% 50%), hsl(42 70% 65%))" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, delay: 7, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Elegant corner ornaments */}
      {[
        { pos: "top-6 left-6", border: "border-l-2 border-t-2" },
        { pos: "top-6 right-6", border: "border-r-2 border-t-2" },
        { pos: "bottom-6 left-6", border: "border-l-2 border-b-2" },
        { pos: "bottom-6 right-6", border: "border-r-2 border-b-2" },
      ].map((corner, i) => (
        <motion.div
          key={i}
          className={`absolute ${corner.pos} w-16 h-16 ${corner.border}`}
          style={{ borderColor: "hsl(40 65% 50% / 0.5)" }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
        >
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: "hsl(40 65% 50%)",
              top: corner.pos.includes("top") ? "-4px" : "auto",
              bottom: corner.pos.includes("bottom") ? "-4px" : "auto",
              left: corner.pos.includes("left") ? "-4px" : "auto",
              right: corner.pos.includes("right") ? "-4px" : "auto",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SplashScreen;