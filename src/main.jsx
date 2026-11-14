import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './style.css';
import { magicAudio } from './sounds';
import { secretNotes } from './data/memories';
import { WandSparkles } from './components/WandSparkles';
import { FloatingCandles } from './components/FloatingCandles';
import { CelebrationBurst } from './components/CelebrationBurst';
import { FirefliesAndButterflies } from './components/FirefliesAndButterflies';
import { WaxShatter } from './components/WaxShatter';
import { BirthdayLanding } from './components/BirthdayLanding';

const scenes = ['welcome', 'envelope', 'letter', 'gift'];

const sceneTitles = {
  welcome: 'The Enchanted Welcome',
  envelope: 'Your Birthday Film',
  letter: 'A Friendship Letter',
  gift: 'Your Special Gift'
};

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT?.trim() || '';
const isMessageDeliveryConfigured = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/i.test(FORMSPREE_ENDPOINT);

function StardustField({ burst = 0 }) {
  const stars = useMemo(() => Array.from({ length: 42 }, (_, i) => ({
    id: i,
    left: `${(i * 31 + 7) % 100}%`,
    top: `${(i * 43 + 11) % 100}%`,
    delay: `${((i % 13) * -1.4).toFixed(1)}s`,
    duration: `${14 + (i % 7) * 2}s`,
    size: 2 + (i % 5),
    opacity: 0.3 + (i % 4) * 0.2
  })), []);

  return (
    <div className={`stardust-field ${burst ? 'burst' : ''}`} key={burst} aria-hidden="true">
      {stars.map(s => (
        <i
          key={s.id}
          style={{
            left: s.left,
            top: s.top,
            animationDelay: s.delay,
            animationDuration: s.duration,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [landingStarted, setLandingStarted] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [scene, setScene] = useState('welcome');
  const [sfxOn, setSfxOn] = useState(true);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageStatus, setMessageStatus] = useState('idle');
  const [messageError, setMessageError] = useState('');
  const [burstKey, setBurstKey] = useState(0);
  const [fireworksKey, setFireworksKey] = useState(0);
  const [waxBurstKey, setWaxBurstKey] = useState(0);
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [filmError, setFilmError] = useState('');
  const [filmPlaybackError, setFilmPlaybackError] = useState('');
  const [filmIsPlaying, setFilmIsPlaying] = useState(false);
  const messageTextareaRef = useRef(null);
  const filmVideoRef = useRef(null);
  const letterMusicRef = useRef(null);

  const stopLetterMusic = () => {
    if (!letterMusicRef.current) return;
    letterMusicRef.current.pause();
    letterMusicRef.current.currentTime = 0;
  };

  useEffect(() => {
    window.history.replaceState(
      { ...window.history.state, vinniIntro: 'music-gate', vinniScene: 'welcome' },
      '',
      window.location.href
    );

    const handlePopState = (event) => {
      if (event.state?.vinniIntro === 'music-gate') {
        setShowLanding(true);
        setLandingStarted(false);
        setShowApp(false);
        setScene('welcome');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (event.state?.vinniIntro === 'birthday-landing') {
        setShowLanding(true);
        setLandingStarted(true);
        setShowApp(false);
        setScene('welcome');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const previousScene = event.state?.vinniScene === 'gallery'
        ? 'letter'
        : event.state?.vinniScene;
      if (scenes.includes(previousScene)) {
        setShowLanding(false);
        setShowApp(true);
        setScene(previousScene);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    magicAudio.enabled = showLanding ? false : sfxOn;
  }, [sfxOn, showLanding]);

  useEffect(() => {
    if (scene !== 'letter' || !letterOpen) stopLetterMusic();
  }, [scene, letterOpen]);

  useEffect(() => () => {
    letterMusicRef.current?.pause();
  }, []);

  useEffect(() => {
    if (scene !== 'envelope' || !envelopeOpen) {
      setFilmIsPlaying(false);
      return;
    }

    const video = filmVideoRef.current;
    if (!video) return;

    let active = true;
    setFilmPlaybackError('');
    video.play().catch(error => {
      if (!active) return;
      if (error.name !== 'NotAllowedError') {
        console.error('Could not autoplay Vinni’s birthday video.', error);
      }
      setFilmPlaybackError(
        error.name === 'NotAllowedError'
          ? 'Autoplay was blocked. Tap Play video to start the film.'
          : 'The video could not start. Tap Play video to try again.'
      );
    });

    return () => {
      active = false;
      video.pause();
    };
  }, [envelopeOpen, scene]);

  useEffect(() => {
    if (scene !== 'envelope' || !envelopeOpen) return;

    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [envelopeOpen, scene]);

  const go = (next) => {
    if (next === scene) return;

    if (scene === 'envelope') filmVideoRef.current?.pause();
    if (scene === 'letter') stopLetterMusic();
    magicAudio.playChime('sparkle');
    window.history.pushState(
      { ...window.history.state, vinniIntro: 'app', vinniScene: next },
      '',
      window.location.href
    );
    setScene(next);
    setBurstKey(v => v + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startBirthdayMusic = () => {
    window.history.pushState(
      { ...window.history.state, vinniIntro: 'birthday-landing', vinniScene: 'welcome' },
      '',
      window.location.href
    );
    setLandingStarted(true);
  };

  const enterBirthdayApp = () => {
    window.history.pushState(
      { ...window.history.state, vinniIntro: 'app', vinniScene: 'welcome' },
      '',
      window.location.href
    );
    setShowApp(true);
  };

  const finishBirthdayLanding = () => {
    setShowLanding(false);
  };

  const toggleFriendshipLetter = () => {
    magicAudio.playPaperFlap();
    if (letterOpen) {
      stopLetterMusic();
      setLetterOpen(false);
      return;
    }

    setLetterOpen(true);
    const audio = letterMusicRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(error => {
      console.error('Could not play the friendship-letter music.', error);
    });
  };

  const handleEnvelopeClick = () => {
    if (!envelopeOpen) {
      magicAudio.playSealBreak();
      setWaxBurstKey(v => v + 1);
    } else {
      magicAudio.playPaperFlap();
      filmVideoRef.current?.pause();
    }
    setEnvelopeOpen(v => !v);
  };

  const toggleFilmPlayback = async () => {
    const video = filmVideoRef.current;
    if (!video) return;

    setFilmPlaybackError('');
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        if (error.name !== 'NotAllowedError') {
          console.error('Could not play Vinni’s birthday video.', error);
        }
        setFilmPlaybackError(
          error.name === 'NotAllowedError'
            ? 'Autoplay was blocked. Tap Play video to start the film.'
            : 'The video could not start. Please try again.'
        );
      }
    } else {
      video.pause();
    }
  };

  const handleGiftClick = () => {
    if (!giftOpen) {
      magicAudio.playFanfare();
      setGiftOpen(true);
      setBurstKey(v => v + 1);
    } else {
      magicAudio.playChime('bell');
      setBurstKey(v => v + 1);
    }
  };

  const launchFireworks = () => {
    magicAudio.playFireworks();
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([100, 50, 140, 50, 180, 60, 140]);
    }
    setFireworksKey(v => v + 1);
    setBurstKey(v => v + 1);
  };

  const handleMessageSubmit = async (event) => {
    event.preventDefault();
    if (messageStatus === 'sending' || messageStatus === 'flying' || messageStatus === 'delivered') return;

    if (!isMessageDeliveryConfigured) {
      setMessageStatus('error');
      setMessageError('Message delivery is not connected yet. Your note is still here; please try again after the inbox is set up.');
      return;
    }

    setMessageStatus('sending');
    setMessageError('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText.trim(),
          _subject: 'A little birthday note from Vinni'
        })
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = result?.errors?.map(error => error.message).filter(Boolean).join(' ');
        throw new Error(detail || 'The message could not be accepted. Please try again.');
      }

      setMessageStatus('flying');
    } catch (error) {
      setMessageStatus('error');
      setMessageError(error instanceof TypeError
        ? 'Could not connect to Formspree. Check your internet connection and try again. Your message is still here.'
        : error instanceof Error
          ? error.message
          : 'We could not send your message. Please try again.');
    }
  };

  const writeAnotherMessage = () => {
    setMessageText('');
    setMessageError('');
    setMessageStatus('idle');
    requestAnimationFrame(() => messageTextareaRef.current?.focus());
  };

  const toggleSecret = (idx) => {
    magicAudio.playChime('sparkle');
    setRevealedSecrets(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      {showLanding && (
        <BirthdayLanding
          initialHasStarted={landingStarted}
          onStartMusic={startBirthdayMusic}
          onEnter={enterBirthdayApp}
          onExitComplete={finishBirthdayLanding}
        />
      )}
      {showApp && (
        <main className={`site-shell scene-is-${scene}`}>
      <audio ref={letterMusicRef} src="/golden-brown.mp3" preload="none" />
      <div className="grain" />
      <StardustField burst={burstKey} />
      <FloatingCandles active={true} />
      <WandSparkles enabled={true} />
      <CelebrationBurst key={fireworksKey} active={giftOpen} />

      {/* Top Navigation Bar */}
      <header className="topbar">
        <button className="brand" onClick={() => go('welcome')} aria-label="Return to beginning">
          <span className="brand-mark">V</span>
          <span className="brand-text">
            <b>VINNI'S WORLD</b>
            <small>OF WARMTH &amp; TIMELESS FRIENDSHIP</small>
          </span>
        </button>

        <div className="top-actions">
          <span className="date-badge">✦ 16 · 11 · 2026 ✦</span>
          <button
            className={`control-pill mute-button ${sfxOn ? 'active' : ''}`}
            onClick={() => setSfxOn(v => !v)}
            aria-label={sfxOn ? 'Mute sound effects' : 'Unmute sound effects'}
            title={sfxOn ? 'Mute sound effects' : 'Unmute sound effects'}
          >
            <span aria-hidden="true">{sfxOn ? '🔔' : '🔕'}</span>
          </button>
        </div>
      </header>

      {/* Scene Progress Dots */}
      <nav className="scene-progress" aria-label="Journey Progress">
        {scenes.map((s, idx) => (
          <button
            key={s}
            className={`scene-dot ${scene === s ? 'active' : scenes.indexOf(scene) > idx ? 'done' : ''}`}
            onClick={() => go(s)}
            title={`Go to ${sceneTitles[s]}`}
          >
            <span className="dot-tooltip">{sceneTitles[s]}</span>
          </button>
        ))}
      </nav>

      {/* ========================================================
          SCENE 1: WELCOME
          ======================================================== */}
      {scene === 'welcome' && (
        <section className="scene welcome-scene">
          <div className="eyebrow reveal">
            <span>✦ EST. 2026 · CERTIFIED BEST FRIEND EDITION ✦</span>
          </div>

          <h1 className="hero-title reveal delay-1">
            In a world full of ordinary moments,<br />
            <em>you became one of my favourite stories.</em>
          </h1>

          <p className="hero-copy reveal delay-2">
            If life is a collection of little moments,<br />
            I'm glad some of my favourite ones have you in them.
          </p>

          <div className="welcome-photo-stack">
            <div className="side-polaroid side-left" role="presentation">
              <div className="mini-polaroid-tape" />
              <img src="/vinni-left-frame.jpg" alt="A cherished memory" />
              <span>Endless Laughs ✦</span>
            </div>

            <div className="side-polaroid side-right" role="presentation">
              <div className="mini-polaroid-tape" />
              <img
                src="https://wallpapers.com/images/hd/harry-and-hermione-granger-k5eae2kymamepaqj.jpg"
                alt="The Unspoken Bond"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=700&q=80"; }}
              />
              <span>Unspoken Bond ✦</span>
            </div>
          </div>

          <div className="action-row reveal delay-3">
            <button className="primary-button" onClick={() => go('envelope')}>
              <span>Step Inside The Magic</span>
              <span className="btn-arrow">↗</span>
            </button>
          </div>

          <div className="hero-bottom reveal delay-3">
            <span>MADE WITH CARE</span>
            <span className="tiny-star">✦</span>
            <span>FROM YOUR BEST FRIEND</span>
          </div>

          <div className="halo halo-one" />
          <div className="halo halo-two" />
        </section>
      )}

      {/* ========================================================
          SCENE 2: ENVELOPE
          ======================================================== */}
      {scene === 'envelope' && (
        <section className="scene centered-scene envelope-scene">
          <FirefliesAndButterflies active={true} />
          <div className="eyebrow reveal">A SPECIAL FILM · SAVED JUST FOR TODAY</div>
          <h2 className="section-title reveal delay-1">
            A little envelope.<br />
            <em>A story in motion.</em>
          </h2>

          <div className={`envelope-container ${envelopeOpen ? 'opened' : ''}`}>
            <div className="envelope-shadow" />
            <div className="envelope-back" />

            <div className="envelope-front" />
            <div className="envelope-flap" />
            <WaxShatter triggerKey={waxBurstKey} />
            <button
              type="button"
              className={`wax-seal ${envelopeOpen ? 'broken' : ''}`}
              onClick={handleEnvelopeClick}
              aria-label={envelopeOpen ? 'Close birthday film' : 'Open birthday film'}
              aria-hidden={envelopeOpen}
              disabled={envelopeOpen}
              title={envelopeOpen ? 'Close birthday film' : 'Open birthday film'}
            >
              <span>V</span>
            </button>
          </div>

          {envelopeOpen && (
            <div className="secrets-container reveal">
              <h3 className="secrets-heading">A few little notes, just for you</h3>
              <div className="secrets-grid">
                {secretNotes.map((s, idx) => (
                  <button
                    key={idx}
                    className={`secret-pill ${revealedSecrets[idx] ? 'revealed' : ''}`}
                    onClick={() => toggleSecret(idx)}
                  >
                    <span className="secret-icon">{s.icon}</span>
                    <div className="secret-text">
                      <b>{s.title}</b>
                      <small>{revealedSecrets[idx] ? s.secret : s.teaser}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="hint">
            {envelopeOpen ? '✦ Your birthday film is ready when you are. ✦' : 'TAP THE SEAL TO REVEAL YOUR FILM'}
          </p>

          <button className="text-button" onClick={() => go('letter')}>
            <span>Continue to The Friendship Letter</span>
            <span>→</span>
          </button>
        </section>
      )}

      {scene === 'envelope' && envelopeOpen && (
        <div
          className="film-cinema-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Vinni’s birthday film"
        >
          <div className="cinema-video-stage">
            <video
              ref={filmVideoRef}
              className="memory-film cinema-video"
              controls
              playsInline
              preload="auto"
              aria-label="Birthday film for Vinni"
              onError={(event) => {
                const video = event.currentTarget;
                console.error('Could not load Vinni’s birthday video.', {
                  source: video.currentSrc,
                  errorCode: video.error?.code
                });
                setFilmError('This video could not be loaded. Please refresh the page and try again.');
              }}
              onLoadedData={() => {
                setFilmError('');
                setFilmPlaybackError('');
              }}
              onPlay={() => setFilmIsPlaying(true)}
              onPause={() => setFilmIsPlaying(false)}
            >
              <source src="/vinni-memory-film.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
          <div className="cinema-controls">
            <button
              type="button"
              className="cinema-action"
              onClick={toggleFilmPlayback}
              aria-pressed={filmIsPlaying}
              aria-label={filmIsPlaying ? 'Pause birthday video' : 'Play birthday video'}
            >
              {filmIsPlaying ? 'Pause video' : 'Play video'}
            </button>
            <button type="button" className="cinema-action" onClick={handleEnvelopeClick}>
              Close film
            </button>
            <button type="button" className="cinema-action cinema-action-primary" onClick={() => go('letter')}>
              Continue to The Friendship Letter <span aria-hidden="true">→</span>
            </button>
          </div>
          {filmError && <p className="cinema-error" role="alert">{filmError}</p>}
          {filmPlaybackError && <p className="cinema-error" role="status">{filmPlaybackError}</p>}
        </div>
      )}

      {scene === 'letter' && (
        <section className="scene letter-scene">
          <div className="eyebrow reveal">AN UNFILTERED NOTE FROM THE HEART</div>
          <h2 className="section-title reveal delay-1">
            Dear Vinni, <em>always.</em>
          </h2>

          <div
            className={`letter-card ${letterOpen ? 'letter-expanded' : ''}`}
            onClick={toggleFriendshipLetter}
            role="button"
            tabIndex={0}
            aria-label="Toggle unfolded letter"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleFriendshipLetter();
              }
            }}
          >
            <div className="parchment-border" />
            <div className="letter-card-top">
              <span>✦ A LETTER FROM THE HEART ✦</span>
              <span>CONFIDENTIAL &amp; SACRED</span>
            </div>

            {!letterOpen ? (
              <div className="letter-teaser">
                <span className="wax-teaser-icon">📜</span>
                <span className="script">To my favourite person on their special day...</span>
                <b>Tap to unfold this letter</b>
                <span className="unfold-icon">⌄</span>
              </div>
            ) : (
              <div className="letter-content">
                <p className="salutation">Happy Birthday, Vinni! ❤️</p>
                <p>Let me tell you a story about a kid whom you know very well...</p>
                <p>
                  A kid with so many insecurities wanted to be friends with someone. He decided to message a girl
                  who lived near his village, with so many questions running through his mind.
                </p>
                <img
                  className="letter-memory-image"
                  src="/letter-friendship-first.png"
                  alt="Two friends sitting together beneath a blue sky"
                />
                <img
                  className="letter-memory-image letter-memory-image-second"
                  src="/letter-friendship-second.png"
                  alt="Two friends laughing together in a field at sunset"
                />
                <p>
                  Finally, one day, he gathered the courage to message her, not even expecting a reply. But,
                  fortunately, she replied, and that one reply changed his entire perspective on thinking and growing up.
                </p>
                <p>
                  She was the first girl he had ever talked to, so he became very attached to her. He wouldn't even
                  sleep if she didn't message him that day.
                </p>
                <p>
                  As the days passed, the kid became more and more excited just about being her friend. But eventually,
                  that excitement turned into over-possessiveness.
                </p>
                <p>
                  After a year, the messages became slower, the conversations became shorter, and the arguments became longer.
                </p>
                <p>
                  He thought it was because of his appearance that her replies were getting slower. So, he decided to
                  change everything about himself and his life.
                </p>
                <p>
                  He stopped texting her for two years and, day by day, started getting over her.
                </p>
                <p>
                  Then came a day when time changed, and so did he. He started transforming himself, and that
                  transformation completely changed his perspective on life, how things work, and how feelings work.
                  He finally learned to take control of the things that once affected him so deeply. It taught him how
                  to live a solo life.
                </p>
                <p>But somewhere deep inside, he still felt like something was missing.</p>
                <p>And then, one fine day, he received a message from her again.</p>
                <p>
                  At that very moment, he almost forgot all the hunger he once had to become a better version of himself.
                  Somehow, he felt like he had found something he had always wanted.
                </p>
                <p>Later came so many memories, late-night talks, and whatnot!</p>
                <p>
                  She became the first person in so many moments of his life, and those moments became the reason
                  behind so many things he does today.
                </p>
                <div className="signoff">
                  <img
                    className="letter-memory-image letter-memory-image-final"
                    src="/letter-friendship-final.png"
                    alt="Two friends standing together outdoors"
                  />
                  <p>
                    <strong>
                      So, in the end, I just want to make as many memories as possible with you, until anything
                      comes along that separates us.
                    </strong>
                  </p>
                  <p>Maybe no one writes something like this to a friend.</p>
                  <p>But I will.</p>
                  <p>Because some friendships are worth writing about.</p>
                  <span>— Ravi</span>
                  <p className="letter-closing-line">
                    <em>The only friend that once was a kid's entire world.</em>
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="hint">
            {letterOpen ? '✦ A piece of friendship, carved into words. ✦' : 'TAP THE LETTER TO UNFOLD'}
          </p>

          <div className="secrets-container reveal delay-2">
            <h3 className="secrets-heading">💌 Tap to unlock little notes for you:</h3>
            <div className="secrets-grid">
              {secretNotes.map((secret, index) => (
                <button
                  key={index}
                  className={`secret-pill ${revealedSecrets[index] ? 'revealed' : ''}`}
                  onClick={() => toggleSecret(index)}
                >
                  <span className="secret-icon">{secret.icon}</span>
                  <div className="secret-text">
                    <b>{secret.title}</b>
                    <small>{revealedSecrets[index] ? secret.secret : secret.teaser}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button className="text-button" onClick={() => go('gift')}>
            <span>One Last Surprise Awaits</span>
            <span>→</span>
          </button>
        </section>
      )}

      {/* ========================================================
          SCENE 4: YOUR SPECIAL GIFT (FINAL)
          ======================================================== */}
      {scene === 'gift' && (
        <section className="scene centered-scene final-scene">
          <div className="eyebrow reveal">SOMETHING JUST FOR YOU</div>
          <h2 className="section-title reveal delay-1">
            One last little<br />
            <em>golden treasure.</em>
          </h2>

          <button
            className={`gift-box ${giftOpen ? 'gift-open' : ''}`}
            onClick={handleGiftClick}
            aria-label="Open the golden mystery chest"
          >
            <div className="gift-rays">✦　✧　✨　✧　✦</div>
            <div className="gift-lid"><i /></div>
            <div className="gift-body">
              <i className="ribbon-v" />
              <i className="ribbon-h" />
              <span className="gift-crest">♡</span>
            </div>
            <div className="gift-bow">⚜</div>
          </button>

          {giftOpen ? (
            <div className="final-revelation reveal">
              <figure className="jewelry-reveal">
                <img
                  src="/vinni-jewelry.jpg"
                  alt="A selection of gold earrings, a ring, and a necklace"
                />
                <figcaption>
                  A little sparkle for someone who makes life shine.
                </figcaption>
              </figure>

              <div className="jewelry-actions">
                <button className="primary-button" onClick={launchFireworks}>
                  <span>Launch Celebratory Fireworks 🎆</span>
                </button>
              </div>

              <section className="message-back-section" aria-labelledby="message-back-title">
                <p className="message-back-eyebrow">ONE LAST LITTLE MAGIC</p>
                <h3 id="message-back-title">A little note for me?</h3>
                <p className="message-back-copy">
                  Write anything you want me to know. I would love to hear from you.
                </p>
                {!isMessageDeliveryConfigured && (
                  <p className="message-setup-note">
                    The message inbox is not connected yet. You can write your note, but delivery must be set up before it can be sent.
                  </p>
                )}
                {messageStatus === 'delivered' ? (
                  <div className="message-delivered" role="status">
                    <span className="message-delivered-icon" aria-hidden="true">✦</span>
                    <p>Your note reached me!</p>
                    <small>Thank you for sharing a little piece of your heart with me.</small>
                    <button
                      className="write-another-button"
                      type="button"
                      onClick={writeAnotherMessage}
                    >
                      Say, would you like to write another? ✦
                    </button>
                  </div>
                ) : (
                  <form className="message-back-form" onSubmit={handleMessageSubmit}>
                    <label className="visually-hidden" htmlFor="message-sender-note">Your note</label>
                    <textarea
                      ref={messageTextareaRef}
                      id="message-sender-note"
                      name="message"
                      rows={5}
                      maxLength={1000}
                      value={messageText}
                      onChange={event => setMessageText(event.target.value)}
                      placeholder="Dear best friend..."
                      required
                      disabled={messageStatus === 'sending' || messageStatus === 'flying'}
                    />
                    <div className="message-submit-row">
                      <span>{messageText.length}/1000</span>
                      <button
                        className="primary-button message-send-button"
                        type="submit"
                        disabled={messageStatus === 'sending' || messageStatus === 'flying'}
                      >
                        {messageStatus === 'sending' ? 'Sealing your note…' : 'Fold my note & send it ✦'}
                      </button>
                    </div>
                    {messageStatus === 'error' && (
                      <p className="message-status message-status-error" role="alert">{messageError}</p>
                    )}
                  </form>
                )}
              </section>

              <button
                className="restart-button"
                onClick={() => {
                  setGiftOpen(false);
                  setEnvelopeOpen(false);
                  setMessageText('');
                  setMessageStatus('idle');
                  setMessageError('');
                  go('welcome');
                }}
              >
                ↺ Experience It Again From The Start
              </button>
            </div>
          ) : (
            <div className="gift-prompt">
              <p className="cake-caption">
                An enchanted chest that only opens for the birthday celebrant.
              </p>
              <button className="primary-button" onClick={handleGiftClick}>
                <span>Open Your Gift</span>
                <span>✦</span>
              </button>
            </div>
          )}
          {messageStatus === 'flying' && createPortal(
            <div
              className="message-rocket-flight"
              role="status"
              aria-label="Your folded letter is flying to the inbox"
              onAnimationEnd={event => {
                if (event.animationName === 'messagePaperFlight') {
                  setMessageStatus('delivered');
                }
              }}
            >
              <span className="message-flight-caption">Folding your letter... ✦</span>
              <div className="message-paper-flight" aria-hidden="true">
                <div className="message-letter-sheet">
                  <p>{messageText}</p>
                  <i className="letter-fold-panel fold-left" />
                  <i className="letter-fold-panel fold-right" />
                  <i className="letter-fold-panel fold-top" />
                  <i className="letter-fold-panel fold-bottom" />
                  <span className="letter-plane-tip" />
                  <span className="letter-plane-wing" />
                  <span className="letter-plane-flame" />
                </div>
              </div>
              <span className="message-flight-spark spark-one" aria-hidden="true">✦</span>
              <span className="message-flight-spark spark-two" aria-hidden="true">✧</span>
              <span className="message-flight-spark spark-three" aria-hidden="true">♡</span>
            </div>,
            document.body
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <span>CRAFTED WITH FRIENDSHIP &amp; PIXEL MAGIC</span>
        <span>✦</span>
        <span>BUILT EXCLUSIVELY FOR VINNI · 2026</span>
      </footer>
        </main>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
