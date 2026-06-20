import React, { useState, useEffect } from 'react';

const steps = [
  {
    num: '1',
    title: 'Paste a GitHub PR URL',
    desc: 'Copy any public pull request link',
  },
  {
    num: '2',
    title: 'AI analyzes the diff in seconds',
    desc: 'Understands code changes and context',
  },
  {
    num: '3',
    title: 'Read insights or chat for deeper understanding',
    desc: 'Ask follow-up questions instantly',
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s === 3 ? 1 : s + 1));
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="how-it-works" className="py-[120px] bg-[#0a0a0d]" aria-labelledby="how-it-works-title">
      <div className="w-full px-6 md:px-[60px] 2xl:px-[100px]">
        {/* Heading */}
        <h2
          id="how-it-works-title"
          className="text-[clamp(32px,5vw,48px)] font-bold text-[#f3f3f6] tracking-tight mb-[100px] text-center"
        >
          How it works
        </h2>

        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 max-w-[1100px] mx-auto">
          {/* Left: Steps */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="flex flex-col gap-10">
              {steps.map((step) => {
                const isActive = activeStep === parseInt(step.num);
                return (
                  <div
                    key={step.num}
                    className="flex gap-6 items-start transition-all duration-500"
                    aria-label={`Step ${step.num}`}
                  >
                    {/* Number circle with connecting line */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-[20px] font-bold shrink-0 transition-all duration-500"
                        style={{
                          background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                          border: `1px solid ${isActive ? 'rgba(124,58,237,0.5)' : '#232330'}`,
                          color: isActive ? '#9457f5' : '#6b6b78',
                        }}
                      >
                        {step.num}
                      </div>
                      {/* Connecting line */}
                      {parseInt(step.num) < 3 && (
                        <div
                          className="w-px h-[64px] mt-3 transition-colors duration-500"
                          style={{
                            background: activeStep > parseInt(step.num) ? 'linear-gradient(to bottom, #9457f5, #232330)' : '#232330',
                          }}
                        />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="pt-3">
                      <h3
                        className="text-[19px] font-semibold mb-2 transition-colors duration-500"
                        style={{ color: isActive ? '#f3f3f6' : '#9b9ba8' }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[16px] leading-relaxed text-[#6b6b78]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Video */}
          <div className="flex-1 w-full relative rounded-2xl overflow-hidden"
            style={{
              background: '#16161d',
              border: '1px solid #232330',
              aspectRatio: '16 / 9',
            }}
            aria-label="Demo video"
          >
            <video
              className="w-full h-full object-cover"
              src="/videos/demo.mp4"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoError(true)}
              aria-hidden="true"
            />

            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="flex flex-col items-center justify-center rounded-full w-16 h-16 mb-3"
                  style={{ background: 'rgba(124,58,237,0.2)' }}
                >
                  <svg
                    className="w-8 h-8 text-[#9457f5]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-[13px] text-[#6b6b78]">Video unavailable</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
