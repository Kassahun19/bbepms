import React, { useState, useEffect } from 'react';
import { Bot, Send, Key, Check, Copy, ExternalLink, Info, X, MessageSquare, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [copiedText, setCopiedText] = useState<'id' | 'password' | 'linkCmd' | 'token' | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSyncingWebhook, setIsSyncingWebhook] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const botUsername = 'bbepmsbot';
  const botLink = 'https://t.me/bbepmsbot';
  const targetWebhook = 'https://bbepms.vercel.app/api/telegram/webhook';

  const linkCommand = `/link ${currentUser?.userId || 'YOUR_EMPLOYEE_ID'} ${currentUser?.password || 'YOUR_PASSWORD'}`;

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setWebhookStatus(data);
    } catch (e: any) {
      setWebhookStatus({ connected: false, error: e.message });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSyncWebhook = async () => {
    setIsSyncingWebhook(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/telegram/set-webhook', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage('✅ Webhook successfully connected to https://bbepms.vercel.app/api/telegram/webhook');
      } else {
        setSyncMessage(`⚠️ Webhook sync response: ${JSON.stringify(data.result || data.message)}`);
      }
      await fetchStatus();
    } catch (e: any) {
      setSyncMessage(`❌ Sync failed: ${e.message}`);
    } finally {
      setIsSyncingWebhook(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'id' | 'password' | 'linkCmd' | 'token') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isConnected = webhookStatus?.connected || webhookStatus?.activeWebhookUrl === targetWebhook;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="telegram-bot-modal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-gray-100 flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6B3F1D] to-[#8C5A3C] p-6 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Bot className="h-6 w-6 text-[#C89A2B]" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Telegram Bot & Vercel Integration</h3>
                <p className="text-xs text-amber-100/80">Bunna Bank S.C. EPMS Companion (@{botUsername})</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-lg p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[80vh]">
            
            {/* Live Vercel Deployment & Webhook Status Card */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></div>
                  <span className="text-sm font-bold text-gray-800">
                    Vercel Webhook: {isConnected ? 'Connected & Active' : 'Checking Connection...'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSyncWebhook}
                    disabled={isSyncingWebhook}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#6B3F1D] hover:bg-[#523015] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncingWebhook ? 'animate-spin' : ''}`} />
                    <span>{isSyncingWebhook ? 'Connecting...' : 'Reconnect Webhook'}</span>
                  </button>
                  <button
                    onClick={fetchStatus}
                    disabled={isLoadingStatus}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Refresh status"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200/80">
                <div>
                  <span className="text-gray-400">Deployed App:</span>{' '}
                  <a href="https://bbepms.vercel.app" target="_blank" rel="noreferrer" className="font-mono font-medium text-[#6B3F1D] hover:underline">
                    bbepms.vercel.app
                  </a>
                </div>
                <div>
                  <span className="text-gray-400">Bot Handle:</span>{' '}
                  <a href={botLink} target="_blank" rel="noreferrer" className="font-mono font-bold text-[#C89A2B] hover:underline">
                    @{botUsername}
                  </a>
                </div>
                <div className="col-span-full font-mono text-[11px] text-gray-500 break-all">
                  <span className="text-gray-400">Webhook URL:</span> {webhookStatus?.activeWebhookUrl || targetWebhook}
                </div>
              </div>

              {syncMessage && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900 flex items-start space-x-2">
                  <Info className="h-4 w-4 text-[#C89A2B] shrink-0 mt-0.5" />
                  <span>{syncMessage}</span>
                </div>
              )}
            </div>

            {/* Account Status Alert */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/50 flex items-start space-x-3">
              <Info className="h-5 w-5 text-[#C89A2B] shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-gray-800">Your Account Link Status: </span>
                {currentUser?.telegramChatId ? (
                  <span className="inline-flex items-center text-green-700 font-medium ml-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-1 inline" />
                    Linked (Telegram Chat ID: {currentUser.telegramChatId})
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-700 font-medium ml-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400 mr-1.5"></span>
                    Not Linked (Ready to connect)
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Once linked, you receive instant target notifications, broadcast announcements, and can submit daily reports directly from Telegram.
                </p>
              </div>
            </div>

            {/* Steps Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
                Quick 3-Step Account Linking
              </h4>
              <div className="space-y-4">
                
                {/* Step 1 */}
                <div className="flex space-x-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-[#6B3F1D]/10 text-[#6B3F1D] flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Open Telegram Bot</p>
                    <p className="text-xs text-gray-500">
                      Open Telegram and search for <span className="font-mono font-semibold text-gray-700">@{botUsername}</span> or click below:
                    </p>
                    <div className="mt-2">
                      <a 
                        href={botLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#C89A2B] hover:bg-[#B08520] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Open @{botUsername} in Telegram</span>
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex space-x-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-[#6B3F1D]/10 text-[#6B3F1D] flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Copy 1-Click Link Command</p>
                    <p className="text-xs text-gray-500">
                      Copy the pre-formatted authentication command for your staff account:
                    </p>
                    
                    <div className="mt-2 flex items-center justify-between p-2.5 bg-gray-900 text-amber-400 rounded-lg text-xs font-mono">
                      <span className="select-all truncate">{linkCommand}</span>
                      <button 
                        onClick={() => copyToClipboard(linkCommand, 'linkCmd')}
                        className="text-amber-100/80 hover:text-amber-300 p-1 ml-2 shrink-0 flex items-center space-x-1 bg-white/10 rounded px-2"
                      >
                        {copiedText === 'linkCmd' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span className="text-[11px]">{copiedText === 'linkCmd' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex space-x-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-[#6B3F1D]/10 text-[#6B3F1D] flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Send Command in Chat</p>
                    <p className="text-xs text-gray-500">
                      Paste and send the command to <span className="font-mono font-semibold text-gray-700">@{botUsername}</span>. The bot will authenticate you and open your customized role menu immediately.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Commands Section */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
                Supported Bot Commands
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-start space-x-3">
                  <Key className="h-4 w-4 text-[#C89A2B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-800">/link &lt;id&gt; &lt;pwd&gt;</span>
                    <p className="text-xs text-gray-500 mt-0.5">Links your Telegram chat to your profile.</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-[#C89A2B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-800">/menu &amp; /start</span>
                    <p className="text-xs text-gray-500 mt-0.5">Launches interactive keyboard navigation.</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-[#C89A2B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-800">/performance</span>
                    <p className="text-xs text-gray-500 mt-0.5">View consolidated deposit and digital KPI stats.</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-[#C89A2B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-800">/leaderboard</span>
                    <p className="text-xs text-gray-500 mt-0.5">Lists top-performing districts and branches.</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-[#C89A2B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-800">/announcements</span>
                    <p className="text-xs text-gray-500 mt-0.5">Get bank-wide high priority announcements.</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-[#C89A2B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-800">/coach &lt;query&gt;</span>
                    <p className="text-xs text-gray-500 mt-0.5">Consult BBEPMS AI Coach for tips.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-2xl border-t border-gray-100">
            <button
              onClick={handleSyncWebhook}
              disabled={isSyncingWebhook}
              className="text-xs font-medium text-[#6B3F1D] hover:underline inline-flex items-center space-x-1"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncingWebhook ? 'animate-spin' : ''}`} />
              <span>Sync Webhook</span>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-white bg-[#6B3F1D] hover:bg-[#523015] rounded-lg shadow-xs transition-colors inline-flex items-center space-x-2"
              >
                <Bot className="h-4 w-4 text-amber-400" />
                <span>Launch Bot</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

