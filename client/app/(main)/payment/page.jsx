"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';;
import { CreditCard, ShieldCheck, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import '../../../src/styles/Payment.css';

const Payment = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const handlePayment = (e) => {
    e.preventDefault();
    setStep(2); // Success step
  };

  return (
    <div className="payment-page">
      <div className="container payment-container">
        {step === 1 ? (
          <motion.div 
            className="payment-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="payment-header">
              <h2>Secure Checkout</h2>
              <p>Mastering Full-Stack Web Development</p>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Course Price</span>
                <span>₹14,999</span>
              </div>
              <div className="summary-row discount">
                <span>Discount (66% OFF)</span>
                <span>-₹10,000</span>
              </div>
              <div className="summary-row total">
                <span>Total Payable</span>
                <span>₹4,999</span>
              </div>
            </div>

            <form className="payment-form" onSubmit={handlePayment}>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input type="text" placeholder="JOHN DOE" required />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <div className="input-with-icon">
                  <CreditCard size={18} />
                  <input type="text" placeholder="4242 4242 4242 4242" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" required />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input type="password" placeholder="•••" required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Pay Securely ₹4,999 <ShieldCheck size={18} />
              </button>
            </form>

            <div className="secure-footer">
              <div className="badge">
                <Lock size={14} /> 256-bit SSL Encryption
              </div>
              <div className="payment-icons">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="payment-success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="success-icon">
              <CheckCircle size={80} color="var(--success)" />
            </div>
            <h2>Payment Successful!</h2>
            <p>Your enrollment is confirmed. Welcome to the GuruEdu family!</p>
            <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
              Go to Dashboard <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Payment;
