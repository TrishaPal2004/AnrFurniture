import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState(''); // Store generated OTP
  const [otpExpiry, setOtpExpiry] = useState(null); // Store OTP expiry time

  // EmailJS configuration
  const EMAILJS_SERVICE_ID ="service_504jiho"; // Replace with your EmailJS service ID
  const EMAILJS_TEMPLATE_ID = "service_504jiho"; // Replace with your EmailJS template ID
  const EMAILJS_PUBLIC_KEY = "aTOq6h_cUzPy7UMW5"; // Replace with your EmailJS public key

  // Generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Format expiry time
  const formatExpiryTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Sending OTP...', { id: 'otp' });

      // Generate OTP and expiry time
      const newOTP = generateOTP();
      const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      
      setGeneratedOTP(newOTP);
      setOtpExpiry(expiryTime);

      // Prepare email template parameters
      const templateParams = {
        to_email: email,
        passcode: newOTP,
        time: formatExpiryTime(expiryTime),
        to_name: email.split('@')[0], // Use email username as name
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (response.status === 200) {
        toast.success('OTP sent to your email!', { id: 'otp' });
        setStep(2);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP. Please try again.', { id: 'otp' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    // Check if OTP has expired
    if (otpExpiry && new Date() > otpExpiry) {
      toast.error('OTP has expired. Please request a new one.');
      setStep(1);
      setGeneratedOTP('');
      setOtpExpiry(null);
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Verifying OTP...', { id: 'verify' });

      // Verify OTP (client-side for demo - in production, verify on server)
      if (otp === generatedOTP) {
        toast.success('OTP verified successfully!', { id: 'verify' });
        setStep(3);
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Invalid OTP', { id: 'verify' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Resetting password...', { id: 'reset' });

      // Here you would typically make an API call to your backend to reset the password
      // For demo purposes, we'll simulate the API call
      const response = await fetch('https://anrfurniture-2.onrender.com/api/user/reset-password-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success('Password reset successfully!', { id: 'reset' });
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password', { id: 'reset' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    padding: '12px',
    marginTop: '16px',
    width: '100%',
    borderRadius: '8px',
    backgroundColor: isLoading ? '#ccc' : '#00ffff',
    color: 'black',
    fontWeight: 'bold',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
  };

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        padding: '30px',
        boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        backgroundColor: '#fff',
        width: '400px',
        maxWidth: '90vw',
      }}>
        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <h2 style={{
              textAlign: 'center',
              paddingBottom: '20px',
              color: '#333',
            }}>Forgot Password</h2>
            
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
              Enter your email address and we'll send you an OTP to reset your password.
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={inputStyle}
              disabled={isLoading}
              required
            />

            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <p style={{
              textAlign: 'center',
              marginTop: '16px',
              color: '#666',
              cursor: 'pointer'
            }} onClick={() => navigate('/login')}>
              Remember your password?{' '}
              <span style={{ color: '#00ffff', textDecoration: 'underline' }}>
                Back to Login
              </span>
            </p>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <h2 style={{
              textAlign: 'center',
              paddingBottom: '20px',
              color: '#333',
            }}>Verify OTP</h2>
            
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
              Enter the 6-digit OTP sent to {email}
            </p>

            {otpExpiry && (
              <p style={{ 
                textAlign: 'center', 
                color: '#ff6b6b', 
                fontSize: '14px', 
                marginBottom: '10px' 
              }}>
                OTP expires at {formatExpiryTime(otpExpiry)}
              </p>
            )}

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              style={{
                ...inputStyle,
                textAlign: 'center',
                fontSize: '24px',
                letterSpacing: '0.5em',
                fontWeight: 'bold'
              }}
              disabled={isLoading}
              maxLength={6}
              required
            />

            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <span
                style={{
                  color: '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => {
                  setStep(1);
                  setGeneratedOTP('');
                  setOtpExpiry(null);
                }}
              >
                Change Email
              </span>
              
              <span
                style={{
                  color: '#00ffff',
                  fontSize: '14px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                  pointerEvents: isLoading ? 'none' : 'auto'
                }}
                onClick={() => !isLoading && handleSendOTP({ preventDefault: () => {} })}
              >
                Resend OTP
              </span>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <h2 style={{
              textAlign: 'center',
              paddingBottom: '20px',
              color: '#333',
            }}>Reset Password</h2>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              style={inputStyle}
              disabled={isLoading}
              minLength={6}
              required
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              style={inputStyle}
              disabled={isLoading}
              minLength={6}
              required
            />

            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;