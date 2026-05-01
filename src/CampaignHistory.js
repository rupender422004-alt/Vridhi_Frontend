import React, { useState, useMemo } from 'react';
import { jsPDF } from "jspdf";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './App.css'; 
import SocialMediaCard from './SocialMediaCard'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function CampaignHistory({ userId, campaigns, activeTab, fetchCampaigns, setActiveTab }) {
    const [regeneratingId, setRegeneratingId] = useState(null); 
    const camp = campaigns.find(c => c._id === activeTab);

    const chartData = useMemo(() => {
        const toneCounts = {};
        campaigns.forEach(c => { const tone = c.tone || 'Professional'; toneCounts[tone] = (toneCounts[tone] || 0) + 1; });
        return { labels: Object.keys(toneCounts), datasets: [{ label: 'Campaigns Generated', data: Object.values(toneCounts), backgroundColor: ['#007bff', '#e1306c', '#1da1f2', '#27ae60', '#f1c40f'], borderRadius: 6 }] };
    }, [campaigns]);

    const chartOptions = { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Campaigns by Brand Tone', color: 'var(--text-primary)', font: { size: 16 } } }, scales: { y: { beginAtZero: true, ticks: { precision: 0, color: 'var(--text-secondary)' } }, x: { ticks: { color: 'var(--text-secondary)' } } } };
    
    const handleCopy = (content) => { navigator.clipboard.writeText(content); alert("Copied to clipboard!"); };
    
    // 🔥 PRO PDF GENERATOR (Fixes Emojis, Page Breaks, and Splitting)
    const handleDownloadPDF = (content, name) => { 
        const doc = new jsPDF(); 
        const pageWidth = doc.internal.pageSize.getWidth(); 
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // Vridhi.AI Branding Header
        doc.setFontSize(22); doc.setTextColor(0, 123, 255); doc.text("Vridhi.AI", 15, yPos); 
        yPos += 8;
        doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.text("Automated Marketing Report", 15, yPos); 
        yPos += 5;
        doc.setLineWidth(0.5); doc.line(15, yPos, pageWidth - 15, yPos); 
        yPos += 12;

        // Campaign Title
        doc.setFontSize(16); doc.setTextColor(44, 62, 80); doc.text(`${name || 'Campaign'} Overview`, 15, yPos); 
        yPos += 10;

        doc.setFontSize(11); doc.setTextColor(60, 60, 60); 

        // 🧹 CLEANING PIPELINE:
        let cleanContent = content
            .replace(/\*\*/g, '') // Remove Markdown Bold
            .replace(/### /g, '') // Remove Markdown Headings
            .replace(/['"]/g, "'") // Normalize quotes
            .replace(/[“”]/g, '"') // Normalize smart quotes
            .replace(/[‘’]/g, "'")
            .replace(/[^\x00-\x7F]/g, ""); // 🔥 REMOVES ALL EMOJIS & UNICODE GARBAGE
        
        // Handle VS Competitor Logic beautifully
        if (cleanContent.includes("===SPLIT===")) {
             const parts = cleanContent.split("===SPLIT===");
             cleanContent = "TARGET BRAND STRATEGY:\n\n" + parts[0].trim() + "\n\n------------------------------------------------------------\nCOMPETITOR STRATEGY:\n\n" + parts[1].trim();
        }

        // Auto Word-Wrap
        const splitText = doc.splitTextToSize(cleanContent, pageWidth - 30); 

        // 📄 AUTO-PAGINATION (Naya page banayega agar text lamba hai)
        for (let i = 0; i < splitText.length; i++) {
            if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20; // Reset Y position for new page
            }
            doc.text(splitText[i], 15, yPos);
            yPos += 6; // Line spacing
        }

        doc.save(`${name || 'Campaign'}_Report.pdf`); 
    };
    
    const getDomainName = (link) => { if (!link) return "Our Campaign"; try { let domain = new URL(link).hostname.replace('www.', ''); return domain.charAt(0).toUpperCase() + domain.slice(1); } catch (error) { return link; } };
    const getCampaignTitle = (camp) => { if (camp.name && camp.name !== "Campaign" && !camp.name.includes("Our Campaign")) return camp.name; const mainBrand = getDomainName(camp.target_url); if (camp.competitor_url && camp.competitor_url.trim() !== "") { const compBrand = getDomainName(camp.competitor_url); return `${mainBrand} vs ${compBrand} Campaign`; } return `${mainBrand} Campaign`; };
    const formatBoldText = (text) => { if (!text) return null; const parts = text.split(/(\*\*.*?\*\*)/g); return parts.map((part, i) => { if (part.startsWith('**') && part.endsWith('**')) { return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '900' }}>{part.replace(/\*\*/g, '')}</strong>; } return <span key={i}>{part}</span>; }); };

    const renderAnimatedCards = (text) => {
        if (!text) return null;
        const sections = text.split(/(?=(?:### |## |# |Instagram Post|X \(Twitter\) Post|LinkedIn Post|Email Campaign|Product Positioning))/g);
        return sections.map((sec, index) => {
            let rawText = sec.replace(/^---$/gm, '').trim(); let cleanedText = rawText.replace(/^(### |## |# )/gm, '').trim(); if (!cleanedText || cleanedText.length < 5) return null;
            let borderColor = '#007bff'; if (cleanedText.includes('Instagram')) borderColor = '#e1306c'; else if (cleanedText.includes('Twitter') || cleanedText.includes('X (Twitter)') || cleanedText.includes('LinkedIn')) borderColor = '#1da1f2'; else if (cleanedText.includes('Email') || cleanedText.includes('Subject:')) borderColor = '#f1c40f'; else if (cleanedText.includes('Positioning') || cleanedText.includes('Headline')) borderColor = '#27ae60'; 
            const lines = cleanedText.split('\n'); const headingText = lines[0]; const bodyText = lines.slice(1).join('\n').trim();
            return ( <div key={index} className="campaign-card" style={{ borderLeftColor: borderColor, animationDelay: `${index * 0.1}s`, position: 'relative', paddingRight: '60px' }}> <> <div style={{ fontWeight: '900', fontSize: '1.1em', marginBottom: '10px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>{formatBoldText(headingText)}</div> <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{formatBoldText(bodyText)}</div> </> <button onClick={() => handleCopy(cleanedText)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', padding: '5px 10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Copy</button> </div> );
        });
    };

    const handleRegenerate = async (camp) => {
        setRegeneratingId(camp._id); let baseName = getCampaignTitle(camp); if (!baseName.includes("(Regenerated)")) { baseName = baseName.replace(" Campaign", ""); baseName = `${baseName} (Regenerated)`; }
        const payload = { name: baseName, category: camp.category || "", price: camp.price || "", description: camp.description || "", url: camp.target_url || "", competitor_url: camp.competitor_url || "", user_id: userId, generate_image: false };
        try { const response = await fetch("https://vridhi-api.onrender.com/generate-marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); await response.json(); fetchCampaigns(); } catch (error) { alert("Failed."); }
        setRegeneratingId(null);
    };

    const handleDelete = async (id) => { if (!window.confirm("Delete?")) return; try { const response = await fetch(`https://vridhi-api.onrender.com/delete-campaign/${id}`, { method: "DELETE" }); if (response.ok) { fetchCampaigns(); setActiveTab('new'); } } catch (error) { alert("Failed."); } };

    if (!camp) { return ( <div style={{ padding: '20px' }}> <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px' }}> <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>Your Workspace Analytics</h3> <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}> <div style={{ flex: 1, padding: '20px', background: 'var(--hover-bg)', borderRadius: '8px', textAlign: 'center' }}> <h2 style={{ margin: 0, fontSize: '36px', color: '#007bff' }}>{campaigns.length}</h2> <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Campaigns</p> </div> <div style={{ flex: 2, height: '200px' }}> {campaigns.length > 0 ? <Bar data={chartData} options={chartOptions} /> : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '80px' }}>Generate campaigns to see data.</p>} </div> </div> </div> <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Select a campaign from the sidebar to view details.</p> </div> ); }

    return (
        <div style={{ marginTop: '10px' }}>
            <div style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: '10px', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, color: '#007bff', flex: 1 }}>{getCampaignTitle(camp)}</h3>
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                        <button onClick={() => handleRegenerate(camp)} disabled={regeneratingId === camp._id} style={actionButtonStyle}>{regeneratingId === camp._id ? "Wait..." : "Regenerate"}</button>
                        <button onClick={() => handleCopy(camp.generated_content)} style={actionButtonStyle}>Copy All</button>
                        <button onClick={() => handleDownloadPDF(camp.generated_content, camp.name)} style={actionButtonStyle}>Export PDF</button>
                        <button onClick={() => handleDelete(camp._id)} style={{...actionButtonStyle, color: '#ff4757'}}>Delete</button>
                    </div>
                </div>                    

                {camp.generated_content && camp.generated_content.includes("===SPLIT===") ? (
                    <div style={{ display: 'flex', gap: '20px', background: 'var(--bg-color)', padding: '20px', borderRadius: '8px', marginTop: '15px' }}>
                        <div style={{ flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                            <h4 style={{ color: '#27ae60', marginTop: 0, borderBottom: '2px solid #27ae60', paddingBottom: '10px' }}>{getDomainName(camp.target_url)}</h4>
                            {renderAnimatedCards(camp.generated_content.split("===SPLIT===")[0])}
                        </div>
                        <div style={{ width: '2px', backgroundColor: 'var(--border-color)', borderRadius: '2px', flexShrink: 0 }}></div>
                        <div style={{ flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                            <h4 style={{ color: '#c0392b', marginTop: 0, borderBottom: '2px solid #c0392b', paddingBottom: '10px' }}>{getDomainName(camp.competitor_url)}</h4>
                            {renderAnimatedCards(camp.generated_content.split("===SPLIT===")[1])}
                        </div>
                    </div>
                ) : (
                    <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '8px', marginTop: '15px', maxHeight: '600px', overflowY: 'auto' }}>
                        {renderAnimatedCards(camp.generated_content)}
                    </div>
                )}

                <div style={{ marginTop: '40px', padding: '30px', borderTop: '2px dashed var(--border-color)', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                    <h3 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '10px' }}>Ready-to-Upload Assets</h3>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '25px' }}>
                        AI Generated Visual tailored with contextual information and brand tone.
                    </p>
                    
                    {camp.generated_content && camp.generated_content.includes("===SPLIT===") ? (
                        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                            <SocialMediaCard 
                                brandName={camp.name || getDomainName(camp.target_url)} 
                                tone={camp.tone || 'Professional'} 
                                content={camp.generated_content.split("===SPLIT===")[0]} 
                                isCompetitorCard={false} 
                                bgImage={camp.image_url} 
                            />
                            <div style={{width: '2px', background: 'var(--border-color)'}}></div>
                            <SocialMediaCard 
                                brandName={getDomainName(camp.competitor_url)} 
                                tone={camp.tone || 'Professional'} 
                                content={camp.generated_content.split("===SPLIT===")[1]} 
                                isCompetitorCard={true} 
                                bgImage={camp.image_url} 
                            />
                        </div>
                    ) : (
                        <SocialMediaCard 
                            brandName={camp.name || getDomainName(camp.target_url)} 
                            tone={camp.tone || 'Professional'} 
                            content={camp.generated_content} 
                            isCompetitorCard={false} 
                            bgImage={camp.image_url} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

const actionButtonStyle = { background: 'var(--hover-bg)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' };

export default CampaignHistory;