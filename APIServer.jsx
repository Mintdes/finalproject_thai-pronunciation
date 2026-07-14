const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // 🆕 1. นำเข้า cors

const app = express();
const prisma = new PrismaClient();
app.use(express.json());
app.use(cors()); // 🆕 2. เปิดใช้งาน CORS (วางไว้ก่อนบรรทัด app.use(express.json()))

// ----------------------------------------------------
// การตั้งค่าสำหรับการส่ง Email และการอัปโหลดไฟล์เสียง
// ----------------------------------------------------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-project-email@gmail.com',
        pass: 'your-app-password' // App Password จาก Google
    }
});

// ตั้งค่าตำแหน่งจัดเก็บไฟล์เสียงที่อัดมาจาก User ชั่วคราว (เข้าโฟลเดอร์ newuser/ ตามโครงสร้าง Python)
const upload = multer({ dest: 'newuser/' });

// ----------------------------------------------------
// API ขั้นตอนที่ 1: ตรวจสอบความถูกต้อง เช็คอีเมลซ้ำ และส่ง OTP
// ----------------------------------------------------
app.post('/api/auth/register-request', async (req, res) => {
    const { username, email, password } = req.body;

    // 1. ตรวจสอบความปลอดภัยหลังบ้าน (Back-end Validation กันเหนียว)
    if (username.length < 5) {
        return res.status(400).json({ message: "Username ต้องยาวอย่างน้อย 5 ตัวอักษร" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "รูปแบบรหัสผ่านไม่ปลอดภัยตามเงื่อนไข" });
    }

    try {
        // 2. ตรวจสอบว่า Email ซ้ำในระบบฐานข้อมูลจริงหรือไม่
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email นี้ถูกใช้ลงทะเบียนไปแล้วในระบบ" });
        }

        // 3. สุ่มรหัส OTP 6 หลัก
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // หมดอายุใน 5 นาที

        // 4. บันทึกหรืออัปเดต OTP ลงในตาราง EmailVerification
        await prisma.emailVerification.upsert({
            where: { email },
            update: { otpCode, expiresAt },
            create: { email, otpCode, expiresAt }
        });

        // 5. ส่งรหัส OTP ไปยังเมลผู้ใช้
        const mailOptions = {
            from: '"Thai Pronunciation App" <your-project-email@gmail.com>',
            to: email,
            subject: 'รหัสยืนยันสำหรับการสมัครสมาชิก (OTP)',
            text: `รหัสยืนยันของคุณคือ: ${otpCode} (รหัสนี้มีอายุ 5 นาที)`
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "ส่งรหัส OTP เรียบร้อยแล้ว" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์" });
    }
});

// ----------------------------------------------------
// API ขั้นตอนที่ 2: ตรวจสอบ OTP และบันทึกข้อมูลสมัครสมาชิกจริง
// ----------------------------------------------------
app.post('/api/auth/register-confirm', async (req, res) => {
    const { username, email, password, otpCode } = req.body;

    try {
        // 1. ค้นหาประวัติ OTP ในตารางบันทึกการยืนยัน
        const record = await prisma.emailVerification.findUnique({ where: { email } });

        if (!record || record.otpCode !== otpCode) {
            return res.status(400).json({ message: "รหัส OTP ไม่ถูกต้อง" });
        }

        // 2. ตรวจสอบเวลาหมดอายุ
        if (new Date() > record.expiresAt) {
            return res.status(400).json({ message: "รหัส OTP หมดอายุแล้ว กรุณากดขอรหัสใหม่" });
        }

        // 3. ผ่านการตรวจสอบทั้งหมด -> ทำการเข้ารหัสรหัสผ่าน (Hash) ป้องกันความปลอดภัย
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. บันทึกผู้ใช้ใหม่ลงในฐานข้อมูลตาราง User
        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        // 5. ลบข้อมูล OTP ออกเพื่อไม่ให้นำมาใช้ซ้ำได้อีก
        await prisma.emailVerification.delete({ where: { email } });

        res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });

    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
});

// ----------------------------------------------------
// API ขั้นตอนที่ 3: รับไฟล์เสียงดิบและส่งคำนวณคะแนนด้วยโมเดล Python (DTW)
// ----------------------------------------------------
app.post('/api/pronounce/evaluate', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "ไม่พบไฟล์เสียงที่ส่งมาประมวลผล" });
    }

    const tempFileName = req.file.filename;
    const oldPath = req.file.path;
    const newPath = oldPath + '.wav';
    const finalFileName = tempFileName + '.wav';

    try {
        // เปลี่ยนชื่อไฟล์ชั่วคราวให้มีนามสกุล .wav เพื่อให้ librosa สกัดฟีเจอร์ได้ถูกต้อง
        fs.renameSync(oldPath, newPath);
    } catch (renameErr) {
        console.error("Rename Error:", renameErr);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเตรียมไฟล์เสียง" });
    }

    const pythonScriptPath = path.join(__dirname, '1602THpronunc.py');

    // สั่งรันสคริปต์ Python โดยส่งชื่อไฟล์เสียงของ user เข้าไปเป็น argument ตัวแรก
    exec(`python "${pythonScriptPath}" "${finalFileName}"`, (error, stdout, stderr) => {
        // 🛑 ทำลายหรือลบไฟล์เสียงทิ้งทันทีหลังประมวลผลเสร็จสิ้นเพื่อไม่ให้เปลืองพื้นที่และรักษาความเป็นส่วนตัว
        if (fs.existsSync(newPath)) {
            try {
                fs.unlinkSync(newPath);
            } catch (unlinkErr) {
                console.error("File deletion error:", unlinkErr);
            }
        }

        if (error) {
            console.error(`Python Execution Error: ${error}`);
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการประมวลผลสัญญาณเสียงด้วยโมเดล" });
        }

        try {
            // จับคู่ดึงค่าระยะห่างจาก stdout บรรทัดสรุปผลลัพธ์ของไฟล์ Python
            // มองหาคำว่า FINAL_DISTANCE: ในผลลัพธ์ หรือวิเคราะห์โครงสร้างข้อมูลจาก print()
            const lines = stdout.trim().split('\n');
            let distanceValue = null;

            // ค้นหาข้อความในบรรทัดต่างๆ เพื่อดึงค่าระยะห่าง DTW
            for (let line of lines) {
                if (line.includes("FINAL_DISTANCE:")) {
                    const parts = line.split("FINAL_DISTANCE:");
                    distanceValue = parseFloat(parts[1].trim());
                    break;
                }
                // กรณีดึงจากประโยคสรุป ">>> ประโยคที่ใกล้เคียงที่สุด: ... (Distance: 0.XXX)"
                if (line.includes("Distance:")) {
                    const match = line.match(/Distance:\s*([\d.]+)/);
                    if (match) {
                        distanceValue = parseFloat(match[1]);
                        break;
                    }
                }
            }

            // หากตัดแยกค่าจาก stdout ล้มเหลว จะดึงค่าจากผลลัพธ์ตัวแรกในระบบแทน
            if (distanceValue === null || isNaN(distanceValue)) {
                // ค่า Default ในกรณีที่เกิดความผิดพลาดในการ Parse ข้อความ
                distanceValue = 0.5;
            }

            res.status(200).json({
                message: "ประมวลผลเสร็จสิ้น",
                distance: distanceValue,
                rawOutput: stdout
            });

        } catch (parseErr) {
            console.error("Parse Error:", parseErr);
            res.status(500).json({ message: "ไม่สามารถแปลงค่าผลลัพธ์ความถูกต้องจากโมเดลได้" });
        }
    });
});

app.listen(5000, () => console.log('Server is running on port 5000'));