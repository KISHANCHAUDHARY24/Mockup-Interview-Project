from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout    #for login
from django.contrib import messages       #for login
from .api import get_interview_question, evaluate_response
import logging
import time
import re
from django.core.exceptions import ValidationError              #for login            #for login
from django.contrib.auth.decorators import login_required       #for login
from django.contrib.auth.models import User                         #for login
from .forms import SignupForm, LoginForm                    #for login
from .models import UserProfile                       #for login

# Set up logging
logger = logging.getLogger(__name__)

def landing(request):
    return render(request, 'index.html')





def interview_form(request):
    if request.method == 'POST':
        job_role = request.POST.get('jobRole')
        industry = request.POST.get('industry')
        experience_level = request.POST.get('experienceLevel')
        interview_type = request.POST.get('interviewType')
        specific_skills = request.POST.get('specificSkills')
        request.session['interview_data'] = {
            'job_role': job_role,
            'industry': industry,
            'experience_level': experience_level,
            'interview_type': interview_type,
            'specific_skills': specific_skills
        }
        # Pre-fetch questions to reduce API calls during the interview
        questions = []
        for _ in range(3):  # Fetch 3 questions upfront
            question_data = get_interview_question(job_role, industry, experience_level, interview_type, specific_skills)
            if 'question' in question_data:
                questions.append(question_data['question'])
            else:
                questions.append(f"Error: {question_data['error']}")
        request.session['questions'] = questions
        request.session['current_question_index'] = 0
        request.session['feedback_data'] = []  # Initialize feedback data
        return redirect('interview_start')
    return render(request, 'interview_form.html')

def interview_start(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    logger.info(f"Request method: {request.method}, Is AJAX: {is_ajax}")

    if request.method == 'GET' and is_ajax:
        if 'interview_data' not in request.session or 'questions' not in request.session:
            return JsonResponse({'error': 'No interview data or questions available'}, status=400)
        
        current_index = request.session.get('current_question_index', 0)
        questions = request.session['questions']

        if current_index == 0:
            # Add a friendly greeting based on the time of day
            current_hour = time.localtime().tm_hour
            if 5 <= current_hour < 12:
                greeting = "Good morning"
            elif 12 <= current_hour < 17:
                greeting = "Good afternoon"
            elif 17 <= current_hour < 22:
                greeting = "Good evening"
            else:
                greeting = "Good evening"
            greeting_message = f"{greeting}! Hello, I'm your AI Interviewer. I'll be conducting your interview today. To get started, please tell me a bit about yourself. Let's begin!"
            return JsonResponse({'question': greeting_message, 'current': current_index + 1, 'is_greeting': True})

        if current_index - 1 < len(questions):
            question = questions[current_index - 1]  # Adjust for greeting
            response_data = {
                'question': question,
                'current': current_index + 1,
                'is_greeting': False
            }
            return JsonResponse(response_data)
        else:
            return JsonResponse({'error': 'No more questions available'}, status=400)

    if request.method == 'POST' and is_ajax:
        user_response = request.POST.get('textAnswer', '')
        audio_response = request.FILES.get('audio_response')
        if audio_response:
            user_response = audio_response.read().decode('utf-8', errors='ignore') if hasattr(audio_response, 'read') else str(audio_response)
        
        current_index = request.session.get('current_question_index', 0)
        questions = request.session['questions']
        question = questions[current_index - 1] if current_index > 0 else "Greeting"

        feedback = evaluate_response(question, user_response)
        if 'feedback' in feedback:
            request.session['feedback_data'].append({
                'question': question,
                'response': user_response,
                'feedback': feedback['feedback']
            })
            request.session['current_question_index'] += 1
            if request.session['current_question_index'] < 4:  # 3 questions + greeting
                next_question = questions[current_index] if current_index < len(questions) else "No more questions"
                return JsonResponse({
                    'question': next_question,
                    'current': request.session['current_question_index'] + 1,
                    'is_greeting': False
                })
            else:
                return JsonResponse({'redirect': '/feedback/'})
        return JsonResponse({'error': feedback['error']}, status=500)

    return render(request, 'interview_start.html')

def logout_view(request):
    logout(request)
    return redirect('landing')

def about(request):
    return render(request, 'about.html')

def blog(request):
    return render(request, 'blog.html')

def contact(request):
    return render(request, 'contact.html')

def faq(request):
    return render(request, 'faq.html')

def feedback(request):
    feedback_data = request.session.pop('feedback_data', [])
    if not feedback_data:
        feedback_text = "No feedback available. It seems there was an issue during your interview."
    else:
        total_score = 0
        valid_scores = 0
        for item in feedback_data:
            if 'feedback' in item:
                score_match = re.search(r'score:\s*(\d+\.?\d*)\s*%?', item['feedback'], re.IGNORECASE)
                if score_match:
                    score = float(score_match.group(1))
                    total_score += score
                    valid_scores += 1
        overall_score = (total_score / valid_scores) if valid_scores > 0 else 0
        feedback_text = f"Overall Performance Score: {overall_score}%\n\n"
        for item in feedback_data:
            feedback_text += f"Question: {item['question']}\nYour Response: {item['response']}\nFeedback: {item['feedback']}\n\n"
        logger.info(f"Feedback data: {feedback_text}")  # Log for debugging
    return render(request, 'feedback.html', {'feedback': feedback_text})

def guide(request):
    return render(request, 'guide.html')

def pricing(request):
    return render(request, 'pricing.html')

def privacy(request):
    return render(request, 'privacy.html')

def profile(request):
    return render(request, 'profile.html')

def terms(request):
    return render(request, 'terms.html')

def testimonials(request):
    return render(request, 'testimonials.html')




# for login

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('landing')  # Redirect authenticated users to landing page

    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            try:
                # Create user
                user = User.objects.create_user(
                    username=form.cleaned_data['email'],  # Use email as username
                    email=form.cleaned_data['email'],
                    password=form.cleaned_data['password'],
                    first_name=form.cleaned_data['full_name'].split()[0],
                    last_name=' '.join(form.cleaned_data['full_name'].split()[1:]) if len(form.cleaned_data['full_name'].split()) > 1 else ''
                )
                # Create user profile
                UserProfile.objects.create(user=user, full_name=form.cleaned_data['full_name'])
                # Log in the user
                login(request, user)
                messages.success(request, 'Account created successfully!')
                return redirect('landing')
            except ValidationError as e:
                messages.error(request, str(e))
                errors = {'password': [str(e)]}
        else:
            errors = form.errors
            if 'agree_to_terms' in errors:
                messages.error(request, 'You must agree to the Terms of Service and Privacy Policy.')
            elif 'email' in errors:
                messages.error(request, 'An account with this email already exists.')
            else:
                messages.error(request, 'Please correct the errors below.')
    else:
        form = SignupForm()
        errors = {}

    return render(request, 'signup.html', {'form': form, 'errors': errors})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('landing')  # Redirect authenticated users to landing page

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, username=email, password=password)
            if user:
                login(request, user)
                # Handle "remember me"
                if not form.cleaned_data['remember_me']:
                    request.session.set_expiry(0)  # Session expires when browser closes
                messages.success(request, 'Logged in successfully!')
                return redirect('landing')  # Redirect to landing page
            else:
                messages.error(request, 'Invalid email or password.')
                errors = {'email': ['Invalid credentials']}
        else:
            errors = form.errors
            messages.error(request, 'Please correct the errors below.')
    else:
        form = LoginForm()
        errors = {}

    return render(request, 'login.html', {'form': form, 'errors': errors})

@login_required
def profile_view(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        return render(request, 'profile.html', {'profile': profile})
    except UserProfile.DoesNotExist:
        messages.error(request, 'Profile not found. Please contact support.')
        return redirect('landing')

@login_required
def interview_form_view(request):
    return render(request, 'interview_form.html')

def logout_view(request):
    logout(request)
    messages.success(request, 'Logged out successfully!')
    return redirect('landing')