import React, { useState } from 'react';

function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Naya state: Password show/hide track karne ke liye
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("❌ Please enter a valid email address.");
            return;
        }
        if (formData.password.length < 6) {
            setError("❌ Password must be at least 6 characters long.");
            return;
        }
        if (!isLogin && formData.name.trim() === '') {
            setError("❌ Please enter your full name.");
            return;
        }

        setLoading(true);

        const endpoint = isLogin ? "https://vridhi-api.onrender.com/login" : "https://vridhi-api.onrender.com/signup";
        
        const payload = isLogin 
            ? { email: formData.email, password: formData.password } 
            : { username: formData.name, email: formData.email, password: formData.password };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Agar server achanak crash ho, toh JSON parse fail na ho
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error("Invalid Server Response");
            }

            // 🌟 THE FIX: Ab hum data.error ko bhi check kar rahe hain!
            if (response.ok && !data.error) {
                // 🔥 FIX: 'data' ki jagah 'data.user' bhejna hai
                onLogin(data.user);
            } else {
                setError(`❌ ${data.error || data.detail || 'Login failed. Please try again.'}`);
            }
        } catch (err) {
            setError("❌ Could not connect. Is FastAPI running?");
        } finally {
            // Ye har haal mein "Please wait..." ko band karega
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '20px' }}>
                    {isLogin ? 'Login to access your AI Agents' : 'Start your free marketing journey'}
                </p>

                {error && (
                    <div style={{ padding: '10px', backgroundColor: '#ffeaa7', color: '#d63031', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {!isLogin && (
                        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} value={formData.name} style={inputStyle} />
                    )}
                    
                    <input type="email" name="email" placeholder="Email Address" onChange={handleChange} value={formData.email} style={inputStyle} />
                    
                    {/* YAHAN HAI NAYA PASSWORD BOX WITH EYE ICON 👇 */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Password (Min 6 chars)" 
                            onChange={handleChange} 
                            value={formData.password}
                            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', paddingRight: '40px' }} 
                        />
                        <span 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                                position: 'absolute', 
                                right: '12px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                cursor: 'pointer',
                                fontSize: '18px',
                                userSelect: 'none'
                            }}
                            title={showPassword ? "Hide Password" : "Show Password"}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                    
                    <button type="submit" disabled={loading} style={{...buttonStyle, opacity: loading ? 0.7 : 1}}>
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', color: '#555' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => { setIsLogin(!isLogin); setError(''); setFormData({name:'', email:'', password:''}); setShowPassword(false); }} style={{ color: '#007bff', fontWeight: 'bold', cursor: 'pointer' }}>
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </span>
                </p>
            </div>
        </div>
    );
}

const inputStyle = { padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', outline: 'none' };
const buttonStyle = { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s', marginTop: '10px' };

export default AuthPage;