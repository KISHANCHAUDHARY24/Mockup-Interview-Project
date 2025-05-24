import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

def get_interview_question(job_role, industry, experience_level, interview_type, specific_skills):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"Generate a diverse interview question for a candidate applying for a {job_role} role in the {industry} industry with {experience_level} experience. "
            f"The interview type is {interview_type}. The candidate has specific skills in {specific_skills}. "
            f"Include a mix of technical, behavioral, and role-specific questions to ensure variety. "
            f"For example, ask about {specific_skills}, teamwork, problem-solving, or industry trends. "
            f"Return only the question as a string, without any additional context or numbering."
        )
        response = model.generate_content(prompt)
        return {'question': response.text.strip()}
    except Exception as e:
        return {'error': f"Failed to generate question: {str(e)}"}

def evaluate_response(question, user_response):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"Evaluate the following interview response for the question: '{question}'. "
            f"User's response: '{user_response}'. "
            f"Provide detailed feedback on the response, focusing on clarity, relevance, and completeness. "
            f"Include a performance score out of 100 (e.g., 'score: 85%') and actionable suggestions for improvement. "
            f"Format the feedback as a concise paragraph."
        )
        response = model.generate_content(prompt)
        return {'feedback': response.text.strip()}
    except Exception as e:
        return {'error': f"Failed to evaluate response: {str(e)}"}