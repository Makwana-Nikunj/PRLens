import React, { useState, useEffect, useRef } from 'react';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlaying, setModalPlaying] = useState(false);
  const [modalProgress, setModalProgress] = useState(0);
  const [modalSpeed, setModalSpeed] = useState(1);
  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s === 3 ? 1 : s + 1));
    }, 2600);
    return () => clearInterval(timer);
  }, []);

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
    setProgress((v.currentTime / v.duration) * 100);
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
    <section id="how-it-works" className="py-[120px] bg-[#0a0a0d]" aria-labelledby="how-it-works-title">
      <div className="w-full px-6 md:px-[60px] 2xl:px-[100px]">
        {/* Heading */}
        <h2
          id="how-it-works-title"
          className="text-[clamp(32px,5vw,48px)] font-bold text-[#f3f3f6] tracking-tight mb-[100px] text-center"
        >
          How it works
        </h2>

        <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14 max-w-[1100px] mx-auto">
          {/* Left: Steps */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="flex flex-col gap-8">
              {steps.map((step) => {
                const isActive = activeStep === parseInt(step.num);
                return (
                  <div
                    key={step.num}
                    className="flex gap-5 items-start transition-all duration-500"
                    aria-label={`Step ${step.num}`}
                  >
                    {/* Number circle with connecting line */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[18px] font-bold shrink-0 transition-all duration-500"
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
                          className="w-px h-[56px] mt-2 transition-colors duration-500"
                          style={{
                            background: activeStep > parseInt(step.num) ? 'linear-gradient(to bottom, #9457f5, #232330)' : '#232330',
                          }}
                        />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="pt-2">
                      <h3
                        className="text-[17px] font-semibold mb-1 transition-colors duration-500"
                        style={{ color: isActive ? '#f3f3f6' : '#9b9ba8' }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[14px] leading-relaxed text-[#6b6b78]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Video */}
          <div
            className="flex-1 w-full relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{
              background: '#16161d',
              border: '1px solid #232330',
              aspectRatio: '16 / 9',
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
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={() => setVideoError(true)}
              aria-hidden="true"
            />

            {/* Hover + centered play icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex items-center justify-center rounded-full w-20 h-20 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'rgba(124,58,237,0.2)' }}
              >
                <svg
                  className="w-10 h-10 text-[#9457f5]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
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
