import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { BiSend } from 'react-icons/bi';
import { BsChatDots } from 'react-icons/bs';
import { FaLightbulb } from 'react-icons/fa';
import { useOffers } from '../offers/context/offers-context';
import { useTenant } from '@/context/TenantContext';
import { apiClient } from '@/config/api';

interface Message {
  type: 'user' | 'bot';
  content: string;
  suggestions?: string[];
}

// Function to format potential markdown to plain text
const formatResponseText = (text: string): string => {
    // Replace markdown headings with plain text
    let formatted = text.replace(/^#{1,6}\s+(.+)$/gm, (_, title) => title);
    
    // Replace bullet points with plain dash bullets
    formatted = formatted.replace(/^\*\s+(.+)$/gm, '• $1');
    formatted = formatted.replace(/^-\s+(.+)$/gm, '• $1');

    // Replace numbered lists with plain text
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '$1');
    
    // Replace bold text
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '$1');
    
    // Replace italic text
    formatted = formatted.replace(/\*(.+?)\*/g, '$1');
    
    // Replace code blocks with plain text
    formatted = formatted.replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```(?:.*\n)?/g, '').replace(/```/g, '');
    });
    
    // Replace inline code with plain text
    formatted = formatted.replace(/`(.+?)`/g, '$1');
    
    return formatted;
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { 
            type: 'bot', 
            content: "Hi there! 👋 I'm OffersHub AI, a specialized assistant for the OffersHub platform. How can I help you today?",
            suggestions: [
                "What is OffersHub?",
                "List available offers",
                "Show active campaigns"
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Access offers data and context
    const { primaryRole } = useOffers();
    const { currentTenant } = useTenant();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSuggestionClick = (suggestion: string) => {
        setInputMessage(suggestion);
        handleSubmit(null, suggestion);
    };

    const handleSubmit = async (e: FormEvent | null, suggestionText?: string) => {
        if (e) e.preventDefault();
        
        const messageText = suggestionText || inputMessage;
        if (!messageText.trim()) return;

        const userMessage: Message = { type: 'user', content: messageText.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Prepare the conversation history
            const conversationHistory = messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

            // Add the new user message
            conversationHistory.push({
                role: 'user',
                content: userMessage.content
            });

            // Call the backend AI chat API using apiClient
            const response = await apiClient.post(`/ai/chat`, {
                messages: conversationHistory,
                tenant_name: currentTenant?.name
            });

            const { message, suggestions } = response.data;
            
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: message.content,
                suggestions: suggestions || []
            }]);
        } catch (error) {
            console.error('Error calling AI service:', error);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-7 right-7 z-50 ">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-16 right-0 w-[450px] h-[600px] bg-white/95 dark:bg-slate-900/95 
                            rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 
                            backdrop-blur-sm flex flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 
                            bg-gradient-to-r from-slate-50 to-slate-100 
                            dark:from-slate-800 dark:to-slate-800/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                    dark:from-slate-600 dark:to-slate-800 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 
                                        flex items-center justify-center">
                                        <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                            OH
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                        OffersHub AI
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {currentTenant ? `Assistant for ${currentTenant.name.replace(/_/g, ' ')}` : 'Your platform assistant'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 
                                        rounded-lg transition-colors"
                                >
                                    <IoMdClose className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className="space-y-2">
                                    <div
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} 
                                            items-end gap-2`}
                                    >
                                        {message.type === 'bot' && (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                                dark:from-slate-600 dark:to-slate-800 flex-shrink-0 
                                                flex items-center justify-center">
                                                <span className="text-xs font-medium text-white">OH</span>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl ${
                                                message.type === 'user'
                                                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Suggestions */}
                                    {message.type === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                                        <div className="ml-8 flex flex-wrap gap-2">
                                            {message.suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 
                                                        hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full 
                                                        text-xs text-slate-700 dark:text-slate-300 transition-colors"
                                                >
                                                    <FaLightbulb className="w-3 h-3 text-amber-500" />
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                        dark:from-slate-600 dark:to-slate-800 flex-shrink-0 
                                        flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">OH</span>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" 
                                                style={{ animationDelay: '0.2s' }} />
                                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" 
                                                style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-900 
                            border-t border-slate-200 dark:border-slate-700">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask about offers or campaigns..."
                                    className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 
                                        bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200
                                        placeholder-slate-400 dark:placeholder-slate-500
                                        focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="p-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 
                                        text-white hover:from-slate-800 hover:to-slate-900
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all duration-200 ease-in-out"
                                >
                                    <BiSend size={20} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 
                    text-white shadow-lg hover:shadow-xl hover:from-slate-800 hover:to-slate-900
                    flex items-center justify-center transition-shadow duration-200"
            >
                <BsChatDots size={24} />
            </motion.button>
        </div>
    );
};

export default ChatBot;