import React from 'react';

export const Reveal = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ animationDelay: `${delay}s` }} className={`${className} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {children}
        </div>
    );
};

export default Reveal;
