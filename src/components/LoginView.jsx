import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, UserPlus } from 'lucide-react';
import { useState } from 'react';
import styled from 'styled-components';

// --- STYLED COMPONENTS ---
const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 25px;
  h1 { font-size: 50px; font-weight: 800; margin: 0; color: #000; }
  p { font-size: 18px; color: #333; margin: 0; }
`;

const ViewHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  color: #f97316;
  font-size: 20px;
  font-weight: bold;
  width: 100%;
`;

const InputGroup = styled.div`
  margin-bottom: 18px;
  width: 100%;
  label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 15px; text-align: left; }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  background-color: #f9f3e9;
  border: none;
  border-radius: 20px;
  padding: 14px 18px;
  font-size: 15px;
  font-family: inherit;
  box-sizing: border-box;
  &:focus { outline: 2px solid #f97316; }
`;

const IconButton = styled.button`
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const PrimaryButton = styled.button`
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  transition: background 0.2s;
  &:hover { background-color: #ea580c; }
`;

const SecondaryButton = styled.button`
  background-color: #222;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
`;

const TextLink = styled.span`
  color: #f97316;
  font-weight: bold;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const FooterText = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  width: 100%;
`;

const OtpInputContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 20px 0;
  width: 100%;
`;

const OtpBox = styled.input`
  width: 40px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  border: 1.5px solid #ccc;
  border-radius: 12px;
  background: white;
  &:focus { border-color: #f97316; outline: none; }
`;

const BackIconBtn = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
  &:hover { color: #f97316; }
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 12px;
  margin: 4px 0 0 0;
  text-align: left;
  width: 100%;
`;

// --- MAIN LOGINVIEW COMPONENT ---
function LoginView({ onAuthSuccess }) {
    const [currentView, setCurrentView] = useState('login');
    const [otpSource, setOtpSource] = useState('login');
    const [showPw, setShowPw] = useState(false);
    const [showSignupPw, setShowSignupPw] = useState(false);
    const [showSignupConfirmPw, setShowSignupConfirmPw] = useState(false);
    const [showResetPw, setShowResetPw] = useState(false);
    const [showResetConfirmPw, setShowResetConfirmPw] = useState(false);

    // State สำหรับฟอร์มเข้าสู่ระบบ (Login)
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // State สำหรับฟอร์มสมัครสมาชิก (Signup)
    const [signupData, setSignupData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // ✨ เพิ่ม State สำหรับเก็บข้อมูลการเปลี่ยนรหัสผ่านใหม่ (Reset New Password)
    const [resetPasswordData, setResetPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // State สำหรับเก็บรหัส OTP 6 หลักที่กรอก
    const [otpValues, setOtpValues] = useState(Array(6).fill(''));

    // State สำหรับเก็บ Error Message
    const [errors, setErrors] = useState({});

    // ฟังก์ชันสำหรับกดยืนยันการเข้าสู่ระบบแบบเช็คค่าว่าง
    const handleLoginSubmit = () => {
        if (!loginEmail.trim() || !loginPassword.trim()) {
            alert('Please enter both Email and Password.');
            return;
        }
        onAuthSuccess();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSignupData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ✨ เพิ่มฟังก์ชันตรวจจับการพิมพ์ในหน้า Reset Password
    const handleResetInputChange = (e) => {
        const { name, value } = e.target;
        setResetPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleOtpChange = (element, index) => {
        const value = element.value.replace(/[^0-9]/g, '');
        if (!value && element.value !== '') return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        if (value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otpValues[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const validateSignup = () => {
        let tempErrors = {};
        if (signupData.username.trim().length < 5) {
            tempErrors.username = 'Username must be at least 5 characters long.';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(signupData.email)) {
            tempErrors.email = 'Invalid email address format.';
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        if (!passwordRegex.test(signupData.password)) {
            tempErrors.password = 'Password must be 8+ chars with (A-Z), (a-z), (0-9), and 1 special char.';
        }
        if (signupData.password !== signupData.confirmPassword) {
            tempErrors.confirmPassword = 'Passwords do not match.';
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // ✨ เพิ่มฟังก์ชันตรวจสอบความถูกต้องของรหัสผ่านตอนตั้งใหม่ (เลียนแบบมาจากหน้า Signup)
    const validateResetPassword = () => {
        let tempErrors = {};
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

        if (!passwordRegex.test(resetPasswordData.newPassword)) {
            tempErrors.newPassword = 'Password must be 8+ chars with (A-Z), (a-z), (0-9), and 1 special char.';
        }
        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            tempErrors.resetConfirmPassword = 'Passwords do not match.';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSignupSubmit = async () => {
        if (validateSignup()) {
            try {
                const response = await fetch('http://localhost:5000/api/auth/register-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: signupData.username,
                        email: signupData.email,
                        password: signupData.password
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    setOtpSource('signup');
                    setOtpValues(Array(6).fill(''));
                    setCurrentView('otp');
                } else {
                    setErrors(prev => ({ ...prev, email: data.message }));
                }
            } catch (err) {
                alert("Server connection failed.");
            }
        }
    };

    const handleOtpSubmit = async () => {
        const fullOtpCode = otpValues.join('');
        if (fullOtpCode.length < 6) {
            alert('Please enter all 6 digits of the OTP.');
            return;
        }

        if (otpSource === 'signup') {
            try {
                const response = await fetch('http://localhost:5000/api/auth/register-confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: signupData.username,
                        email: signupData.email,
                        password: signupData.password,
                        otpCode: fullOtpCode
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Registration successful! You can now log in.');
                    setCurrentView('login');
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert("Server connection failed.");
            }
        } else {
            // เคลียร์ Error ก่อนเข้าหน้าตั้งรหัสผ่านใหม่
            setErrors({});
            setCurrentView('reset-new');
        }
    };

    // ✨ ฟังก์ชันกดยืนยันการเปลี่ยนรหัสผ่านใหม่แบบตรวจสอบเงื่อนไข
    const handleResetPasswordSubmit = () => {
        if (validateResetPassword()) {
            alert('Password changed successfully!');
            // สั่งรีเซ็ตค่าในกล่องกรอกให้ว่างหลังจากทำรายการสำเร็จ
            setResetPasswordData({ newPassword: '', confirmPassword: '' });
            setCurrentView('login');
        }
    };

    return (
        <>
            {/* ================= 1. LOGIN VIEW ================= */}
            {currentView === 'login' && (
                <>
                    <LogoSection><h1>TH</h1><p>Thai Pronunciation</p></LogoSection>
                    <ViewHeader><ArrowRight size={20} /> Log in</ViewHeader>
                    <InputGroup>
                        <label>Email</label>
                        <StyledInput
                            placeholder="example@gmail.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                        />
                    </InputGroup>
                    <InputGroup>
                        <label>Password</label>
                        <InputWrapper>
                            <StyledInput
                                type={showPw ? "text" : "password"}
                                placeholder="**********"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                            <IconButton type="button" onClick={() => setShowPw(!showPw)}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                        </InputWrapper>
                        <p style={{ fontSize: '12px', textAlign: 'right', marginTop: '6px', color: '#666', cursor: 'pointer' }}
                            onClick={() => setCurrentView('reset-request')}>
                            Forgot password?
                        </p>
                    </InputGroup>
                    <PrimaryButton onClick={handleLoginSubmit}>Log in</PrimaryButton>
                    <FooterText>
                        Don't have an account? <TextLink onClick={() => setCurrentView('signup')}>Sign up</TextLink>
                    </FooterText>
                </>
            )}

            {/* ================= 2. SIGNUP VIEW ================= */}
            {currentView === 'signup' && (
                <>
                    <BackIconBtn onClick={() => setCurrentView('login')}><ArrowLeft size={20} /> Back to Log in</BackIconBtn>
                    <LogoSection><h1>TH</h1><p>Thai Pronunciation</p></LogoSection>
                    <ViewHeader><UserPlus size={20} /> Sign up</ViewHeader>

                    <InputGroup>
                        <label>Username</label>
                        <StyledInput name="username" value={signupData.username} onChange={handleInputChange} placeholder="YourName" />
                        {errors.username && <ErrorText>{errors.username}</ErrorText>}
                    </InputGroup>

                    <InputGroup>
                        <label>Email</label>
                        <StyledInput name="email" value={signupData.email} onChange={handleInputChange} placeholder="example@gmail.com" />
                        {errors.email && <ErrorText>{errors.email}</ErrorText>}
                    </InputGroup>

                    <InputGroup>
                        <label>Password</label>
                        <InputWrapper>
                            <StyledInput
                                name="password"
                                type={showSignupPw ? "text" : "password"}
                                value={signupData.password}
                                onChange={handleInputChange}
                                placeholder="**********"
                            />
                            <IconButton type="button" onClick={() => setShowSignupPw(!showSignupPw)}>
                                {showSignupPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                        </InputWrapper>
                        {errors.password && <ErrorText>{errors.password}</ErrorText>}
                    </InputGroup>

                    <InputGroup>
                        <label>Confirm Password</label>
                        <InputWrapper>
                            <StyledInput
                                name="confirmPassword"
                                type={showSignupConfirmPw ? "text" : "password"}
                                value={signupData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="**********"
                            />
                            <IconButton type="button" onClick={() => setShowSignupConfirmPw(!showSignupConfirmPw)}>
                                {showSignupConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                        </InputWrapper>
                        {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
                    </InputGroup>

                    <PrimaryButton onClick={handleSignupSubmit}>Sign up</PrimaryButton>
                    <FooterText>
                        Already have an account? <TextLink onClick={() => setCurrentView('login')}>Log in</TextLink>
                    </FooterText>
                </>
            )}

            {/* ================= 3. OTP VERIFICATION VIEW ================= */}
            {currentView === 'otp' && (
                <>
                    <BackIconBtn onClick={() => setCurrentView(otpSource)}><ArrowLeft size={20} /> Back</BackIconBtn>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <h3 style={{ fontWeight: '800', marginBottom: '8px', fontSize: '18px' }}>Enter 6-digit OTP code</h3>
                        <p style={{ fontSize: '13px', color: '#666' }}>We sent a verification code to <b>{signupData.email || 'your email'}</b></p>
                        <OtpInputContainer>
                            {otpValues.map((data, index) => (
                                <OtpBox
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={data}
                                    onChange={(e) => handleOtpChange(e.target, index)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                />
                            ))}
                        </OtpInputContainer>
                        <PrimaryButton onClick={handleOtpSubmit}>Confirm</PrimaryButton>
                        <p style={{ marginTop: '15px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', color: '#f97316' }} onClick={handleSignupSubmit}>Resend OTP</p>
                    </div>
                </>
            )}

            {/* ================= 4. RESET PASSWORD REQUEST VIEW ================= */}
            {currentView === 'reset-request' && (
                <>
                    <BackIconBtn onClick={() => setCurrentView('login')}><ArrowLeft size={20} /> Back to Log in</BackIconBtn>
                    <div style={{ textAlign: 'center', marginBottom: '15px', width: '100%' }}>
                        <div style={{ background: '#f97316', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'white' }}>
                            <Lock size={24} />
                        </div>
                        <h3 style={{ fontWeight: '800', margin: 0, fontSize: '18px' }}>Reset Password</h3>
                    </div>
                    <InputGroup>
                        <label>Email <span style={{ color: 'red' }}>*</span></label>
                        <StyledInput placeholder="example@gmail.com" />
                    </InputGroup>
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <SecondaryButton onClick={() => setCurrentView('login')}>Cancel</SecondaryButton>
                        <PrimaryButton style={{ marginTop: 0, flex: 2 }} onClick={() => { setOtpSource('reset-request'); setCurrentView('otp'); }}>
                            Send OTP
                        </PrimaryButton>
                    </div>
                </>
            )}

            {/* ================= 5. NEW PASSWORD SETUP VIEW ================= */}
            {currentView === 'reset-new' && (
                <>
                    <BackIconBtn onClick={() => setCurrentView('reset-request')}><ArrowLeft size={20} /> Back</BackIconBtn>
                    <div style={{ textAlign: 'center', marginBottom: '15px', width: '100%' }}>
                        <div style={{ background: '#f97316', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'white' }}>
                            <Lock size={24} />
                        </div>
                        <h3 style={{ fontWeight: '800', margin: 0, fontSize: '18px' }}>Reset Password</h3>
                    </div>

                    {/* ✨ เพิ่มข้อกำหนดและการผูก State สำหรับ New Password */}
                    <InputGroup>
                        <label>New Password <span style={{ color: 'red' }}>*</span></label>
                        <InputWrapper>
                            <StyledInput
                                name="newPassword"
                                type={showResetPw ? "text" : "password"}
                                value={resetPasswordData.newPassword}
                                onChange={handleResetInputChange}
                                placeholder="**********"
                            />
                            <IconButton type="button" onClick={() => setShowResetPw(!showResetPw)}>
                                {showResetPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                        </InputWrapper>
                        {errors.newPassword && <ErrorText>{errors.newPassword}</ErrorText>}
                    </InputGroup>

                    {/* ✨ เพิ่มข้อกำหนดและการผูก State สำหรับ Confirm Password */}
                    <InputGroup>
                        <label>Confirm Password <span style={{ color: 'red' }}>*</span></label>
                        <InputWrapper>
                            <StyledInput
                                name="confirmPassword"
                                type={showResetConfirmPw ? "text" : "password"}
                                value={resetPasswordData.confirmPassword}
                                onChange={handleResetInputChange}
                                placeholder="**********"
                            />
                            <IconButton type="button" onClick={() => setShowResetConfirmPw(!showResetConfirmPw)}>
                                {showResetConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                        </InputWrapper>
                        {errors.resetConfirmPassword && <ErrorText>{errors.resetConfirmPassword}</ErrorText>}
                    </InputGroup>

                    {/* ✨ เปลี่ยนปุ่มให้ไปเรียกใช้งานฟังก์ชันตรวจสอบรหัสผ่านใหม่ก่อนผ่านด่าน */}
                    <PrimaryButton onClick={handleResetPasswordSubmit}>
                        Confirm Reset
                    </PrimaryButton>
                </>
            )}
        </>
    );
}

export default LoginView;