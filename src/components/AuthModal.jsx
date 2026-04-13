import React, { useState, useEffect, useRef } from 'react';
import {
  X, Lock, Building, User, Mail, Eye, EyeOff,
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft,
  Verified, MailOpen, Send, Loader, Shield, Briefcase,
  Globe, MapPin, Clock, Users, Check, Sparkles, Rocket,
  GraduationCap, Building2, Target, Award, TrendingUp, MessageSquare
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';
const FALLBACK_API = 'http://localhost:5000/api';

const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  console.log(`[AuthModal] Fetching: ${url}`, options);
  
  const config = {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  };
  if (options.body) config.body = JSON.stringify(options.body);
  
  try {
    const response = await fetch(url, config);
    console.log(`[AuthModal] Response: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log(`[AuthModal] Response body:`, text.substring(0, 300) || '(empty)');
    
    if (!text) {
      // Try fallback URL
      console.log('[AuthModal] Empty response, trying fallback...');
      const fallbackUrl = `${FALLBACK_API}${endpoint}`;
      const fallbackResponse = await fetch(fallbackUrl, config);
      console.log(`[AuthModal] Fallback response: ${fallbackResponse.status}`);
      const fallbackText = await fallbackResponse.text();
      console.log(`[AuthModal] Fallback body:`, fallbackText.substring(0, 300) || '(empty)');
      
      if (!fallbackText) throw new Error('Server returned empty response');
      const data = JSON.parse(fallbackText);
      if (!fallbackResponse.ok) throw new Error(data.message || 'Request failed');
      return data;
    }
    
    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('[AuthModal] Error:', err.message);
    // Check if backend is reachable - test with quick-test endpoint
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('empty response')) {
      try {
        const testResp = await fetch(`${API_BASE}/quick-test`);
        const testText = await testResp.text();
        console.log('[AuthModal] Backend reachable via proxy:', testText);
      } catch (testErr) {
        console.log('[AuthModal] Backend NOT reachable via proxy');
      }
      throw new Error('Cannot connect to server. Please ensure backend is running on port 5000.');
    }
    throw err;
  }
};

const authService = {
  async sendCode(email) {
    return fetchApi('/auth/send-code', { method: 'POST', body: { email } });
  },
  async verifyCode(payload) {
    return fetchApi('/auth/verify-code', { method: 'POST', body: payload });
  },
  async resendCode(email) {
    return fetchApi('/auth/resend-code', { method: 'POST', body: { email } });
  },
  async login(credentials) {
    return fetchApi('/auth/login', { method: 'POST', body: credentials });
  },
  async verify2FA(userId, code) {
    return fetchApi('/auth/verify-2fa', { method: 'POST', body: { userId, code } });
  },
  async forgotPassword(email) {
    return fetchApi('/auth/forgot-password', { method: 'POST', body: { email } });
  },
  async resetPassword(resetToken, password) {
    return fetchApi('/auth/reset-password', { method: 'POST', body: { resetToken, password } });
  }
};

const SidePanel = ({ isLogin }) => (
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-8 flex-col justify-between text-white">
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">MissionHub</h3>
          <p className="text-slate-300 text-sm">Connect & Grow</p>
        </div>
      </div>
      {isLogin ? (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Welcome Back!</h2>
          <p className="text-slate-300">Sign in to continue your journey with thousands of opportunities waiting for you.</p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-500 border-2 border-slate-700 flex items-center justify-center text-xs">U{i}</div>
              ))}
            </div>
            <p className="text-sm text-slate-300">Join 10,000+ professionals</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Start Your Journey</h2>
          <p className="text-slate-300">Create an account and unlock access to exclusive opportunities, resources, and community.</p>
          <div className="space-y-4 pt-4">
            {[
              { icon: Target, text: 'Access exclusive job opportunities' },
              { icon: Award, text: 'Earn badges and recognition' },
              { icon: TrendingUp, text: 'Track your career growth' },
              { icon: MessageSquare, text: 'Connect with professionals' }
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    <div className="text-slate-400 text-sm">
      © 2026 MissionHub. All rights reserved.
    </div>
  </div>
);

const Modal = ({ title, children, open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />
      <div className="relative w-full max-w-[95vw] sm:max-w-[900px] max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-slideUp">
        <SidePanel title={title} isLogin={title === 'Sign In'} />
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between md:hidden mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-slate-800">MissionHub</span>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="hidden md:flex items-center justify-end mb-6">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <div className="space-y-6">
            <div className="hidden md:block">
              <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
              <p className="text-slate-500 text-sm mt-1">Please fill in your details to continue</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <input className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Button = ({ children, loading, className = '', ...props }) => (
  <button disabled={loading} className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 ${className}`} {...props}>
    {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : children}
  </button>
);

const PasswordResetModal = ({ open, onClose, switchToLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['','','','','','']);
  const [newP, setNewP] = useState('');
  const [confirm, setConfirm] = useState('');
  const [count, setCount] = useState(0);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState('');
  const [succ, setSucc] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => { if(count>0){const t=setInterval(()=>setCount(c=>c<=1?0:c-1),1000); return()=>clearInterval(t);}},[count]);

  const emailSubmit = async e => { e.preventDefault(); if(!email){setErr('Enter your email');return;} setLoad(true); setErr(''); try{await authService.forgotPassword(email); setSucc('Check your email for reset code'); setStep(2); setCount(60);}catch(e){setErr(e.message);}finally{setLoad(false);} };
  
  const passSubmit = async e => { e.preventDefault(); if(code.join('').length!==6){setErr('Enter code');return;} if(newP.length<8){setErr('Password min 8');return;} if(newP!==confirm){setErr('Passwords mismatch');return;} setLoad(true); try{await authService.resetPassword(code.join(''),newP); setSucc('Password reset!'); setTimeout(()=>{onClose(); switchToLogin?.();},2000);}catch(e){setErr(e.message);}finally{setLoad(false);} };

  const codeChange = (v,i) => { if(!/^\d?$/.test(v))return; const c=[...code];c[i]=v;setCode(c); if(v&&i<5)inputRefs.current[i+1]?.focus(); };
  const keyDown = (e,i) => { if(e.key==='Backspace'&&!code[i]&&i>0)inputRefs.current[i-1]?.focus(); };

  return (
    <Modal title="Reset Password" open={open} onClose={onClose}>
      <form onSubmit={step===1?emailSubmit:passSubmit} className="space-y-5">
        {err&&<div className="p-3 bg-red-50 rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500"/><span className="text-sm text-red-600">{err}</span></div>}
        {succ&&<div className="p-3 bg-green-50 rounded-xl flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/><span className="text-sm text-green-600">{succ}</span></div>}
        {step === 1 && (
          <>
            <div className="p-4 bg-blue-50 rounded-xl"><div className="flex items-center gap-3"><Shield className="w-5 h-5 text-blue-600"/><div><p className="font-medium text-slate-800">Forgot Password?</p><p className="text-sm text-slate-500">Enter your email</p></div></div></div>
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <Button type="submit" loading={load}><Send className="w-5 h-5 mr-2"/>Send Reset Code</Button>
          </>
        )}
        {step===2 && (
          <>
            <button type="button" onClick={()=>setStep(1)} className="flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="w-4 h-4"/>Back</button>
            <div className="p-4 bg-blue-50 rounded-xl"><div className="flex items-center gap-3"><MailOpen className="w-5 h-5 text-blue-600"/><div><p className="font-medium text-slate-800">Enter Reset Code</p><p className="text-sm text-slate-500">Sent to {email}</p></div></div></div>
            <div className="flex justify-center gap-2">{code.map((d,i)=><input key={i} ref={el=>inputRefs.current[i]=el} maxLength="1" value={d} onChange={e=>codeChange(e.target.value,i)} onKeyDown={e=>keyDown(e,i)} className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500" autoFocus={i===0}/>)}</div>
            <Input label="New Password" type="password" placeholder="Min 8 characters" value={newP} onChange={e=>setNewP(e.target.value)} />
            <Input label="Confirm Password" type="password" placeholder="Confirm" value={confirm} onChange={e=>setConfirm(e.target.value)} />
            <Button type="submit" loading={load}><Shield className="w-5 h-5 mr-2"/>Reset Password</Button>
          </>
        )}
        <p className="text-center text-sm text-slate-600">Remember? <button type="button" onClick={()=>{onClose(); switchToLogin?.();}} className="font-semibold text-blue-600">Sign in</button></p>
      </form>
    </Modal>
  );
};

const CodeInput = ({ value, onChange, countdown, onResend, isLoading, error, email }) => {
  const refs = useRef([]);
  const change = (v, i) => { if (!/^\d?$/.test(v)) return; const c = [...value]; c[i] = v; onChange(c); if (v && i < 5) refs.current[i+1]?.focus(); };
  const key = (e, i) => { if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i-1]?.focus(); };
  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-3"><MailOpen className="w-5 h-5 text-blue-600" /><div><p className="font-medium text-slate-800">Verify your email</p><p className="text-sm text-slate-500">Code sent to {email}</p></div></div>
      </div>
      {error && <div className="p-3 bg-red-50 rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">{error}</span></div>}
      <div className="flex justify-center gap-2">
        {value.map((d, i) => <input key={i} ref={el => refs.current[i] = el} maxLength="1" value={d} onChange={e => change(e.target.value, i)} onKeyDown={e => key(e, i)} className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" autoFocus={i===0} />)}
      </div>
      <div className="text-center">{countdown > 0 ? <p className="text-sm text-slate-500 flex items-center justify-center gap-1"><Clock className="w-4 h-4" />Resend in {countdown}s</p> : <button type="button" onClick={onResend} disabled={isLoading} className="text-sm font-medium text-blue-600 hover:text-blue-700">Resend code</button>}</div>
    </div>
  );
};

export const LoginModal = ({ open, onClose, handleLogin, switchToRegister }) => {
  const [show, setShow] = useState(false);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ email: '', password: '', remember: false });
  const [showReset, setShowReset] = useState(false);

  const submit = async e => { e.preventDefault(); setLoad(true); setErr(''); try { const data = await authService.login(f); if(data.token && data.user){ localStorage.setItem('token',data.token); localStorage.setItem('user',JSON.stringify(data.user)); onClose(); window.location.reload(); } } catch(e) { setErr(e.message||'Login failed'); } finally { setLoad(false); } };

  return (
    <>
      <Modal title="Sign In" open={open} onClose={onClose}>
        <form onSubmit={submit} className="space-y-5">
          {err&&<div className="p-3 bg-red-50 rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500"/><span className="text-sm text-red-600">{err}</span></div>}
          <Input label="Email" type="email" placeholder="you@example.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})} />
          <div className="relative">
            <Input label="Password" type={show?'text':'password'} placeholder="Enter password" value={f.password} onChange={e=>setF({...f,password:e.target.value})} />
            <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-9 text-slate-400">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
          </div>
          <div className="flex items-center justify-between"><label className="flex items-center gap-2"><input type="checkbox" checked={f.remember} onChange={e=>setF({...f,remember:e.target.checked})} className="rounded"/><span className="text-sm text-slate-600">Remember me</span></label><button type="button" onClick={()=>setShowReset(true)} className="text-sm font-medium text-blue-600">Forgot password?</button></div>
          <Button type="submit" loading={load}>Sign In</Button>
          <p className="text-center text-sm text-slate-600">Don't have an account? <button type="button" onClick={()=>{onClose(); switchToRegister();}} className="font-semibold text-blue-600">Sign up</button></p>
        </form>
      </Modal>
      <PasswordResetModal open={showReset} onClose={()=>setShowReset(false)} switchToLogin={()=>setShowReset(false)}/>
    </>
  );
};

export const RegisterModal = ({ open, onClose, handleRegister, switchToLogin }) => {
  const [step, setStep] = useState(1);
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', email: '', password: '', userType: 'jobSeeker', terms: false, news: false });
  const [code, setCode] = useState(['','','','','','']);

  useEffect(() => { if(count > 0) { const t = setInterval(() => setCount(c => c<=1?0:c-1), 1000); return () => clearInterval(t); } }, [count]);
  const validate = () => { if(!f.name?.trim()||!f.email||!f.password) return 'Fill all fields'; if(!f.terms) return 'Agree to terms'; if(f.password.length<8) return 'Password min 8 chars'; return null; };
  const step1 = async e => { e.preventDefault(); const v = validate(); if(v){setErr(v); return;} setLoad(true); setErr(''); try{await authService.sendCode(f.email); setStep(2); setCount(60);}catch(e){setErr(e.message);}finally{setLoad(false);} };
  const step2 = async e => { e.preventDefault(); if(code.join('').length!==6){setErr('Enter 6-digit code'); return;} setLoad(true); setErr(''); try{const d = await authService.verifyCode({email: f.email, verificationCode: code.join(''), name: f.name, password: f.password, userType: f.userType, newsletter: f.news}); if(d.success){localStorage.setItem('token',d.token); localStorage.setItem('user',JSON.stringify(d.user)); setTimeout(()=>{onClose(); window.location.reload();},1500);}}catch(e){setErr(e.message);}finally{setLoad(false);} };
  const resend = async () => { if(count>0)return; setLoad(true); try{await authService.resendCode(f.email); setCount(60);}catch(e){setErr(e.message);}finally{setLoad(false);} };

  return (
    <Modal title="Create Account" open={open} onClose={onClose}>
      <form onSubmit={step===1?step1:step2} className="space-y-5">
        {err && <div className="p-3 bg-red-50 rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">{err}</span></div>}
        {step===1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={()=>setF({...f,userType:'jobSeeker'})} className={`p-4 border-2 rounded-xl text-left transition ${f.userType==='jobSeeker'?'border-blue-500 bg-blue-50':'border-slate-200'}`}><User className={`w-5 h-5 mb-2 ${f.userType==='jobSeeker'?'text-blue-600':'text-slate-400'}`} /><p className="font-medium text-sm">Job Seeker</p><p className="text-xs text-slate-500">Find opportunities</p></button>
              <button type="button" onClick={()=>setF({...f,userType:'company'})} className={`p-4 border-2 rounded-xl text-left transition ${f.userType==='company'?'border-blue-500 bg-blue-50':'border-slate-200'}`}><Building2 className={`w-5 h-5 mb-2 ${f.userType==='company'?'text-blue-600':'text-slate-400'}`} /><p className="font-medium text-sm">Company</p><p className="text-xs text-slate-500">Find talent</p></button>
            </div>
            <Input label="Full Name" placeholder="John Doe" value={f.name} onChange={e=>setF({...f,name:e.target.value})} />
            <Input label="Email" type="email" placeholder="you@example.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})} />
            <div className="relative"><Input label="Password" type={show?'text':'password'} placeholder="Min 8 characters" value={f.password} onChange={e=>setF({...f,password:e.target.value})} /><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-9 text-slate-400">{show?<EyeOff className="w-4 h-4" />:<Eye className="w-4 h-4" />}</button></div>
            <div className="space-y-2"><label className="flex items-center gap-2"><input type="checkbox" checked={f.terms} onChange={e=>setF({...f,terms:e.target.checked})} className="rounded" /><span className="text-sm text-slate-600">I agree to Terms & Privacy Policy</span></label><label className="flex items-center gap-2"><input type="checkbox" checked={f.news} onChange={e=>setF({...f,news:e.target.checked})} className="rounded" /><span className="text-sm text-slate-600">Send me updates</span></label></div>
            <Button type="submit" loading={load}><Send className="w-5 h-5 mr-2" />Continue</Button>
            <p className="text-center text-sm text-slate-600">Have an account? <button type="button" onClick={()=>{onClose(); switchToLogin();}} className="font-semibold text-blue-600">Sign in</button></p>
          </>
        )}
        {step===2 && (
          <>
            <button type="button" onClick={()=>{setStep(1); setCode(['','','','','','']);}} className="flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="w-4 h-4" />Back</button>
            <CodeInput value={code} onChange={setCode} countdown={count} onResend={resend} isLoading={load} error={err} email={f.email} />
            <Button type="submit" loading={load}><Verified className="w-5 h-5 mr-2" />Verify & Create Account</Button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default { LoginModal, RegisterModal };