from flask import Flask, request, jsonify, send_file, make_response, render_template, redirect, url_for, session, flash
from flask_cors import CORS
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import PyPDF2
import io
import os
import json
import re
import urllib.parse
import google.generativeai as genai
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = '6b298d9fea545fbd5263fb6cb92a3b32'  # Replace with a strong secret key
CORS(app)

genai.configure(api_key="AIzaSyAn_9wz5q5etT5_Bgm_aEh4HgMXuzIrrUI")  # Replace with your actual API key

USERS_FILE = 'users.json'

CERT_DIR = "certificates"
if not os.path.exists(CERT_DIR):
    os.makedirs(CERT_DIR)

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

@app.route('/')
def landing():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        users = load_users()
        user = users.get(username)

        if user and check_password_hash(user['password'], password):
            session['username'] = username
            flash('Login successful!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.')
            return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        users = load_users()
        if username in users:
            flash('Username already exists. Please choose another.')
            return redirect(url_for('signup'))

        hashed_password = generate_password_hash(password)
        users[username] = {'email': email, 'password': hashed_password}
        save_users(users)

        flash('Signup successful! Please log in.')
        return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        flash('Please log in to access this page.')
        return redirect(url_for('login'))

    users = load_users()
    username = session['username']
    user_data = users.get(username, {})
    certificates = user_data.get('certificates', [])

    return render_template('index.html', username=username, certificates=certificates)


@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You have been logged out.')
    return redirect(url_for('landing'))

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

@app.route('/generate_certificate', methods=['POST'])
def generate_certificate():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    name = data.get("name")
    role = data.get("role")
    score = data.get("score")

    if not name or not role or score is None:
        return jsonify({'error': 'Missing data'}), 400

    username = session['username']
    cert_dir = os.path.join("certificates", username)
    os.makedirs(cert_dir, exist_ok=True)

    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')  # <--- Fixed here
    filename = f"{username}_{role}_{timestamp}.pdf"
    file_path = os.path.join(cert_dir, filename)

    try:
        # Generate PDF
        c = canvas.Canvas(file_path, pagesize=letter)
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(300, 700, "Certificate of Completion")
        c.setFont("Helvetica", 18)
        c.drawCentredString(300, 650, f"Presented to: {name}")
        c.drawCentredString(300, 620, f"For successfully completing the {role} test")
        c.drawCentredString(300, 590, f"Score: {score}%")
        c.drawCentredString(300, 550, "TechCareerHub Platform")
        c.showPage()
        c.save()

        # Save certificate metadata
        users = load_users()
        user_data = users.get(username, {})
        user_data.setdefault('certificates', []).append({
            'file': filename,
            'role': role,
            'score': score,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        users[username] = user_data
        save_users(users)

        return send_file(file_path, as_attachment=True)

    except Exception as e:
        return jsonify({'error': f'Certificate generation failed: {str(e)}'}), 500



@app.route('/certificates')
def certificates():
    if 'username' not in session:
        flash('Please log in to view certificates.')
        return redirect(url_for('login'))

    username = session['username']
    user_cert_dir = os.path.join("certificates", username)

    cert_files = []
    if os.path.exists(user_cert_dir):
        for fname in os.listdir(user_cert_dir):
            if fname.endswith(".pdf"):
                parts = fname.replace(".pdf", "").split("_")
                if len(parts) >= 3:
                    cert_name = f"{parts[1]} ({parts[2]})"
                    cert_files.append({
                        "name": cert_name,
                        "filename": fname
                    })

    return render_template('certificates.html', certificates=cert_files)

@app.route('/view_certificate/<filename>')
def view_certificate(filename):
    if 'username' not in session:
        flash('Please log in to view certificate.')
        return redirect(url_for('login'))

    username = session['username']
    file_path = os.path.join("certificates", username, filename)
    if os.path.exists(file_path):
        return send_file(file_path)
    return "Certificate not found", 404

@app.route('/<page>')
def render_page(page):
    allowed_pages = {'resume', 'learn', 'chat', 'test'}
    if page in allowed_pages:
        return render_template(f'{page}.html')
    return "Page not found", 404

if __name__ == "__main__":
    app.run(debug=True)

