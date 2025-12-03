
import React, { useState, useEffect, useRef } from 'react';
import { X, Banknote, QrCode, ArrowRight, Loader2, CheckCircle2, Delete, RotateCcw, AlertCircle, Printer, RefreshCw, Radio, Wifi, WifiOff, AlertTriangle, Key } from 'lucide-react';
import { io, Socket } from 'socket.io-client'; // Import Socket.IO
import { Language, StoreSettings, CartItem } from '../../types';
import { translations } from '../../translations';
import { PHAJAY_CONFIG } from '../../constants';

interface PaymentModalProps {
  total: number;
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: 'cash' | 'qr') => void;
  lang: Language;
  settings?: StoreSettings;
}

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'error';

export const PaymentModal: React.FC<PaymentModalProps> = ({ total, items, isOpen, onClose, onConfirm, lang, settings }) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [method, setMethod] = useState<'cash' | 'qr'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // QR State
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [qrError, setQrError] = useState<string>('');
  
  // Socket State
  const socketRef = useRef<Socket | null>(null);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('idle');
  const [socketErrorMsg, setSocketErrorMsg] = useState<string>('');

  // Get active secret key from settings OR fallback to config
  const activeSecretKey = settings?.phajaySecretKey || PHAJAY_CONFIG.SECRET_KEY;
  const isPhaJayEnabled = settings?.enablePhaJay ?? true;

  // Cleanup logic
  const cleanupSocket = () => {
    if (socketRef.current) {
      console.log('Disconnecting socket...');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setReceivedAmount('');
      setIsProcessing(false);
      setIsSuccess(false);
      setQrCodeImage('');
      setQrError('');
      setSocketStatus('idle');
      setSocketErrorMsg('');
    } else {
      // Ensure socket is closed when modal closes
      cleanupSocket();
    }
    
    return () => {
      cleanupSocket();
    };
  }, [isOpen]);

  // Generate QR & Connect Socket when switching to QR mode
  useEffect(() => {
    if (isOpen && method === 'qr') {
      // 1. Generate QR Code
      if (!qrCodeImage) {
        if (isPhaJayEnabled) {
          generatePhaJayQR();
        }
      }

      // 2. Connect Socket.IO for Realtime Payment Confirmation
      if (isPhaJayEnabled) {
        connectSocket();
      }
    } else {
      // Disconnect if switching back to cash or closing
      cleanupSocket();
      setSocketStatus('idle');
      setSocketErrorMsg('');
    }
  }, [method, isOpen, isPhaJayEnabled, activeSecretKey]);

  // Helper to map technical errors to user-friendly text
  const getFriendlyError = (msg: string) => {
    if (msg.includes('websocket') || msg.includes('transport')) {
      return t('socketBlockError');
    }
    if (msg.includes('xhr') || msg.includes('poll') || msg.includes('fetch')) {
      return t('socketNetError');
    }
    return msg;
  };

  // --- 2. ຄຳສັ່ງເຊື່ອມຕໍ່ SocketIO (Connection Command) ---
  const connectSocket = () => {
    if (socketRef.current) return; // Already connected

    const cleanKey = activeSecretKey?.trim();

    // 1. ການຕັ້ງຄ່າການເຊື່ອມຕໍ່ (Validation)
    if (!cleanKey || cleanKey.includes('YOUR_PLATFORM_SECRET_KEY') || cleanKey.length < 5) {
      setSocketStatus('idle');
      return;
    }

    // A. URL Construction
    const baseUrl = PHAJAY_CONFIG.SOCKET_URL.replace(/\/$/, ''); 
    
    console.log('Connecting to Socket URL:', baseUrl); 
    setSocketStatus('connecting');
    setSocketErrorMsg('');
    
    // B. ສ້າງການເຊື່ອມຕໍ່ (Create Connection)
    // We allow both 'websocket' and 'polling' transports to fix connection issues
    // where raw websockets might be blocked by the network/browser environment.
    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling'], // Allow fallback to polling
      query: {
        key: cleanKey
      },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    // C. ຟັງເຫດການເຊື່ອມຕໍ່ (Listen for Connect)
    newSocket.on('connect', () => {
      console.log('Connected to the payment Support server!');
      setSocketStatus('connected');
      setSocketErrorMsg('');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection failed:', err.message);
      setSocketStatus('error');
      // Use friendly error mapping
      setSocketErrorMsg(getFriendlyError(err.message));
    });

    newSocket.on('disconnect', (reason) => {
      if (isOpen && method === 'qr') {
        if (reason !== 'io client disconnect') {
           setSocketStatus('error');
           setSocketErrorMsg(t('connectionError'));
        }
      }
    });

    // D. Subscribe ເພື່ອຮັບຂໍ້ມູນ (Subscribe to Event)
    // ລະບົບຕ້ອງຕັ້ງຄ່າ Listener ເພື່ອຟັງເຫດການທີ່ມີຊື່ວ່າ join::PLATFORM_SECRET_KEY
    const eventName = `join::${cleanKey}`;
    console.log('Subscribing to event:', eventName);
    
    newSocket.on(eventName, (data: any) => {
      console.log('Data received (Payment Confirmation):', data);
      
      // 5. ການປະມວນຜົນການຢືນຢັນ (Process Payment Success)
      // ຮັບຂໍ້ມູນການຢືນຢັນ data ທີ່ມີສະຖານະເປັນ PAYMENT_COMPLETED
      if (data && data.status === 'PAYMENT_COMPLETED') {
           console.log("BCEL Sandbox Payment Completed! Auto-confirming...");
           
           // Show success state briefly
           setIsSuccess(true);
           
           // Clear listener to prevent duplicates
           newSocket.off(eventName);

           // Automatically close modal and save transaction after 1.5s
           setTimeout(() => {
              onConfirm('qr');
           }, 1500);
      }
    });

    socketRef.current = newSocket;
  };

  const retrySocketConnection = () => {
    console.log('Retrying socket connection...');
    // Cleanup old socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketStatus('idle');
    setSocketErrorMsg('');
    
    // Small delay to ensure clean slate
    setTimeout(() => {
        connectSocket();
    }, 300);
  };

  // --- 3. ຄຳສັ່ງສ້າງ QR BCEL (Generate QR Payment) ---
  const generatePhaJayQR = async () => {
    setIsLoadingQR(true);
    setQrError('');
    setQrCodeImage('');
    const cleanKey = activeSecretKey?.trim();

    // CHECK FOR DEMO MODE
    if (!cleanKey || cleanKey.includes('YOUR_PLATFORM_SECRET_KEY')) {
      setTimeout(() => {
        setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BCEL_OnePay_${total}_DEMO`);
        setIsLoadingQR(false);
      }, 1000);
      return;
    }

    try {
      // 1. ກຳນົດ Request Payload
      // ຂໍ້ຄວນລະວັງ: description ສໍາລັບ BCEL ບໍ່ຮອງຮັບຕົວອັກສອນລາວ/ໄທໃນປັດຈຸບັນ
      const safeDescription = `Bill-${Date.now().toString().slice(-6)}`;
      
      const payload = {
        amount: total,
        description: safeDescription
        // tag1, tag2 optional
      };

      // 2. ສົ່ງຄຳຮ້ອງຂໍ POST
      // URL: https://payment-gateway.phajay.co/v1/api/test/payment/generate-bcel-qr
      const response = await fetch(PHAJAY_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'secretKey': cleanKey // Headers: ຕ້ອງປະກອບມີ secretKey
        },
        body: JSON.stringify(payload)
      });

      // 3. ຈັດການ Response
      if (response.ok) {
        const result = await response.json();
        console.log("Response QR Sandbox:", result);
        
        let qr = '';
        if (result.qrCode) {
            qr = result.qrCode;
        } else if (result.data && result.data.qrCode) {
            qr = result.data.qrCode;
        }

        if (qr) {
           // ລະບົບຈະໄດ້ຮັບຂໍ້ມູນທີ່ປະກອບມີ QR String.
           // Convert raw QR string to renderable image URL for display
           setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
        } else {
           throw new Error('QR Code not found in response');
        }
      } else {
        const errorText = await response.text();
        console.error("Error generating BCEL Sandbox QR:", errorText);
        
        try {
          const errJson = JSON.parse(errorText);
          if (errJson.message === 'BAD_REQUEST' && errJson.detail) {
            throw new Error(errJson.detail);
          }
          throw new Error(errJson.message || errorText);
        } catch (e) {
          throw new Error(errorText || `API Error: ${response.status}`);
        }
      }

    } catch (error: any) {
      console.error("PhaJay API Error:", error);
      let errorMessage = "Connection failed";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "CORS/Network Error. Ensure you are allowing this domain or check internet.";
      } else {
        errorMessage = error.message || "Unknown API Error";
      }
      setQrError(errorMessage);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handlePrint = () => {
    // Basic Thermal Receipt Printing Logic
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Noto Sans Lao Looped', 'Courier New', monospace; font-size: 12px; width: ${settings?.printerPaperSize === '58mm' ? '58mm' : '80mm'}; margin: 0 auto; padding: 10px; color: #000; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .bold { font-weight: bold; }
              .line { border-bottom: 1px dashed #000; margin: 10px 0; }
              .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .header { font-size: 14px; margin-bottom: 5px; }
              img { max-width: 80px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="text-center">
              ${settings?.logoUrl ? `<img src="${settings.logoUrl}" />` : ''}
              <div class="bold header">${settings?.storeName || 'Sabaidee POS'}</div>
              <div>${settings?.storeAddress || ''}</div>
              <div>${settings?.storePhone || ''}</div>
              <div class="line"></div>
              <div>${settings?.receiptHeader || ''}</div>
            </div>
            <br/>
            <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div>Bill #: ${Date.now().toString().slice(-6)}</div>
            <div class="line"></div>
            
            ${items.map(item => `
              <div class="item">
                <span style="flex:1">${item.name} <br/> <small>x${item.quantity}</small></span>
                <span>${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            
            <div class="line"></div>
            <div class="item bold" style="font-size: 14px;">
              <span>TOTAL</span>
              <span>${total.toLocaleString()} ₭</span>
            </div>
            <div class="item">
               <span>PAYMENT</span>
               <span>${method === 'cash' ? 'CASH' : 'QR PAY'}</span>
            </div>
            ${receivedAmount ? `
            <div class="item">
               <span>CASH</span>
               <span>${parseInt(receivedAmount).toLocaleString()}</span>
            </div>
            <div class="item">
               <span>CHANGE</span>
               <span>${(parseInt(receivedAmount) - total).toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="line"></div>
            <div class="text-center">
              ${settings?.receiptFooter || 'Thank you!'}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  if (!isOpen) return null;

  const change = Math.max(0, (parseInt(receivedAmount) || 0) - total);
  // Allow confirming QR payments even if generation failed (manual backup)
  const canPay = method === 'qr' || (parseInt(receivedAmount) || 0) >= total;

  const handleConfirm = () => {
    if (isProcessing || isSuccess) return; // Prevent double submission
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1000);
  };
  
  const handleSwitchToDemo = () => {
    setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BCEL_OnePay_${total}_DEMO`);
    setQrError('');
    setIsLoadingQR(false);
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
              disabled={isSuccess}
              onClick={() => setMethod('cash')}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                method === 'cash' 
                  ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100' 
                  : 'border-transparent hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-50'
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
                disabled={isSuccess}
                onClick={() => setMethod('qr')}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                  method === 'qr' 
                    ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100' 
                    : 'border-transparent hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-50'
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
               <p className="text-slate-500 font-medium mb-8">Redirecting to sales...</p>
               
               <div className="flex gap-4 w-full max-w-md">
                 <button 
                   onClick={handlePrint}
                   className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                 >
                   <Printer size={20} />
                   {t('printReceipt')}
                 </button>
               </div>
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
                      <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-xl mb-6 relative group cursor-pointer w-[300px] h-[300px] flex items-center justify-center bg-slate-50 overflow-hidden">
                        
                        {isLoadingQR ? (
                          <div className="flex flex-col items-center gap-3 text-slate-500">
                             <Loader2 size={48} className="animate-spin text-indigo-500" />
                             <span className="text-xs font-bold animate-pulse">Generating BCEL QR...</span>
                          </div>
                        ) : qrError ? (
                           <div className="flex flex-col items-center gap-3 text-red-500 p-4 text-center">
                             <AlertCircle size={40} />
                             <div>
                                <p className="font-bold text-sm">Failed to generate QR</p>
                                <p className="text-[10px] mt-1 opacity-75 break-words max-w-[200px]">{qrError}</p>
                             </div>
                             <div className="flex flex-col gap-2 mt-2 w-full">
                               <button 
                                 onClick={generatePhaJayQR}
                                 className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full"
                               >
                                 <RefreshCw size={14} /> Retry
                               </button>
                               {qrError.includes("Amount must be between") && (
                                 <button 
                                   onClick={handleSwitchToDemo}
                                   className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full"
                                 >
                                    <QrCode size={14} /> Switch to Demo QR
                                 </button>
                               )}
                             </div>
                           </div>
                        ) : qrCodeImage ? (
                          <>
                             <img 
                               src={qrCodeImage} 
                               alt="Payment QR" 
                               className="w-full h-full object-contain mix-blend-multiply relative z-10"
                             />
                             {/* Socket Status Indicator */}
                             <div className={`absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-full border border-slate-100 shadow-sm z-20`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    socketStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                                    socketStatus === 'error' ? 'bg-yellow-400' : 'bg-yellow-400'
                                }`}></div>
                                <span className={`text-[10px] font-bold ${socketStatus === 'error' ? 'text-yellow-600' : 'text-slate-600'}`}>
                                  {socketStatus === 'connected' ? 'Live' : 
                                   socketStatus === 'error' ? 'Offline' : 'Connecting'}
                                </span>
                             </div>
                          </>
                        ) : (
                           <div className="flex flex-col items-center gap-2 text-slate-400">
                             <Loader2 size={32} className="animate-spin" />
                             <span className="text-xs font-bold">Initializing...</span>
                           </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                           <p className="text-slate-600 font-bold text-lg">{t('scanPrompt')}</p>
                        </div>
                        
                        {activeSecretKey && (
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                            <Key size={10} />
                            Key: {activeSecretKey.substring(0, 8)}...
                          </div>
                        )}

                        <p className="text-slate-400 text-sm max-w-xs text-center">{t('waiting')}</p>
                        
                        {socketStatus === 'error' && (
                           <div className="mt-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100 flex flex-col items-center gap-2 max-w-sm text-center animate-in fade-in slide-in-from-top-1">
                             <div className="flex items-center gap-2">
                                <AlertTriangle size={16} className="shrink-0" />
                                <span>{t('offlineMode')}</span>
                             </div>
                             {socketErrorMsg && (
                                <span className="text-[10px] text-red-500 font-mono bg-white/50 px-2 py-1 rounded border border-red-100/50 break-all">
                                    {socketErrorMsg}
                                </span>
                             )}
                             <button 
                                onClick={retrySocketConnection} 
                                className="mt-1 flex items-center gap-1 bg-white px-3 py-1 rounded-md shadow-sm border border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition-colors"
                             >
                               <RefreshCw size={12} />
                               {t('retryConnect')}
                             </button>
                           </div>
                        )}
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

                     {method === 'qr' && (
                        socketStatus === 'error' ? (
                          // Offline Fallback Button (Manual Confirm)
                          <button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-yellow-200"
                          >
                            <AlertTriangle size={24} />
                            <span>Manual Confirm (Offline)</span>
                          </button>
                        ) : (
                          // Online Mode - Status Only (No Confirm Button)
                          <div className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 bg-slate-100 border-2 border-slate-100 text-lg flex items-center justify-center gap-3 transition-all duration-300">
                            <Loader2 size={24} className="animate-spin text-indigo-500" />
                            <span className="animate-pulse">{t('waiting')}</span>
                          </div>
                        )
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
