// src/App.jsx
import { useState } from 'react';
import styled from 'styled-components';
import HomeView from './components/HomeView';
import WelcomeView from './components/WelcomeView';

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
  background: #fdf6ec; /* ปรับสีการ์ดหลังให้สว่างครีมละมุนขึ้นตามรูปใหม่ */
  border-radius: 40px;
  padding: 35px 25px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; /* เผื่อหน้าจอ Home ยาวขึ้นในมือถือบางรุ่น */
  &::-webkit-scrollbar { display: none; }
`;

const HeaderIcons = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 25px;
`;

const ProfileIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
`;

const ProfileImagePlaceholder = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
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
  line-height: 1.4;
`;

const UserSubtitle = styled.p`
  font-size: 13px;
  color: #555;
  margin: 6px 0 0 0;
`;

// --- ไอคอนส่วนหัว ---
const AchievementIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
);
const NotificationIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);

function App() {
  const [currentView, setCurrentView] = useState('welcome');

  // โครงสร้างเริ่มต้น ป้องกันไม่ให้แอปอ่านค่าโปรปส์ไม่ได้จนเกิดหน้าจอขาว
  const [activeLevel, setActiveLevel] = useState({
    id: 'easy',
    title: 'เริ่มต้น',
    icon: '🐣',
    color: '#c6f6d5'
  });

  const userName = "The one and only Theerakit K. Lee";

  // เช็กว่าฟังก์ชันนี้มีการรับค่าเลเวลที่ส่งมาจาก WelcomeView หรือยัง
  const handleConfirmSelection = (chosenLevelInfo) => {
    if (chosenLevelInfo) {
      setActiveLevel(chosenLevelInfo);
    }
    setCurrentView('home');
  };

  return (
    <AppContainer>
      <MainCard>
        <HeaderIcons>
          <div style={{ marginTop: '10px' }}><AchievementIcon /></div>
          <div style={{ marginTop: '10px' }}><NotificationIcon /></div>
          <ProfileIcon>
            <ProfileImagePlaceholder>🐶</ProfileImagePlaceholder>
            <span>Profile</span>
          </ProfileIcon>
        </HeaderIcons>

        <HeaderTextContainer>
          <GreetingText>สวัสดีตอนเย็น, คุณ {userName}</GreetingText>
          <UserSubtitle>วันนี้พร้อมที่จะเรียนภาษาไทยหรือยัง?</UserSubtitle>
        </HeaderTextContainer>

        {/* ตรวจสอบการส่งโปรปส์ให้ครบถ้วน */}
        {currentView === 'welcome' ? (
          <WelcomeView onConfirmSelection={handleConfirmSelection} />
        ) : (
          <HomeView currentLevel={activeLevel} onChangeLevel={() => setCurrentView('welcome')} />
        )}

      </MainCard>
    </AppContainer>
  );
}

export default App;