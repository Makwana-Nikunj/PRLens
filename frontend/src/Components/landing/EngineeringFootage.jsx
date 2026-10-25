import React from 'react';

const EngineeringFootage = () => {
  return (
    <section className="bg-[var(--prl-bg)] text-[var(--prl-text)] py-28 md:py-36 px-6 w-full">
      <div className="max-w-[1320px] mx-auto">
        <h2 className="font-display font-bold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] mb-4 prl-entrance">
          Built for engineering velocity.
        </h2>
        <p className="text-[18px] text-[var(--prl-text-dim)] mb-16 max-w-[50ch] prl-entrance prl-delay-1">
          Automating mechanical verification so engineering teams spend time reviewing intent and architecture.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch prl-entrance prl-delay-2">
          {/* Real video footage with poster frame */}
          <div className="lg:col-span-7 w-full overflow-hidden rounded-lg bg-[var(--prl-panel-2)] relative">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/assets/voyager-1-team-reacts-to-receiving-engineering-poster.jpg"
              className="w-full h-full object-cover min-h-[340px]"
              aria-label="Engineering team monitoring mission telemetry data"
            >
              <source src="/assets/voyager-1-team-reacts-to-receiving-engineering.mp4" type="video/mp4" />
            </video>
            <div className="p-4 bg-[var(--prl-panel-2)]">
              <p className="text-[14px] text-[var(--prl-text-dim)]">
                NASA JPL telemetry engineering review (Public Domain archive).
              </p>
            </div>
          </div>

          {/* Real archival code monitor photograph */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-lg bg-[var(--prl-panel-2)] overflow-hidden">
            <div className="w-full h-[240px] overflow-hidden relative">
              <img
                src="/assets/code-on-computer-monitor-unsplash.jpg"
                alt="Source code diff review displayed on workstation monitor"
                width={1920}
                height={1280}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-display text-[22px] font-bold text-[var(--prl-text)] mb-3">
                Zero friction, high signal.
              </h3>
              <p className="text-[15px] leading-relaxed text-[var(--prl-text-dim)] mb-4">
                No complex bot onboarding or repository write access. Paste any PR link into PRLens to surface critical changes, missing test fixtures, and security regressions.
              </p>
              <span className="text-[13px] text-emerald-400 font-semibold">
                Designed for maintainers, tech leads, and contributors.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineeringFootage;
