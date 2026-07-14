import { useState } from 'react';
import styled from 'styled-components';

// --- STYLED COMPONENTS (สำหรับหน้าหลัก) ---
const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 35px;
  padding: 25px 20px;
  box-sizing: border-box;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  text-align: left;
`;

const CardTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: bold;
  color: #222;
`;

const DailyQuoteBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const QuoteText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  font-weight: 500;
`;

const AudioButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
`;

const DarkActionButton = styled.button`
  font-family: inherit;
  width: 100%;
  background-color: #222222;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;

const FlexHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ChangeTextLink = styled.span`
  color: #f97316;
  font-size: 14px;
  cursor: pointer;
`;

const StatusProgressCard = styled.div`
  width: 100%;
  background-color: ${props => props.bgColor || '#c6f6d5'}; 
  border-radius: 25px;
  padding: 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LevelEmoji = styled.span`
  font-size: 38px;
  line-height: 1;
  display: inline-block;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 14px;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  width: 0%; 
  height: 100%;
  background-color: #f97316; 
`;

const ProgressPercentText = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: bold;
  color: #333;
`;

const PrimaryOrangeButton = styled.button`
  font-family: inherit;
  width: 100%;
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 14px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
`;

// --- STYLED COMPONENTS (สำหรับ POP-UP CHOOSE LEVEL) ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: #ffffff;
  width: 320px;
  border-radius: 35px;
  padding: 25px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
`;

const LevelOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
`;

const LevelCard = styled.div`
  background-color: ${props => props.bgColor};
  border-radius: 20px;
  padding: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.1s;
  &:active { transform: scale(0.98); }
`;

// --- MAIN VIEW COMPONENT ---
function HomeView({ currentLevel, onChangeLevel, onContinue }) {
  // 🛠️ 1. เพิ่ม State คุมเปิด-ปิด Pop-up เลือกเลเวลภายในหน้านี้เลย
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isMedium = currentLevel.id === 'medium';

  const contentData = {
    quote: isMedium
      ? `"หมาป่าที่เคยเดียวดาย มันเพิ่งได้ลองลิ้มรสของน้ำผึ้งหวานแค่หกเดือนเองนะ"`
      : `"ฉันพร่ำบอกเธอเช้าค่ำ\nว่าภายใต้การดูแลของฉัน เธอจะปลอดภัย"`,
    emoji: isMedium ? '🐥' : '🐣',
    title: isMedium ? 'Medium' : 'Beginner',
    bgColor: isMedium ? '#feebc8' : '#c6f6d5'
  };

  const handleSelectNewLevel = (levelConfig) => {
    onChangeLevel(levelConfig);
    setIsModalOpen(false);
  };

  return (
    <ContentWrapper>
      {/* ... โค้ดส่วนการ์ดประโยคประจำวันคงเดิม ... */}
      <SectionCard>
        <CardTitle>Daily Sentence</CardTitle>
        <DailyQuoteBox>
          <QuoteText style={{ whiteSpace: 'pre-line' }}>{contentData.quote}</QuoteText>
          <AudioButton onClick={() => alert('เล่นเสียงพูด...')}>🔊</AudioButton>
        </DailyQuoteBox>
        <DarkActionButton onClick={() => alert('เริ่มบันทึกเสียงพูด!')}>I want to try!</DarkActionButton>
      </SectionCard>

      {/* ส่วนระดับปัจจุบัน */}
      <SectionCard style={{ paddingBottom: '15px' }}>
        <FlexHeader>
          <CardTitle style={{ margin: 0 }}>Current Level</CardTitle>
          <ChangeTextLink onClick={() => setIsModalOpen(true)}>change</ChangeTextLink>
        </FlexHeader>

        <StatusProgressCard bgColor={contentData.bgColor}>
          <StatusInfoRow>
            <LevelEmoji>{contentData.emoji}</LevelEmoji>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{contentData.title}</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#444' }}>Basic Sentence</p>
            </div>
          </StatusInfoRow>

          <ProgressBarContainer><ProgressBarFill /></ProgressBarContainer>
          <ProgressPercentText>Progress 0%</ProgressPercentText>
        </StatusProgressCard>

        {/* 🛠️ แก้ไขตรงนี้: ผูกเหตุการณ์ onClick ให้ไปเรียกฟังก์ชัน onContinue */}
        <PrimaryOrangeButton onClick={onContinue}>
          ▶ Continue
        </PrimaryOrangeButton>
      </SectionCard>
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setIsModalOpen(false)}>✕</CloseButton>
            <h3 style={{ margin: '5px 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>Select Difficulty Level</h3>

            <LevelOptionsContainer>
              {/* ตัวเลือกเริ่มต้น (Easy) */}
              <LevelCard bgColor="#c6f6d5" onClick={() => handleSelectNewLevel({ id: 'easy', title: 'Beginner', icon: '🐣', color: '#c6f6d5' })}>
                <div style={{ fontSize: '28px' }}>🐣</div>
                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Beginner</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#555' }}>Basic Sentence</p>
                </div>
              </LevelCard>

              {/* ตัวเลือกปานกลาง (Medium) */}
              <LevelCard bgColor="#feebc8" onClick={() => handleSelectNewLevel({ id: 'medium', title: 'Medium', icon: '🐥', color: '#feebc8' })}>
                <div style={{ fontSize: '28px' }}>🐥</div>
                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Medium</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#555' }}>Interactive Sentence</p>
                </div>
              </LevelCard>
            </LevelOptionsContainer>
          </ModalCard>
        </ModalOverlay>
      )}
    </ContentWrapper>
  );
}

export default HomeView;