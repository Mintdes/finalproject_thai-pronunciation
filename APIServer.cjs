const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

// เปิดใช้งาน CORS ให้ฝั่ง Frontend (React) สามารถติดต่อกับ Backend พอร์ต 5000 ได้
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// ตั้งค่าสำหรับการส่ง Email ยืนยัน (ฟิกอีเมลฝั่งเราที่เป็นคนส่ง)
// ----------------------------------------------------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ayanee2747@gmail.com', // ⚠️ เปลี่ยนเป็น Gmail จริงของคุณที่จะใช้ส่ง OTP ออกไป
        pass: 'nkbdypfjlufbktwf'             // ⚠️ เปลี่ยนเป็น App Password 16 หลักจาก Google Account ของคุณ
    }
});

// ----------------------------------------------------
// API ขั้นตอนที่ 1: ตรวจสอบความถูกต้อง เช็คอีเมลซ้ำ และส่ง OTP
// ----------------------------------------------------
app.post('/api/auth/register-request', async (req, res) => {
    const { username, email, password } = req.body;

    // 1. ตรวจสอบความปลอดภัยหลังบ้าน (Back-end Validation)
    if (!username || username.length < 5) {
        return res.status(400).json({ message: "Username ต้องยาวอย่างน้อย 5 ตัวอักษร" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password ไม่เป็นไปตามเงื่อนไขความปลอดภัย" });
    }

    try {
        // 2. ตรวจสอบว่ามีผู้ใช้รายนี้ในระบบแล้วหรือยัง
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานไปแล้ว" });
        }

        // 3. สุ่มรหัส OTP 6 หลัก
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // ตั้งเวลาหมดอายุ 5 นาที
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 4. บันทึกหรืออัปเดตรหัส OTP ลงฐานข้อมูล Supabase (ผ่าน Prisma)
        await prisma.emailVerification.upsert({
            where: { email },
            update: { otpCode, expiresAt },
            create: { email, otpCode, expiresAt }
        });

        // 5. ส่งอีเมลรหัส OTP หาผู้ใช้ (ดึงตามอีเมลที่กรอกเข้ามาสมัคร)
        const mailOptions = {
            from: '"Thai Pronunciation" <ayanee2747@gmail.com>', // ⚠️ แก้ไขให้ตรงกับเมลด้านบน
            to: email, // ระบบจะส่งไปหาอีเมลที่เขากรอกเข้ามาสมัครในแอปโดยอัตโนมัติ ไม่ต้องฟิกค่า
            subject: 'Your OTP Verification Code for Registration',
            html: `
                <div style="font-family: 'Prompt', Arial, sans-serif; padding: 25px; border: 1px solid #e5e7eb; border-radius: 20px; max-width: 500px; margin: auto; background-color: #fdf6ec;">
                    <h2 style="color: #f97316; text-align: center; font-size: 24px;">Welcome to Thai Pronunciation! 🐣</h2>
                    <p style="font-size: 16px; color: #333;">Hello <b>${username}</b>,</p>
                    <p style="font-size: 15px; color: #555;">Thank you for registering. Please use the One-Time Password (OTP) below to verify your account and complete your sign-up process:</p>
                    <div style="background-color: #ffffff; padding: 18px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #f97316; margin: 25px 0; border-radius: 16px; border: 2px dashed #f97316;">
                        ${otpCode}
                    </div>
                    <p style="color: #ef4444; font-size: 13px; font-weight: bold; text-align: center;">* This OTP code is valid for 5 minutes only.</p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">If you did not request this code, please safely ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว" });

    } catch (error) {
        console.error("Register Request Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์" });
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

        // 3. ผ่านการตรวจสอบทั้งหมด -> ทำการเข้ารหัสรหัสผ่าน (Hash)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. บันทึกผู้ใช้ใหม่ลงในฐานข้อมูลตาราง User บน Supabase
        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        // 5. ลบข้อมููล OTP ออกเพื่อไม่ให้นำมาใช้ซ้ำได้อีก
        await prisma.emailVerification.delete({ where: { email } });

        return res.status(200).json({ message: "สมัครสมาชิกสำเร็จเรียบร้อยแล้ว" });

    } catch (error) {
        console.error("Register Confirm Error:", error);
        return res.status(500).json({ message: "ไม่สามารถบันทึกข้อมูลสมาชิกได้" });
    }
});

// ----------------------------------------------------
// API ขั้นตอนที่ 3: ระบบตรวจสอบสิทธิ์ในการ Log in
// ----------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน" });
        }

        // 1. ค้นหาผู้ใช้จากอีเมลในฐานข้อมูลตาราง User บน Supabase
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
        }

        // 2. ตรวจสอบรหัสผ่านที่กรอกมาเปรียบเทียบกับรหัสผ่านแบบ Hash ในฐานข้อมูล
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" });
        }

        // 3. รหัสผ่านถูกต้อง ส่งสถานะกลับไปบอกหน้าบ้าน
        return res.status(200).json({ 
            message: "เข้าสู่ระบบสำเร็จ",
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});