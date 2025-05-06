// --- START OF FILE chat.jsx ---

"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Helmet } from "react-helmet" // Added Helmet
import { motion, AnimatePresence } from "framer-motion" // Added Framer Motion
import {
  Send,
  Loader2,
  Search,
  Phone,
  Video,
  Info,
  Smile,
  ImageIcon,
  Paperclip,
  ChevronLeft,
  X,
  Check,
  Clock,
  MessageCircle,
} from "lucide-react"
import baseUrl from "../config/Baseurl"
import { getToken, getUserRole, logout } from "../utils/auth"
import Navbar from "./Navbar" // Ensure Navbar component exists and path is correct
import { jwtDecode } from "jwt-decode"

function Chat() {
  // --- State Variables (Unchanged) ---
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState({
    startups: true,
    messages: false,
    sending: false,
  })
  const [error, setError] = useState(null) // General errors + startup/message loading errors
  const [sendError, setSendError] = useState(null); // Specific errors for send/upload actions
  const [chatPartner, setChatPartner] = useState(null)
  const [startups, setStartups] = useState([])
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { displayName } = useParams()
  const [startupsStatus, setStartupsStatus] = useState([])
  const [unreadMessages, setUnreadMessages] = useState({})
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")


  // --- Hooks and Data Fetching (Logic Unchanged) ---
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && chatPartner) {
        setShowSidebar(false)
      } else if (!mobile) {
        setShowSidebar(true)
      }
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [chatPartner])

  useEffect(() => {
    const userRole = getUserRole()
    const token = getToken()
    if (!token || (userRole !== "startup" && userRole !== "admin")) {
      navigate("/login")
      return
    }
    try {
      const decodedToken = jwtDecode(token)
      const userDisplayName = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decodedToken.name || "Unknown User";
      setCurrentUserDisplayName(userDisplayName)
      setShowSidebar(window.innerWidth >= 768)
    } catch (err) { console.error("Error decoding token:", err); logout(); navigate("/login") }
  }, [navigate])

  useEffect(() => {
    const fetchStartups = async () => {
      if (!currentUserDisplayName) return;
      setLoading((prev) => ({ ...prev, startups: true }))
      setError(null)
      try {
        const token = getToken()
        const response = await fetch(`${baseUrl}/api/Messages/conversable-startups`, { headers: { ...(token && { Authorization: `Bearer ${token.trim()}` }) } })
        if (!response.ok) { if (response.status === 401) { logout(); navigate("/login"); return; } throw new Error(`HTTP ${response.status} fetching startups`) }
        const data = await response.json(); setStartups(Array.isArray(data) ? data : [])
      } catch (err) { console.error("Error fetching startups:", err); setError("Failed to load startups."); setStartups([]); }
      finally { setLoading((prev) => ({ ...prev, startups: false })) }
    }
    fetchStartups()
  }, [currentUserDisplayName, navigate])

  useEffect(() => {
      if (!currentUserDisplayName || startups.length === 0) return;
      if (displayName) {
          const currentPartner = startups.find((s) => s.displayName === displayName);
          if (currentPartner) {
              if (chatPartner !== currentPartner.displayName) {
                  setChatPartner(currentPartner.displayName); setSelectedStartup(currentPartner);
                  fetchMessages(currentPartner.displayName); markMessagesAsRead(currentPartner.displayName);
                   if (isMobile) setShowSidebar(false);
              }
          } else {
              console.warn(`Startup "${displayName}" from URL not found.`); setError(`Startup "${displayName}" not found.`);
              setChatPartner(null); setSelectedStartup(null); setMessages([]); navigate("/chat", { replace: true });
          }
      } else {
            if (chatPartner !== null || selectedStartup !== null) {
                setChatPartner(null); setSelectedStartup(null); setMessages([]); setError(null);
                if (!isMobile) setShowSidebar(true);
            }
      }
  }, [displayName, startups, currentUserDisplayName, isMobile, navigate, chatPartner]);

  useEffect(() => { if (messages.length > 0) scrollToBottom(); }, [messages]);

  useEffect(() => { if (chatPartner && messageInputRef.current && !loading.messages) { setTimeout(() => messageInputRef.current?.focus(), 100); } }, [chatPartner, loading.messages]);

  useEffect(() => {
    let intervalId = null;
    const fetchStartupsStatus = async () => {
      try {
        const token = getToken(); if (!token) return;
        const response = await fetch(`${baseUrl}/api/Auth/startups/status`, { headers: { Authorization: `Bearer ${token.trim()}` } })
        if (response.ok) { setStartupsStatus(await response.json()) }
      } catch (error) { console.error("Error loading startup statuses:", error); } // Keep console noise low
    }
    fetchStartupsStatus(); intervalId = setInterval(fetchStartupsStatus, 60000); return () => clearInterval(intervalId);
  }, [])

  useEffect(() => {
     let intervalId = null;
    const checkUnreadMessages = async () => {
      try {
        const token = getToken(); if (!token) return;
        const response = await fetch(`${baseUrl}/api/Messages/my-unread-summary`, { headers: { Authorization: `Bearer ${token.trim()}` } });
        if (response.ok) {
          const summaryData = await response.json();
          const unreadCounts = summaryData.reduce((acc, item) => { acc[item.senderName] = item.unreadCount; return acc; }, {});
           if (JSON.stringify(unreadCounts) !== JSON.stringify(unreadMessages)) { setUnreadMessages(unreadCounts); }
        }
      } catch (error) { console.error('Error checking unread messages:', error); } // Keep console noise low
    };
    const handleUnreadUpdate = () => checkUnreadMessages();
    window.addEventListener('unreadCountChanged', handleUnreadUpdate);
    checkUnreadMessages(); intervalId = setInterval(checkUnreadMessages, 15000);
    return () => { clearInterval(intervalId); window.removeEventListener('unreadCountChanged', handleUnreadUpdate); };
  }, [unreadMessages]);


  // --- Helper Functions (Logic Unchanged) ---
  const getStartupStatus = (startupName) => { const startup = startupsStatus.find((s) => s.name === startupName); return startup?.status === 'En ligne' ? 'Online' : 'Offline'; } // Changed to English
  const scrollToBottom = () => { setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }

  const fetchMessages = async (partnerDisplayName) => {
    if (!partnerDisplayName) return;
    setLoading((prev) => ({ ...prev, messages: true })); setError(null); setSendError(null); setMessages([]);
    try {
      const token = getToken(); if (!token) { logout(); navigate("/login"); return; }
      const response = await fetch(`${baseUrl}/api/Messages/with/${partnerDisplayName}`, { method: "GET", headers: { Accept: "application/json", Authorization: `Bearer ${token.trim()}` } });
      if (!response.ok) { if (response.status === 401) { logout(); navigate("/login"); return; } throw new Error(`HTTP ${response.status} fetching messages`); }
      const data = await response.json(); setMessages(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Error fetching messages:", err); setError("Failed to load messages."); setMessages([]); }
    finally { setLoading((prev) => ({ ...prev, messages: false })); }
  }

  const markMessagesAsRead = async (senderDisplayName) => {
      if (!senderDisplayName || !unreadMessages[senderDisplayName]) return;
      try {
          const token = getToken(); if (!token) return;
          const response = await fetch(`${baseUrl}/api/Messages/mark-as-read`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.trim()}` }, body: JSON.stringify({ senderDisplayName }) });
          if (response.ok) { setUnreadMessages(prev => ({...prev, [senderDisplayName]: 0})); window.dispatchEvent(new CustomEvent('unreadCountChanged')); }
      } catch (error) { console.error("Error marking messages as read:", error); }
  };

  const sendMessage = async ({ content = "", imageUrl = null }) => {
    const trimmedContent = content.trim();
    if ((!trimmedContent && !imageUrl) || !chatPartner || !currentUserDisplayName) { if (!chatPartner) setSendError("Cannot send message. Select a chat partner."); return; }
    setLoading((prev) => ({ ...prev, sending: true })); setSendError(null);
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage = { id: optimisticId, senderDisplayName: currentUserDisplayName, receiverDisplayName: chatPartner, content: trimmedContent, timestamp: new Date().toISOString(), imageUrl, isOptimistic: true };
    setMessages((prev) => [...prev, optimisticMessage]); setNewMessage(""); scrollToBottom();
    try {
      const token = getToken(); if (!token) { logout(); navigate("/login"); setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId)); return; }
      const messagePayload = { receiverDisplayName: chatPartner, content: trimmedContent, imageUrl };
      const response = await fetch(`${baseUrl}/api/Messages/send`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token.trim()}` }, body: JSON.stringify(messagePayload) });
      if (!response.ok) { if (response.status === 401) { logout(); navigate("/login"); setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId)); return; } const errorData = await response.json().catch(() => ({ message: "Failed to send message." })); throw new Error(errorData.message || `HTTP ${response.status}`); }
      const sentMessageData = await response.json(); if (!sentMessageData?.sentMessage) throw new Error("Invalid response structure from server after sending message.");
      setMessages((prev) => prev.map((msg) => msg.id === optimisticId ? { ...sentMessageData.sentMessage, isOptimistic: false } : msg));
    } catch (err) { console.error("Error sending message:", err); setSendError(`Failed to send: ${err.message}`); setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId)); }
    finally { setLoading((prev) => ({ ...prev, sending: false })); }
  };

  const handleSendMessageSubmit = (e) => { e.preventDefault(); sendMessage({ content: newMessage }); };
  const handleImageUploadClick = () => { if (!isUploadingImage && !loading.sending) fileInputRef.current?.click(); };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !chatPartner) { if (!chatPartner) setSendError("Please select a chat first."); return; }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]; if (!allowedTypes.includes(file.type)) { setSendError("Invalid file type (JPG, PNG, GIF only)."); return; }
    if (file.size > 5 * 1024 * 1024) { setSendError("Max file size is 5MB."); return; }
    setIsUploadingImage(true); setSendError(null); const formData = new FormData(); formData.append('File', file);
    try {
        const token = getToken(); if (!token) { logout(); navigate("/login"); setIsUploadingImage(false); return; }
        const response = await fetch(`${baseUrl}/api/Messages/upload-image`, { method: 'POST', headers: { 'Authorization': `Bearer ${token.trim()}` }, body: formData });
        if (!response.ok) { if (response.status === 401) { logout(); navigate("/login"); } const errorData = await response.json().catch(() => ({ message: "Upload failed." })); throw new Error(errorData.message || `HTTP ${response.status}`); }
        const result = await response.json(); if (!result?.imageUrl) throw new Error("Invalid upload response.");
        await sendMessage({ imageUrl: result.imageUrl, content: "" });
    } catch (err) { console.error("Error uploading image:", err); setSendError(`Upload failed: ${err.message}`); }
    finally { setIsUploadingImage(false); if (fileInputRef.current) fileInputRef.current.value = null; }
  };

  const selectStartupFromSidebar = (startup) => {
    if (!startup || startup.displayName === chatPartner) return;
    setMessages([]); setLoading(prev => ({ ...prev, messages: true })); setError(null); setSendError(null);
    navigate(`/chat/${startup.displayName}`);
  };

  const formatTime = (dateString) => { if (!dateString) return ""; try { return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch (e) { return "Invalid Time"; } }
  const formatDate = (dateString) => { if (!dateString) return ""; try { const date = new Date(dateString); const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1); const isToday = date.toDateString() === today.toDateString(); const isYesterday = date.toDateString() === yesterday.toDateString(); if (isToday) return "Today"; if (isYesterday) return "Yesterday"; return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return "Invalid Date"; } };
  const toggleSidebar = () => { setShowSidebar(!showSidebar); };

  const getStartupAvatar = (startup) => {
    if (!startup) return '/placeholder.svg';
    if (startup.logoPath?.trim()) {
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const cleanLogoPath = startup.logoPath.startsWith('/') ? startup.logoPath : `/${startup.logoPath}`;
      const fullUrl = `${cleanBaseUrl}${cleanLogoPath}`;
      if (fullUrl.match(/\.(jpeg|jpg|gif|png|svg)$/i)) return fullUrl;
    }
    const nameParam = encodeURIComponent(startup.displayName || "?"); const color = getRandomColor(startup.displayName).replace("#", "");
    return `https://ui-avatars.com/api/?name=${nameParam}&background=${color}&color=fff&size=128&bold=true`;
  };

  const getRandomColor = (name) => {
    if (!name) return "#6366f1";
    const colors = ["#f43f5e","#ec4899","#d946ef","#a855f7","#8b5cf6","#6366f1","#3b82f6","#0ea5e9","#06b6d4","#14b8a6","#10b981","#22c55e","#84cc16","#eab308","#f59e0b","#f97316"];
    let hash = 0; for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; }
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredStartups = startups.filter(startup => startup.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => { const unreadA = unreadMessages[a.displayName] || 0; const unreadB = unreadMessages[b.displayName] || 0; if (unreadA !== unreadB) { return unreadB - unreadA; } return (a.displayName || '').localeCompare(b.displayName || ''); });


  // --- Animation Variants (Unchanged) ---
  const sidebarVariants = { open: { x: 0 }, closed: { x: "-100%" } };
  const mobileOverlayVariants = { visible: { opacity: 1, pointerEvents: 'auto' }, hidden: { opacity: 0, pointerEvents: 'none' } };

  // --- JSX Rendering (Applying Design) ---
  return (
    <>
      {/* Navbar is assumed to be styled separately */}
      <Navbar />

      {/* --- Root Structure (Dark Theme) --- */}
      <div className="relative w-full font-sans bg-gray-950 flex flex-col pt-16" style={{ height: 'calc(100vh)' }}>
        <Helmet>
          <title>{chatPartner ? `${selectedStartup?.displayName} - Chat` : "Chat"} - VenturesRoom</title>
          <meta name="description" content="Chat with startups on VenturesRoom." />
        </Helmet>

        {/* --- Background --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp" alt="Abstract background" className="h-full w-full object-cover filter blur-xl scale-110" loading="lazy"/>
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
        </div>

        {/* Mobile Overlay */}
         <AnimatePresence>
          {isMobile && showSidebar && (
            <motion.div variants={mobileOverlayVariants} initial="hidden" animate="visible" exit="hidden" transition={{ duration: 0.3 }} onClick={toggleSidebar} className="fixed inset-0 z-10 bg-black/60 md:hidden" aria-hidden="true"/>
          )}
        </AnimatePresence>

        {/* --- Main Content Area (Flex Container) --- */}
        <div className="relative z-10 flex flex-1 overflow-hidden text-white">

            {/* --- Startups Sidebar (Glassmorphism) --- */}
            <motion.aside
              className={` ${isMobile ? "absolute top-0 left-0 z-20 h-full w-[85%] max-w-xs" : "relative w-80 flex-shrink-0"}
                bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-lg border-r border-white/20 flex flex-col shadow-xl`}
              variants={sidebarVariants} initial={isMobile ? "closed" : "open"} animate={showSidebar ? "open" : "closed"} transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              aria-label="Conversations list" style={{ transform: !isMobile ? 'translateX(0)' : undefined }}
            >
               {/* Sidebar Header */}
               <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                 <h2 className="text-lg font-semibold text-white">Messages</h2>
                 {isMobile && ( <button onClick={toggleSidebar} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close sidebar"> <X className="h-5 w-5 text-gray-300" /> </button> )}
               </div>

               {/* Search Bar */}
               <div className="p-3 border-b border-white/10 flex-shrink-0">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                   <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-input-dark pl-9 pr-3 py-1.5 !rounded-full text-sm" aria-label="Search conversations" />
                 </div>
               </div>

               {/* Startup List */}
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {loading.startups ? ( <div className="flex items-center justify-center h-32"> <Loader2 className="h-6 w-6 text-blue-400 animate-spin" /> </div>
                 ) : error && !startups.length ? ( <div className="p-4 text-center text-red-300 text-sm">{error}</div>
                 ) : filteredStartups.length === 0 ? ( <div className="p-6 text-center text-gray-400 text-sm">{searchQuery ? "No matches found." : "No chats yet."}</div>
                 ) : (
                   <ul role="listbox" aria-label="Select a conversation">
                     {filteredStartups.map((startup) => (
                       <li key={startup.id} role="option" aria-selected={chatPartner === startup.displayName}>
                         <button onClick={() => selectStartupFromSidebar(startup)} className={`w-full p-3 hover:bg-white/10 flex items-center space-x-3 text-left relative transition-colors duration-150 ${ chatPartner === startup.displayName ? "bg-blue-900/60" : "" }`}>
                           {/* Avatar */}
                           <div className="flex-shrink-0 relative">
                             <img src={getStartupAvatar(startup)} alt="" className="h-10 w-10 rounded-full object-cover border border-white/10 bg-gray-700" loading="lazy" />
                             <span className={`absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full ring-2 ring-gray-900 ${getStartupStatus(startup.displayName) === 'Online' ? 'bg-green-400' : 'bg-gray-500'}`} title={getStartupStatus(startup.displayName)}></span> {/* Adjusted ring color */}
                           </div>
                           {/* Info */}
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-white truncate">{startup.displayName}</p>
                             <p className={`text-xs ${getStartupStatus(startup.displayName) === 'Online' ? 'text-green-400' : 'text-gray-400'}`}>{getStartupStatus(startup.displayName)}</p>
                           </div>
                           {/* Unread Badge */}
                           {unreadMessages[startup.displayName] > 0 && ( <div className="ml-auto flex-shrink-0"><span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center shadow-md">{unreadMessages[startup.displayName] > 9 ? '9+' : unreadMessages[startup.displayName]}</span></div> )}
                         </button>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
            </motion.aside>

            {/* --- Main Chat Area (Subtle Dark BG) --- */}
            <main className="flex-1 flex flex-col bg-black/10 overflow-hidden">
              {chatPartner && selectedStartup ? (
                <>
                  {/* Chat Header (Glassmorphism) */}
                  <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border-b border-white/10 p-3 flex items-center justify-between shadow-sm flex-shrink-0">
                     <div className="flex items-center min-w-0">
                       {isMobile && ( <button onClick={toggleSidebar} className="mr-2 p-1.5 rounded-full hover:bg-white/10" aria-label="Show conversations list"> <ChevronLeft className="h-5 w-5 text-gray-300" /> </button> )}
                       <div className="flex-shrink-0 relative mr-3">
                         <img src={getStartupAvatar(selectedStartup)} alt="" className="h-10 w-10 rounded-full object-cover border border-white/10 bg-gray-700" />
                         <span className={`absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full ring-2 ring-gray-850 ${getStartupStatus(selectedStartup.displayName) === 'Online' ? 'bg-green-400' : 'bg-gray-500'}`}></span> {/* Adjusted ring color */}
                       </div>
                       <div className="min-w-0 flex-1">
                         <h2 className="text-base font-semibold text-white truncate">{selectedStartup.displayName}</h2>
                         <p className="text-xs text-gray-400 truncate">{getStartupStatus(selectedStartup.displayName)}</p>
                       </div>
                     </div>
                  </motion.header>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar" role="log" aria-live="polite">
                    {loading.messages && messages.length === 0 ? ( <div className="flex flex-col justify-center items-center h-full text-gray-400"><Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-400" /><span>Loading...</span></div>
                     ) : error && messages.length === 0 && error.startsWith("Failed to load messages") ? ( <div className="text-center p-4 text-red-300 text-sm">{error}</div>
                     ) : messages.length === 0 && !loading.messages ? ( <div className="text-center text-gray-400 mt-10 px-4 text-sm">No messages yet with {selectedStartup.displayName}. 👋</div>
                    ) : (
                      <>
                        {messages.map((message, index) => {
                           const showDate = index === 0 || formatDate(messages[index - 1]?.timestamp) !== formatDate(message.timestamp);
                           const isCurrentUser = message.senderDisplayName === currentUserDisplayName;
                           const isGroupStart = index === 0 || message.senderDisplayName !== messages[index - 1]?.senderDisplayName || (message.timestamp && messages[index-1]?.timestamp && new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 3 * 60 * 1000);
                           const isGroupEnd = index === messages.length - 1 || message.senderDisplayName !== messages[index + 1]?.senderDisplayName || (messages[index+1]?.timestamp && message.timestamp && new Date(messages[index + 1].timestamp).getTime() - new Date(message.timestamp).getTime() > 3 * 60 * 1000);

                          return (
                            <div key={message.id || `msg-${index}`}>
                              {showDate && ( <div className="flex justify-center my-3"> <span className="px-2.5 py-1 bg-black/20 backdrop-blur-sm rounded-full text-xs font-medium text-gray-300 shadow-sm">{formatDate(message.timestamp)}</span> </div> )}
                              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} ${isGroupStart ? "mt-2" : "mt-0.5"}`}>
                                {/* Avatar */}
                                {!isCurrentUser && isGroupEnd && <img src={getStartupAvatar(selectedStartup)} alt="" className="h-7 w-7 rounded-full object-cover mr-2 flex-shrink-0 self-end mb-0.5 shadow bg-gray-700 border border-white/10" loading="lazy" />}
                                {!isCurrentUser && !isGroupEnd && <div className="w-7 mr-2 flex-shrink-0"></div>}
                                {/* Message Bubble */}
                                <div className={`max-w-[75%] px-3 py-1.5 text-sm relative group shadow-md ${ isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-700/60 text-gray-100' } ${ isGroupStart && isGroupEnd ? "rounded-2xl" : isCurrentUser ? (isGroupStart ? "rounded-t-2xl rounded-bl-2xl" : isGroupEnd ? "rounded-b-2xl rounded-tl-2xl" : "rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-md") : (isGroupStart ? "rounded-t-2xl rounded-br-2xl" : isGroupEnd ? "rounded-b-2xl rounded-tr-2xl" : "rounded-tr-2xl rounded-tl-md rounded-br-2xl rounded-bl-md") }`}>
                                   {/* Image */}
                                  {message.imageUrl && <img src={message.imageUrl.startsWith('http') ? message.imageUrl : `${baseUrl}${message.imageUrl.startsWith('/') ? '' : '/'}${message.imageUrl}`} alt="Uploaded content" className="max-w-[200px] sm:max-w-[250px] rounded-lg mb-1 cursor-pointer shadow-md object-contain bg-gray-800/50 border border-white/10" loading="lazy" onClick={() => window.open(message.imageUrl.startsWith('http') ? message.imageUrl : `${baseUrl}${message.imageUrl.startsWith('/') ? '' : '/'}${message.imageUrl}`, '_blank')} />}
                                   {/* Text */}
                                  {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                                   {/* Timestamp/Status */}
                                  <div className={`text-[10px] mt-1 flex items-center ${isCurrentUser ? "justify-end text-blue-200/80" : "justify-start text-gray-400"}`}>
                                    {formatTime(message.timestamp)}
                                    {isCurrentUser && <span className="ml-1.5 flex items-center" title={message.isOptimistic ? "Sending..." : "Sent"}>{message.isOptimistic ? <Clock className="h-3 w-3 opacity-70 animate-pulse" /> : <Check className="h-3 w-3" />}</span>}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* --- Message Input Area (Glassmorphism Footer) --- */}
                  <footer className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border-t border-white/10 p-3 flex-shrink-0 shadow-inner">
                     {sendError && <p className="text-xs text-red-300 mb-2 px-1">{sendError}</p>}
                     <form onSubmit={handleSendMessageSubmit} className="flex items-center space-x-2">
                       <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/png, image/jpeg, image/gif" style={{ display: "none" }} disabled={isUploadingImage || loading.sending} aria-hidden="true" />
                       {/* Image Button */}
                       <button type="button" onClick={handleImageUploadClick} disabled={isUploadingImage || loading.sending} className="p-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0" title="Send Image" aria-label="Attach image">
                         {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin text-blue-400"/> : <ImageIcon className="h-5 w-5" />}
                       </button>
                       {/* Text Input */}
                       <input ref={messageInputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="form-input-dark flex-1 !rounded-full !py-2 !px-4 text-sm disabled:opacity-70" disabled={isUploadingImage || loading.sending} autoComplete="off" aria-label="Message input" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendMessageSubmit(e); }} />
                       {/* Send Button */}
                       <button type="submit" disabled={isUploadingImage || loading.sending || !newMessage.trim()} className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 w-10 h-10 shadow-sm transition-colors" aria-label="Send message">
                         {loading.sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                       </button>
                     </form>
                  </footer>
                </>
              ) : (
                // Placeholder (Dark Theme)
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                   {loading.startups ? ( <> <Loader2 className="h-12 w-12 animate-spin mb-4 text-blue-400" /> <p>Loading Chats...</p> </>
                    ) : error ? ( <> <X className="h-12 w-12 text-red-400 mb-4" /> <h2 className="text-xl font-semibold text-red-300 mb-2">Error</h2> <p>{error}</p> </>
                    ) : ( <> <MessageCircle className="h-16 w-16 text-gray-500 mb-4" /> <h2 className="text-xl font-semibold text-gray-300 mb-2">Select a Chat</h2> <p>Choose a startup to start messaging.</p> </> )}
                </div>
              )}
            </main>
        </div>
      </div>

       {/* --- Utility Styles (Dark Theme) --- */}
      <style jsx global>{`
         .form-input-dark { display: block; width: 100%; padding-top: 0.75rem; padding-bottom: 0.75rem; padding-right: 0.75rem; border-width: 1px; border-color: rgba(255, 255, 255, 0.2); border-radius: 0.5rem; background-color: rgba(255, 255, 255, 0.05); color: white; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; outline: none; }
         .form-input-dark::placeholder { color: #9ca3af; }
         .form-input-dark:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
         .form-input-dark.pl-9 { padding-left: 2.25rem; }
         .form-input-dark.\\!rounded-full { border-radius: 9999px; }
         .form-input-dark.\\!py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
         .form-input-dark.\\!px-4 { padding-left: 1rem; padding-right: 1rem; }
         .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
         .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05); }
         input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.05) inset !important; -webkit-text-fill-color: #ffffff !important; caret-color: #ffffff !important; transition: background-color 5000s ease-in-out 0s; }
      `}</style>
    </>
  )
}

export default Chat;
// --- END OF FILE chat.jsx ---