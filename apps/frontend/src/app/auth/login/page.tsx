'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Value } from 'react-phone-number-input';
import { getApiClient } from '@/common/config/axios/axios.instance';
import { normalizeAPIClientError } from '@/common/config/axios/axios.errors';
import { signIn } from 'next-auth/react';
import { SubmitButton } from '@/common/components/auth/authButtons/signInButton';
import { SSOButton } from '@/common/components/auth/authButtons/ssoButton';
import { FloatingInput } from '@/common/components/auth/authFields/FloatingInput';
import { FloatingPhoneInput } from '@/common/components/auth/authFields/FloatingPhoneInput';
import Image from 'next/image';
import logoImg from '@/assets/logo2.png';

export default function LoginPage() {
    const [view, setView] = useState<'login' | 'register'>('login');

    const [globalError, setGlobalError] = useState('');
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('pan');
    const [nickname, setNickname] = useState('');
    
    const [email1, setEmail1] = useState('');
    const [email2, setEmail2] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    
    const [phone, setPhone] = useState<Value | undefined>();
    const [altEmail, setAltEmail] = useState('');

    const [loginEmailError, setLoginEmailError] = useState('');
    const [emailMismatchError, setEmailMismatchError] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState('');

    const validateLoginEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email) && email.length > 0) {
            setLoginEmailError('Niepoprawny format adresu email');
        } else {
            setLoginEmailError('');
        }
    };

    const handleEmail2Blur = () => {
        if (email1 !== email2 && email1.length > 0 && email2.length > 0) {
            setEmailMismatchError('Adresy email muszą być identyczne');
        } else {
            setEmailMismatchError('');
        }
    };

    const handlePassword2Blur = () => {
        if (password1 !== password2 && password1.length > 0 && password2.length > 0) {
            setPasswordMismatchError('Hasła muszą być identyczne');
        } else {
            setPasswordMismatchError('');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError('');
        
        try {
            const api = getApiClient();
            
            // Definiujemy <T, R>: 
            // T (any) - pozwalamy wysłać dowolny obiekt (email, password)
            // R - określamy, że z serwera wróci obiekt { access: string }
            const res = await api.post<Record<string, string>, { access: string }>('/api/auth/login/', { 
                email: email1, 
                password: password1 
            });
            
            // Axios zawsze zawija odpowiedź w obiekt, dlatego używamy res.data.access
            await signIn('credentials', { 
                access_token: res.data.access, 
                callbackUrl: '/dashboard' 
            });
        } catch (err: unknown) {
            const error = normalizeAPIClientError(err);
            setGlobalError(error.message);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (emailMismatchError || passwordMismatchError) return;
        
        setGlobalError('');

        try {
            const api = getApiClient();
            // Tworzymy payload z danymi
            const payload = {
                email: email1,
                password: password1,
                password_confirm: password2,
                first_name: firstName,
                last_name: lastName,
                gender: gender,
                nickname: nickname,
                phone: phone ? String(phone) : '',
                alt_email: altEmail
            };

            await api.post('/api/auth/register/', payload);
            
            // Po sukcesie wracamy na logowanie i czyścimy błędy
            alert("Konto utworzone pomyślnie. Możesz się zalogować.");
            setView('login');
            setEmail1('');
            setPassword1('');
            setPassword2('');
        }catch (err: unknown) {
            const error = normalizeAPIClientError(err);
            setGlobalError(error.message);
        }
    };

    return (
        <div className="min-h-screen h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div 
                layout
                className={`w-full ${view === 'login' ? 'max-w-[400px] 2xl:max-w-md' : 'max-w-[600px] 2xl:max-w-2xl'} flex flex-col items-center justify-center`}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
                <div className="w-full bg-zinc-900 border border-zinc-700 p-5 sm:p-6 2xl:p-8 rounded-3xl shadow-2xl overflow-hidden relative">
                    
                    <motion.div layout="position" className="mb-5 2xl:mb-8 text-center flex items-center justify-center gap-4">
                        <Image 
                            src={logoImg}
                            alt="Logo Portfel+"
                            priority 
                            className="drop-shadow-[0_10px_10px_rgba(178,102,255,0.2)] w-75 h-auto"
                        />
                    </motion.div>

                    <motion.div layout="position" className="flex relative mb-6 2xl:mb-8 bg-zinc-950 rounded-xl p-1">
                        <button 
                            onClick={() => setView('login')}
                            className={`flex-1 py-1.5 2xl:py-2 text-sm font-medium z-10 transition-colors cursor-pointer ${view === 'login' ? 'text-zinc-100' : 'text-zinc-400'}`}
                        >
                            Zaloguj się
                        </button>
                        <button 
                            onClick={() => setView('register')}
                            className={`flex-1 py-1.5 2xl:py-2 text-sm font-medium z-10 transition-colors cursor-pointer ${view === 'register' ? 'text-zinc-100' : 'text-zinc-400'}`}
                        >
                            Zarejestruj się
                        </button>
                        <motion.div 
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-700 rounded-lg shadow"
                            animate={{ x: view === 'login' ? 0 : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {view === 'login' ? (
                            <motion.form 
                                key="login"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleLogin}
                            >
                                <FloatingInput 
                                    label="Email" 
                                    type="email" 
                                    value={email1} // <-- DODANE
                                    onChange={(e) => {
                                        setEmail1(e.target.value); // <-- DODANE (aktualizuje stan)
                                        validateLoginEmail(e.target.value);
                                    }}
                                />
                                {loginEmailError && <p className="text-red-400 text-xs mb-3 -mt-3 ml-2">{loginEmailError}</p>}

                                <FloatingInput 
                                    label="Hasło" 
                                    type="password" 
                                    value={password1} // <-- DODANE
                                    onChange={(e) => setPassword1(e.target.value)} // <-- DODANE
                                />
                                
                                <div className="flex justify-start -mt-3 mb-3 2xl:mb-4 ml-1">
                                    <a href="#" className="text-xs 2xl:text-sm text-[#B266FF] hover:text-purple-400 transition-colors">
                                        Zapomniałem hasła...
                                    </a>
                                </div>

                                {globalError && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
                                        {globalError}
                                    </div>
                                )}

                                <SubmitButton>Zaloguj się</SubmitButton>

                                <div className="relative flex py-4 2xl:py-5 items-center">
                                    <div className="flex-grow border-t border-zinc-700"></div>
                                    <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs 2xl:text-sm">lub</span>
                                    <div className="flex-grow border-t border-zinc-700"></div>
                                </div>

                                <div className="space-y-2 2xl:space-y-3">
                                    <SSOButton provider="microsoft-entra-id" label="Kontynuuj z Microsoft" />
                                    <SSOButton provider="google" label="Kontynuuj z Google" />
                                    <SSOButton provider="github" label="Kontynuuj z GitHub" />
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="register"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleRegister}
                            >
                                <div className="mb-4 2xl:mb-6">
                                    <h3 className="text-base 2xl:text-lg font-semibold text-zinc-100 mb-3 2xl:mb-4">Imię i nazwisko</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 2xl:gap-4 mb-3 2xl:mb-4">
                                        <FloatingInput label="Imię" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                        <FloatingInput label="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                    </div>
                                    
                                    <div className="flex gap-3 2xl:gap-4 mb-3 2xl:mb-4">
                                        <div className="w-[100px] 2xl:w-[120px]">
                                            <select 
                                                value={gender} 
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full h-[44px] 2xl:h-[52px] bg-zinc-800 border border-zinc-700 rounded-xl px-4 text-sm 2xl:text-base text-zinc-100 focus:border-[#B266FF] outline-none"
                                            >
                                                <option value="pan">Pan</option>
                                                <option value="pani">Pani</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <FloatingInput label="Pseudonim (opcjonalny)" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-zinc-700 my-4 2xl:my-6" />

                                <div className="mb-4 2xl:mb-6">
                                    <h3 className="text-base 2xl:text-lg font-semibold text-zinc-100 mb-2">Dane Logowania</h3>
                                    <p className="text-xs 2xl:text-sm text-zinc-400 mb-4 2xl:mb-5">Wprowadź adres email i hasło. Pola muszą się zgadzać.</p>
                                    
                                    <FloatingInput label="Email" type="email" value={email1} onChange={(e) => setEmail1(e.target.value)} />
                                    <FloatingInput label="Powtórz email" type="email" value={email2} onChange={(e) => setEmail2(e.target.value)} onBlur={handleEmail2Blur} />
                                    {emailMismatchError && <p className="text-red-400 text-xs mb-3 -mt-3 ml-2">{emailMismatchError}</p>}
                                    
                                    <FloatingInput label="Hasło" type="password" value={password1} onChange={(e) => setPassword1(e.target.value)} />
                                    <FloatingInput label="Powtórz hasło" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} onBlur={handlePassword2Blur} />
                                    {passwordMismatchError && <p className="text-red-400 text-xs mb-3 -mt-3 ml-2">{passwordMismatchError}</p>}
                                </div>

                                <hr className="border-zinc-700 my-4 2xl:my-6" />

                                <div className="mb-4 2xl:mb-6">
                                    <h3 className="text-base 2xl:text-lg font-semibold text-zinc-100 mb-3 2xl:mb-4">Dane kontaktowe</h3>
                                    <FloatingPhoneInput label="Numer telefonu" value={phone} onChange={setPhone} />
                                    <FloatingInput label="Alternatywny adres email" type="email" value={altEmail} onChange={(e) => setAltEmail(e.target.value)} />
                                </div>

                                {globalError && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
                                        {globalError}
                                    </div>
                                )}

                                <SubmitButton>Utwórz konto</SubmitButton>
                            </motion.form>
                        )}
                    </AnimatePresence>

                </div>
            </motion.div>
        </div>
    );
}