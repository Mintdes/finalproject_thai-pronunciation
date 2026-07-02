import styled from 'styled-components';
import shakeHandsImg from '../assets/meeting.png';

// --- STYLED COMPONENTS ---
const ViewContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  animation: fadeIn 0.25s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const BackButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px;
`;

const CircularBackButton = styled.button`
  background: white;
  border: none;
  width: 55px;
  height: 32px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover { transform: scale(1.05); }
`;

const WhiteCard = styled.div`
  width: 100%;
  height: 67%;
  background: white;
  border-radius: 45px;
  padding: 30px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
  margin-bottom: 30px;
`;

const SubtitleText = styled.p`
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #333;
  font-weight: 500;
`;

const Illustration = styled.img`
  width: 130px;
  height: auto;
  margin-bottom: 25px;
  object-fit: contain;
`;

const TargetPhraseCard = styled.div`
  width: 100%;
  background-color: #c6f6d5; /* สีเขียวพาสเทล */
  border-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  margin-bottom: 10px;
`;

const ThaiPhrase = styled.h2`
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: bold;
  color: #000;
`;

const EngTranslation = styled.p`
  margin: 0;
  font-size: 16px;
  color: #222;
  font-weight: 500;
`;

const SpeakerButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #222;
  transition: transform 0.1s;
  &:active { transform: scale(0.9); }
`;

const MicButton = styled.button`
  width: 75px;
  height: 75px;
  background-color: #f97316; /* สีส้ม */
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 30px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
  margin-bottom: 12px;
  &:hover { background-color: #e86400; }
`;

const TapToSpeakText = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #333;
`;

// --- MAIN COMPONENT ---
function PracticeView({ onBack }) {
    return (
        <ViewContainer>
            <BackButtonWrapper>
                <CircularBackButton onClick={onBack}>⭠</CircularBackButton>
            </BackButtonWrapper>

            <WhiteCard>
                <SubtitleText>Speak the phrase / พูดประโยค</SubtitleText>

                {/* รูปภาพประกอบคนจับมือกัน */}
                <Illustration src={shakeHandsImg} alt="Practice Illustration" onError={(e) => { e.target.style.display = 'none'; }} />

                <TargetPhraseCard>
                    <ThaiPhrase>ยินดีที่ได้รู้จัก</ThaiPhrase>
                    <EngTranslation>Nice to meet you.</EngTranslation>
                </TargetPhraseCard>

                <SpeakerButton onClick={() => alert('เปิดเสียงออดิโอต้นแบบ...')}>🔊</SpeakerButton>
            </WhiteCard>

            <MicButton onClick={() => alert('เริ่มบันทึกเสียงพูดของคุณ...')}>🎙️</MicButton>
            <TapToSpeakText>Tap to speak</TapToSpeakText>
        </ViewContainer>
    );
}

export default PracticeView;