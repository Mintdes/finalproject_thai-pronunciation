import audioBufferToWav from 'audiobuffer-to-wav'; // 👈 1. Import ตัวแปลงไฟล์ WAV
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// --- STYLED COMPONENTS ---
const ViewContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  animation: fadeIn 0.25s ease-out;

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const HeaderRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 55px 1fr 55px; /* แบ่งสัดส่วนซ้าย กลาง ขวา ให้เท่ากันเพื่อล็อกข้อความให้อยู่ตรงกลางเป๊ะ */
  align-items: center;
  margin-bottom: 20px;
`;

const TextBackButton = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
`;

const SubtitleText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
  text-align: center;
  grid-column-start: 2; /* บังคับให้อยู่ช่องตรงกลาง */
`;

const WhiteCard = styled.div`
  width: 100%;
  background: white;
  border-radius: 30px;
  padding: 25px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
  margin-bottom: 20px;
`;

const Illustration = styled.img`
  width: 130px;
  height: auto;
  margin-bottom: 25px;
  object-fit: contain;
`;

const TargetPhraseCard = styled.div`
  width: 100%;
  background-color: #c6f6d5;
  border-radius: 20px;
  padding: 15px;
  box-sizing: border-box;
  text-align: center;
  margin-bottom: 15px;
`;

const ThaiPhrase = styled.h2`
  margin: 0 0 3px 0;
  font-size: 24px;
  font-weight: bold;
  color: #000;
`;

const PronunciationText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #f97316; 
  font-style: italic;
  margin: 10px 0;
  text-align: center;
`;

const EngTranslation = styled.p`
  margin: 0;
  font-size: 18px;
  color: #222;
  font-weight: 500;
`;

const SpeakerButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #222;
`;

const WaveformCanvas = styled.canvas`
  width: 100%;
  height: 70px;
  background-color: #fdf8f2; 
  border-radius: 20px;
  margin-bottom: 20px; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
`;

const MicButton = styled.button`
  width: 70px;
  height: 70px;
  background-color: ${props => props.isRecording ? '#dc2626' : '#f97316'};
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 30px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: ${props => props.isRecording ? '0 8px 20px rgba(220, 38, 38, 0.4)' : '0 8px 20px rgba(249, 115, 22, 0.3)'};
  margin-bottom: 12px;
  transition: all 0.2s ease;
  animation: ${props => props.isRecording ? 'pulse 1.5s infinite' : 'none'};
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
`;

const TapToSpeakText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isRecording ? '#dc2626' : '#333'};
`;

const ResultContainer = styled.div`
  margin-top: 15px;
  padding: 12px;
  background-color: #fff7ed;
  border-radius: 15px;
  text-align: center;
  width: 100%;
  border: 1px solid #ffedd5;
`;

const ScoreText = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #ea580c;
`;

// --- MAIN COMPONENT ---
function PracticeView({ onBack, phraseData }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  const handlePlayAudio = () => {
    if (!phraseData?.audio) return;
    new Audio(phraseData.audio).play().catch(err => console.error(err));
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#fdf8f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = 4;
      const barSpacing = 3;
      const totalBars = Math.floor(canvas.width / (barWidth + barSpacing));
      const centerY = canvas.height / 2;

      for (let i = 0; i < totalBars; i++) {
        const sampleIndex = Math.floor((i / totalBars) * (bufferLength * 0.6));
        const value = dataArray[sampleIndex];

        let barHeight = (value / 255) * canvas.height * 0.8;
        if (barHeight < 4) barHeight = 4;

        const x = i * (barWidth + barSpacing);
        const y = centerY - barHeight / 2;

        ctx.fillStyle = '#f97316';

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    };
    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      // 🎯 แก้ไขท่อน onstop: แปลง WebM เป็น PCM WAV แท้ก่อนส่ง
      mediaRecorder.onstop = async () => {
        const rawWebmBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });

        try {
          // แปลงไฟล์ผ่าน AudioContext ให้เป็น PCM WAV 16-bit แท้
          const wavBlob = await convertWebmToWav(rawWebmBlob);
          await sendAudioToModel(wavBlob);
        } catch (error) {
          console.error("Audio conversion error:", error);
          alert("Failed to process audio format.");
        }
      };

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;

      audioContext.createMediaStreamSource(stream).connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      mediaRecorder.start();
      setIsRecording(true);
      setEvaluationResult(null);
    } catch (err) {
      alert("Please allow microphone access.");
    }
  };

  // 🎯 เพิ่มฟังก์ชันช่วยแปลง WebM -> PCM WAV แท้
  const convertWebmToWav = async (webmBlob) => {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

    const wavArrayBuffer = audioBufferToWav(audioBuffer);
    tempCtx.close();

    return new Blob([wavArrayBuffer], { type: 'audio/wav' });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRecording(false);
  };

  // 🎯 ปรับ URL ปลายทางให้ยิงไปที่ Vercel API
  const sendAudioToModel = async (audioBlob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'user_input.wav'); // หรือ 'audio' ตามฝั่ง backend

    try {
      // ใช้ await ได้แล้วเพราะมี async ด้านบน
      const response = await fetch('https://finalproject-thai-pronunciation-yeu.vercel.app/api/run-algo', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        const dist = data.best_match ? data.best_match.Dist : (data.distance || 0);
        setEvaluationResult({ ...data, distance: dist });
      } else {
        alert(data.detail || "Evaluation failed.");
      }
    } catch (err) {
      alert("Cannot connect to Python evaluation server.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isRecording) drawWaveform();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isRecording]);

  return (
    <ViewContainer>
      <WhiteCard>
        <HeaderRow>
          <TextBackButton onClick={onBack}>⭠</TextBackButton>
          <SubtitleText>Speak the phrase</SubtitleText>
        </HeaderRow>

        <Illustration src={phraseData?.image} alt="Illustration" onError={(e) => { e.target.style.display = 'none'; }} />

        <TargetPhraseCard>
          <ThaiPhrase>{phraseData?.thai || 'ไม่มีข้อมูล'}</ThaiPhrase>
          <PronunciationText>{phraseData?.karaoke || phraseData?.roman || ''}</PronunciationText>
          <EngTranslation>{phraseData?.eng || ''}</EngTranslation>
        </TargetPhraseCard>

        <SpeakerButton onClick={handlePlayAudio}>🔊</SpeakerButton>

        {isProcessing && <p style={{ fontSize: '14px', color: '#f97316', fontWeight: 'bold', marginTop: '15px' }}>⏳ Analyzing your pronunciation...</p>}

        {evaluationResult && !isRecording && (
          <ResultContainer>
            {(() => {
              // 🎯 สูตรแปลงค่า: เอา (1 - distance) * 100 เพื่อให้ได้ % ความถูกต้อง
              // ใช้ Math.max(0, ...) เผื่อกรณีที่ค่าหลุดเกิน 1 เปอร์เซ็นต์จะได้ไม่ติดลบ
              const accuracyPercentage = Math.max(0, (1 - evaluationResult.distance) * 100);

              return (
                <>
                  {/* แสดงเป็น Accuracy Score ในรูปแบบ % ที่เข้าใจง่าย */}
                  <ScoreText>🎯 Accuracy Score: {accuracyPercentage.toFixed(1)}%</ScoreText>

                  <p style={{ fontSize: '12px', margin: '5px 0 0', color: '#666' }}>
                    {/* ปรับเกณฑ์การชม: ถ้าความถูกต้องเกิน 75% ถือว่ายอดเยี่ยม */}
                    {accuracyPercentage >= 75.0 ? "Excellent Pronunciation! 🎉" : "Keep trying! 💪"}
                  </p>
                </>
              );
            })()}
          </ResultContainer>
        )}
      </WhiteCard>

      {isRecording && <WaveformCanvas ref={canvasRef} width={300} height={70} />}

      <MicButton isRecording={isRecording} onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? '⏹️' : '🎙️'}
      </MicButton>

      <TapToSpeakText isRecording={isRecording}>
        {isRecording ? 'Tap to stop and evaluate' : 'Tap to speak'}
      </TapToSpeakText>
    </ViewContainer>
  );
}
export default PracticeView;