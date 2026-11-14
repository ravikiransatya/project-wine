import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FireworksCanvas } from './FireworksCanvas';
import { magicAudio } from '../sounds';
import './birthday-landing.css';

const MESSAGE = 'From one unexpected hello to a thousand beautiful memories, you became a part of so many of my happiest days. May life give you all the happiness you bring into mine.';

function setPitchPreservation(audio, preserve) {
  if ('preservesPitch' in audio) audio.preservesPitch = preserve;
  else if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = preserve;
  else if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = preserve;
}

function WordReveal({ text, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span className="birthday-word">{word}</span>
          {index < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </span>
  );
}

function MusicPlayer({ audioRef, musicPlaying, musicMuted, musicVolume, onToggle, onMute, onVolumeChange, sfxEnabled, onSfxToggle, onPlayFullCelebration }) {
  return (
    <div className="birthday-audio-controls" aria-label="Celebration audio controls">
      {onPlayFullCelebration && (
        <button
          type="button"
          className="birthday-motion-opt-in"
          onClick={onPlayFullCelebration}
          aria-label="Play the full birthday celebration with rockets and fireworks"
        >
          FIREWORKS
        </button>
      )}
      <button
        type="button"
        className={`birthday-audio-button ${musicPlaying ? 'is-playing' : ''}`}
        onClick={onToggle}
        aria-label={musicPlaying ? 'Pause birthday music' : 'Play birthday music'}
        aria-pressed={musicPlaying}
      >
        <span className={`music-indicator ${musicPlaying ? 'is-playing' : ''}`} aria-hidden="true">
          <i /><i /><i />
        </span>
        <span>{musicPlaying ? 'PAUSE' : 'MUSIC'}</span>
      </button>
      <button
        type="button"
        className="birthday-audio-icon-button"
        onClick={onMute}
        aria-label={musicMuted ? 'Unmute birthday music' : 'Mute birthday music'}
        aria-pressed={musicMuted}
      >
        {musicMuted ? '×' : 'VOL'}
      </button>
      <label className="birthday-volume-control">
        <span className="visually-hidden">Music volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicVolume}
          onChange={onVolumeChange}
          aria-label="Music volume"
        />
      </label>
      <button
        type="button"
        className={`birthday-audio-icon-button birthday-sfx-toggle ${sfxEnabled ? 'is-playing' : ''}`}
        onClick={onSfxToggle}
        aria-label={sfxEnabled ? 'Turn off rocket and fireworks sounds' : 'Turn on rocket and fireworks sounds'}
        aria-pressed={sfxEnabled}
      >
        SFX {sfxEnabled ? 'ON' : 'OFF'}
      </button>
      <audio ref={audioRef} src="/vinni-birthday-song.mp3" preload="auto" loop />
    </div>
  );
}

function PersonalBirthdayMessage() {
  return (
    <section className="birthday-message" aria-label="A birthday message for Vinni">
      <p className="birthday-message-copy"><WordReveal text={MESSAGE} /></p>
      <p className="birthday-final-wish"><WordReveal text="HAPPY BIRTHDAY, VINNI!" /></p>
      <p className="birthday-signoff">— From your best friend</p>
    </section>
  );
}

export function BirthdayLanding({ initialHasStarted = false, onStartMusic, onEnter, onExitComplete }) {
  const rootRef = useRef(null);
  const fireworksRef = useRef(null);
  const buttonRef = useRef(null);
  const timelineRef = useRef(null);
  const exitTimelineRef = useRef(null);
  const audioRef = useRef(null);
  const soundEffectsRef = useRef(false);
  const enteredRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(initialHasStarted);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicError, setMusicError] = useState('');
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.42);
  const [sfxEnabled, setSfxEnabled] = useState(false);
  const [prefersReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [playFullCelebration, setPlayFullCelebration] = useState(false);
  const reducedMotion = prefersReducedMotion && !playFullCelebration;

  const reportMusicPlaybackError = (error) => {
    const autoplayBlocked = error?.name === 'NotAllowedError';
    setMusicError(autoplayBlocked
      ? 'Tap MUSIC to start the song.'
      : 'The birthday song could not be played.');
    if (!autoplayBlocked) console.error('Could not play the birthday song.', error);
  };

  useEffect(() => () => {
    audioRef.current?.pause();
    gsap.killTweensOf(buttonRef.current);
    magicAudio.enabled = false;
  }, []);

  useEffect(() => {
    setHasStarted(initialHasStarted);
    if (!initialHasStarted) {
      audioRef.current?.pause();
      setMusicPlaying(false);
    }
  }, [initialHasStarted]);

  useEffect(() => {
    if (!hasStarted) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    const context = gsap.context(() => {
      const titleLines = gsap.utils.toArray('.birthday-title-line');
      const words = gsap.utils.toArray('.birthday-word');
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
      const titleAt = reducedMotion ? 0.1 : 7.1;
      const messageAt = reducedMotion ? 0.35 : 9.9;
      const wordsAt = reducedMotion ? 0.5 : 10;
      const wordDuration = reducedMotion ? 0.05 : 0.11;
      const wordStagger = reducedMotion ? 0.004 : 0.075;
      const signoffAt = wordsAt + (words.length - 1) * wordStagger + wordDuration;
      const buttonAt = reducedMotion ? signoffAt + 0.15 : Math.max(13.15, signoffAt + 0.6);

      if (!reducedMotion) {
        timeline
          .call(() => {
            fireworksRef.current?.launchRockets();
            if (soundEffectsRef.current) {
              magicAudio.playRocketLaunch(0);
              magicAudio.playRocketLaunch(0.1);
              magicAudio.playRocketLaunch(0.2);
            }
          }, [], 2)
          .call(() => {
            fireworksRef.current?.burstSalvo();
            if (soundEffectsRef.current) magicAudio.playFireworks();
          }, [], 4)
          .call(() => fireworksRef.current?.burstSalvo(), [], 4.75)
          .call(() => fireworksRef.current?.burstSalvo(), [], 5.55)
          .call(() => fireworksRef.current?.burstSalvo(), [], 6.35)
          .call(() => fireworksRef.current?.burstSalvo(), [], 7.15)
          .call(() => fireworksRef.current?.burstSalvo(), [], 8.05)
          .call(() => fireworksRef.current?.burstSalvo(), [], 9)
          .call(() => fireworksRef.current?.burstSalvo(), [], 10)
          .call(() => fireworksRef.current?.burstSalvo(), [], 11.1)
          .call(() => fireworksRef.current?.burstSalvo(), [], 12.3)
          .call(() => fireworksRef.current?.burstSalvo(), [], 13.1)
          .call(() => fireworksRef.current?.startSustainedShow(), [], 13.15);
      }

      timeline
        .fromTo(titleLines, {
          autoAlpha: 0,
          y: reducedMotion ? 0 : 30,
          filter: reducedMotion ? 'none' : 'blur(10px)'
        }, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: reducedMotion ? 0.08 : 1.1,
          stagger: reducedMotion ? 0 : 0.3
        }, titleAt)
        .fromTo('.birthday-message', { autoAlpha: 0, y: reducedMotion ? 0 : 16 }, {
          autoAlpha: 1, y: 0, duration: reducedMotion ? 0.08 : 0.65
        }, messageAt)
        .to(words, {
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: wordDuration,
          stagger: wordStagger,
          ease: 'none'
        }, wordsAt)
        .fromTo('.birthday-signoff', {
          autoAlpha: 0,
          y: reducedMotion ? 0 : 7
        }, {
          autoAlpha: 1,
          y: 0,
          duration: reducedMotion ? 0.08 : 0.35
        }, signoffAt)
        .fromTo('.birthday-enter-button', {
          autoAlpha: 0,
          y: reducedMotion ? 0 : 14,
          scale: reducedMotion ? 1 : 0.98
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: reducedMotion ? 0.08 : 0.65
        }, buttonAt);

      timelineRef.current = timeline;
    }, root);

    const handleVisibility = () => {
      if (document.hidden) timelineRef.current?.pause();
      else timelineRef.current?.resume();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      timelineRef.current?.kill();
      exitTimelineRef.current?.kill();
      context.revert();
    };
  }, [hasStarted, reducedMotion]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = musicVolume;
      audio.muted = musicMuted;
    }
  }, [musicVolume, musicMuted]);

  const startExperience = () => {
    if (hasStarted) return;

    if (audioRef.current) {
      const audio = audioRef.current;
      audio.volume = musicVolume;
      audio.muted = musicMuted;
      audio.play().then(() => {
        setMusicError('');
        setMusicPlaying(true);
      }).catch(reportMusicPlaybackError);
    }

    onStartMusic();
    setHasStarted(true);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => {
        setMusicError('');
        setMusicPlaying(true);
      }).catch((error) => {
        reportMusicPlaybackError(error);
      });
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  const toggleMusicMute = () => {
    setMusicMuted(value => !value);
  };

  const updateMusicVolume = (event) => {
    const nextVolume = Number(event.target.value);
    setMusicVolume(nextVolume);
    if (nextVolume > 0 && musicMuted) setMusicMuted(false);
  };

  const toggleSoundEffects = () => {
    const enabled = !soundEffectsRef.current;
    soundEffectsRef.current = enabled;
    magicAudio.enabled = enabled;
    setSfxEnabled(enabled);
    if (enabled) magicAudio.playChime('sparkle');
  };

  const enterWorld = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    const audio = audioRef.current;
    const fadeMusic = audio && !audio.paused;
    if (fadeMusic) setPitchPreservation(audio, false);

    const root = rootRef.current;
    const finishExit = () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.playbackRate = 1;
        audio.volume = musicVolume;
        setPitchPreservation(audio, true);
      }
      setMusicPlaying(false);
      onExitComplete();
    };

    if (reducedMotion || !root) {
      onEnter();
      if (!fadeMusic) {
        setMusicPlaying(false);
        onExitComplete();
        return;
      }

      if (root) gsap.set(root, { autoAlpha: 0 });
      exitTimelineRef.current = gsap.timeline({ onComplete: finishExit })
        .to(audio, {
          volume: 0,
          playbackRate: 0.6,
          duration: 0.65,
          ease: 'power2.out'
        });
      return;
    }

    fireworksRef.current?.finalBurst();
    if (soundEffectsRef.current) magicAudio.playFireworks();
    onEnter();

    const exitTimeline = gsap.timeline({ onComplete: finishExit });

    if (fadeMusic) {
      exitTimeline.to(audio, {
        volume: 0,
        playbackRate: 0.6,
        duration: 1.4,
        ease: 'power2.out'
      }, 0);
    }

    exitTimeline.to(root, {
      autoAlpha: 0,
      scale: 1.015,
      duration: 0.75,
      ease: 'power2.inOut'
    }, 0);

    exitTimelineRef.current = exitTimeline;
  };

  const animateButton = (scale, glow) => {
    if (!buttonRef.current || reducedMotion) return;
    gsap.to(buttonRef.current, {
      scale,
      boxShadow: glow ? '0 0 34px rgba(227, 190, 122, 0.28), inset 0 0 24px rgba(227, 190, 122, 0.08)' : '0 0 0 rgba(0, 0, 0, 0)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <main className="birthday-landing" ref={rootRef}>
      <FireworksCanvas ref={fireworksRef} reducedMotion={reducedMotion} />
      <div className="birthday-vignette" aria-hidden="true" />

      {!hasStarted && (
        <section className="birthday-music-gate" aria-labelledby="birthday-music-gate-title">
          <div className="birthday-music-gate-orbit birthday-music-gate-orbit-one" aria-hidden="true" />
          <div className="birthday-music-gate-orbit birthday-music-gate-orbit-two" aria-hidden="true" />
          <div className="birthday-music-gate-card">
            <span className="birthday-music-gate-eyebrow">A LITTLE MUSIC BEFORE THE MAGIC</span>
            <h1 id="birthday-music-gate-title">
              Turn on the music.<br />
              <em>Let the magic begin.</em>
            </h1>
            <p>Tap once to start the song and reveal your birthday surprise.</p>
            <button
              type="button"
              className="birthday-music-start"
              onClick={() => startExperience(true)}
            >
              <span className="birthday-music-start-icon" aria-hidden="true">♫</span>
              <span>TURN ON MUSIC</span>
              <span className="birthday-music-start-spark" aria-hidden="true">✦</span>
            </button>
          </div>
        </section>
      )}

      <header className="birthday-landing-top">
        <span className="birthday-monogram" aria-label="Vinni">V</span>
        <MusicPlayer
          audioRef={audioRef}
          musicPlaying={musicPlaying}
          musicMuted={musicMuted}
          musicVolume={musicVolume}
          onToggle={toggleMusic}
          onMute={toggleMusicMute}
          onVolumeChange={updateMusicVolume}
          sfxEnabled={sfxEnabled}
          onSfxToggle={toggleSoundEffects}
          onPlayFullCelebration={reducedMotion ? () => setPlayFullCelebration(true) : null}
        />
      </header>

      <div className="birthday-content" id="birthday">
        <div className="birthday-title-block">
          <h1 className="birthday-title" aria-label="Happy Birthday, Vinni!">
            <span className="birthday-title-line">HAPPY BIRTHDAY</span>
            <span className="birthday-title-line birthday-name">VINNI<span className="birthday-title-mark">!</span></span>
          </h1>
        </div>

        <PersonalBirthdayMessage />
      </div>

      <div className="birthday-enter-wrap">
        <button
          ref={buttonRef}
          type="button"
          className="birthday-enter-button"
          onClick={enterWorld}
          onPointerEnter={() => animateButton(1.025, true)}
          onPointerLeave={() => animateButton(1, false)}
          onFocus={() => animateButton(1.025, true)}
          onBlur={() => animateButton(1, false)}
        >
          <span>ENTER YOUR WORLD</span>
          <span className="enter-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      {musicError && <p className="birthday-music-error" role="status">{musicError}</p>}
    </main>
  );
}
