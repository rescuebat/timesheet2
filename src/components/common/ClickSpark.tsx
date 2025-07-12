import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ClickSparkProps {
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
    extraScale?: number;
    children?: React.ReactNode;
}

interface Spark {
    x: number;
    y: number;
    angle: number;
    startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
    sparkColor = "#ffffff",
    sparkSize = 12,
    sparkRadius = 25,
    sparkCount = 12,
    duration = 600,
    easing = "ease-out",
    extraScale = 1.0,
    children
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparksRef = useRef<Spark[]>([]);
    const animationIdRef = useRef<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Initialize canvas size
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        let resizeTimeout: NodeJS.Timeout;

        const resizeCanvas = () => {
            const rect = parent.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            // Set actual size in memory (scaled for high DPI)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            // Scale the canvas back down using CSS
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            // Scale the drawing context so everything draws at the correct size
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
        };

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        const ro = new ResizeObserver(handleResize);
        ro.observe(parent);

        resizeCanvas();

        return () => {
            ro.disconnect();
            clearTimeout(resizeTimeout);
        };
    }, []);

    const easeFunc = useCallback(
        (t: number) => {
            switch (easing) {
                case "linear":
                    return t;
                case "ease-in":
                    return t * t;
                case "ease-in-out":
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default:
                    return t * (2 - t); // ease-out
            }
        },
        [easing]
    );

    // Animation loop
    useEffect(() => {
        if (!isAnimating) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const draw = (timestamp: number) => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Filter and draw sparks
            sparksRef.current = sparksRef.current.filter((spark: Spark) => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) {
                    return false;
                }

                const progress = elapsed / duration;
                const eased = easeFunc(progress);

                // Calculate spark position and size
                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);
                const opacity = 1 - eased;

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                // Draw spark line
                ctx.strokeStyle = sparkColor;
                ctx.globalAlpha = opacity;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            // Continue animation if there are sparks
            if (sparksRef.current.length > 0) {
                animationIdRef.current = requestAnimationFrame(draw);
            } else {
                setIsAnimating(false);
                animationIdRef.current = null;
            }
        };

        animationIdRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
                animationIdRef.current = null;
            }
        };
    }, [isAnimating, sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const now = performance.now();
        const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / sparkCount,
            startTime: now,
        }));

        sparksRef.current.push(...newSparks);
        
        if (!isAnimating) {
            setIsAnimating(true);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                cursor: "pointer"
            }}
            onClick={handleClick}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    zIndex: 1000
                }}
            />
            {children}
        </div>
    );
};

export default ClickSpark; 