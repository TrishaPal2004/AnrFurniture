import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpToken, setOtpToken] = useState(''); // Store OTP token from backend

  // Step 1: Send OTP to phone
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    // Clean phone number for validation
    const phoneWithCode = "+91" + phone.trim(); 

    try {
      setIsLoading(true);
      toast.loading('Sending OTP...', { id: 'otp' });

      const response = await fetch('https://anrfurniture-2.onrender.com/api/user/forgot-password-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneWithCode }), // Send clean phone number
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpToken(data.otpToken); // Store the OTP token
      toast.success('OTP sent to your phone!', { id: 'otp' });
      setStep(2);
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP', { id: 'otp' });
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

    try {
      setIsLoading(true);
      toast.loading('Verifying OTP...', { id: 'verify' });

      const cleanPhone = phone.replace(/\D/g, '');

      const response = await fetch('https://anrfurniture-2.onrender.com/api/user/verify-otp-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: cleanPhone, 
          otp, 
          otpToken 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      toast.success('OTP verified successfully!', { id: 'verify' });
      setStep(3);
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

      const cleanPhone = phone.replace(/\D/g, '');

      const response = await fetch('https://anrfurniture-2.onrender.com/api/user/reset-password-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: cleanPhone, 
          newPassword, 
          otpToken 
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
        {/* Step 1: Phone Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <h2 style={{
              textAlign: 'center',
              paddingBottom: '20px',
              color: '#333',
            }}>Forgot Password</h2>
            
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
              Enter your phone number and we'll send you an OTP to reset your password.
            </p>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number (1234567890)"
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
              Enter the 6-digit OTP sent to {phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
            </p>

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
                onClick={() => setStep(1)}
              >
                Change Phone
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