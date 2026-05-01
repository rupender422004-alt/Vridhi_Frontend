import React, { useState } from 'react';
import './App.css';
import SocialMediaCard from './SocialMediaCard'; 

function ProductForm({ userId, refreshHistory }) { 
    const [formData, setFormData] = useState({
        name: '', category: '', price: '', url: '', description: '', competitorUrl: '',
        tone: 'Professional', audience: 'Corporate Professionals',
        generateImage: false, imageModel: 'pollinations', imageStyle: 'highly detailed, 4k, realistic photography'
    });
    const [result, setResult] = useState('');
    const [imageUrl, setImageUrl] = useState(''); 
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const getDomainName = (link) => {
        if (!link) return "Our Campaign";
        try { let domain = new URL(link).hostname.replace('www.', ''); return domain.charAt(0).toUpperCase() + domain.slice(1); } 
        catch (error) { return link; }
    };

    const formatBoldText = (text) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) { return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '900' }}>{part.replace(/\*\*/g, '')}</strong>; }
            return <span key={i}>{part}</span>;
        });
    };

    const handleCopy = (content) => { navigator.clipboard.writeText(content); alert("Content copied to clipboard!"); };

    const renderAnimatedCards = (text) => {
        if (!text) return null;
        const sections = text.split(/(?=(?:### |## |# |Instagram Post|X \(Twitter\) Post|LinkedIn Post|Email Campaign|Product Positioning))/g);

        return sections.map((sec, index) => {
            let rawText = sec.replace(/^---$/gm, '').trim();
            let cleanedText = rawText.replace(/^(### |## |# )/gm, '').trim();
            if (!cleanedText || cleanedText.length < 5) return null;

            let borderColor = '#007bff'; 
            if (cleanedText.includes('Instagram')) borderColor = '#e1306c'; 
            else if (cleanedText.includes('Twitter') || cleanedText.includes('X (Twitter)') || cleanedText.includes('LinkedIn')) borderColor = '#1da1f2'; 
            else if (cleanedText.includes('Email') || cleanedText.includes('Subject:')) borderColor = '#f1c40f'; 
            else if (cleanedText.includes('Positioning') || cleanedText.includes('Headline')) borderColor = '#27ae60'; 

            const lines = cleanedText.split('\n');
            const headingText = lines[0];
            const bodyText = lines.slice(1).join('\n').trim();

            return (
                <div key={index} className="campaign-card" style={{ borderLeftColor: borderColor, animationDelay: `${index * 0.1}s`, position: 'relative', paddingRight: '60px' }}>
                    <>
                        <div style={{ fontWeight: '900', fontSize: '1.1em', marginBottom: '10px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>{formatBoldText(headingText)}</div>
                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{formatBoldText(bodyText)}</div>
                    </>
                    <button onClick={() => handleCopy(cleanedText)} title="Copy section" style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', padding: '5px 10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Copy</button>
                </div>
            );
        });
    };

    const handleGenerateMarketing = async (e) => {
        e.preventDefault();
        // Validation: URL ya Description mein se koi ek hona hi chahiye
        if (!formData.url && !formData.description) { 
            alert("Please provide either a Target Website URL or a detailed Manual Description so the AI has context!"); 
            return; 
        }

        setResult(''); setImageUrl(''); setLoading(true); 

        const payload = { 
            ...formData, competitor_url: formData.competitorUrl, user_id: userId,
            generate_image: formData.generateImage, image_model: formData.imageModel, image_style: formData.imageStyle 
        };

        try {
            const response = await fetch("https://vridhi-api.onrender.com/generate-marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json();
            
            let finalContent = data.data || "Error generating content";

            // 🔥 SMART FILTER: Agar backend System Prompt leak kar de, toh use hide kar do
            if (finalContent.includes("CRITICAL INSTRUCTIONS") || finalContent.includes("CUSTOM NLP ANALYSIS")) {
                finalContent = "### ⚠️ Need More Context\n\nAI got confused because there wasn't enough content to analyze. Please provide a valid **Website URL** or write a slightly longer **Manual Description** about your product.";
            }

            setResult(finalContent);
            if (data.image_url) setImageUrl(data.image_url);
            
            if (refreshHistory) refreshHistory(); 
        } catch (error) { setResult("Failed to connect to AI Agent."); }
        setLoading(false);
    };

    return (
        <div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '700px', margin: '0 auto', backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="text" name="name" placeholder="Product Name (e.g., Vridhi)" onChange={handleChange} style={{...inputStyle, flex: 1}} />
                    <input type="text" name="category" placeholder="Category (e.g., EdTech)" onChange={handleChange} style={{...inputStyle, flex: 1}} />
                </div>
                <input type="text" name="url" placeholder="Target Website URL (Required if no description)" onChange={handleChange} style={{...inputStyle, borderLeft: '3px solid #007bff'}} />
                <input type="text" name="competitorUrl" placeholder="Competitor Website URL (Optional)" onChange={handleChange} style={inputStyle} />
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Brand Tone</label>
                        <select name="tone" value={formData.tone} onChange={handleChange} style={inputStyle}>
                            <option value="Professional">Professional & Corporate</option><option value="Gen-Z">Gen-Z & Trendy</option><option value="Aggressive">Aggressive & Sales-driven</option><option value="Humorous">Humorous & Witty</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Target Audience</label>
                        <select name="audience" value={formData.audience} onChange={handleChange} style={inputStyle}>
                            <option value="Corporate Professionals">Corporate Professionals</option><option value="Students">College Students</option><option value="Parents">Parents & Families</option><option value="Tech Enthusiasts">Tech Enthusiasts</option>
                        </select>
                    </div>
                </div>

                <textarea name="description" placeholder="Manual Description (Required if no URL)" onChange={handleChange} style={{...inputStyle, height: '80px'}} />
                
                <div style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" id="genImage" name="generateImage" checked={formData.generateImage} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <label htmlFor="genImage" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>Enable AI Image Generation Engine</label>
                    </div>

                    {formData.generateImage && (
                        <div style={{ marginTop: '15px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--hover-bg)' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Select Core Model</label>
                                    <select name="imageModel" value={formData.imageModel} onChange={handleChange} style={inputStyle}>
                                        <option value="pollinations">Pollinations.ai (Fast & Free)</option>
                                        <option value="huggingface">Stable Diffusion XL (via HF API)</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Size & Quality</label>
                                    <select name="imageStyle" value={formData.imageStyle} onChange={handleChange} style={inputStyle}>
                                        <option value="highly detailed, 4k, realistic photography">HD Realistic (16:9)</option>
                                        <option value="3D render, minimalist, studio lighting">3D Minimalist (Studio)</option>
                                        <option value="vibrant, pop-art, eye-catching">Vibrant & Pop Art</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={handleGenerateMarketing} disabled={loading} style={{...buttonStylePrimary, opacity: loading ? 0.8 : 1, marginTop: '10px'}}>{loading ? "Analyzing Data & Crafting Strategy..." : "Generate Smart Campaign"}</button>
            </form>

            {loading && (<div style={{ marginTop: '30px' }}><div className="skeleton-box"></div><div className="skeleton-box" style={{ height: '80px', width: '80%' }}></div></div>)}

            {/* ❌ GOLDI: RAW IMAGE CONTAINER DELETED FROM HERE ❌ */}

            {result && (
                <>
                    {result.includes("===SPLIT===") ? (
                        <div style={{ display: 'flex', gap: '20px', background: 'var(--bg-color)', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                            <div style={{ flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                                <h4 style={{ color: '#27ae60', marginTop: 0, borderBottom: '2px solid #27ae60', paddingBottom: '10px' }}>{getDomainName(formData.url)}</h4>
                                {renderAnimatedCards(result.split("===SPLIT===")[0])}
                            </div>
                            <div style={{ width: '2px', backgroundColor: 'var(--border-color)', borderRadius: '2px', flexShrink: 0 }}></div>
                            <div style={{ flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                                <h4 style={{ color: '#c0392b', marginTop: 0, borderBottom: '2px solid #c0392b', paddingBottom: '10px' }}>{getDomainName(formData.competitorUrl)}</h4>
                                {renderAnimatedCards(result.split("===SPLIT===")[1])}
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '8px', marginTop: '20px', maxHeight: '600px', overflowY: 'auto' }}>
                            {renderAnimatedCards(result)}
                        </div>
                    )}

                    <div style={{ marginTop: '40px', padding: '30px', borderTop: '2px dashed var(--border-color)' }}>
                        <h3 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '10px' }}>Ready-to-Upload Assets</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '25px' }}>AI Generated Visual tailored with contextual information and brand tone.</p>
                        
                        {result.includes("===SPLIT===") ? (
                            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                                <SocialMediaCard brandName={formData.name || getDomainName(formData.url)} tone={formData.tone} content={result.split("===SPLIT===")[0]} isCompetitorCard={false} bgImage={imageUrl} />
                                <div style={{width: '2px', background: 'var(--border-color)'}}></div>
                                <SocialMediaCard brandName={getDomainName(formData.competitorUrl)} tone={formData.tone} content={result.split("===SPLIT===")[1]} isCompetitorCard={true} bgImage={imageUrl} />
                            </div>
                        ) : (
                            <SocialMediaCard brandName={formData.name || getDomainName(formData.url)} tone={formData.tone} content={result} isCompetitorCard={false} bgImage={imageUrl} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '15px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' };
const buttonStylePrimary = { padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', transition: '0.2s' };

export default ProductForm;