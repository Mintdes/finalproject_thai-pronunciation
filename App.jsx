import { useState } from 'react';
import styled from 'styled-components';
import ChooseSentenceView from './components/ChooseSentenceView';
import HomeView from './components/HomeView';
import PracticeView from './components/PracticeView';
import WelcomeView from './components/WelcomeView';
// 🆕 1. Import LoginView เข้ามาใช้งาน
import LoginView from './components/LoginView';

// --- โครงสร้างเลย์เอาต์หลักของแอป ---
const AppContainer = styled.div`
  font-family: 'Prompt', system-ui, -apple-system, sans-serif;
  background-color: #fcebd2;
  color: #333;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
`;

const MainCard = styled.div`
  width: 380px;
  max-width: 90%;
  height: 90vh;
  background: #fdf6ec; 
  border-radius: 40px;
  padding: 35px 25px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; 
  &::-webkit-scrollbar { display: none; }
`;

const HeaderIcons = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const RightIconsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LanguageButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
`;

const ProfileIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  cursor: pointer; /* 🆕 เปลี่ยน cursor เพื่อให้รู้ว่ากดได้ */
`;

const ProfileImagePlaceholder = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 70%;
  background-color: #fcebd2;
  border: 2px solid #333;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
`;

const HeaderTextContainer = styled.div`
  width: 100%;
  text-align: left;
  margin-bottom: 25px;
`;

const GreetingText = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #222;
  line-height: 1.5;
`;

const UserSubtitle = styled.p`
  font-size: 13px;
  color: #555;
  margin: 6px 0 0 0;
`;

// --- ไอคอนส่วนหัว ---
const LanguageIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const AchievementIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
);
const NotificationIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);

function App() {
  // 🆕 2. สร้าง State เพื่อเช็คว่าล็อกอินหรือยัง (เริ่มต้นเป็น false เพื่อบังคับให้ผ่านหน้า Login ก่อน)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentView, setCurrentView] = useState('welcome');
  const [activeLevel, setActiveLevel] = useState({ id: 'easy', title: 'เริ่มต้น', icon: '🐣', color: '#c6f6d5' });
  const [selectedPhrase, setSelectedPhrase] = useState(null);

  const userName = "The one and only Theerakit K. Lee";

  const handleConfirmSelection = (chosenLevelInfo) => {
    setActiveLevel(chosenLevelInfo);
    setCurrentView('home');
  };

  // 🆕 3. ฟังก์ชันการจัดการเมื่อกดยืนยันการ Auth สำเร็จจาก LoginView
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView('welcome'); // เมื่อล็อกอินสำเร็จ ให้ส่งผู้ใช้ไปหน้าประเมินระดับ/เลือกเลเวลเริ่มต้น
  };

  // 🆕 4. ฟังก์ชันจำลองการ Log out (ผูกไว้กับปุ่ม Profile เผื่ออยากทดสอบสลับหน้า)
  const handleLogOut = () => {
    if (confirm("Do you want to log out?")) {
      setIsLoggedIn(false);
      setSelectedPhrase(null);
    }
  };

  const renderCurrentView = () => {
    // 🆕 5. ถ้าสถานะยังไม่ได้ล็อกอิน ให้บังคับเรนเดอร์หน้าจอ LoginView เท่านั้น
    if (!isLoggedIn) {
      return <LoginView onAuthSuccess={handleAuthSuccess} />;
    }

    if (currentView === 'welcome') {
      return <WelcomeView onConfirmSelection={handleConfirmSelection} />;
    }
    if (currentView === 'home') {
      return (
        <HomeView
          currentLevel={activeLevel}
          onChangeLevel={(newLevel) => setActiveLevel(newLevel)}
          onContinue={() => setCurrentView('choose_sentence')}
        />
      );
    }
    if (currentView === 'choose_sentence') {
      return (
        <ChooseSentenceView
          onBack={() => setCurrentView('home')}
          onSelectSentence={(phraseData) => {
            setSelectedPhrase(phraseData);
            setCurrentView('practice');
          }}
        />
      );
    }
    if (currentView === 'practice') {
      return (
        <PracticeView
          onBack={() => setCurrentView('choose_sentence')}
          phraseData={selectedPhrase}
        />
      );
    }
    return null;
  };

  return (
    <AppContainer>
      <MainCard>
        {/* 🆕 6. ปรับเงื่อนไขตรวจสอบ: Header จะแสดงก็ต่อเมื่อล็อกอินแล้ว และไม่ได้อยู่ในหน้าเลือกประโยค/ฝึกฝน */}
        {isLoggedIn && currentView !== 'choose_sentence' && currentView !== 'practice' && (
          <HeaderIcons>
            <LanguageButton>
              <LanguageIcon />
            </LanguageButton>

            <RightIconsGroup>
              <div style={{ marginTop: '10px' }}><AchievementIcon /></div>
              <div style={{ marginTop: '10px' }}><NotificationIcon /></div>
              <ProfileIcon onClick={handleLogOut}>
                <ProfileImagePlaceholder>🐶</ProfileImagePlaceholder>
                <span>Log out</span>
              </ProfileIcon>
            </RightIconsGroup>
          </HeaderIcons>
        )}

        {/* 🆕 7. ปรับเงื่อนไขตรวจสอบการแสดงข้อความต้อนรับเช่นเดียวกัน */}
        {isLoggedIn && currentView !== 'choose_sentence' && currentView !== 'practice' && (
          <HeaderTextContainer>
            <GreetingText>Good Evening, {userName}</GreetingText>
            <UserSubtitle>Today, are you ready to learn Thai?</UserSubtitle>
          </HeaderTextContainer>
        )}

        {renderCurrentView()}

      </MainCard>
    </AppContainer>
  );
}

export default App;