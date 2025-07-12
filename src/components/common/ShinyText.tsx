import React from 'react';

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 3, className = '' }) => {
    if (disabled) {
        return <span className={className}>{text}</span>;
    }

    const animationDuration = `${speed}s`;

    return (
        <>
            <span
                className={`inline-block ${className}`}
                style={{
                    color: '#b5b5b5a4',
                    background: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                    backgroundSize: '200% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    display: 'inline-block',
                    animation: `shine ${animationDuration} linear infinite`
                }}
            >
                {text}
            </span>
            <style>{`
                @keyframes shine {
                    0% {
                        background-position: 100%;
                    }
                    100% {
                        background-position: -100%;
                    }
                }
            `}</style>
        </>
    );
};

export default ShinyText; 