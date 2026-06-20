import React, { useEffect, useRef } from 'react';

const MouseGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    let requestRef;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    const easing = 0.15; // smooth trailing

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!requestRef) requestRef = requestAnimationFrame(update);
    };

    const update = () => {
      currentX += (mouseX - currentX) * easing;
      currentY += (mouseY - currentY) * easing;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }

      if (Math.abs(mouseX - currentX) > 0.1 || Math.abs(mouseY - currentY) > 0.1) {
        requestRef = requestAnimationFrame(update);
      } else {
        requestRef = null;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    requestRef = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (requestRef) cancelAnimationFrame(requestRef);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[400px] h-[400px] -ml-[200px] -mt-[200px] rounded-full pointer-events-none z-0 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default MouseGlow;
