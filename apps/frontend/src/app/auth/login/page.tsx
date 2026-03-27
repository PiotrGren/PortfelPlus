'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Value } from 'react-phone-number-input';
import { SubmitButton } from '@/common/components/auth/authButtons/signInButton';
import { SSOButton } from '@/common/components/auth/authButtons/ssoButton';
import { FloatingInput } from '@/common/components/auth/authFields/FloatingInput';
import { FloatingPhoneInput } from '@/common/components/auth/authFields/FloatingPhoneInput';
import Image from 'next/image';
import logoImg from '@/assets/logo2.png';

export default function LoginPage() {
    const [view, setView] = useState<'login' | 'register'>('login');
    
    // --- STAN DLA FORMULARZA REJESTRACJI ---
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

    // --- STAN DLA BŁĘDÓW WALIDACJI ---
    const [loginEmailError, setLoginEmailError] = useState('');
    const [emailMismatchError, setEmailMismatchError] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState('');

    // --- FUNKCJE WALIDUJĄCE ---
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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Logowanie własne...");
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Przed wysłaniem sprawdzamy, czy nie ma błędów walidacji
        if (emailMismatchError || passwordMismatchError) {
            console.error("Błędy walidacji w formularzu!");
            return;
        }
        console.log("Rejestracja użytkownika:", { 
            firstName, lastName, gender, nickname, 
            email: email1, password: password1, 
            phone, altEmail 
        });
        // TODO: Wywołanie Twojego AxiosClienta
    };

    return (
        // Tło strony: Zinc-950, pełna wysokość, flex do centrowania, responsywny padding
        <div className="min-h-screen h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 md:p-8">
            
            {/* DYNAMICZNY Parent kontener. 
                Szerokość: w-full, maks szerokość: dynamiczna (max-w-md lub max-w-2xl)
                Wysokość: automatyczna (wzrasta z kontentem), nieograniczona.
                Dodałem flex-col, aby logo było nad formualrzem na środku.
            */}
            <motion.div 
                className={`w-full ${view === 'login' ? 'max-w-md' : 'max-w-2xl'} h-full flex flex-col items-center justify-center`}
                animate={{ maxWidth: view === 'login' ? '448px' : '672px' }} // 448px = max-w-md, 672px = max-w-2xl
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
                <div className="w-full bg-zinc-900 border border-zinc-700 p-6 md:p-8 rounded-3xl shadow-2xl overflow-hidden relative">
                    
                    {/* Miejsce na Logo - wewnątrz karty */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-center flex items-center justify-center gap-4"
                    >
                        <Image 
                            src={logoImg} // <--- TUTAJ ZMIANA
                            alt="Logo Portfel+"
                            //height={80}
                            priority 
                            className="drop-shadow-[0_10px_10px_rgba(178,102,255,0.2)]"
                        />
                    </motion.div>

                    {/* Przełącznik widoku */}
                    <div className="flex relative mb-8 bg-zinc-950 rounded-xl p-1">
                        <button 
                            onClick={() => setView('login')}
                            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors cursor-pointer ${view === 'login' ? 'text-zinc-100' : 'text-zinc-400'}`}
                        >
                            Zaloguj się
                        </button>
                        <button 
                            onClick={() => setView('register')}
                            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors cursor-pointer ${view === 'register' ? 'text-zinc-100' : 'text-zinc-400'}`}
                        >
                            Zarejestruj się
                        </button>
                        {/* Animowane tło wybranego przycisku */}
                        <motion.div 
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-700 rounded-lg shadow"
                            animate={{ x: view === 'login' ? 0 : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>

                    {/* Formularze z płynnym przejściem */}
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
                                    onChange={(e) => validateLoginEmail(e.target.value)}
                                />
                                {loginEmailError && <p className="text-red-400 text-xs mb-4 -mt-3 ml-2">{loginEmailError}</p>}
                                
                                <FloatingInput label="Hasło" type="password" />
                                
                                {/* "Zapomniałem hasła" - Moved to the LEFT */}
                                <div className="flex justify-start -mt-2 mb-4 ml-1">
                                    <a href="#" className="text-sm text-[#B266FF] hover:text-purple-400 transition-colors">
                                        Zapomniałem hasła...
                                    </a>
                                </div>

                                <SubmitButton>Zaloguj się</SubmitButton>

                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-zinc-700"></div>
                                    <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm">lub</span>
                                    <div className="flex-grow border-t border-zinc-700"></div>
                                </div>

                                <div className="space-y-3">
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
                                {/* --- Sekcja: Imię i nazwisko --- */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Imię i nazwisko</h3>
                                    
                                    {/* Grid dla Imię i Nazwisko (side-by-side on large screens, stack on small) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <FloatingInput label="Imię" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                        <FloatingInput label="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                    </div>
                                    
                                    {/* Grid dla Pn/Pani i Pseudonim (side-by-side) */}
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-[120px]">
                                            <select 
                                                value={gender} 
                                                onChange={(e) => setGender(e.target.value)}
                                                // Zmieniono: dodano h-[50px] i usunięto py-3
                                                className="w-full h-[50px] bg-zinc-800 border border-zinc-700 rounded-xl px-4 text-zinc-100 focus:border-[#B266FF] outline-none"
                                            >
                                                <option value="pan">Pan</option>
                                                <option value="pani">Pani</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            {/* Zmieniono: usunięto className="mb-0" bo już go nie potrzebujemy */}
                                            <FloatingInput label="Pseudonim (opcjonalny)" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Poprzeczka rozdzielająca */}
                                <hr className="border-zinc-700 my-6" />

                                {/* --- Sekcja: Dane Logowania --- */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Dane Logowania</h3>
                                    <p className="text-sm text-zinc-400 mb-5">Wprowadź adres email i hasło. Pola muszą się zgadzać.</p>
                                    
                                    {/* Lista pionowa (eden pod drugim) dla Email i Hasło */}
                                    <FloatingInput 
                                        label="Email" 
                                        type="email" 
                                        value={email1} 
                                        onChange={(e) => setEmail1(e.target.value)} 
                                    />
                                    <FloatingInput 
                                        label="Powtórz email" 
                                        type="email" 
                                        value={email2} 
                                        onChange={(e) => setEmail2(e.target.value)} 
                                        onBlur={handleEmail2Blur}
                                    />
                                    {emailMismatchError && <p className="text-red-400 text-xs mb-4 -mt-3 ml-2">{emailMismatchError}</p>}
                                    
                                    <FloatingInput 
                                        label="Hasło" 
                                        type="password" 
                                        value={password1} 
                                        onChange={(e) => setPassword1(e.target.value)} 
                                    />
                                    <FloatingInput 
                                        label="Powtórz hasło" 
                                        type="password" 
                                        value={password2} 
                                        onChange={(e) => setPassword2(e.target.value)} 
                                        onBlur={handlePassword2Blur}
                                    />
                                    {passwordMismatchError && <p className="text-red-400 text-xs mb-4 -mt-3 ml-2">{passwordMismatchError}</p>}
                                </div>

                                {/* Poprzeczka rozdzielająca */}
                                <hr className="border-zinc-700 my-6" />

                                {/* --- Sekcja: Dane kontaktowe --- */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Dane kontaktowe</h3>
                                    
                                    {/* Wykorzystanie nowego komponentu FloatingPhoneInput z obsługą kraju i formatowania */}
                                    <FloatingPhoneInput 
                                        label="Numer telefonu" 
                                        value={phone} 
                                        onChange={setPhone} 
                                    />
                                    
                                    <FloatingInput 
                                        label="Alternatywny adres email" 
                                        type="email" 
                                        value={altEmail} 
                                        onChange={(e) => setAltEmail(e.target.value)} 
                                    />
                                </div>

                                <SubmitButton>Utwórz konto</SubmitButton>
                            </motion.form>
                        )}
                    </AnimatePresence>

                </div>
            </motion.div>
        </div>
    );
}