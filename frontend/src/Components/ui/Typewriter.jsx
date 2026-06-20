import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, delay = 50 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  // We need to render the text with the same styling as the original HTML,
  // which had three parts: white text, gradient text, white text.
  // The original string is exactly: "Understand any GitHub PR in seconds"
  // Let's break the current typed string into these parts based on index.

  const currentText = text.substring(0, currentIndex);
  
  const part1 = "Understand any "; // length 15
  const part2 = "GitHub PR";       // length 9
  const part3 = " in seconds";     // length 11

  const renderText = () => {
    let p1 = "", p2 = "", p3 = "";

    if (currentIndex <= part1.length) {
      p1 = currentText;
    } else if (currentIndex <= part1.length + part2.length) {
      p1 = part1;
      p2 = currentText.substring(part1.length);
    } else {
      p1 = part1;
      p2 = part2;
      p3 = currentText.substring(part1.length + part2.length);
    }

    return (
      <>
        <span className="text-[#f3f3f6]">{p1}</span>
        {p2 && (
          <span
            className="font-bold"
            style={{
              background: 'linear-gradient(135deg, #9457f5, #7c3aed)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {p2}
          </span>
        )}
        {p3 && <span className="text-[#f3f3f6]">{p3}</span>}
        {currentIndex < text.length && (
          <span className="inline-block w-[3px] h-[0.8em] bg-[#9457f5] ml-1 align-baseline animate-pulse"></span>
        )}
      </>
    );
  };

  return renderText();
};

export default Typewriter;
