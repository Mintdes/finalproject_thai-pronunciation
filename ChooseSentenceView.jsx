import { useState } from 'react';
import styled from 'styled-components';
import helloImg from '../assets/hi.png';
import meetingImg from '../assets/meeting.png';
import helloAudio from '../assets/oriaudio/ai-sawasdee.wav';
import whaturnameAudio from '../assets/oriaudio/ai0.8-whaturname.wav';
import niceToMeetYouAudio from '../assets/oriaudio/ai0.9-nice2meetu.wav';
import whaturnameImg from '../assets/whaturname.png';

// --- STYLED COMPONENTS ---
const ViewContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #222;
  padding: 0;
  display: flex;
  align-items: center;
  &:hover { transform: scale(1.1); }
`;

const ProgressText = styled.span`
  font-size: 13px;
  font-weight: bold;
  color: #555;
`;

const PageTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: #222;
  margin: 5px 0 15px 0;
  text-align: center;
`;

const TopicGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TopicHeaderCard = styled.div`
  width: 100%;
  background-color: #c6f6d5; /* สีเขียวพาสเทลตามภาพ */
  border-radius: 20px;
  padding: 15px 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const TopicLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const TopicTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #222;
`;

const StatusText = styled.span`
  font-size: 12px;
  color: #555;
  font-weight: 500;
`;

const ArrowCircle = styled.div`
  width: 26px;
  height: 26px;
  background-color: #222;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  transform: ${props => props.isOpen ? 'rotate(-90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

// กล่องสีเทาเก็บรายชื่อประโยคย่อยภายในหมวดหมู่
const SubListWrapper = styled.div`
  width: 100%;
  background-color: #f3f4f6; /* พื้นหลังกล่องสีเทาซ้อนตามภาพ */
  border-radius: 20px;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
`;

const SentenceItemRow = styled.div`
  width: 100%;
  background-color: white;
  border-radius: 12px;
  padding: 12px 15px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  transition: background-color 0.15s;

  &:hover {
    background-color: #fafafa;
  }
`;

const RadioCircle = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #aaa;
  border-radius: 50%;
`;

const SentenceText = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #333;
`;

// --- MAIN COMPONENT ---
function ChooseSentenceView({ onBack, onSelectSentence }) {
  const [openTopic, setOpenTopic] = useState('');

  const toggleTopic = (topicName) => {
    setOpenTopic(openTopic === topicName ? '' : topicName);
  };

  // 2. สร้างฟังก์ชันเมื่อจิ้มเลือกประโยค เพื่อจัดกลุ่มข้อมูลส่งขึ้นไป
  const handlePickSentence = (thai, karaoke, eng, image, audio) => {
    onSelectSentence({ thai, karaoke, eng, image, audio });
  };

  return (
    <ViewContainer>
      <TopBar>
        <BackButton onClick={onBack}>⭠</BackButton>
        <ProgressText>Progress 0%</ProgressText>
      </TopBar>

      <PageTitle>Choose the lesson</PageTitle>

      <TopicGroup>
        <TopicHeaderCard onClick={() => toggleTopic('topic1')}>
          <TopicLeftSection>
            <IconContainer>
              <span style={{ fontSize: '32px' }}>🙋‍♀️</span>
              <StatusText>not pass</StatusText>
            </IconContainer>
            <TopicTitle>First Meeting</TopicTitle>
          </TopicLeftSection>
          <ArrowCircle isOpen={openTopic === 'topic1'}>▶</ArrowCircle>
        </TopicHeaderCard>

        {openTopic === 'topic1' && (
          <SubListWrapper>
            {/* 🛠️ ผูกปุ่มคำว่า "สวัสดี" */}
            <SentenceItemRow onClick={() => handlePickSentence('สวัสดี', 'Sa-wat-di', 'Hello', helloImg, helloAudio)}>
              <RadioCircle />
              <SentenceText>สวัสดี</SentenceText>
            </SentenceItemRow>

            <SentenceItemRow onClick={() => handlePickSentence('คุณชื่ออะไร?', 'Khun-Chue-A-rai?', 'What is your name?', whaturnameImg, whaturnameAudio)}>
              <RadioCircle />
              <SentenceText>คุณชื่ออะไร</SentenceText>
            </SentenceItemRow>

            {/* 🛠️ ผูกปุ่มคำว่า "ยินดีที่ได้รู้จัก" */}
            <SentenceItemRow onClick={() => handlePickSentence('ยินดีที่ได้รู้จัก', 'Yin-di-Thi-Dai-Ru-chak', 'Nice to meet you.', meetingImg, niceToMeetYouAudio)}>
              <RadioCircle />
              <SentenceText>ยินดีที่ได้รู้จัก</SentenceText>
            </SentenceItemRow>
          </SubListWrapper>
        )}
      </TopicGroup>

      {/* หมวดหมู่ที่ 2: การทักทาย (หดอยู่ตามภาพ) */}
      <TopicGroup>
        <TopicHeaderCard onClick={() => toggleTopic('topic2')}>
          <TopicLeftSection>
            <IconContainer>
              <span style={{ fontSize: '32px' }}>🚪</span>
              <StatusText>not pass</StatusText>
            </IconContainer>
            <TopicTitle>Greeting</TopicTitle>
          </TopicLeftSection>
          <ArrowCircle isOpen={openTopic === 'topic2'}>▶</ArrowCircle>
        </TopicHeaderCard>

        {openTopic === 'topic2' && (
          <SubListWrapper>
            <SentenceItemRow><RadioCircle /><SentenceText>อรุณสวัสดิ์</SentenceText></SentenceItemRow>
            <SentenceItemRow><RadioCircle /><SentenceText>สบายดีไหม</SentenceText></SentenceItemRow>
          </SubListWrapper>
        )}
      </TopicGroup>

      {/* หมวดหมู่ที่ 3: ไปไหนดี? */}
      <TopicGroup>
        <TopicHeaderCard onClick={() => toggleTopic('topic3')}>
          <TopicLeftSection>
            <IconContainer>
              <span style={{ fontSize: '32px' }}>🏢</span>
              <StatusText>not pass</StatusText>
            </IconContainer>
            <TopicTitle>Where to go?</TopicTitle>
          </TopicLeftSection>
          <ArrowCircle isOpen={openTopic === 'topic3'}>▶</ArrowCircle>
        </TopicHeaderCard>
      </TopicGroup>

    </ViewContainer>
  );
}

export default ChooseSentenceView;