import { useState } from 'react';
import styled from 'styled-components';
import talkingImg from '../assets/talking.png';

// --- STYLED COMPONENTS เฉพาะหน้า Welcome ---
const StartLearningContainer = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const StartLearningTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin: 5px;
`;

const IllustrationImage = styled.img`
  width: 110px;         /* ปรับขนาดความกว้างตามความเหมาะสม */
  height: auto;         /* ปล่อยให้ความสูงคำนวณอัตโนมัติตามสัดส่วนรูป */
  object-fit: contain;  /* ควบคุมไม่ให้รูปบิดเบี้ยว */
  margin: 15px 0;       /* เว้นระยะห่างบน-ล่าง */
`;

const ActionButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 15px;
`;

const ActionButton = styled.button`
  font-family: inherit;
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 16px 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2);
  &:hover { background-color: #e86400; }
`;

const HintText = styled.p` text-align: center; font-size: 13px; color: #444; margin: 6px 0 0 0; font-weight: 500; `;
const ModalOverlay = styled.div` position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.35); border-radius: 40px; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; z-index: 10; `;
const ModalCard = styled.div` width: 90%; max-width: 320px; background: white; border-radius: 40px; padding: 35px 25px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; position: relative; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); `;
const CloseButton = styled.button` position: absolute; top: 15px; right: 15px; background: #ff5b5b; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; `;
const LevelOptionsContainer = styled.div` width: 100%; display: flex; flex-direction: column; gap: 15px; margin-top: 25px; `;
const LevelCard = styled.div` width: 100%; background-color: ${props => props.bgColor}; border-radius: 20px; padding: 15px 18px; box-sizing: border-box; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: transform 0.2s; &:hover { transform: translateY(-2px); } `;
// กล่องยืนยันปรับสีพื้นหลังตาม Props ได้
const BigConfirmIconBox = styled.div`
  width: 140px;
  height: 140px;
  background-color: ${props => props.bgColor}; 
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;
const BigIconText = styled.span` font-size: 50px; line-height: 1; `;
const BigIconLabel = styled.span` font-size: 20px; font-weight: bold; color: #222; margin-top: 8px; `;
const ConfirmQuestionText = styled.p` font-size: 16px; color: #222; margin: 10px 0 25px 0; `;
const PopupButtonGroup = styled.div` width: 100%; display: flex; justify-content: space-between; gap: 12px; `;
const PopupButton = styled.button` font-family: inherit; flex: 1; border: none; border-radius: 25px; padding: 12px 20px; font-size: 16px; cursor: pointer; color: white; background-color: ${props => props.variant === 'confirm' ? '#f97316' : '#222222'}; `;

function WelcomeView({ onConfirmSelection }) {
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    const [modalStage, setModalStage] = useState('select');
    // เพิ่ม State ชั่วคราวเพื่อเก็บระดับที่กำลังกดเลือก
    const [chosenLevel, setChosenLevel] = useState({ id: 'easy', title: 'เริ่มต้น', icon: '🐣', color: '#c6f6d5' });

    const handleSelectLevel = (levelConfig) => {
        setChosenLevel(levelConfig);
        setModalStage('confirm');
    };

    return (
        <StartLearningContainer>
            <StartLearningTitle>Start your lesson</StartLearningTitle>

            <IllustrationImage src={talkingImg} alt="Learning Illustration" />

            <ActionButtonGroup>
                <div>
                    <ActionButton onClick={() => { setModalStage('select'); setIsLevelModalOpen(true); }}>
                        Select Level
                    </ActionButton>
                    <HintText>Choose any level you want to learn</HintText>
                </div>
                <div>
                    <ActionButton>Assess pronunciation proficiency</ActionButton>
                    <HintText>Assess your Thai pronunciation proficiency to select the lesson for you</HintText>
                </div>
            </ActionButtonGroup>

            {isLevelModalOpen && (
                <ModalOverlay onClick={() => setIsLevelModalOpen(false)}>
                    <ModalCard onClick={(e) => e.stopPropagation()}>
                        {modalStage === 'select' ? (
                            <>
                                <CloseButton onClick={() => setIsLevelModalOpen(false)}>✕</CloseButton>
                                <LevelOptionsContainer>
                                    {/* ปุ่มกดระดับเริ่มต้น */}
                                    <LevelCard bgColor="#c6f6d5" onClick={() => handleSelectLevel({ id: 'easy', title: 'Beginner', icon: '🐣', color: '#c6f6d5' })}>
                                        <div style={{ fontSize: '28px' }}>🐣</div>
                                        <div style={{ textalign: 'left', marginLeft: '10px' }}>
                                            <h3 style={{ margin: 0, fontSize: '16px' }}>Beginner</h3>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#555' }}>Basic Sentence</p>
                                        </div>
                                    </LevelCard>

                                    {/* ปุ่มกดระดับปานกลาง */}
                                    <LevelCard bgColor="#feebc8" onClick={() => handleSelectLevel({ id: 'medium', title: 'Medium', icon: '🐥', color: '#feebc8' })}>
                                        <div style={{ fontSize: '28px' }}>🐥</div>
                                        <div style={{ textalign: 'left', marginLeft: '10px' }}>
                                            <h3 style={{ margin: 0, fontSize: '16px' }}>Medium</h3>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#555' }}>Interactive Sentence</p>
                                        </div>
                                    </LevelCard>
                                </LevelOptionsContainer>
                            </>
                        ) : (
                            <>
                                {/* หน้าต่างยืนยันจะเปลี่ยนสีและไอคอนตามที่เราจิ้มเลือกมาได้แบบ Dynamic */}
                                <BigConfirmIconBox bgColor={chosenLevel.color}>
                                    <BigIconText>{chosenLevel.icon}</BigIconText>
                                    <BigIconLabel>{chosenLevel.title}</BigIconLabel>
                                </BigConfirmIconBox>
                                <ConfirmQuestionText>Are you sure to select this level?</ConfirmQuestionText>
                                <PopupButtonGroup>
                                    <PopupButton variant="confirm" onClick={() => { setIsLevelModalOpen(false); onConfirmSelection(chosenLevel); }}>
                                        Confirm
                                    </PopupButton>
                                    <PopupButton variant="cancel" onClick={() => setModalStage('select')}>
                                        Cancel
                                    </PopupButton>
                                </PopupButtonGroup>
                            </>
                        )}
                    </ModalCard>
                </ModalOverlay>
            )}
        </StartLearningContainer>
    );
}

export default WelcomeView;