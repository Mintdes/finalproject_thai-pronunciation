const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// ตั้งค่าสำหรับการส่ง Email ยืนยัน (ใช้ Gmail หรือ Mailtrap ทดสอบ)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-project-email@gmail.com',
        pass: 'your-app-password' // App Password จาก Google
    }
});

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

        // 5. ลบข้อมููล OTP ออกเพื่อไม่ให้นำมาใช้ซ้ำได้อีก
        await prisma.emailVerification.delete({ where: { email } });

        res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });

    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
});

app.listen(5000, () => console.log('Server is running on port 5000'));