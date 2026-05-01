import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

function SocialMediaCard({ brandName, tone, content, isCompetitorCard, bgImage }) {
    const cardRef = useRef(null);

    const getGradient = (brandTone) => {
        if (isCompetitorCard) return 'linear-gradient(135deg, #1e293b, #334155)';
        switch(brandTone) {
            case 'Gen-Z': return 'linear-gradient(135deg, #FF0080, #7928CA)'; 
            case 'Aggressive': return 'linear-gradient(135deg, #ED213A, #93291E)'; 
            case 'Humorous': return 'linear-gradient(135deg, #FDC830, #F37335)'; 
            case 'Professional': 
            default: return 'linear-gradient(135deg, #0f2027, #2c5364)';
        }
    };

    // 🔥 ADVANCED SMART EXTRACTOR: Catchy Hook Finder
    const extractCardDetails = (text) => {
        if (!text) return { title: "Unleash Potential", highlight: "Discover the ultimate solution tailored for your specific needs." };

        // 1. Sabse pehle 'Instagram Post' dhoondho (Kyunki wo sabse catchy hota hai)
        const igMatch = text.match(/Instagram Post([\s\S]*?)(?=###|$)/i);
        let socialPost = igMatch ? igMatch[1].replace(/\*\*/g, '').trim() : "";

        if (socialPost && socialPost.length > 15) {
            // Emojis aur quotes hata do clean look ke liye
            let cleanPost = socialPost.replace(/["']/g, '');
            // Pehli sentence ko Title banao (Exclamation mark tak)
            let sentences = cleanPost.split(/(?<=[.!?])\s+/);
            
            let extractedTitle = sentences[0];
            let extractedHighlight = sentences.slice(1).join(' ').replace(/#\w+/g, '').trim(); // Hashtags hata do

            if (!extractedHighlight) extractedHighlight = "Experience the thrill and elevate your journey today.";

            return {
                title: extractedTitle.length > 70 ? extractedTitle.substring(0, 70) + "..." : extractedTitle,
                highlight: extractedHighlight.length > 200 ? extractedHighlight.substring(0, 200) + "..." : extractedHighlight
            };
        }

        // 2. Agar Instagram post nahi mila, toh koi bhi aisi line dhoondho jisme '!' ya '?' ho (The Hook)
        const cleanText = text.replace(/### |## |# |\*\*/g, '');
        const allSentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
        let hookSentence = allSentences.find(s => s.includes('!') || s.includes('?'));

        if (hookSentence && hookSentence.length > 10) {
            let hookIndex = allSentences.indexOf(hookSentence);
            let highlightText = allSentences[hookIndex + 1] ? allSentences[hookIndex + 1] : allSentences[0];
            return {
                title: hookSentence.trim().replace(/["']/g, ''),
                highlight: highlightText.trim().substring(0, 200)
            };
        }

        // 3. Fallback: Boring pehli line chhod kar dusri line ko Title banao
        const paragraphs = cleanText.split('\n').filter(p => p.trim().length > 20);
        if (paragraphs.length > 0) {
            const sentences = paragraphs[0].split(/(?<=[.!?])\s+/);
            if (sentences.length >= 2) {
                return {
                    title: sentences[1].trim(),
                    highlight: (sentences[2] || paragraphs[1] || sentences[0]).trim().substring(0, 200)
                };
            }
            return { title: sentences[0].substring(0, 70), highlight: paragraphs[1]?.substring(0, 200) || "Explore more today." };
        }

        return { title: "Elevate Your Brand", highlight: "Step into the future with our innovative solutions." };
    };

    const handleDownload = async () => {
        const element = cardRef.current;
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 3, useCORS: true, allowTaint: true });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${brandName}_Ad_Post.png`;
            link.click();
        } catch (error) { console.error("Export failed", error); }
    };

    const { title, highlight } = extractCardDetails(content);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            {/* MAIN CANVAS */}
            <div 
                ref={cardRef} 
                style={{ 
                    width: '500px', height: '500px', 
                    backgroundImage: bgImage ? `url(${bgImage})` : getGradient(tone),
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    borderRadius: '12px', display: 'flex', flexDirection: 'column', 
                    position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)' }}></div>

                {/* UPRIGHT TEXT BOX */}
                <div style={{ 
                    position: 'absolute', 
                    top: '30px', 
                    right: '30px', 
                    maxWidth: '300px', 
                    backdropFilter: 'blur(12px)', 
                    background: 'rgba(0,0,0,0.65)', 
                    padding: '25px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.15)',
                    zIndex: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                    <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900', margin: '0 0 12px 0', textTransform: 'uppercase', lineHeight: '1.2', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {title}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: '0', lineHeight: '1.6' }}>
                        {highlight}
                    </p>
                </div>
                
                {/* BOTTOM BRANDING STRIP */}
                <div style={{ zIndex: 2, position: 'absolute', bottom: '25px', left: '30px', right: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                        {brandName}
                    </span>
                    <span style={{ color: '#007bff', background: 'white', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                        VRIDHI AI
                    </span>
                </div>
            </div>

            <button onClick={handleDownload} style={{ padding: '12px 25px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                Download Marketing Post
            </button>
        </div>
    );
}

export default SocialMediaCard;