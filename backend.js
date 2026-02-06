/**
 * NeronExpert - Backend for Email Sending
 * 
 * This module handles email sending through various services:
 * - EmailJS (client-side, free tier available)
 * - Formspree (simple API integration)
 * - Nodemailer (Node.js server-side)
 * 
 * Choose the method that best fits your needs.
 */

// ================================
// Configuration
// ================================

const CONFIG = {
    // EmailJS Configuration (https://www.emailjs.com/)
    emailjs: {
        serviceID: 'your_service_id',
        templateID: 'your_template_id',
        publicKey: 'your_public_key',
        toEmail: 'djarikdevo@tutamail.com'
    },
    
    // Formspree Configuration (https://formspree.io/)
    formspree: {
        formID: 'your_formspree_id',
        toEmail: 'djarikdevo@tutamail.com'
    },
    
    // Nodemailer Configuration (for Node.js server)
    nodemailer: {
        host: 'smtp.protonmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your_email@protonmail.com',
            pass: 'your_app_password'
        },
        toEmail: 'djarikdevo@tutamail.com'
    }
};

// ================================
// Method 1: EmailJS Integration (Client-side)
// ================================

/**
 * Send email using EmailJS (recommended for static sites)
 * Free tier: 200 emails/month
 */
class EmailJSService {
    constructor(config) {
        this.serviceID = config.serviceID;
        this.templateID = config.templateID;
        this.publicKey = config.publicKey;
        this.toEmail = config.toEmail;
    }

    async send(data) {
        // Load EmailJS SDK if not already loaded
        if (!window.emailjs) {
            await this.loadSDK();
        }

        const templateParams = {
            from_name: data.name,
            from_email: data.email,
            message: data.message,
            to_email: this.toEmail,
            reply_to: data.email
        };

        try {
            const response = await window.emailjs.send(
                this.serviceID,
                this.templateID,
                templateParams,
                this.publicKey
            );
            return { success: true, response };
        } catch (error) {
            console.error('EmailJS Error:', error);
            return { success: false, error };
        }
    }

    loadSDK() {
        return new Promise((resolve, reject) => {
            if (window.emailjs) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                window.emailjs.init(this.publicKey);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// ================================
// Method 2: Formspree Integration (Simplest)
// ================================

/**
 * Send email using Formspree (easiest setup)
 * Free tier: 1000 emails/month
 */
class FormspreeService {
    constructor(config) {
        this.formID = config.formID;
        this.toEmail = config.toEmail;
    }

    async send(data) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('message', data.message);
        formData.append('_to', this.toEmail);
        formData.append('_subject', `NeronExpert - Заявка от ${data.name}`);

        try {
            const response = await fetch(
                `https://formspree.io/f/${this.formID}`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.ok) {
                return { success: true };
            } else {
                throw new Error('Formspree submission failed');
            }
        } catch (error) {
            console.error('Formspree Error:', error);
            return { success: false, error };
        }
    }
}

// ================================
// Method 3: Nodemailer Server (Node.js)
// ================================

/**
 * Node.js server implementation using Nodemailer
 * Run this with: node server.js
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.protonmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Все поля обязательны для заполнения' 
        });
    }

    try {
        const mailOptions = {
            from: `"NeronExpert Website" <${process.env.SMTP_USER}>`,
            to: process.env.TO_EMAIL || 'djarikdevo@tutamail.com',
            subject: `NeronExpert - Заявка от ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #00ffcc;">Новая заявка с сайта NeronExpert</h2>
                    <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Имя:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Сообщение:</strong></p>
                        <p>${message}</p>
                    </div>
                    <p style="color: #6c757d; font-size: 12px;">
                        Это автоматическое сообщение с сайта NeronExpert
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: 'Сообщение отправлено успешно!' 
        });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка при отправке сообщения' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Emails will be sent to: ${process.env.TO_EMAIL || 'djarikdevo@tutamail.com'}`);
});

// Export for use in other modules
module.exports = { app, EmailJSService, FormspreeService, CONFIG };

// ================================
// Email Template for EmailJS/Formspree
// ================================

/**
 * Email Template for EmailJS:
 * ----------------------
 * Subject: NeronExpert - Заявка от {{from_name}}
 * 
 * <h2>Новая заявка с сайта NeronExpert</h2>
 * <p><strong>Имя:</strong> {{from_name}}</p>
 * <p><strong>Email:</strong> {{from_email}}</p>
 * <p><strong>Сообщение:</strong></p>
 * <p>{{message}}</p>
 */

// ================================
// Usage Instructions
// ================================

/*
 * QUICK START - Choose one method:
 * 
 * 1. EmailJS (Easiest - Client-side):
 *    - Sign up at https://www.emailjs.com/
 *    - Create email service and template
 *    - Replace config in script.js with your credentials
 * 
 * 2. Formspree (Simplest - No code required):
 *    - Sign up at https://formspree.io/
 *    - Create a form
 *    - Change form action in index.html
 *    - Add _to field for forwarding
 * 
 * 3. Node.js Server (Most control):
 *    - Run: npm install express nodemailer cors dotenv
 *    - Copy server code above to server.js
 *    - Create .env file with SMTP credentials
 *    - Run: node server.js
 *    - Update form submission to hit /api/contact
 */

// ================================
// Client-side Form Handler (for Node.js server)
// ================================

async function sendToNodeServer(data) {
    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Server error:', error);
        return { success: false, error };
    }
}
