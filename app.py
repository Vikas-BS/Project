from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from flask import render_template
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
import PyPDF2
import io
import os
import json
import re
import urllib.parse
from reportlab.pdfgen import canvas
import google.generativeai as genai




app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)
# Configure the Generative AI API key
genai.configure(api_key="AIzaSyAn_9wz5q5etT5_Bgm_aEh4HgMXuzIrrUI")  # Replace with your actual API key

# ---------------- Chat Assistant ----------------
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'status': 'error', 'message': 'No message provided'}), 400

    user_message = data['message']
    job_context = (
        "You are a professional job assistant. Provide helpful, concise, and professional advice about "
        "job searching, resume writing, interview preparation, career development, and workplace skills.\n\nUser's query:\n"
    )
    full_prompt = job_context + user_message

    try:
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(full_prompt)

        if response.prompt_feedback.block_reason:
            return jsonify({'status': 'error', 'message': "Response blocked due to content safety."}), 400

        return jsonify({'status': 'success', 'message': response.text})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ---------------- Resume Upload + Job Recommendation ----------------
def load_json_file(file_name):
    file_path = os.path.join(os.path.dirname(__file__), file_name)
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

def load_jobs():
    return load_json_file("jobs.json")

def extract_skills_from_pdf(file_stream):
    skills = []
    reader = PyPDF2.PdfReader(file_stream)
    text = "".join([page.extract_text() or "" for page in reader.pages])
    lines = text.splitlines()
    skills_section_found = False

    for line in lines:
        line = line.strip()
        if 'skills' in line.lower():
            skills_section_found = True
            continue
        if skills_section_found and line:
            skills.extend([skill.strip() for skill in line.split(',') if skill.strip()])
        if skills_section_found and not line:
            break

    return skills

def tokenize(text):
    return re.findall(r'\b\w+\b', text.lower())

def generate_job_search_url(skills):
    technical_keywords = ['javascript', 'node.js', 'react', 'mongodb', 'python', 'java', 
                          'c', 'c++', 'html', 'css', 'backend', 'frontend', 'fullstack', 
                          'web development', 'programming', 'software', 'devops', 'sql']
    non_technical_keywords = ['management', 'sales', 'marketing', 'hr', 'customer service', 
                              'administrative', 'communication', 'creative', 'business']
    
    is_technical = any(skill.lower() in technical_keywords for skill in skills)
    
    base_url = "https://www.google.com/search"
    if is_technical:
        job_types = ["fullstack developer jobs", "backend developer jobs", "devops jobs"]
        apply_button = True
    else:
        job_types = ["general office jobs", "sales jobs", "customer service jobs"]
        apply_button = False

    search_params = {
        "q": " OR ".join(job_types),
        "udm": "8",
        "sa": "X"
    }

    return {
        "job_search_url": f"{base_url}?{urllib.parse.urlencode(search_params)}",
        "apply_button": apply_button,
        "job_types": job_types
    }

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_stream = io.BytesIO(file.read())
    skills_text = extract_skills_from_pdf(file_stream)

    extracted_tokens = set(token for skill in skills_text for token in tokenize(skill))
    job_listings = load_jobs()
    recommended_jobs = []

    for job in job_listings:
        job_tokens = set(tokenize(job.get('job_title', '') + job.get('job_description', '') +
                                   job.get('experience_level', '') + job.get('location', '') +
                                   job.get('company_name', '') + " ".join(job.get('skills', []))))
        matched_tokens = extracted_tokens.intersection(job_tokens)
        if matched_tokens:
            match_percentage = round((len(matched_tokens) / len(job_tokens)) * 100, 2)
            recommended_jobs.append({
                "job": job,
                "match_percentage": match_percentage,
                "matched_tokens": list(matched_tokens)
            })

    recommended_jobs.sort(key=lambda x: x['match_percentage'], reverse=True)
    job_search_info = generate_job_search_url(skills_text)

    return jsonify({
        'jobs': recommended_jobs,
        'job_search_url': job_search_info['job_search_url'],
        'show_apply_button': job_search_info['apply_button']
    })

# certificate #

import os

@app.route('/generate_certificate', methods=['POST'])
def generate_certificate():
    data = request.get_json()
    name = data.get("name")
    role = data.get("role")
    score = data.get("score")

    if not name or not role or score is None:
        return jsonify({'error': 'Missing data'}), 400

    cert_dir = "certificates"
    if not os.path.exists(cert_dir):
        os.makedirs(cert_dir)

    file_path = os.path.join(cert_dir, f"{name.replace(' ', '_')}_{role}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf")

    c = canvas.Canvas(file_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(300, 700, "Certificate of Completion")

    c.setFont("Helvetica", 18)
    c.drawCentredString(300, 650, f"Presented to: {name}")
    c.drawCentredString(300, 620, f"For successfully completing the {role} test")
    c.drawCentredString(300, 590, f"Score: {score}%")
    c.drawCentredString(300, 550, "TechJob Assistant Platform")

    c.showPage()
    c.save()

    return send_file(file_path, as_attachment=True)

# ---------------- Routes for HTML ----------------
@app.route('/')
def index():
    return render_template('dashboard.html')


@app.route('/<page>')
def render_page(page):
    allowed_pages = {'resume', 'learn', 'chat', 'test'}
    if page in allowed_pages:
        return render_template(f'{page}.html')
    return "Page not found", 404



if __name__ == "__main__":
    app.run(debug=True)
