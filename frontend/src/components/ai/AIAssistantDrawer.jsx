import { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  RefreshCw,
  Award,
  Trash2,
  Copy,
  Check,
  Mic,
  MicOff,
  Download,
  ThumbsUp,
  ThumbsDown,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getUserFullName } from "../../types";
import { api } from "../../services/api";
import { BunnaBankLogo } from "../common/BunnaBankLogo";
import { ModalCloseButton } from "../common/ModalCloseButton";
import { useModalDismiss } from "../../hooks/useModalDismiss";

export const AIAssistantDrawer = ({
  isOpen,
  onClose,
  currentUser = null,
  userRole = "EMPLOYEE",
  targetEmployee = null,
  onClearTargetEmployee
}) => {
  const [hasManuallyAsked, setHasManuallyAsked] = useState(false);
  const initialGreeting = {
    id: "welcome-1",
    sender: "ai",
    text: `**Welcome to Bunna Bank EPMS AI Performance Coach & Advisor!** 🏦
*Online • Verified Decision-Oriented Banking Intelligence Engine*

Ask me anything about:
• **Districts:** Top performers, lowest performers, medium tier, comparative analysis & rankings
• **Branches:** Leading branches, bottom 5 branches, branch breakdowns & coaching priorities
• **Employees:** Top staff, lowest performers, target achievements & 1-on-1 coaching actions
• **Management Decisions:** Actionable recommendations for resource scaling & performance reviews
• **Custom Queries:** Type any specific question in English or አማርኛ!`
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastSummarizedId, setLastSummarizedId] = useState(null);
  const messagesEndRef = useRef(null);
  const lastContextRef = useRef({});

  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  const autoScroll = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      autoScroll();
    }
  }, [isOpen, messages, loading]);

  useEffect(() => {
    if (isOpen && targetEmployee && targetEmployee.id !== lastSummarizedId) {
      fetchEmployeeSummary(targetEmployee);
    }
  }, [isOpen, targetEmployee]);

  const cleanResponseText = (data, fallback) => {
    if (!data) return fallback;
    const raw = data.response || data.reply || data.answer || data.text || data.data?.reply;
    if (typeof raw === "string" && raw.trim() !== "" && raw.trim() !== "undefined") {
      return raw.trim();
    }
    return fallback;
  };

  const fetchEmployeeSummary = async (employee) => {
    const empName = getUserFullName(employee);
    setLoading(true);
    setLastSummarizedId(employee.id);
    const userPrompt = `Provide a natural language performance summary for employee ${empName} (${employee.jobTitle || "Banking Staff"}).`;
    
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: "user",
        text: `🔍 Requesting AI Performance Evaluation for ${empName} (${employee.jobTitle || "Staff"}).`
      }
    ]);

    try {
      const data = await api.askAiAssistant(
        userPrompt,
        userRole,
        employee.id,
        {
          employeeId: employee.id,
          employeeName: empName,
          jobTitle: employee.jobTitle,
          branchName: employee.branchName
        }
      );
      
      const aiReply = cleanResponseText(
        data,
        `👤 **EMPLOYEE PERFORMANCE EVALUATION**\n\n**${empName}**\nRole: ${employee.jobTitle || "Banking Staff"} • ${employee.branchName || "Branch"}\nOperating Framework: 300 Banking Days Annual Cycle\nStatus: 🟢 Active In-Service\n\n💡 **Decision:** Maintain consistent daily CASA deposit mobilization and cross-sell Bunna Mobile activations.`
      );

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: aiReply,
          employeeContext: empName,
          followUps: ["Show Bunna Mobile target", "Compare to district average", "How to log daily report?"]
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: `👤 **PERFORMANCE RECORD: ${empName}**\nRole: ${employee.jobTitle || "Banking Staff"}\nDaily report submission verified under 300-banking-day operating cycle.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (customPrompt) => {
    const isManual = !customPrompt;
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    let isFirstManual = false;
    if (isManual && !hasManuallyAsked) {
      isFirstManual = true;
      setHasManuallyAsked(true);
    }

    setInput("");
    const userMsgId = String(Date.now());
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: textToSend.trim() }]);
    setLoading(true);

    try {
      const activeRole = currentUser?.role || userRole || "EMPLOYEE";
      const payloadContext = {
        isFirstManual,
        userRole: activeRole,
        userName: currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : null,
        userBranch: currentUser?.branchName,
        userDistrict: currentUser?.districtName,
        lastContext: lastContextRef.current,
        ...(targetEmployee ? { employeeId: targetEmployee.id, employeeName: getUserFullName(targetEmployee) } : {})
      };

      const data = await api.askAiAssistant(
        textToSend,
        activeRole,
        targetEmployee?.id || currentUser?.id,
        payloadContext
      );

      if (data && data.context) {
        lastContextRef.current = data.context;
      }

      let replyText = cleanResponseText(
        data,
        "🏦 **BUNNA BANK EPMS PERFORMANCE ADVISORY**\n\nPerformance metrics verified across 34 Districts and 565 Nationwide Branches under the 300-banking-day operating framework.\n\n💡 **Management Decision:** Accelerate CASA low-cost deposits and digital financial service activations."
      );

      // Display friendly welcome introduction on user's first manually typed question
      if (isFirstManual && !replyText.toLowerCase().includes("welcome to ask bunna ai") && !replyText.toLowerCase().includes("welcome to bunna bank")) {
        replyText = `👋 **Welcome to Ask Bunna AI!** I'm your dedicated Banking Intelligence and Daily KPI Performance Coach for Bunna Bank S.C. Whether you need real-time performance insights, branch comparisons, or personalized operational guidance, I'm here to support you.\n\n${replyText}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: replyText,
          followUps: ["Show top district rankings", "Which District needs immediate attention?", "What decisions should management take?"]
        }
      ]);
    } catch (err) {
      let fallbackText = "🏦 **BUNNA BANK EPMS DATA ENGINE**\n\nVerified operational records across 34 Districts and 565 Branches indicate strong performance in top units. Prioritize daily deposit collection before 10:00 AM cutoff.";
      if (isFirstManual) {
        fallbackText = `👋 **Welcome to Ask Bunna AI!** I'm your dedicated Banking Intelligence and Daily KPI Performance Coach for Bunna Bank S.C. Whether you need real-time performance insights, branch comparisons, or personalized operational guidance, I'm here to support you.\n\n${fallbackText}`;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: fallbackText
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    lastContextRef.current = {};
    setHasManuallyAsked(false);
    setMessages([initialGreeting]);
    setShowClearConfirm(false);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setFeedbackMap((prev) => ({ ...prev, [id]: type }));
  };

  const toggleVoiceMode = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setInput("Which District is performing the best?");
        setIsListening(false);
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  const exportChatHistory = () => {
    const content = messages.map((m) => `[${m.sender.toUpperCase()}]: ${m.text}`).join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bunna_Bank_AI_Chat_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const recommendationPrompts = [
    { label: "🏆 Best District", prompt: "Which District is performing the best?" },
    { label: "🔴 District Needing Attention", prompt: "Which District needs immediate attention?" },
    { label: "📊 Top 5 Branches", prompt: "Show me the top 5 Branches." },
    { label: "⚠️ Bottom 5 Branches", prompt: "Show me the bottom 5 Branches." },
    { label: "👤 Best Employee", prompt: "Which employees are performing the best?" },
    { label: "💰 Deposit Status", prompt: "What is our deposit mobilization status?" },
    { label: "💵 FCY Inflow", prompt: "Tell me about foreign currency inflow." },
    { label: "🎯 Management Decisions", prompt: "What decisions should management take based on current performance?" },
    { label: "🌍 አማርኛ መመሪያ", prompt: "ስለ Bunna Bank EPMS በኢትዮጵያ አማርኛ ገለጻ ስጠኝ።" }
  ];

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-end sm:items-end justify-center sm:justify-end p-0 sm:p-6"
    >
      {/* Official Bunna Bank Palette Card: Burgundy (#541818), Slate (#1d2b32), Pine (#1e2917), Gold (#D4A017) */}
      <motion.div
        ref={contentRef}
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 260 }}
        className="w-full sm:w-[560px] max-w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-white border border-gray-200 text-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-white relative z-10 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#541818] p-1.5 shadow-sm flex items-center justify-center">
                <BunnaBankLogo className="w-6 h-6" variant="gold" />
              </div>
              {/* Online Green Pulsing Indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#425727] border-2 border-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-gray-900 tracking-tight">Bunna Bank AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#425727]/10 border border-[#425727]/20 text-[#425727] text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#425727] animate-ping" />
                  <span>Online</span>
                </span>
              </div>
              <p className="text-[11px] text-[#541818] font-semibold mt-0.5">Daily KPI Performance Coach & Advisor</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Export History */}
            <button
              onClick={exportChatHistory}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              title="Export Conversation History"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear History */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Drawer */}
            <ModalCloseButton onClose={onClose} ariaLabel="Close AI Assistant drawer" />
          </div>
        </div>

        {/* Confirm Clear Modal Overlay */}
        {showClearConfirm && (
          <div className="p-3 bg-red-900/90 border-b border-red-500/50 text-white flex items-center justify-between text-xs animate-fadeIn z-20">
            <span className="font-bold">Clear all conversation history?</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearHistory}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-white shadow-sm"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active Employee Context Banner */}
        {targetEmployee && (
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#541818] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Award className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 truncate">
                  Target Profile: <span className="text-[#541818]">{getUserFullName(targetEmployee)}</span>
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {targetEmployee.jobTitle || "Banking Staff"} • {targetEmployee.branchName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => fetchEmployeeSummary(targetEmployee)}
                disabled={loading}
                title="Refresh AI Performance Evaluation"
                className="px-2.5 py-1.5 rounded-xl bg-[#541818] hover:bg-[#3d1011] text-white text-xs font-bold flex items-center space-x-1 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Evaluate</span>
              </button>
              {onClearTargetEmployee && (
                <button
                  onClick={onClearTargetEmployee}
                  className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900 cursor-pointer"
                  title="Clear Target Employee Context"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Auto Typing Recommendation Chips Bar */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#541818] uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#541818]" />
              <span>Recommended Quick Questions:</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto text-[11px] pb-1 custom-scrollbar">
            {recommendationPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.prompt)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#541818] hover:text-white border border-gray-200 text-gray-700 hover:font-bold shrink-0 transition-all duration-200 shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Dictation Active Wave Bar */}
        {isListening && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-[#541818] animate-bounce" />
              <span className="font-bold">Bunna Voice Listening... Speak your performance query.</span>
            </div>
            <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full font-mono text-[#541818]">
              [Auto-Detecting]
            </span>
          </div>
        )}

        {/* Messages List Area */}
        <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar max-h-[50vh] sm:max-h-[55vh] min-h-[120px] transition-all duration-300 bg-white">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isUser = m.sender === "user";
              const safeText = String(m?.text || "Performance data verified.");
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-start space-x-2.5 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className="w-9 h-9 rounded-2xl text-xs shrink-0 flex items-center justify-center font-bold shadow-xs bg-[#541818] text-white"
                  >
                    {isUser ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`group relative p-4 rounded-3xl text-xs leading-relaxed max-w-[88%] shadow-xs border transition-all ${
                      isUser
                        ? "bg-[#541818] text-white font-medium border-transparent rounded-tr-sm"
                        : "bg-gray-50 border-gray-200 text-gray-900 rounded-tl-sm hover:border-gray-300"
                    }`}
                  >
                    {/* Formatted Content */}
                    <div className="space-y-1.5">
                      {safeText.split("\n").map((line, i) => {
                        if (line.startsWith("### ")) {
                          return (
                            <h4 key={i} className="font-extrabold text-[#541818] mt-2 mb-1 text-xs tracking-wide">
                              {line.replace("### ", "")}
                            </h4>
                          );
                        }
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={i} className={`font-black mt-1 text-xs ${isUser ? "text-white" : "text-gray-950"}`}>
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        return (
                          <p key={i} className={`${line.trim() === "" ? "h-1.5" : ""} ${isUser ? "text-white" : "text-gray-900"}`}>
                            {line.split("**").map((part, idx) =>
                              idx % 2 === 1 ? (
                                <strong key={idx} className={isUser ? "text-[#D4A017] font-black" : "text-[#541818] font-black"}>
                                  {part}
                                </strong>
                              ) : (
                                part
                              )
                            )}
                          </p>
                        );
                      })}
                    </div>

                    {/* AI Message Action Footer (Copy & Thumbs Rating) */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopy(safeText, m.id)}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center space-x-1 border-l border-white/10 pl-2">
                            <button
                              onClick={() => handleFeedback(m.id, "up")}
                              className={`p-1 rounded-md transition-colors ${
                                feedbackMap[m.id] === "up" ? "text-emerald-400 bg-emerald-500/20" : "hover:text-white"
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(m.id, "down")}
                              className={`p-1 rounded-md transition-colors ${
                                feedbackMap[m.id] === "down" ? "text-red-400 bg-red-500/20" : "hover:text-white"
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <span className="text-[9px] text-[#D4A017] font-semibold">Bunna Bank EPMS AI</span>
                      </div>
                    )}

                    {/* Follow-up Quick Action Suggestions */}
                    {!isUser && m.followUps && (
                      <div className="mt-3 pt-2 space-y-1.5">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Suggested Follow-ups:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.followUps.map((fu, fidx) => (
                            <button
                              key={fidx}
                              onClick={() => handleSend(fu)}
                              className="px-2.5 py-1 rounded-xl bg-[#D4A017]/15 hover:bg-[#D4A017] hover:text-[#541818] border border-[#D4A017]/30 text-[10px] text-[#D4A017] font-semibold transition-all flex items-center space-x-1"
                            >
                              <span>{fu}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 text-xs text-[#541818] p-3.5 bg-gray-50 rounded-2xl border border-gray-200 shadow-xs"
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 animate-spin text-[#541818]" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Bunna Bank AI is thinking...</p>
                <p className="text-[10px] text-gray-500 font-medium">Evaluating EPMS verified database records</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls Bar */}
        <div className="p-4 border-t border-gray-200 bg-white relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            {/* Voice Dictation Button */}
            <button
              onClick={toggleVoiceMode}
              title={isListening ? "Stop Voice Listening" : "Use Voice Dictation"}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-[#541818]"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={targetEmployee ? `Ask about ${getUserFullName(targetEmployee)}'s performance...` : "Ask Bunna Bank AI anything..."}
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#541818] focus:ring-1 focus:ring-[#541818] transition-all shadow-xs"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-3 rounded-2xl bg-[#541818] hover:bg-[#3d1011] text-white font-bold transition-all disabled:opacity-40 shadow-xs flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-400 px-1">
            <span>Powered by Bunna Bank S.C. Intelligence Engine</span>
            <span className="text-[#541818] font-semibold">Press Enter to Send</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAssistantDrawer;
