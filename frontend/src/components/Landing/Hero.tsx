"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/UI/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Animate from "../Animations/Animate";

function FloatingPaths({ position }: { position: number }) {
  const centerX = 348;
  const centerY = 158;

  const paths = Array.from({ length: 36 }, (_, i) => {
    const points = [];
    const spiralRadius = 10 + i * 3;
    const spiralTightness = 0.2 * position;

    for (let theta = 0; theta <= Math.PI * 2 * 3; theta += 0.1) {
      const r = spiralRadius + spiralTightness * theta;
      const x = centerX + r * Math.cos(theta + i * 0.1);
      const y = centerY + r * Math.sin(theta + i * 0.1);
      points.push([x, y]);
    }

    const d = points
      .map(
        ([x, y], idx) =>
          `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
      )
      .join(" ");

    return {
      id: i,
      d,
      color: `rgba(15,23,42,${0.1 + i * 0.03})`,
      width: 0.5 + i * 0.03,
      rotationDuration: 20 + Math.random() * 10,
    };
  });

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        ease: "linear",
        duration: 60,
      }}
    >
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.4, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: path.rotationDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

function Hero({ title = "Hero" }: { title?: string }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleButtonClick = () => {
    if (isAuthenticated) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden --background dark:bg-neutral-950">
      <Animate type="fade" delay={0.2} duration={1}>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </Animate>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8">
            <motion.span
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                textShadow: [
                  "0 0 8px rgba(255,255,255,0.3)",
                  "0 0 15px rgba(255,255,255,0.4)",
                  "0 0 8px rgba(255,255,255,0.3)",
                ],
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                delay: 0.2,
                duration: 1.5,
                textShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }}
              className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-950-500 to-indigo-950-500 font-extrabold tracking-tight leading-tight"
              style={{
                backgroundSize: "200% auto",
                animation: "gradientShift 3s ease infinite",
              }}
            >
              {title}
              <style jsx global>{`
                @keyframes gradientShift {
                  0% {
                    background-position: 0% center;
                  }
                  50% {
                    background-position: 100% center;
                  }
                  100% {
                    background-position: 0% center;
                  }
                }
              `}</style>
            </motion.span>
          </h1>

          <h2 className=" font-bold mb-8 tracking-tighter">SEE BEYOND</h2>

          <div
            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Button
              onClick={handleButtonClick}
              variant={"custom"}
              size={"default"}
            >
              <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                Get insured
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;
