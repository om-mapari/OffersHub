import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { BiSend } from 'react-icons/bi';
import { BsChatDots } from 'react-icons/bs';
import { FaLightbulb } from 'react-icons/fa';

// Azure OpenAI client configuration
const AZURE_ENDPOINT = "";
const AZURE_API_KEY = "";
const AZURE_API_VERSION = "";
const AZURE_DEPLOYMENT = "";

interface Message {
  type: 'user' | 'bot';
  content: string;
  suggestions?: string[];
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { 
            type: 'bot', 
            content: "Hi there! 👋 I'm OffersHub AI, a specialized assistant for the OffersHub platform. How can I help you today?",
            suggestions: [
                "What is OffersHub?",
                "Tell me about campaign management",
                "What are the different user roles?"
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [systemPrompt, setSystemPrompt] = useState<string | null>(null);

    // Fetch system prompt on component mount
    useEffect(() => {
        const fetchSystemPrompt = async () => {
            try {
                const response = await fetch('/src/features/ai-chat/system-prompt.md');
                const text = await response.text();
                setSystemPrompt(text);
            } catch (error) {
                console.error('Failed to load system prompt:', error);
            }
        };
        
        fetchSystemPrompt();
    }, []);

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
            // Prepare conversation history for context
            const conversationHistory = messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

            // Add the new user message
            conversationHistory.push({
                role: 'user',
                content: userMessage.content
            });

            // Add system prompt if available
            if (systemPrompt) {
                conversationHistory.unshift({
                    role: 'system',
                    content: systemPrompt
                });
            }

            // Call Azure OpenAI API directly
            const response = await fetch(`${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': AZURE_API_KEY
                },
                body: JSON.stringify({
                    messages: conversationHistory,
                    max_tokens: 1000,
                    temperature: 0.7,
                    top_p: 0.95,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stop: null
                }),
            });

            const data = await response.json();
            
            if (data.choices && data.choices[0]) {
                const botResponse = data.choices[0].message.content;
                
                // Generate follow-up suggestions based on the bot's response
                const suggestionsResponse = await fetch(`${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': AZURE_API_KEY
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: 'Based on the previous conversation, generate 2-3 short follow-up questions the user might want to ask next. Return only the questions as a JSON array of strings. Make them concise and directly related to OffersHub functionality.'
                            },
                            ...conversationHistory,
                            {
                                role: 'assistant',
                                content: botResponse
                            }
                        ],
                        max_tokens: 250,
                        temperature: 0.7,
                        response_format: { type: "json_object" }
                    }),
                });
                
                const suggestionsData = await suggestionsResponse.json();
                let suggestions: string[] = [];
                
                try {
                    const parsedSuggestions = JSON.parse(suggestionsData.choices[0].message.content);
                    suggestions = Array.isArray(parsedSuggestions.suggestions) ? parsedSuggestions.suggestions : [];
                } catch (error) {
                    console.error('Failed to parse suggestions:', error);
                    suggestions = [];
                }
                
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    content: botResponse,
                    suggestions
                }]);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error calling AI service:', error);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: 'Sorry, I encountered an error. Please try again later.' 
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
                        className="absolute bottom-16 right-0 w-96 h-[500px] bg-white/95 dark:bg-slate-900/95 
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
                                        Your OffersHub platform assistant
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
                                            className={`max-w-[80%] p-3 rounded-2xl ${
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
                                    placeholder="Ask about OffersHub..."
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