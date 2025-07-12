import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

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
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparksRef = useRef<Spark[]>([]);
    const animationIdRef = useRef<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [canvasStyle, setCanvasStyle] = useState<React.CSSProperties>({ display: 'none' });

    // Update canvas position and size to match container
    const updateCanvasPosition = useCallback(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        setCanvasStyle({
            position: 'fixed',
            left: rect.left + 'px',
            top: rect.top + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
            pointerEvents: 'none',
            zIndex: 9999,
            // display: isAnimating ? 'block' : 'none', // REMOVE THIS
        });
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
            ctx.scale(dpr, dpr);
        }
    }, [isAnimating]);

    useEffect(() => {
        updateCanvasPosition();
        window.addEventListener('resize', updateCanvasPosition);
        return () => {
            window.removeEventListener('resize', updateCanvasPosition);
        };
    }, [updateCanvasPosition]);

    useEffect(() => {
        updateCanvasPosition();
    }, [isAnimating, updateCanvasPosition]);

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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            sparksRef.current = sparksRef.current.filter((spark: Spark) => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) {
                    return false;
                }
                const progress = elapsed / duration;
                const eased = easeFunc(progress);
                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);
                const opacity = 1 - eased;
                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
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
            ctx.globalAlpha = 1;
            if (sparksRef.current.length > 0) {
                animationIdRef.current = requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setIsAnimating(false);
                animationIdRef.current = null;
                sparksRef.current = [];
            }
        };
        animationIdRef.current = requestAnimationFrame(draw);
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
                animationIdRef.current = null;
            }
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
            }
            sparksRef.current = [];
        };
    }, [isAnimating, sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        updateCanvasPosition(); // Ensure canvas position is up to date before getting rect
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect(); // Use canvas, not container
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
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                cursor: "pointer",
                zIndex: 0,
                willChange: "transform"
            }}
            onClick={handleClick}
        >
            {ReactDOM.createPortal(
                <canvas
                    ref={canvasRef}
                    style={canvasStyle}
                />,
                document.body
            )}
            {children}
        </div>
    );
};

export default ClickSpark; 