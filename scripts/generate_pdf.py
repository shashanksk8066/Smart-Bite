#!/usr/bin/env python3
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "Smart Bite - AI Nutrition & Fitness Platform Documentation")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer (All pages)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_str)
        self.drawString(54, 36, "Confidential - Smart Bite Engineering & Architecture Document")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 48, letter[0] - 54, 48)

        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Styles
    primary_color = colors.HexColor("#059669")    # Emerald 600
    dark_slate = colors.HexColor("#0f172a")       # Slate 900
    text_color = colors.HexColor("#1e293b")       # Slate 800
    muted_color = colors.HexColor("#475569")      # Slate 600
    teal_accent = colors.HexColor("#0d9488")      # Teal 600
    bg_light = colors.HexColor("#f8fafc")         # Slate 50

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark_slate,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=dark_slate,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=teal_accent,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_color,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_color,
        leftIndent=14,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#065f46")
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=text_color
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=text_color
    )

    story = []

    # Title & Banner
    story.append(Paragraph("Smart Bite - Project & Architecture Overview", title_style))
    story.append(Paragraph("Comprehensive Technical Documentation, AI Architecture & System Specification", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceAfter=12))

    # Executive Summary Card
    summary_text = (
        "<b>Executive Summary:</b> Smart Bite is an intelligent, full-stack AI-powered nutrition and fitness platform "
        "engineered to simplify diet tracking, macronutrient balance, and metabolic health. By leveraging computer vision "
        "(Google Gemini Vision), parallel model racing with automatic API key failover, and scientific MET metabolic calculation, "
        "users receive instant, highly accurate meal breakdowns, healthy alternative recommendations, and habit-forming gamification."
    )
    summary_table = Table(
        [[Paragraph(summary_text, callout_style)]],
        colWidths=[letter[0] - 108]
    )
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ecfdf5")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#a7f3d0")),
        ('PADDING', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # Technology Stack Table
    story.append(Paragraph("1. Technology Stack", h1_style))
    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technologies Used", table_header_style), Paragraph("Key Responsibilities", table_header_style)],
        [
            Paragraph("Frontend", table_cell_bold),
            Paragraph("React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons", table_cell_style),
            Paragraph("Responsive SPA, image camera upload, interactive calendar, dynamic macro rings, dashboard visualization", table_cell_style)
        ],
        [
            Paragraph("Backend", table_cell_bold),
            Paragraph("Node.js, Express.js, TypeScript (ts-node)", table_cell_style),
            Paragraph("REST API endpoints, image payload normalization, fallback model dispatch, MySQL connection pooling", table_cell_style)
        ],
        [
            Paragraph("Database", table_cell_bold),
            Paragraph("MySQL Server (mysql2/promise driver)", table_cell_style),
            Paragraph("Stores user body metrics, macro goals, saved meal histories with JSON analysis, and timestamped exercise logs", table_cell_style)
        ],
        [
            Paragraph("AI Engine", table_cell_bold),
            Paragraph("Google Gemini 2.5/3.x SDK (@google/genai)", table_cell_style),
            Paragraph("Visual food recognition, macro breakdown, healthy alternative generation, conversational nutrition assistant", table_cell_style)
        ],
    ]
    tech_table = Table(tech_data, colWidths=[65, 175, letter[0] - 108 - 240])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 12))

    # Core Application Modules
    story.append(Paragraph("2. Core Features & Functional Modules", h1_style))

    story.append(Paragraph("A. AI Meal Scanner & Computer Vision Analysis", h2_style))
    story.append(Paragraph(
        "Users photograph or upload meals. The image is passed via base64 encoding to Google Gemini Vision models. "
        "The model identifies all visible ingredients, estimates portion weights in grams, and returns structured nutritional "
        "data: calories, protein, carbohydrates, fats, and an overall health rating.",
        body_style
    ))

    story.append(Paragraph("B. Instant Healthy Alternatives Engine", h2_style))
    story.append(Paragraph(
        "Directly below the scanned image, the application displays proactive, AI-generated healthy alternatives. "
        "For example, if French fries are scanned, the engine suggests baked sweet potato wedges, explaining the "
        "glycemic and caloric benefit in an elegant badge format.",
        body_style
    ))

    story.append(Paragraph("C. Real-time Net Calorie Tracking", h2_style))
    story.append(Paragraph(
        "The dashboard tracks <b>Net Calories = Calories Consumed - Exercise Burned</b>. "
        "As users log meals and workouts throughout the day, the progress bar updates in real-time against their goal.",
        body_style
    ))

    story.append(Paragraph("D. Exercise & Activity Module", h2_style))
    story.append(Paragraph(
        "Allows logging of walking, running, cycling, swimming, gym workouts, and yoga. Caloric burn is calculated using "
        "standard scientific Metabolic Equivalent of Task (MET) ratings combined with user body weight and intensity: "
        "<code>Calories Burned = (MET x 3.5 x Weight in kg x Minutes) / 200</code>.",
        body_style
    ))

    story.append(Paragraph("E. AI Meal Suggestions", h2_style))
    story.append(Paragraph(
        "Analyzes the user's remaining caloric and macronutrient budget for the day and recommends three personalized "
        "recipes with precise macros to hit their targets without exceeding limits.",
        body_style
    ))

    story.append(Paragraph("F. Gamified Streaks & Global Leaderboard", h2_style))
    story.append(Paragraph(
        "Encourages consistency by awarding streak days when net calories remain within +/-15% of the user's daily target. "
        "A global leaderboard displays user rankings, all-time best streaks, and an interactive podium.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # Advanced AI Architecture
    story.append(Paragraph("3. High-Speed AI Architecture: Parallel Racing & Key Rotation", h1_style))
    ai_arch_text = (
        "To eliminate latency and prevent quota exhaustion (HTTP 429 errors), Smart Bite implements a cutting-edge "
        "two-tiered AI dispatch architecture in <code>server/gemini.ts</code>:"
    )
    story.append(Paragraph(ai_arch_text, body_style))

    story.append(Paragraph(
        "<b>1. Multi-Model Parallel Race (Promise.any):</b> Instead of trying fallback models sequentially (which caused 5-10s delays), "
        "the backend fires parallel requests across available models (gemini-3.6-flash, gemini-flash-latest, gemini-3.1-pro-preview, "
        "and gemini-3.1-flash-lite). The fastest successful response resolves immediately, slashing analysis times.",
        bullet_style
    ))
    story.append(Paragraph(
        "<b>2. Seamless Multi-API Key Failover Rotation:</b> The system scans <code>.env</code> for up to 5 keys "
        "(<code>GEMINI_API_KEY</code>, <code>GEMINI_API_KEY1</code> through <code>GEMINI_API_KEY4</code>). If an entire model tier "
        "exhausts its quota on Key #1, the engine automatically rolls over to Key #2 and triggers a new parallel race without user interruption.",
        bullet_style
    ))

    story.append(Spacer(1, 10))

    # Database Schema
    story.append(Paragraph("4. Relational Database Architecture (MySQL)", h1_style))
    story.append(Paragraph(
        "The database is managed via <code>server/db.ts</code>. On server startup, <code>initializeDatabase()</code> automatically "
        "creates the <code>smartbite</code> database and ensures all required tables and foreign keys exist.",
        body_style
    ))

    schema_data = [
        [Paragraph("Table", table_header_style), Paragraph("Primary Key / Foreign Key", table_header_style), Paragraph("Key Columns & Types", table_header_style)],
        [
            Paragraph("users", table_cell_bold),
            Paragraph("email (PK)", table_cell_style),
            Paragraph("name (VARCHAR), goal (VARCHAR), age (INT), gender (VARCHAR), weightKg (FLOAT), heightCm (FLOAT), targetCalories (INT), targetProtein (INT), targetCarbs (INT), targetFat (INT), joinedAt (TIMESTAMP)", table_cell_style)
        ],
        [
            Paragraph("saved_meals", table_cell_bold),
            Paragraph("id (PK)<br/>user_email (FK -> users.email)", table_cell_style),
            Paragraph("date (VARCHAR), time (VARCHAR), imageUrl (LONGTEXT), analysis (JSON), customNotes (TEXT)", table_cell_style)
        ],
        [
            Paragraph("exercises", table_cell_bold),
            Paragraph("id (PK)<br/>user_email (FK -> users.email)", table_cell_style),
            Paragraph("date (VARCHAR), time (VARCHAR), type (VARCHAR), duration_minutes (INT), intensity (VARCHAR), calories_burned (INT), created_at (TIMESTAMP)", table_cell_style)
        ],
    ]
    schema_table = Table(schema_data, colWidths=[75, 130, letter[0] - 108 - 205])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), dark_slate),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(schema_table)
    story.append(Spacer(1, 10))

    # API Endpoints
    story.append(Paragraph("5. Backend REST API Endpoints", h1_style))
    api_data = [
        [Paragraph("Method", table_header_style), Paragraph("Endpoint", table_header_style), Paragraph("Description", table_header_style)],
        [Paragraph("POST", table_cell_bold), Paragraph("/api/analyze-food", code_style), Paragraph("Uploads food image; returns macros, ingredients, alternatives via Gemini Vision", table_cell_style)],
        [Paragraph("POST", table_cell_bold), Paragraph("/api/suggest-meals", code_style), Paragraph("Generates 3 meal ideas tailored to user's remaining daily macro deficit", table_cell_style)],
        [Paragraph("POST", table_cell_bold), Paragraph("/api/recommend-target", code_style), Paragraph("Calculates personalized BMR/TDEE calorie and macro goals during onboarding", table_cell_style)],
        [Paragraph("POST", table_cell_bold), Paragraph("/api/chat", code_style), Paragraph("AI health nutritionist conversational assistant for user advice and tips", table_cell_style)],
        [Paragraph("GET / POST", table_cell_bold), Paragraph("/api/users", code_style), Paragraph("Retrieves or registers user profiles with personalized targets", table_cell_style)],
        [Paragraph("GET / POST", table_cell_bold), Paragraph("/api/meals", code_style), Paragraph("Fetches meal history or persists newly logged meal with full analysis JSON", table_cell_style)],
        [Paragraph("GET / POST", table_cell_bold), Paragraph("/api/exercises", code_style), Paragraph("Retrieves or saves exercise sessions with calories burned math", table_cell_style)],
        [Paragraph("GET", table_cell_bold), Paragraph("/api/leaderboard", code_style), Paragraph("Computes rankings across all users based on longest active streaks", table_cell_style)],
    ]
    api_table = Table(api_data, colWidths=[65, 135, letter[0] - 108 - 200])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), teal_accent),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(api_table)
    story.append(Spacer(1, 10))

    # Getting Started & Deployment
    story.append(Paragraph("6. Deployment & Execution Reference", h1_style))
    story.append(Paragraph(
        "<b>Prerequisites:</b> Node.js (v18+) and MySQL Server. Configure root password as <code>root1234</code>. "
        "The server will automatically generate the <code>smartbite</code> database schema on start.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Environment Variables (server/.env):</b><br/>"
        "<code>GEMINI_API_KEY=\"primary_key\"</code><br/>"
        "<code>GEMINI_API_KEY1=\"secondary_key\"</code><br/>"
        "<code>GEMINI_API_KEY2=\"tertiary_key\"</code>",
        body_style
    ))
    story.append(Paragraph(
        "<b>Execution Commands:</b><br/>"
        "• Backend: <code>cd server && npm install && npm run dev</code><br/>"
        "• Frontend: <code>cd client && npm install && npm run dev</code> (Runs on http://localhost:5173)",
        body_style
    ))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at {filename}")

if __name__ == "__main__":
    output_path = sys.argv[1] if len(sys.argv) > 1 else "Smart-Bite-Documentation.pdf"
    build_pdf(output_path)
