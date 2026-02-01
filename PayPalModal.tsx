
import React, { useState } from 'react';
import { PlanLevel, PLAN_LIMITS } from '../types';
import { api } from '../services/api';

interface PayPalModalProps {
  plan: PlanLevel; // The plan the user attempted to use or upgrade to
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

const PRICING = {
  FREE: { price: 0, credits: 20 },
  PRO: { price: 99, credits: 2000 },
  PRO_PLUS: { price: 199, credits: 6000 }
};

const PayPalModal: React.FC<PayPalModalProps> = ({ plan, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  
  // Default to upgrading to PRO if passed FREE (e.g. from logic error), otherwise target specific plan
  const targetPlan = plan === 'FREE' ? 'PRO' : plan; 
  const details = PRICING[targetPlan];
  const limits = PLAN_LIMITS[targetPlan];

  const handleSimulatedPayment = async () => {
    setProcessing(true);
    try {
       // 1. Simulate PayPal
       const fakeOrderId = `ORD-${Date.now()}`;
       await api.payment.processPayPalOrder(fakeOrderId, targetPlan);
       
       // 2. Upgrade User
       const updatedUser = await api.auth.updateUserPlan(targetPlan, details.credits);
       
       onSuccess(updatedUser);
       onClose();
    } catch (e) {
       alert("Payment failed. Please try again.");
       setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="bg-[#003087] p-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 filter brightness-0 invert" />
              <span className="text-white/50 text-xs">| Secure Checkout</span>
           </div>
           <button onClick={onClose} className="text-white/80 hover:text-white text-xl">&times;</button>
        </div>

        <div className="p-8">
           <div className="text-center mb-8">
              <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold mb-2">Subscribe to SimuCrowd</p>
              <h3 className="text-3xl font-bold text-zinc-900">{limits.name}</h3>
              <div className="text-5xl font-extrabold text-[#003087] mt-4">
                 ${details.price}<span className="text-lg text-zinc-400 font-medium">/mo</span>
              </div>
              
              <div className="mt-6 space-y-2 bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-left">
                 <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <span className="text-green-500">✓</span> <strong>{details.credits.toLocaleString()}</strong> Monthly Credits
                 </div>
                 <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <span className="text-green-500">✓</span> <strong>{limits.maxBriefs}</strong> Master Briefs Storage
                 </div>
                 {targetPlan === 'PRO_PLUS' && (
                    <div className="flex items-center gap-2 text-sm text-zinc-700">
                       <span className="text-green-500">✓</span> <strong>FGI Mode</strong> (Deep Follow-up)
                    </div>
                 )}
              </div>
           </div>

           <div className="space-y-3">
              <button 
                onClick={handleSimulatedPayment}
                disabled={processing}
                className="w-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold py-3 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 relative overflow-hidden"
              >
                 {processing ? (
                    <span className="flex items-center gap-2">
                       <span className="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin"></span>
                       Processing...
                    </span>
                 ) : (
                    <>
                       <span className="italic font-serif font-bold text-lg">Pay</span>
                       <span className="italic font-serif font-bold text-lg text-[#009cde]">Pal</span>
                    </>
                 )}
              </button>
              <button disabled className="w-full bg-zinc-100 text-zinc-400 py-3 rounded-full font-bold cursor-not-allowed text-xs">
                 Debit or Credit Card (Coming Soon)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalModal;
