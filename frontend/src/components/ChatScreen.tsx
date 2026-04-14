import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Send, Phone, MapPin, MoreVertical, ShieldCheck, MessageCircle } from 'lucide-react';

export default function ChatScreen() {
  const { navParam, rides, users, chatMessages, sendMessage, currentUser, navigate } = useAppStore();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const ride = rides.find(r => r.id === navParam);
  if (!ride || !currentUser) return null;

  const isPoster = ride.poster === currentUser.id;
  const otherUserId = isPoster 
    ? chatMessages.find(m => m.ride === ride.id && m.sender !== currentUser.id)?.sender 
    : ride.poster;
    
  const otherUser = users.find(u => u.id === otherUserId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!text.trim() || !otherUserId) return;
    sendMessage(ride.id, otherUserId, text.trim());
    setText('');
  };

  const messages = chatMessages.filter(m => m.ride === ride.id);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Premium Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('rideDetail', ride.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 active:scale-90 transition hover:bg-gray-200">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-extrabold border border-indigo-100 shadow-sm overflow-hidden">
                {otherUser?.full_name?.[0] || '?'}
             </div>
             <div>
                <div className="flex items-center gap-1.5 leading-none mb-0.5">
                   <p className="font-extrabold text-gray-800 text-sm tracking-tight">{otherUser?.full_name || 'Driver'}</p>
                   <ShieldCheck size={12} className="text-green-500" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Online</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-100 active:scale-95 transition">
              <Phone size={18} />
           </button>
           <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-gray-600 active:scale-95 transition">
              <MoreVertical size={18} />
           </button>
        </div>
      </div>

      {/* Ride Quick Context */}
      <div className="bg-indigo-50/30 px-4 py-3 flex items-center justify-between border-b border-indigo-100/30">
         <div className="flex items-center gap-2">
            <MapPin size={14} className="text-indigo-400" />
            <p className="text-[11px] font-bold text-gray-500 truncate max-w-[200px]">{ride.from_location} → {ride.to_location}</p>
         </div>
         <button onClick={() => navigate('rideDetail', ride.id)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white/60 px-2 py-1 rounded-lg backdrop-blur-sm border border-indigo-100/50">View Details</button>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-12 opacity-40">
             <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <MessageCircle color="gray" size={32} />
             </div>
             <div className="text-center">
                <p className="text-gray-600 font-bold">Start the conversation</p>
                <p className="text-xs text-gray-400 mt-1">Be polite and stay safe!</p>
             </div>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.sender === currentUser.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-3xl text-sm font-bold shadow-sm ${
                  isMe 
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  <p className="leading-relaxed">{m.text}</p>
                  <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end text-white/50' : 'text-gray-300'}`}>
                    <span className="text-[9px] font-black">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-100 pb-8">
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 pr-1.5 rounded-[28px] border-2 border-gray-100 focus-within:border-indigo-200 transition-all">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-gray-800 focus:outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              text.trim() ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-100 active:scale-90 scale-100' : 'bg-gray-200 text-white scale-90'
            }`}
          >
            <Send size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
