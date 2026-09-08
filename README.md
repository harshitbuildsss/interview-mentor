# 🎯 Interview Mentor

An AI-powered full-stack technical interview preparation platform. The application dynamically parses candidate resumes, generates tailored technical and HR interview rounds via Groq AI, scores responses with live feedback, and provides comprehensive performance summaries.

---

## 🛠️ Tech Stack

- Backend: Java 17+, Spring Boot, Spring Data JPA, Spring Security (JWT), WebClient, MySQL
- AI Engine: Groq API (openai/gpt-oss-20b)
- Frontend: React, Vite, Tailwind CSS, Axios, Lucide Icons
- Document Processing: Apache PDFBox (Resume text extraction)

---

## ✨ Features

- 📄 Resume & Job Description Analysis: Extracts key technical keywords, framework experience, and skills from uploaded resumes.
- 🤖 Dynamic Question Generation: Customizes questions based on difficulty level, interview type (Technical/HR), and weak areas identified in previous sessions.
- ⚡ Real-Time Pedagogical Feedback: Delivers structured evaluations with highlighted technical keywords, syntax code-chips, and score cards (0–10).
- 📊 Session Summaries & Action Items: Breaks down topic-by-topic performance, lists key strengths, and generates revision action items for subsequent rounds.
- 🔒 Secure Auth: JWT-based user authentication and stateless session management.

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
- Java 17 or higher
- Maven
- Node.js (v18+) & npm
- MySQL Server

### 2. Configure Environment Variables
Set the following variables in your local environment or terminal:

GROQ_API_KEY=gsk_your_groq_api_key_here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=interview_mentor
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long

### 3. Backend Setup (Spring Boot)
mvn clean install
mvn spring-boot:run

The server will start at http://localhost:8080.

### 4. Frontend Setup (React)
npm install
npm run dev

The frontend will start at http://localhost:5173.

---

## 📁 Key Routes

- /login or /register : Authentication portals
- /setup : Configure interview mode, difficulty, and upload resume
- /interview/:sessionId : Active interactive interview room
- /interview/:sessionId/summary : Post-round performance summary & score report
- /session/:sessionId : Full transcript and historical QA review

---

## 📝 License
This project is open-source and available under the MIT License.
