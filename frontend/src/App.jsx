import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Shield, Umbrella, Car, Home, User, MapPin, 
  AlertTriangle, CloudRain, Sun, Wind, Info, CheckCircle2, 
  Loader2, Menu, X, Sparkles
} from 'lucide-react';

// --- CONFIGURATION ---
const BACKEND_URL = "http://localhost:3000"; 

// --- MOCK WEATHER SERVICE ---
const getWeatherRisk = (city) => {
  const lowerCity = city ? city.toLowerCase() : '';
  if (lowerCity.includes('oklahoma') || lowerCity.includes('dallas') || lowerCity.includes('kansas')) {
    return { condition: 'Severe Storms', risk: 'Hail Damage', icon: CloudRain, color: 'text-purple-600 bg-purple-50', advice: 'High hail probability. Review auto comprehensive coverage.' };
  }
  if (lowerCity.includes('miami') || lowerCity.includes('tampa') || lowerCity.includes('orleans')) {
    return { condition: 'Hurricane Season', risk: 'Flood/Wind', icon: Wind, color: 'text-blue-600 bg-blue-50', advice: 'Flood zone alert. Flood insurance is likely mandatory.' };
  }
  if (lowerCity.includes('california') || lowerCity.includes('los angeles') || lowerCity.includes('francisco')) {
    return { condition: 'Dry/Arid', risk: 'Wildfire', icon: Sun, color: 'text-orange-600 bg-orange-50', advice: 'High fire risk area. Check homeowner policy for fire exclusions.' };
  }
  if (lowerCity.includes('seattle') || lowerCity.includes('london')) {
    return { condition: 'Constant Rain', risk: 'Slippery Roads', icon: Umbrella, color: 'text-cyan-600 bg-cyan-50', advice: 'Increased accident risk. Ensure collision deductibles are manageable.' };
  }
  return { condition: 'Clear', risk: 'Low', icon: Sun, color: 'text-yellow-600 bg-yellow-50', advice: 'Conditions are stable. Standard coverage reviews recommended.' };
};

// --- COMPONENTS ---

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
          isUser ? 'bg-blue-600' : isError ? 'bg-red-500' : 'bg-white border border-gray-200'
        }`}>
          {isUser ? <User size={18} className="text-white" /> : <Shield size={18} className="text-blue-600" />}
        </div>
        
        {/* Bubble */}
        <div className={`p-5 rounded-2xl shadow-sm text-sm leading-7 ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : isError
              ? 'bg-red-50 border border-red-100 text-red-600 rounded-tl-none'
              : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
        }`}>
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-2 last:mb-0">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeatherCard = ({ location }) => {
  const weather = getWeatherRisk(location);
  const Icon = weather.icon;

  return (
    <div className="bg-white border border-gray-100 p-5 rounded-xl mb-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin size={14} /> Local Risk Assessment
        </h3>
        <span className="text-xs bg-gray-50 px-2 py-1 rounded-md text-gray-600 font-medium border border-gray-200">
          {location || "Unknown Location"}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${weather.color}`}>
          <Icon size={28} />
        </div>
        <div>
          <p className="text-base font-bold text-gray-800">{weather.condition}</p>
          <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5">
            <AlertTriangle size={12} /> Risk: {weather.risk}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-500 italic leading-relaxed">
          "{weather.advice}"
        </p>
      </div>
    </div>
  );
};

export default function App() {
  // --- STATE ---
  const [messages, setMessages] = useState([
    { role: 'system', content: "Hello! I'm InsureGuide AI. I can help simplify your policies, recommend coverage, or check for local risks like hail or floods. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileMobile, setShowProfileMobile] = useState(false);
  
  // User Profile State
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    location: 'Oklahoma City, OK',
    age: 34,
    hasCar: true,
    hasHome: true,
    policyType: 'Comprehensive'
  });

  const messagesEndRef = useRef(null);

  // --- SCROLL TO BOTTOM ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- HANDLERS ---
  
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleAsset = (asset) => {
    setProfile(prev => ({ ...prev, [asset]: !prev[asset] }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 1. Prepare Context
      const weatherData = getWeatherRisk(profile.location);
      
      const systemContext = `
        You are an expert Insurance Consultant AI. 
        
        User Profile Context:
        - Name: ${profile.name}
        - Age: ${profile.age}
        - Location: ${profile.location}
        - Assets: ${profile.hasCar ? 'Car' : 'No Car'}, ${profile.hasHome ? 'Homeowner' : 'Renter'}
        
        Current Local Risk Data for ${profile.location}:
        - Condition: ${weatherData.condition}
        - Specific Risk: ${weatherData.risk}
        - Automated Advice: ${weatherData.advice}

        INSTRUCTIONS:
        1. Use the User Profile to personalize advice.
        2. CRITICAL: You MUST reference the "Current Local Risk Data" above.
        3. Simplify any complex insurance terms you use.
        4. Keep the tone professional, empathetic, and trustworthy.
      `;

      // 2. SEND TO YOUR LOCAL BACKEND
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          context: systemContext
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

    } catch (error) {
      console.error("Error calling Backend:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Connection Error: ${error.message}. Is your backend server running on port 3000?`,
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* --- MOBILE MENU OVERLAY --- */}
      {showProfileMobile && (
        <div className="absolute inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setShowProfileMobile(false)} />
      )}

      {/* --- LEFT PANEL: PROFILE & SETTINGS --- */}
      <aside className={`
        absolute md:relative z-50 w-80 bg-white h-full border-r border-slate-200 flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out
        ${showProfileMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3 text-blue-700">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">SurePolicy AI</h1>
          </div>
          <button onClick={() => setShowProfileMobile(false)} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Weather Widget */}
          <WeatherCard location={profile.location} />

          <div className="flex items-center gap-2 mb-4 mt-8">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Profile</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={profile.name} 
                onChange={handleProfileChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current Location</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="location" 
                  value={profile.location} 
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
                <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={profile.age} 
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-500 mb-3">Assets & Coverage</label>
              <div className="space-y-2.5">
                <button 
                  onClick={() => toggleAsset('hasCar')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all shadow-sm ${
                    profile.hasCar ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${profile.hasCar ? 'bg-blue-200' : 'bg-slate-100'}`}>
                      <Car size={16} />
                    </div>
                    <span className="text-sm font-medium">Vehicle Owner</span>
                  </div>
                  {profile.hasCar && <CheckCircle2 size={18} className="text-blue-600" />}
                </button>

                <button 
                  onClick={() => toggleAsset('hasHome')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all shadow-sm ${
                    profile.hasHome ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <div className={`p-1.5 rounded-md ${profile.hasHome ? 'bg-blue-200' : 'bg-slate-100'}`}>
                      <Home size={16} />
                    </div>
                    <span className="text-sm font-medium">Home Owner</span>
                  </div>
                  {profile.hasHome && <CheckCircle2 size={18} className="text-blue-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Sparkles size={14} className="text-blue-400" />
            <span>Powered by Gemini 1.5 Flash</span>
          </div>
        </div>
      </aside>

      {/* --- RIGHT PANEL: CHAT INTERFACE --- */}
      <main className="flex-1 flex flex-col bg-slate-50/50 relative">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <Shield size={24} />
            <span>SurePolicy AI</span>
          </div>
          <button onClick={() => setShowProfileMobile(true)} className="p-2 bg-slate-100 rounded-full text-slate-600">
            <Menu size={20} />
          </button>
        </header>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="max-w-3xl mx-auto pb-4">
            
            {messages.length === 0 && (
              <div className="text-center py-24 opacity-50">
                <div className="bg-white p-6 rounded-full inline-block mb-4 shadow-sm">
                  <Shield size={48} className="text-blue-200" />
                </div>
                <p className="text-slate-500 text-lg">Ready to analyze your insurance needs.</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {isLoading && (
              <div className="flex w-full justify-start animate-pulse mb-6">
                 <div className="flex max-w-[75%] gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Shield size={18} className="text-blue-600" />
                    </div>
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl rounded-tl-none flex items-center gap-3 text-slate-500 text-sm shadow-sm">
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                      <span>Analyzing policy data...</span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 md:p-6 border-t border-slate-200 shadow-lg z-20">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-3">
              <div className="relative flex-1 group">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Ask about coverage, deductibles, or policy recommendations..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-12 py-4 max-h-32 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm shadow-inner transition-all group-hover:bg-white"
                  rows={1}
                />
                <div className="absolute right-3 bottom-3">
                </div>
              </div>
              <button 
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`p-4 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                  !inputValue.trim() || isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
                }`}
              >
                <Send size={20} className={isLoading ? 'opacity-0' : ''} />
                {isLoading && <div className="absolute"><Loader2 size={20} className="animate-spin" /></div>}
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-400 mt-3">
              SurePolicy AI assesses risks based on the location in your sidebar profile.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}