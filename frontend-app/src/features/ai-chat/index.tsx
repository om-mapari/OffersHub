import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { BiSend } from 'react-icons/bi';
import { BsChatDots } from 'react-icons/bs';
import { FaLightbulb } from 'react-icons/fa';
import { useOffers } from '../offers/context/offers-context';
import { useTenant } from '@/context/TenantContext';
import { AZURE_CONFIG, isAzureConfigValid } from '@/config/env';
import { campaignsApi } from '../campaigns/api/campaigns-api';

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
    const { offers, rawOffers, primaryRole } = useOffers();
    const { currentTenant } = useTenant();

    // Function to get offer information for the chatbot
    const getOffersData = async () => {
        if (!currentTenant) {
            return {
                offers: [],
                hasData: false,
                message: "No tenant selected"
            };
        }

        // If offers are already loaded in context
        if (offers.length > 0) {
            return {
                offers,
                hasData: true,
                message: `${offers.length} offers available`
            };
        }
        
        try {
            // Fetch offers if not already loaded
            const fetchedOffers = await campaignsApi.getOffers(currentTenant.name);
            return {
                offers: fetchedOffers,
                hasData: fetchedOffers.length > 0,
                message: `${fetchedOffers.length} offers available`
            };
        } catch (error) {
            console.error("Error fetching offers for chatbot:", error);
            return {
                offers: [],
                hasData: false,
                message: "Error fetching offers data"
            };
        }
    };

    // System prompt for the AI assistant with context
    const getSystemPrompt = () => {
        const tenantName = currentTenant?.name || "unknown";
        const formattedTenantName = tenantName.split('_').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
        
        // Define system prompt with context about offers
        return `You are OffersHub AI, a specialized assistant for the OffersHub platform.
Your primary role is to help users navigate and utilize the OffersHub platform efficiently.

CURRENT CONTEXT:
- Current tenant: ${formattedTenantName}
- User role: ${primaryRole}
- Available offers: ${offers.length}

You can access the following data to provide specific information:
- Offers data with details on descriptions, types, status, and attributes
- Basic campaign information

When asked about offers or campaigns, provide specific information from the context data.
For requests about listing offers, show a concise summary of available offers.
When asked about a specific offer, provide its details including description, type, status, and attributes.

FORMATTING INSTRUCTIONS:
- DO NOT use markdown formatting in your responses.
- Use plain text instead of markdown headings.
- Use plain bullet points (•) instead of markdown bullets (* or -).
- Don't use markdown bold or italic formatting.
- Present information in a clean, readable format with proper spacing.
- For lists, simply use numbers or bullet points without markdown.

ABOUT OFFERSHUB:
OffersHub is a purpose-built platform for financial services companies to create, manage, and optimize personalized offers. It enables banks and financial institutions to deliver targeted promotions that enhance customer engagement, drive retention, and fuel growth.

Each tenant represents a financial product like "Credit Card", "Loan", etc. In each tenant, there will be offers created, and campaigns are created from these offers.

USER ACCESS MODEL:
- Users can belong to multiple user groups per tenant.
- Default user groups: admin, read_only, create, approver.
- A Super Admin can create tenants and manage users and their roles.

PLATFORM FLOW:
1. Super Admin creates a tenant → this auto-creates default user groups and prepares offer configuration.
2. Tenants have offer data stored in a common offers table with a flexible data JSONB field for custom attributes.

FREQUENTLY ASKED QUESTIONS:

QQ-What is OfferHub?
Offers hub is platform that simples offer and campaign management by optimizing process, levering workflow automation, real time analytics, AI-Powered personalization of offers, and robust data and integration capabilities.

QQ-What is Campaigns?
Marketing efforts designed to promote specific offers or services to a targeted audience. Campaigns can be executed through various channels such as email, social media, and advertisements.

QQ-What is Manage Users?
This involves overseeing the profiles and activities of users within the system. It includes tasks like adding new users, updating user information, and setting permissions.

QQ-What is Manage Offer Data?
Handling the information related to various offers, including their terms, conditions, validity, and performance metrics.

QQ-What is Manage Business Rules?
Setting and maintaining the rules that govern how offers are applied and processed. Business rules ensure that offers are executed correctly and comply with regulatory requirements.

QQ-What is Reports and Dashboards?
Tools that provide insights into the performance of offers and campaigns. Reports can include metrics like user engagement, conversion rates, and financial impact. Dashboards offer a visual representation of these metrics for easy analysis.

QQ-What is Offer List?
A comprehensive list of all active and past offers provided by the bank. This list helps in tracking and managing the offers effectively.

QQ-What is Offer Create/Update?
The process of creating new offers or updating existing ones. This includes defining the offer details, terms, and conditions.

QQ-What is Campaign Execute?
The implementation of marketing campaigns to promote offers. This involves scheduling, launching, and monitoring the campaign's progress.

QQ-What is User Management?
Similar to manage users, it involves the administration of user accounts, roles, and permissions within the system.

Be brief, professional, and helpful. Format responses in a clear, readable manner.
Always respect user roles and permissions. Do not expose sensitive information.`;
    };

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
            // Check if Azure OpenAI is configured
            if (!isAzureConfigValid()) {
                throw new Error("Azure OpenAI configuration is missing. Please check your environment variables.");
            }

            // Get offers data for context
            const offersData = await getOffersData();
            
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

            // Add system prompt with context
            const systemPrompt = getSystemPrompt();
            conversationHistory.unshift({
                role: 'system',
                content: systemPrompt
            });

            // Add offers data as context
            let contextMessage = "Here is the current offers data:\n";
            if (offersData.hasData) {
                contextMessage += JSON.stringify(offersData.offers.slice(0, 10).map(offer => ({
                    id: offer.id,
                    description: offer.offer_description,
                    type: offer.offer_type,
                    status: offer.status,
                    attributes: offer.data || {} // Include offer attributes
                })), null, 2);
            } else {
                contextMessage += offersData.message;
            }
            
            conversationHistory.push({
                role: 'system',
                content: `Context information: ${contextMessage}`
            });

            const { endpoint, apiKey, apiVersion, deployment } = AZURE_CONFIG;

            // Call Azure OpenAI API directly
            const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
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
                const rawBotResponse = data.choices[0].message.content;
                // Format the response to remove markdown formatting
                const botResponse = formatResponseText(rawBotResponse);
                
                // Generate follow-up suggestions based on the bot's response
                const suggestionsResponse = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': apiKey
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
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your Azure OpenAI configuration.` 
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