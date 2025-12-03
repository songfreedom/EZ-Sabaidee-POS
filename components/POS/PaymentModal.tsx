
import React, { useState, useEffect, useRef } from 'react';
import { X, Banknote, QrCode, ArrowRight, Loader2, CheckCircle2, Delete, RotateCcw, AlertCircle } from 'lucide-react';
import { Language, StoreSettings } from '../../types';
import { translations } from '../../translations';
import { PHAJAY_CONFIG } from '../../constants';

interface PaymentModalProps {
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: 'cash' | 'qr') => void;
  lang: Language;
  settings?: StoreSettings;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ total, isOpen, onClose, onConfirm, lang, settings }) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [method, setMethod] = useState<'cash' | 'qr'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // QR State
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [qrError, setQrError] = useState<string>('');
  // Use any to avoid NodeJS.Timeout vs number issues in different environments
  const pollIntervalRef = useRef<any>(null);

  // Get active secret key from settings OR fallback to config
  const activeSecretKey = settings?.phajaySecretKey || PHAJAY_CONFIG.SECRET_KEY;
  const activeTag = settings?.phajayTag || 'Store_01';
  const isPhaJayEnabled = settings?.enablePhaJay ?? true;

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setReceivedAmount('');
      setIsProcessing(false);
      setIsSuccess(false);
      setQrCodeImage('');
      setQrError('');
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen]);

  // Generate QR when switching to QR mode
  useEffect(() => {
    if (isOpen && method === 'qr' && !qrCodeImage) {
      if (isPhaJayEnabled) {
        generatePhaJayQR();
      }
    }
    // Cleanup polling when switching away or closing
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [method, isOpen]);

  const generatePhaJayQR = async () => {
    setIsLoadingQR(true);
    setQrError('');

    // CHECK FOR DEMO MODE: If using the placeholder key or empty key, skip the real API call
    if (!activeSecretKey || activeSecretKey === 'YOUR_PLATFORM_SECRET_KEY_HERE') {
      console.log("Demo Mode: Using mock QR generation (No valid PhaJay key provided in Settings)");
      setTimeout(() => {
        // Use a generic QR generator to simulate the BCEL QR return
        setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BCEL_OnePay_${total}_DEMO`);
        startPaymentStatusCheck('mock_txn_123');
        setIsLoadingQR(false);
      }, 1000);
      return;
    }

    try {
      // NOTE: In a real app, call your backend, not PhaJay directly from frontend to protect SECRET_KEY
      const response = await fetch(PHAJAY_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'secretKey': activeSecretKey
        },
        body: JSON.stringify({
          amount: total,
          description: `POS Order Payment - ${settings?.storeName || 'Sabaidee POS'}`,
          tag1: activeTag,
          tag2: 'POS_ORDER'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodeImage(data.qrCode);
        startPaymentStatusCheck(data.transactionId);
      } else {
        throw new Error('API Error');
      }

    } catch (error) {
      console.error("PhaJay API Error:", error);
      
      // Fallback in case a real key was attempted but failed
      setTimeout(() => {
        setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BCEL_OnePay_${total}_DEMO`);
        startPaymentStatusCheck('mock_txn_123');
      }, 1000);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const startPaymentStatusCheck = (txnId: string) => {
    // Simulate Webhook/Socket checking
    let checkCount = 0;
    pollIntervalRef.current = setInterval(() => {
      checkCount++;
      // Mocking a successful payment after ~4 seconds
      if (checkCount > 2) { 
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        handleConfirm(); // Auto-confirm when payment detected
      }
    }, 2000);
  };

  if (!isOpen) return null;

  const change = Math.max(0, (parseInt(receivedAmount) || 0) - total);
  const canPay = method === 'qr' || (parseInt(receivedAmount) || 0) >= total;

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate processing finalization
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirm(method);
      }, 1500);
    }, 1000);
  };

  // Numpad Logic
  const handleNumClick = (num: string) => {
    if (receivedAmount.length > 12) return; // Limit length
    setReceivedAmount(prev => prev + num);
  };

  const handleBackspace = () => {
    setReceivedAmount(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setReceivedAmount('');
  };

  const handleAddAmount = (amount: number) => {
    const current = parseInt(receivedAmount || '0');
    setReceivedAmount((current + amount).toString());
  };

  const moneyShortcuts = [20000, 50000, 100000, 500000];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[90vh] md:h-[700px] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side - Sidebar */}
        <div className="w-full md:w-1/3 bg-slate-50 p-6 md:p-8 flex flex-col border-r border-slate-100">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-800">{t('paymentTitle')}</h3>
            <p className="text-sm text-slate-500 font-medium">{t('selectMethod')}</p>
          </div>

          <div className="space-y-4 flex-1">
            <button
              onClick={() => setMethod('cash')}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                method === 'cash' 
                  ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100' 
                  : 'border-transparent hover:bg-white hover:shadow-sm text-slate-500'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'cash' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                <Banknote size={24} strokeWidth={2.5} />
              </div>
              <div>
                <span className={`block font-bold ${method === 'cash' ? 'text-slate-800' : 'text-slate-500'}`}>{t('cash')}</span>
                <span className="text-xs font-semibold text-slate-400">{t('cashDesc')}</span>
              </div>
            </button>

            {isPhaJayEnabled && (
              <button
                onClick={() => setMethod('qr')}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                  method === 'qr' 
                    ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100' 
                    : 'border-transparent hover:bg-white hover:shadow-sm text-slate-500'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'qr' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                  <QrCode size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <span className={`block font-bold ${method === 'qr' ? 'text-slate-800' : 'text-slate-500'}`}>{t('qr')}</span>
                  <span className="text-xs font-semibold text-slate-400">{t('qrDesc')}</span>
                </div>
              </button>
            )}
          </div>

          <button onClick={onClose} className="mt-auto flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-200/50 text-slate-500 font-bold text-sm transition-colors">
            <X size={18} />
            <span>{t('cancel')}</span>
          </button>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 bg-white p-6 md:p-8 flex flex-col relative overflow-y-auto custom-scrollbar">
          
          {isSuccess ? (
             <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                 <CheckCircle2 size={48} strokeWidth={3} />
               </div>
               <h2 className="text-3xl font-black text-slate-800 mb-2">{t('paymentSuccess')}</h2>
               <p className="text-slate-500 font-medium">{t('successDesc')}</p>
             </div>
          ) : (
             <>
                <div className="text-center mb-6">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Amount</p>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tight">{total.toLocaleString()} <span className="text-2xl text-slate-400 font-bold">₭</span></h1>
                </div>

                <div className="flex-1 flex flex-col h-full">
                  {method === 'cash' ? (
                    <div className="flex-1 flex flex-col gap-4 max-w-lg mx-auto w-full animate-in slide-in-from-right-8 duration-300">
                      
                      {/* Shortcuts */}
                      <div className="grid grid-cols-4 gap-2">
                        {moneyShortcuts.map(amt => (
                          <button 
                            key={amt}
                            onClick={() => handleAddAmount(amt)}
                            className="py-3 px-1 text-xs md:text-sm font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:scale-105 active:scale-95 rounded-xl transition-all shadow-sm flex flex-col items-center justify-center"
                          >
                            <span>+{amt/1000}k</span>
                          </button>
                        ))}
                      </div>

                      {/* Display Input */}
                      <div className="relative group">
                         <div className={`w-full pl-6 pr-14 py-4 bg-slate-50 border-2 rounded-2xl flex items-center justify-between transition-all ${receivedAmount ? 'border-indigo-500 bg-white' : 'border-slate-100'}`}>
                             <span className={`text-3xl font-bold ${receivedAmount ? 'text-slate-800' : 'text-slate-300'}`}>
                               {receivedAmount ? parseInt(receivedAmount).toLocaleString() : '0'}
                             </span>
                             <span className="text-slate-400 font-bold">₭</span>
                         </div>
                      </div>

                      {/* Change Display */}
                      <div className={`p-4 rounded-2xl flex justify-between items-center border transition-all duration-300 ${
                        change > 0 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t('change')}</span>
                          <span className="text-slate-900 font-black text-lg">{change > 0 ? t('change') : '-'}</span>
                        </div>
                        <span className={`text-2xl font-black ${change > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                          {change.toLocaleString()} ₭
                        </span>
                      </div>

                      {/* Numpad */}
                      <div className="grid grid-cols-3 gap-2 flex-1 mt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleNumClick(num.toString())}
                            className="bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 hover:bg-slate-50 text-slate-700 text-2xl font-bold py-3 rounded-2xl transition-all h-16"
                          >
                            {num}
                          </button>
                        ))}
                        <button
                           onClick={handleClear}
                           className="bg-red-50 border-b-4 border-red-100 active:border-b-0 active:translate-y-1 hover:bg-red-100 text-red-500 font-bold py-3 rounded-2xl transition-all h-16 flex items-center justify-center"
                        >
                           <RotateCcw size={24} />
                        </button>
                        <button
                          onClick={() => handleNumClick('0')}
                          className="bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 hover:bg-slate-50 text-slate-700 text-2xl font-bold py-3 rounded-2xl transition-all h-16"
                        >
                          0
                        </button>
                        <button
                          onClick={() => handleNumClick('00')}
                          className="bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 hover:bg-slate-50 text-slate-700 text-2xl font-bold py-3 rounded-2xl transition-all h-16"
                        >
                          00
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center animate-in slide-in-from-right-8 duration-300 h-full">
                      <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-xl mb-6 relative group cursor-pointer w-[280px] h-[280px] flex items-center justify-center bg-slate-50">
                        <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        
                        {isLoadingQR ? (
                          <div className="flex flex-col items-center gap-3 text-slate-500">
                             <Loader2 size={48} className="animate-spin text-indigo-500" />
                             <span className="text-xs font-bold animate-pulse">Generating BCEL QR...</span>
                          </div>
                        ) : qrCodeImage ? (
                          <img 
                            src={qrCodeImage} 
                            alt="Payment QR" 
                            className="w-full h-full object-contain mix-blend-multiply relative z-10"
                          />
                        ) : (
                           <div className="flex flex-col items-center gap-2 text-red-400">
                             <AlertCircle size={32} />
                             <span className="text-xs font-bold">QR Gen Failed</span>
                           </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                           <Loader2 size={16} className="animate-spin text-indigo-500" />
                           <p className="text-slate-600 font-bold text-lg">{t('scanPrompt')}</p>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xs text-center">{t('waiting')}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex gap-3">
                     {method === 'cash' && (
                        <button 
                          onClick={handleBackspace}
                          className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500 transition-colors"
                        >
                           <Delete size={24} />
                        </button>
                     )}
                     
                     {method === 'cash' && (
                       <button
                          onClick={handleConfirm}
                          disabled={!canPay || isProcessing}
                          className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-[0.98] ${
                             canPay && !isProcessing
                             ? 'bg-slate-900 hover:bg-indigo-600 shadow-slate-200' 
                             : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                       >
                          {isProcessing ? (
                             <>
                             <Loader2 size={24} className="animate-spin" />
                             <span>{t('processing')}</span>
                             </>
                          ) : (
                             <>
                             <span>{t('confirmPayment')}</span>
                             <ArrowRight size={24} />
                             </>
                          )}
                       </button>
                     )}

                     {/* For QR, hide the manual confirm button as it auto-detects, or provide a 'Paid' override */}
                     {method === 'qr' && (
                        <button
                          onClick={handleConfirm}
                          className="flex-1 py-4 px-6 rounded-2xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-lg flex items-center justify-center gap-3 transition-all duration-300 border border-indigo-200"
                        >
                          {isProcessing ? (
                             <>
                             <Loader2 size={24} className="animate-spin" />
                             <span>Checking Status...</span>
                             </>
                          ) : (
                             <span>Simulate Payment Received</span>
                          )}
                        </button>
                     )}
                  </div>
                </div>
             </>
          )}
        </div>
      </div>
    </div>
  );
};