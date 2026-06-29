import { useState } from 'react';
import styled from 'styled-components';

// --- STYLED COMPONENTS (หน้าหลัก) ---
const AppContainer = styled.div`
  font-family: 'Prompt', sans-serif;
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
  background: white;
  border-radius: 40px;
  padding: 40px 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  /* ลดความคมชัดหน้าจอหลังลงเล็กน้อยเมื่อเปิด Modal เพื่อความสมจริง */
  filter: ${props => props.isDimmed ? 'contrast(0.9) brightness(0.9)' : 'none'};
  transition: filter 0.3s ease;
`;

const HeaderIcons = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 30px;
  opacity: ${props => props.isDimmed ? 0.3 : 1};
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
  margin-bottom: 30px;
  opacity: ${props => props.isDimmed ? 0.3 : 1};
`;

const GreetingText = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #222;
  line-height: 1.4;
`;

const UserSubtitle = styled.p`
  font-size: 16px;
  color: #555;
  margin: 8px 0 0 0;
`;

const StartLearningContainer = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const PersonTalking = styled.div`
  width: 40px;
  height: 60px;
  border-radius: 10px;
  background: ${props => props.color};
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -25px;
    left: 5px;
    width: 30px;
    height: 30px;
    background: #55d6b4; // Chat bubble color
    border-radius: 15px 15px 0 15px;
  }
`;

const StartLearningTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin: 0;
`;

const ActionButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ActionButton = styled.button`
  font-family: inherit;
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 16px 25px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2);
  &:hover {
    background-color: #e86400;
  }
`;

const HintText = styled.p`
  font-size: 13px;
  color: #444;
  margin: 6px 0 0 0;
  font-weight: 500;
`;

// --- STYLED COMPONENTS (ปรับใหม่ให้อยู่ตรงกลางหน้าจอ) ---
const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* เพิ่มความเข้มพื้นหลังให้ดูโฟกัสตรงกลางมากขึ้น */
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center; /* จัดให้อยู่กึ่งกลางหน้าจอในแนวตั้ง */
  padding: 20px;
  box-sizing: border-box;
  z-index: 10;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalCard = styled.div`
  width: 90%;
  max-width: 330px; /* บีบขนาดกล่องไม่ให้ขยายเต็มการ์ดหลังเกินไป */
  background: white;
  border-radius: 30px;
  padding: 30px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* เอฟเฟกต์เด้งออกแบบมีมิติ (Pop out) */

  @keyframes scaleUp {
    from { transform: scale(0.85); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff5b5b;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  &:hover {
    background: #e04444;
  }
`;

const LevelOptionsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 35px; /* เว้นระยะจากปุ่มกากบาทด้านบน */
`;

const LevelCard = styled.div`
  width: 100%;
  background-color: ${props => props.bgColor};
  border-radius: 20px;
  padding: 15px 18px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }
`;

const LevelIconCircle = styled.div`
  font-size: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LevelTextGroup = styled.div`
  text-align: left;
`;

const LevelTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #222;
`;

const LevelDesc = styled.p`
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #555;
`;

// --- ไอคอนจำลอง ---
const AchievementIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const NotificationIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// --- MAIN COMPONENT ---
function App() {
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  const userName = "The one and only Theerakit K. Lee";

  return (
    <AppContainer>
      <MainCard isDimmed={isLevelModalOpen}>

        <HeaderIcons isDimmed={isLevelModalOpen}>
          <div style={{ marginTop: '10px' }}><AchievementIcon /></div>
          <div style={{ marginTop: '10px' }}><NotificationIcon /></div>
          <ProfileIcon>
            <ProfileImagePlaceholder>🐶</ProfileImagePlaceholder>
            <span>Profile</span>
          </ProfileIcon>
        </HeaderIcons>

        <HeaderTextContainer isDimmed={isLevelModalOpen}>
          <GreetingText>สวัสดีตอนเย็น, คุณ {userName}</GreetingText>
          <UserSubtitle>วันนี้พร้อมที่จะเรียนภาษาไทยหรือยัง?</UserSubtitle>
        </HeaderTextContainer>

        <StartLearningContainer>
          <StartLearningTitle>เริ่มต้นการเรียนรู้ของคุณ</StartLearningTitle>

          <div style={{ display: 'flex', gap: '30px' }}>
            <PersonTalking color="#e5e7eb" /> {/* Placeholder Person 1 */}
            <PersonTalking color="#a5b4fc" /> {/* Placeholder Person 2 */}
          </div>
          <ActionButtonGroup>
            <div>
              <ActionButton onClick={() => setIsLevelModalOpen(true)}>
                เลือกระดับความยาก
              </ActionButton>
              <HintText>เลือกเรียนระดับไหนก็ได้ตามต้องการ!</HintText>
            </div>

            <div>
              <ActionButton>วัดระดับการฝึกออกเสียงภาษาไทย</ActionButton>
              <HintText>วัดระดับเพื่อให้เราเลือกหลักสูตรที่เหมาะกับคุณ!</HintText>
            </div>
          </ActionButtonGroup>
        </StartLearningContainer>

        {/* --- หน้าต่างเลือกระดับความยากแบบเด้งตรงกลาง (Center Popup Modal) --- */}
        {isLevelModalOpen && (
          <ModalOverlay onClick={() => setIsLevelModalOpen(false)}>
            <ModalCard onClick={(e) => e.stopPropagation()}>

              <CloseButton onClick={() => setIsLevelModalOpen(false)}>✕</CloseButton>

              <LevelOptionsContainer>
                {/* ระดับเริ่มต้น */}
                <LevelCard bgColor="#c6f6d5" onClick={() => { alert('ระดับเริ่มต้น'); setIsLevelModalOpen(false); }}>
                  <LevelIconCircle>🐣</LevelIconCircle>
                  <LevelTextGroup>
                    <LevelTitle>เริ่มต้น</LevelTitle>
                    <LevelDesc>ประโยคพื้นฐาน</LevelDesc>
                  </LevelTextGroup>
                </LevelCard>

                {/* ระดับปานกลาง */}
                <LevelCard bgColor="#feebc8" onClick={() => { alert('ระดับปานกลาง'); setIsLevelModalOpen(false); }}>
                  <LevelIconCircle>🐥</LevelIconCircle>
                  <LevelTextGroup>
                    <LevelTitle>ปานกลาง</LevelTitle>
                    <LevelDesc>ประโยคพื้นฐาน</LevelDesc>
                  </LevelTextGroup>
                </LevelCard>
              </LevelOptionsContainer>

            </ModalCard>
          </ModalOverlay>
        )}

      </MainCard>
    </AppContainer>
  );
}

export default App;