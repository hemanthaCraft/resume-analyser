# resume-analyser
🧠 AI-Powered Resume Analyzer (Flask + Gemini + NLP)

An advanced AI Resume Analyzer that evaluates resumes using Natural Language Processing (NLP), Semantic Matching, and Google Gemini AI to generate in-depth ATS reports, keyword insights, and improvement suggestions.
It helps job seekers optimize their resumes for ATS (Applicant Tracking Systems) and assists recruiters in identifying the best candidate matches — all through a sleek, API-driven web application.

🚀 Key Highlights
🔍 Intelligent Resume Analysis

Extracts and analyzes data from PDF and DOCX resumes

Detects skills, education, certifications, and experience automatically

Understands context using semantic embeddings for smarter matching

🤖 AI-Powered Evaluation (Gemini 2.5 Pro)

Generates detailed feedback reports using Google’s Gemini AI

Produces full ATS-style analysis including:

Executive Summary

Strengths & Weaknesses

Keyword & Section Breakdown

Personalized Improvement Suggestions

📊 ATS Scoring System

Evaluates resumes across multiple dimensions:

Category	Weight	Description
Keyword Matching	40%	Identifies technical and soft skill overlap
Contact Details	10%	Ensures valid email/phone presence
Section Completeness	25%	Detects essential sections like Education, Skills, Experience
Formatting & Readability	15%	Checks bullet points, dates, action verbs
Length & Density	10%	Optimizes resume length and clarity

✅ Final score = 0–100, with color-coded performance indicators.

💡 Core Features

🧩 Multi-Strategy Keyword Extraction
Combines Regex, NLP, and embeddings to detect technical skills, certifications, and education details.

🧠 Semantic Matching
Uses Sentence Transformers (MiniLM-L6-v2) for intelligent JD-to-resume comparison.

⚙️ AI Rewrite Tool
Rewrites weak resume sections (summary, skills, experience) using Gemini Flash for ATS optimization.

🧾 PDF Report Generator
Creates a beautiful, data-rich ATS report with:

Charts

Keyword tables

AI feedback

Section insights

Automatically timestamped summary

📧 Email Integration
Sends complete ATS reports as PDF attachments directly to the user’s inbox.

💼 Job Recommendation Engine
Suggests personalized job openings based on extracted skills and experience using the JSearch API (RapidAPI).

🧱 Tech Stack
Layer	Technology
Backend	Flask (Python)
Frontend	HTML, CSS, JavaScript
AI / NLP	Google Gemini Pro & Flash, spaCy, SentenceTransformer, KeyBERT
ML Models	all-MiniLM-L6-v2
Libraries	PyPDF2, python-docx, reportlab, Flask-Mail, Regex
Database / Storage	Local JSON & file storage
Visualization	Matplotlib (for PDF charts)
🧮 How It Works

User uploads resume (PDF/DOCX)

Job Description is provided as input

The system:

Extracts text using OCR and parsers

Identifies keywords & sections

Calculates ATS score using weighted rules

Performs semantic similarity check

Uses Gemini AI to generate human-like detailed analysis

Results are displayed, emailed, and optionally downloaded as a PDF report.

📧 Email Reporting

Each report email includes:

ATS score breakdown

Matching and missing keywords

Key recommendations

Attached PDF report with AI feedback

⚙️ API Endpoints
Endpoint	Method	Description
/	GET	API Health & Status
/api/analyze	POST	Upload and analyze resume + job description
/api/download-report	POST	Download generated PDF analysis
/api/send-email	POST	Email the full ATS report to the user
/api/ai-rewrite	POST	AI rewrite for specific resume sections
/api/job-recommendations	POST	Get job recommendations via JSearch API
🧰 Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/<your-username>/resume-analyzer-ai.git
cd resume-analyzer-ai

2️⃣ Install Dependencies
pip install -r requirements.txt

3️⃣ Create .env File
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=youremail@gmail.com
MAIL_PASSWORD=yourpassword
MAIL_DEFAULT_SENDER=youremail@gmail.com
GEMINI_API_KEY=your_gemini_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here

4️⃣ Run Application
python app.py


Then open:

http://127.0.0.1:5000/

📈 Output Example

After analysis, you’ll receive:

ATS Score: 82/100

Keyword Match: 76%

Missing Skills: AWS, React, Docker

AI Feedback: "Excellent technical match. Add project metrics and certifications for a stronger profile."

PDF Report: auto-generated and emailed to user.

🧭 Future Enhancements

🔗 Integration with LinkedIn & Naukri APIs

📊 Interactive dashboard for recruiters

🧠 Resume version comparison tool

🗣 Voice-based resume feedback assistant
