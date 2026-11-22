'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { RegistrationDialog } from '@/components/RegistrationDialog';
import type { StoryState } from '@/components/InvitationScene';

const InvitationScene = dynamic(() => import('@/components/InvitationScene'), {
  ssr: false,
  loading: () => <div className="scene-loader" aria-hidden="true"><span /></div>,
});

gsap.registerPlugin(ScrollTrigger, useGSAP);

const navItems = [['Experience', '#experience'], ['Details', '#details'], ['Reserve', '#ticket']];

export function EventExperience() {
  const pageRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const storyState = useRef<StoryState>({ progress: 0, revealed: 0 });
  const [navOpen, setNavOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const panels = gsap.utils.toArray<HTMLElement>('[data-story-panel]');
    const timeline = gsap.timeline({ scrollTrigger: { trigger: journeyRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.1 } });

    timeline
      .to(storyState.current, { progress: 0.22, duration: 1, ease: 'none' }, 0)
      .to(panels[0], { autoAlpha: 0.18, yPercent: -12, duration: 0.8, ease: 'none' }, 0.35)
      .to(storyState.current, { progress: 0.58, duration: 1, ease: 'none' }, 1)
      .fromTo(panels[1], { autoAlpha: 0, y: 56 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'none' }, 1.08)
      .to(storyState.current, { progress: 1, duration: 1, ease: 'none' }, 2)
      .fromTo(panels[2], { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'none' }, 2.16);

    ScrollTrigger.create({
      trigger: detailsRef.current,
      start: 'top 76%',
      end: 'bottom 70%',
      toggleClass: { targets: detailsRef.current, className: 'is-revealed' },
    });
  }, { scope: pageRef });

  function openRegistration() { setRegistrationOpen(true); setNavOpen(false); }
  function revealInvitation() { storyState.current.revealed = storyState.current.revealed > 0.5 ? 0 : 1; }

  return (
    <div ref={pageRef} className="experience-shell">
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lumina home">LUMINA</a>
        <button className="menu-toggle" type="button" aria-expanded={navOpen} aria-controls="main-nav" onClick={() => setNavOpen((open) => !open)}><span>{navOpen ? 'Close' : 'Menu'}</span></button>
        <nav id="main-nav" className={navOpen ? 'is-open' : undefined} aria-label="Main navigation">
          {navItems.map(([label, href]) => <a href={href} key={href} onClick={() => setNavOpen(false)}>{label}</a>)}
          <button className="nav-reserve" type="button" onClick={openRegistration}>Reserve your spot</button>
        </nav>
      </header>

      <main id="content">
        <section ref={journeyRef} id="top" className="scene-journey" aria-labelledby="hero-title">
          <div className="scene-pin">
            <div className="scene-vignette" aria-hidden="true" />
            <InvitationScene storyState={storyState} onReveal={revealInvitation} />
            <p className="scene-instruction">Move your cursor · Select the invitation</p>
          </div>
          <div className="journey-content">
            <section className="story-panel hero-panel" data-story-panel>
              <p className="eyebrow">An evening under the stars.</p>
              <h1 id="hero-title">A night<br />beyond<br /><em>the ordinary.</em></h1>
              <p className="hero-description">Some nights are remembered.<br />Others become part of your story.</p>
              <div className="action-row"><button className="button button-primary" type="button" onClick={openRegistration}>Reserve your spot <span aria-hidden="true">↗</span></button><a className="text-link" href="#experience">Discover the experience <span aria-hidden="true">↓</span></a></div>
            </section>
            <section id="experience" className="story-panel experience-panel" data-story-panel aria-labelledby="experience-title">
              <p className="eyebrow">The invitation opens</p>
              <h2 id="experience-title">Not just another<br /><em>night out.</em></h2>
              <p>An extraordinary gathering created for unforgettable moments, incredible atmosphere, and the people who make every experience worth remembering.</p>
            </section>
            <section className="story-panel reveal-panel" data-story-panel aria-labelledby="unexpected-title">
              <p className="eyebrow">A different kind of arrival</p>
              <h2 id="unexpected-title">Step into<br />the <em>unexpected.</em></h2>
              <p>A carefully curated evening of atmosphere, connection, music, and moments that stay with you long after the night ends.</p>
              <button className="text-button" type="button" onClick={revealInvitation}>Reveal the ticket <span aria-hidden="true">↗</span></button>
            </section>
          </div>
        </section>

        <section ref={detailsRef} id="details" className="details-section" aria-labelledby="details-title">
          <div className="section-intro"><p className="eyebrow">An evening in formation</p><h2 id="details-title">The night,<br /><em>revealed.</em></h2></div>
          <dl className="event-details"><div><dt>Date</dt><dd>Coming soon</dd></div><div><dt>Location</dt><dd>Coming soon</dd></div><div><dt>Doors open</dt><dd>To be announced</dd></div><div><dt>Dress code</dt><dd>To be announced</dd></div></dl>
        </section>

        <section id="ticket" className="ticket-section" aria-labelledby="ticket-title">
          <div className="ticket-mark" aria-hidden="true"><span>L</span><i /></div>
          <div className="ticket-copy"><p className="eyebrow">A place in the story</p><h2 id="ticket-title">Your night<br />starts <em>here.</em></h2><p>Be among the first to experience Lumina. Register your interest and receive updates when reservations open.</p><button className="button button-primary" type="button" onClick={openRegistration}>Save my spot <span aria-hidden="true">↗</span></button></div>
        </section>

        <section className="final-section" aria-labelledby="final-title"><p className="eyebrow">Lumina awaits</p><h2 id="final-title">The night is waiting.</h2><p>Make room for something extraordinary.</p><button className="text-button" type="button" onClick={openRegistration}>Join the list <span aria-hidden="true">↗</span></button></section>
      </main>

      <footer><div><strong>LUMINA</strong><span>An evening under the stars.</span></div><p>Event details and reservations will be announced soon.</p></footer>
      <RegistrationDialog open={registrationOpen} onClose={() => setRegistrationOpen(false)} />
    </div>
  );
}
