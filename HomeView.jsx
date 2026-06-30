import styled from 'styled-components';

// --- STYLED COMPONENTS ---
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
  font-size: 16px;
  font-weight: bold;
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

// เปลี่ยนจากแอดทริบิวต์รูปภาพ มาเป็นกล่องข้อความขนาดใหญ่สำหรับ Emoji
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
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2);
`;

// --- MAIN VIEW COMPONENT ---
function HomeView({ currentLevel, onChangeLevel }) {

  const isMedium = currentLevel.id === 'medium';

  const contentData = {
    quote: isMedium
      ? `"บทเรียนระดับปานกลางจะช่วยเพิ่มความมั่นใจ\nและทำให้สำเนียงของคุณลื่นไหลเป็นธรรมชาติขึ้น"`
      : `"ฉันพร่ำบอกเธอเช้าค่ำ\nว่าภายใต้การดูแลของฉัน เธอจะปลอดภัย"`,
    emoji: isMedium ? '🐥' : '🐣', // ใช้ Emoji แทนไฟล์ภาพรูปเดิม
    title: isMedium ? 'ปานกลาง' : 'เริ่มต้น',
    bgColor: isMedium ? '#feebc8' : '#c6f6d5'
  };

  return (
    <ContentWrapper>
      {/* ส่วนบน: ประโยคประจำวัน */}
      <SectionCard>
        <CardTitle>ประโยคประจำวัน</CardTitle>
        <DailyQuoteBox>
          <QuoteText style={{ whiteSpace: 'pre-line' }}>
            {contentData.quote}
          </QuoteText>
          <AudioButton onClick={() => alert('เล่นเสียงพูด...')}>🔊</AudioButton>
        </DailyQuoteBox>
        <DarkActionButton onClick={() => alert('เริ่มบันทึกเสียงพูด!')}>
          ฉันอยากลองพูด!
        </DarkActionButton>
      </SectionCard>

      {/* ส่วนล่าง: ระดับปัจจุบัน */}
      <SectionCard style={{ paddingBottom: '15px' }}>
        <FlexHeader>
          <CardTitle style={{ margin: 0 }}>ระดับปัจจุบัน</CardTitle>
          <ChangeTextLink onClick={onChangeLevel}>เปลี่ยน</ChangeTextLink>
        </FlexHeader>

        <StatusProgressCard bgColor={contentData.bgColor}>
          <StatusInfoRow>
            {/* เรียกใช้ Component Emoji ตรงนี้ */}
            <LevelEmoji>{contentData.emoji}</LevelEmoji>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{contentData.title}</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#444' }}>ประโยคพื้นฐาน</p>
            </div>
          </StatusInfoRow>

          <ProgressBarContainer>
            <ProgressBarFill />
          </ProgressBarContainer>
          <ProgressPercentText>ความคืบหน้า 0%</ProgressPercentText>
        </StatusProgressCard>

        <PrimaryOrangeButton onClick={() => alert(`กำลังเข้าสู่บทเรียนระดับ ${contentData.title}...`)}>
          ▶ เรียนต่อ
        </PrimaryOrangeButton>
      </SectionCard>
    </ContentWrapper>
  );
}

export default HomeView;