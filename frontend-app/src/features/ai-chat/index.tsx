import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { BiSend } from 'react-icons/bi';
import { BsChatDots } from 'react-icons/bs';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            type: 'bot', 
            content: "Hi there! 👋 I'm the digital version of the portfolio owner. Feel free to ask me anything about my experience, projects, or skills!"
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = { type: 'user', content: inputMessage.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_CHAT_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.content }),
            });

            const data = await response.json();
            
            if (data.success) {
                setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
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
                                            AI
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                        Digital Assistant
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Usually responds instantly
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
                                <div
                                    key={index}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} 
                                        items-end gap-2`}
                                >
                                    {message.type === 'bot' && (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                            dark:from-slate-600 dark:to-slate-800 flex-shrink-0 
                                            flex items-center justify-center">
                                            <span className="text-xs font-medium text-white">AI</span>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${
                                            message.type === 'user'
                                                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                        dark:from-slate-600 dark:to-slate-800 flex-shrink-0 
                                        flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">AI</span>
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
                                    placeholder="Ask me anything about my work..."
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