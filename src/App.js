import React, { useState, useEffect } from 'react';
import './App.css';
import AuthPage from './AuthPage';
import ProductForm from './ProductForm';
import CampaignHistory from './CampaignHistory';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('vridhi_auth') === 'true');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vridhi_user');
    try { return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null; } 
    catch { return null; }
  });

  const [activeTab, setActiveTab] = useState('new'); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  // Default Dark Mode & Save to LocalStorage logic restored
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('vridhi_theme');
    return savedTheme !== null ? savedTheme === 'dark' : true;
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('vridhi_theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchCampaigns();
    }
  }, [isAuthenticated, user]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`https://vridhi-api.onrender.com/get-campaigns/${user.user_id}`);
      const result = await response.json();
      if (result.status === "success") {
        setCampaigns(result.data);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('vridhi_auth', 'true');
    localStorage.setItem('vridhi_user', JSON.stringify(userData));
    toast.success(`Welcome back, ${userData.name || 'User'}!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('vridhi_auth');
    localStorage.removeItem('vridhi_user');
    toast.info("Logged out successfully.");
  };

  const getSidebarTitle = (camp) => {
    if (camp.name && camp.name !== "Campaign" && !camp.name.includes("Our Campaign")) return camp.name;
    if (!camp.target_url) return "Unnamed Campaign";
    try {
      let domain = new URL(camp.target_url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch (error) { return camp.target_url; }
  };

  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
        <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? 'dark' : 'light'} />
        <AuthPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? 'dark' : 'light'} />
      
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        toggleTheme={toggleTheme} 
        isDarkMode={isDarkMode} 
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{ borderTop: 'none', display: 'flex', flexDirection: 'column' }}>
          
          <div className="menu-items" style={{ marginTop: '20px' }}>
            <button className={`menu-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
              <span className="hide-on-collapse">New Campaign</span>
            </button>
            
            <button className={`menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <span className="hide-on-collapse">Analytics Dashboard</span>
            </button>
          </div>

          <div className="sidebar-history" style={{ flex: 1, overflowY: 'auto', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <p className="hide-on-collapse" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', margin: '0 0 10px 15px', letterSpacing: '1px' }}>
               PAST CAMPAIGNS
            </p>

            {campaigns.length === 0 ? (
              <p className="hide-on-collapse" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '15px' }}>No history yet.</p>
            ) : (
              campaigns.map((camp) => (
                <button
                  key={camp._id}
                  className={`menu-btn ${activeTab === camp._id ? 'active' : ''}`}
                  onClick={() => setActiveTab(camp._id)}
                  style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', width: '100%', marginBottom: '5px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '8px' }}
                  title={getSidebarTitle(camp)}
                >
                  <span className="hide-on-collapse" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: activeTab === camp._id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {getSidebarTitle(camp)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="top-header">
            {/* Dynamic Header Title based on Tab */}
            <h2>{activeTab === 'new' ? 'Craft a New Campaign' : activeTab === 'dashboard' ? 'Workspace Analytics' : 'Campaign Overview'}</h2>
          </div>

          <div className="content-area">
            {activeTab === 'new' ? (
              <ProductForm userId={user?.user_id} refreshHistory={fetchCampaigns} /> 
            ) : (
              <CampaignHistory 
                userId={user?.user_id} 
                campaigns={campaigns} 
                activeTab={activeTab} 
                fetchCampaigns={fetchCampaigns} 
                setActiveTab={setActiveTab} 
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;