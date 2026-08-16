import React, { useState, useEffect, useRef } from 'react';
import SectionHeading from './SectionHeading';

const steps = [
  {
    num: 1,
    title: 'Paste a GitHub PR URL',
    desc: 'Copy any public pull request link',
  },
  {
    num: 2,
    title: 'AI analyzes the diff in seconds',
    desc: 'Understands code changes and context',
  },
  {
    num: 3,
    title: 'Read insights or chat for deeper understanding',
    desc: 'Ask follow-up questions instantly',
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlaying, setModalPlaying] = useState(false);
  const [modalProgress, setModalProgress] = useState(0);
  const [modalSpeed, setModalSpeed] = useState(1);
  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);

  useEffect(() => {
    if (!modalOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [modalOpen]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;

    const currentProgress = (v.currentTime / v.duration) * 100;
    setProgress(currentProgress);

    // Sync step with video progress (approximate thirds)
    if (currentProgress < 33.33) {
      setActiveStep(1);
    } else if (currentProgress < 66.66) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  };

  // How much of a step's third of the video has played (0-100), for the per-card fill bar
  const stepFill = (stepNum) => {
    const start = ((stepNum - 1) / 3) * 100;
    const end = (stepNum / 3) * 100;
    return Math.min(100, Math.max(0, ((progress - start) / (end - start)) * 100));
  };

  const handleStepClick = (stepNum) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;

    // Seek to the corresponding third of the video
    let targetTime = 0;
    if (stepNum === 2) targetTime = v.duration * 0.334;
    if (stepNum === 3) targetTime = v.duration * 0.667;

    v.currentTime = targetTime;
    setActiveStep(stepNum);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    v.currentTime = (x / rect.width) * v.duration;
  };

  const handleEnded = () => setIsPlaying(false);

  const openModal = () => {
    setModalOpen(true);
    setTimeout(() => {
      modalVideoRef.current?.play();
      setModalPlaying(true);
    }, 50);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalPlaying(false);
    setModalProgress(0);
    setModalSpeed(1);
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const toggleModalPlay = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setModalPlaying(true);
    } else {
      v.pause();
      setModalPlaying(false);
    }
  };

  const handleModalTimeUpdate = () => {
    const v = modalVideoRef.current;
    if (!v || !v.duration) return;
    setModalProgress((v.currentTime / v.duration) * 100);
  };

  const handleModalSeek = (e) => {
    const v = modalVideoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    v.currentTime = (x / rect.width) * v.duration;
  };

  const handleModalEnded = () => setModalPlaying(false);

  const changeSpeed = (next) => {
    const v = modalVideoRef.current;
    if (!v) return;
    const clamped = Math.max(0.5, Math.min(2, next));
    v.playbackRate = clamped;
    setModalSpeed(clamped);
  };

  return (
    <section id="how-it-works" className="py-[120px] bg-[#0a0a0d] scroll-mt-[80px]" aria-labelledby="how-it-works-title">
      <div className="w-full px-6 md:px-[60px] 2xl:px-[100px]">
        {/* Heading */}
        <SectionHeading
          id="how-it-works-title"
          eyebrow="Demo"
          title="How it works"
          subtitle="Three steps from a pull request URL to a full AI breakdown — watch it in action."
        />

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-14 max-w-[1100px] mx-auto">
          {/* Left: Steps */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="flex flex-col gap-3" role="tablist" aria-label="Demo steps">
              {steps.map((step) => {
                const num = parseInt(step.num);
                const isActive = activeStep === num;
                const isDone = activeStep > num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => handleStepClick(num)}
                    aria-current={isActive}
                    className="group relative w-full text-left rounded-xl px-5 py-4 overflow-hidden transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9457f5]"
                    style={{
                      background: isActive ? 'rgba(124,58,237,0.08)' : '#131318',
                      border: `1px solid ${isActive ? 'rgba(124,58,237,0.4)' : '#232330'}`,
                      boxShadow: isActive ? '0 0 40px rgba(124,58,237,0.1)' : 'none',
                    }}
                    title={`Jump to step ${step.num} in the demo`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Number / done circle */}
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 transition-all duration-300"
                        style={{
                          background: isDone ? 'rgba(124,58,237,0.25)' : isActive ? 'rgba(124,58,237,0.18)' : 'transparent',
                          border: `1px solid ${isDone || isActive ? 'rgba(148,87,245,0.5)' : '#232330'}`,
                          color: isDone || isActive ? '#9457f5' : '#6b6b78',
                          boxShadow: isActive ? '0 0 20px rgba(124,58,237,0.25)' : 'none',
                        }}
                      >
                        {isDone ? <CheckIcon /> : step.num}
                      </span>

                      {/* Text */}
                      <span className="min-w-0">
                        <span
                          className="block text-[16px] font-semibold leading-snug transition-colors duration-300"
                          style={{ color: isActive ? '#f3f3f6' : '#9b9ba8' }}
                        >
                          {step.title}
                        </span>
                        <span className="block text-[13px] leading-relaxed text-[#6b6b78] mt-[3px]">{step.desc}</span>
                      </span>

                      {/* Jump hint */}
                      <svg
                        className="w-4 h-4 shrink-0 ml-auto text-[#9457f5] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>

                    {/* Per-step progress fill */}
                    <span
                      className="absolute bottom-0 left-0 h-[2px] rounded-full transition-[width] duration-200"
                      style={{
                        width: `${stepFill(num)}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #9457f5)',
                        opacity: isActive ? 1 : 0.35,
                      }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[12px] text-[#6b6b78] text-center lg:text-left">
              Click a step to jump to that moment in the demo.
            </p>
          </div>

          {/* Right: Video */}
          <div className="flex-1 w-full relative">
            {/* Glow behind the video card */}
            <div
              className="absolute -inset-6 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(124,58,237,0.14) 0%, transparent 70%)', filter: 'blur(30px)' }}
              aria-hidden="true"
            />
            <div
              className="relative w-full rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
              style={{
                background: '#16161d',
                border: '1px solid #232330',
                aspectRatio: '16 / 9',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              }}
              onClick={openModal}
              role="button"
              tabIndex={0}
              aria-label="Open demo video"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal();
                }
              }}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover pointer-events-none"
                src="/PRLens.mp4"
                preload="metadata"
                autoPlay
                muted
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onError={() => setVideoError(true)}
                aria-hidden="true"
              />

              {/* Corner chip */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <span
                  className="inline-flex items-center gap-[6px] text-[11px] font-semibold px-3 py-[5px] rounded-full backdrop-blur-sm"
                  style={{ background: 'rgba(10,10,13,0.65)', border: '1px solid rgba(255,255,255,0.12)', color: '#d4d4d8' }}
                >
                  <span
                    className="w-[6px] h-[6px] rounded-full bg-[#9457f5]"
                    style={{ animation: 'prl-pulse 2s ease-in-out infinite' }}
                  />
                  Product demo
                </span>
              </div>

              {/* Hover overlay with play affordance */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'rgba(10,10,13,0.35)' }}
              >
                <div
                  className="flex items-center justify-center rounded-full w-[72px] h-[72px] transition-transform duration-300 group-hover:scale-105"
                  style={{ background: 'rgba(124,58,237,0.35)', border: '1px solid rgba(148,87,245,0.5)' }}
                >
                  <svg
                    className="w-9 h-9 text-[#f3f3f6]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-[13px] font-semibold text-[#f3f3f6]">Watch full demo</span>
              </div>

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
      </div>

      {/* Video modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          aria-label="Demo video"
        >
          <div
            className="relative w-full overflow-hidden"
            style={{
              maxWidth: '1200px',
              aspectRatio: '16 / 9',
              background: '#000',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              className="w-full h-full object-contain"
              src="/PRLens.mp4"
              preload="metadata"
              onTimeUpdate={handleModalTimeUpdate}
              onEnded={handleModalEnded}
              onPlay={() => setModalPlaying(true)}
              onPause={() => setModalPlaying(false)}
              onError={() => setVideoError(true)}
            />

            {/* Modal custom controls */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-2"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
            >
              <button
                onClick={toggleModalPlay}
                className="text-white hover:text-[#9457f5] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9457f5] rounded p-1"
                aria-label={modalPlaying ? 'Pause' : 'Play'}
              >
                {modalPlaying ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => changeSpeed(modalSpeed === 1 ? 1.5 : modalSpeed === 1.5 ? 2 : modalSpeed === 2 ? 0.5 : 1)}
                className="text-white hover:text-[#9457f5] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9457f5] rounded px-2 py-1 text-xs font-semibold"
                aria-label="Playback speed"
              >
                {modalSpeed}x
              </button>

              <div
                className="flex-1 h-1 rounded-full cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.2)' }}
                onClick={handleModalSeek}
                role="slider"
                aria-label="Video progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(modalProgress)}
                tabIndex={0}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${modalProgress}%`,
                    background: '#9457f5',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
