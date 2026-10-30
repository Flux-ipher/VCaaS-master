'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic'
const CanvasRevealEffect = dynamic(() => import('./CanvasRevealEffect').then(m => m.CanvasRevealEffect), { ssr: false }) as any;
import { auth, signInWithGoogle, upsertUserProfile } from '@/lib/firebase';
import { requestEmailOtp, verifyEmailOtp } from '@/lib/api';
import { signInWithCustomToken, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignInCanvasLogin({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (mode === 'email') {
      if (!email) return;
      await requestEmailOtp(email);
      setStep('code');
    } else {
      // phone mode
      if (!phone) return;
      // Ensure recaptcha exists
      // @ts-ignore
      if (!window.recaptchaVerifier) {
        // @ts-ignore
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      // @ts-ignore
      const verifier = window.recaptchaVerifier as RecaptchaVerifier;
      const conf = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(conf);
      setStep('code');
    }
  };

  const handleCodeChange = async (i: number, value: string) => {
    if (value.length > 1) return;
    const next = [...code];
    next[i] = value;
    setCode(next);
    if (value && i < 5) codeInputRefs.current[i + 1]?.focus();
    if (i === 5 && value && next.every((d) => d.length === 1)) {
      setReverseCanvasVisible(true);
      setTimeout(() => setInitialCanvasVisible(false), 50);
      try {
        if (mode === 'email') {
          const code = next.join('');
          const res = await verifyEmailOtp(email, code);
          if (res.customToken && auth) {
            const cred = await signInWithCustomToken(auth, res.customToken);
            await upsertUserProfile(cred.user, { email })
            try {
              const idToken = await cred.user.getIdToken()
              const { syncUserProfile } = await import('@/lib/api')
              await syncUserProfile(cred.user as any, idToken)
            } catch {}
          }
        } else if (mode === 'phone' && confirmation) {
          const cred = await confirmation.confirm(next.join(''));
          await upsertUserProfile(cred.user, { phoneNumber: phone as any })
          try {
            const idToken = await cred.user.getIdToken()
            const { syncUserProfile } = await import('@/lib/api')
            await syncUserProfile(cred.user as any, idToken)
          } catch {}
        }
        setTimeout(() => setStep('success'), 800);
      } catch (e) {
        // reset on failure
        setReverseCanvasVisible(false);
        setInitialCanvasVisible(true);
      }
    }
  };

  const handleBack = () => {
    setStep('email');
    setCode(['', '', '', '', '', '']);
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  const handleGoogle = async () => {
    const res = await signInWithGoogle();
    if ((res as any)?.success) {
      await upsertUserProfile((res as any).user ?? (auth?.currentUser ?? null))
      try {
        const idToken = await (auth?.currentUser?.getIdToken?.() ?? Promise.resolve(undefined))
        const { syncUserProfile } = await import('@/lib/api')
        await syncUserProfile((auth?.currentUser as any) ?? {}, idToken)
      } catch {}
      onClose();
      router.push('/dashboard');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0">
            {initialCanvasVisible && (
              <CanvasRevealEffect animationSpeed={3} containerClassName="bg-black" colors={[[255, 255, 255],[255,255,255]]} dotSize={6} reverse={false} />
            )}
            {reverseCanvasVisible && (
              <CanvasRevealEffect animationSpeed={4} containerClassName="bg-black" colors={[[255,255,255],[255,255,255]]} dotSize={6} reverse={true} />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
          </div>

          <div className="relative z-[101] h-full w-full flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="w-full max-w-sm">
              <div className="glass-card/50 rounded-2xl border border-white/10 p-6 bg-black/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Sign in</h2>
                  <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
                </div>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setMode('email')} className={`px-3 py-1 rounded-full text-sm ${mode==='email'?'bg-white text-black':'bg-white/10 text-white/70'}`}>Email OTP</button>
                  <button onClick={() => setMode('phone')} className={`px-3 py-1 rounded-full text-sm ${mode==='phone'?'bg-white text-black':'bg-white/10 text-white/70'}`}>Phone OTP</button>
                </div>

                <AnimatePresence mode="wait">
                  {step === 'email' && (
                    <motion.div key="email" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.25 }} className="space-y-4 text-center">
                      <button onClick={handleGoogle} className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full py-3 px-4 transition-colors">
                        <span className="text-lg">G</span>
                        <span>Sign in with Google</span>
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-white/40 text-sm">or</span>
                        <div className="h-px bg-white/10 flex-1" />
                      </div>
                      <form onSubmit={handleEmailSubmit} className="space-y-3">
                        <div className="relative">
                          {mode==='email' ? (
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 bg-white/5 text-center" required />
                          ) : (
                            <input type="tel" placeholder="+1 555 000 1234" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 bg-white/5 text-center" required />
                          )}
                          <button type="submit" className="absolute right-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">→</button>
                        </div>
                        <div id="recaptcha-container" />
                      </form>
                      <p className="text-xs text-white/50">By signing in, you agree to our policies.</p>
                    </motion.div>
                  )}

                  {step === 'code' && (
                    <motion.div key="code" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.25 }} className="space-y-5 text-center">
                      <h3 className="text-white text-lg">Enter the 6-digit code</h3>
                      <div className="relative rounded-full py-4 px-5 border border-white/10">
                        <div className="flex items-center justify-center">
                          {code.map((digit, i) => (
                            <div key={i} className="flex items-center">
                              <div className="relative">
<input ref={(el) => { codeInputRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleCodeChange(i, e.target.value)} className="w-8 text-center text-xl bg-transparent text-white border-none focus:outline-none" style={{ caretColor: 'transparent' }} />
                                {!digit && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white/40">0</div>}
                              </div>
                              {i < 5 && <span className="text-white/20 text-xl">|</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleBack} className="rounded-full bg-white text-black font-medium px-6 py-2 hover:bg-white/90">Back</button>
                        <button className={`flex-1 rounded-full font-medium py-2 border transition-all ${code.every((d) => d) ? 'bg-white text-black border-transparent' : 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed'}`} disabled={!code.every((d) => d)}>Continue</button>
                      </div>
                    </motion.div>
                  )}

                  {step === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 text-center">
                      <h3 className="text-white text-xl">You're in!</h3>
                      <button onClick={() => { onClose(); router.push('/dashboard'); }} className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90">Continue to Dashboard</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}