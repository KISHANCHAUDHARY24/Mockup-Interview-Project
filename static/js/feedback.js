const { jsPDF } = window.jspdf;

function toggleMenu() {
    const mobileNav = document.querySelector('.mobile-nav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const isExpanded = mobileNav.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', isExpanded);
}

function showTab(tabId) {
    document.querySelectorAll('.content').forEach(content => {
        content.style.display = 'none';
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function setScoreCircleColor(score) {
    let color;
    if (score >= 90) {
        color = '#22c55e'; // Green
    } else if (score >= 70) {
        color = '#f97316'; // Orange
    } else if (score >= 50) {
        color = '#ffde21'; // Yellow
    } else {
        color = '#ef4444'; // Red
    }
    document.querySelectorAll('.score-circle-fill').forEach(element => {
        element.style.stroke = color;
    });
}

function parseFeedbackData(feedback) {
    const lines = feedback.split('\n').filter(line => line.trim() !== '');
    let overallScore = 0;
    const questions = [];
    let currentQuestion = null;

    // Parse overall score with a more flexible regex
    const scoreLine = lines.find(line => line.toLowerCase().includes('overall performance score'));
    if (scoreLine) {
        const match = scoreLine.match(/Overall Performance Score:\s*(\d+\.?\d*)\s*%?/i);
        overallScore = match ? parseFloat(match[1]) : 0;
    } else {
        console.warn('Overall score line not found in feedback:', feedback);
    }

    // Parse each question's feedback
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('Question: ')) {
            if (currentQuestion) questions.push(currentQuestion);
            currentQuestion = { question: line.replace('Question: ', ''), response: '', feedback: '' };
        } else if (line.startsWith('Your Response: ') && currentQuestion) {
            currentQuestion.response = line.replace('Your Response: ', '');
        } else if (line.startsWith('Feedback: ') && currentQuestion) {
            currentQuestion.feedback = line.replace('Feedback: ', '');
            // Accumulate feedback across multiple lines until next section
            while (i + 1 < lines.length && !lines[i + 1].startsWith('Question: ') && !lines[i + 1].startsWith('Your Response: ') && !lines[i + 1].startsWith('Overall Performance Score:')) {
                currentQuestion.feedback += ' ' + lines[++i].trim();
            }
        }
    }
    if (currentQuestion) questions.push(currentQuestion);

    return { overallScore, questions };
}

function extractFeedbackDetails(feedbackText) {
    console.log('Processing feedback:', feedbackText); // Debug log
    const strengths = [];
    const improvements = [];
    const breakdown = { clarity: 0, relevance: 0, confidence: 0, conciseness: 0, problemSolving: 0 };

    // Extract score with multiple flexible regex patterns
    let scoreMatch = feedbackText.match(/score:\s*(\d+\.?\d*)\s*%?/i);
    if (!scoreMatch) {
        scoreMatch = feedbackText.match(/Score:\s*(\d+\.?\d*)\s*%?/i);
    }
    if (!scoreMatch) {
        scoreMatch = feedbackText.match(/(\d+\.?\d*)\s*%?\s*(?:score|Score)/i); // Try score at end or middle
    }
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    console.log('Extracted score:', score, 'from:', feedbackText); // Debug log

    // Contextual analysis for strengths, improvements, and breakdown
    const feedbackLower = feedbackText.toLowerCase();

    // Clarity
    if (feedbackLower.includes('clear')) {
        if (feedbackLower.includes('not clear') || feedbackLower.includes('unclear')) {
            improvements.push('Improve clarity in your responses.');
            breakdown.clarity = Math.max(4, score / 25);
        } else {
            strengths.push('Clear articulation of concepts.');
            breakdown.clarity = Math.min(10, score / 10 + 1);
        }
    } else {
        breakdown.clarity = score / 15;
    }

    // Relevance
    if (feedbackLower.includes('relevant') || feedbackLower.includes('examples')) {
        if (feedbackLower.includes('not relevant') || feedbackLower.includes('irrelevant')) {
            improvements.push('Ensure responses are more relevant to the question.');
            breakdown.relevance = Math.max(4, score / 25);
        } else {
            strengths.push('Good use of relevant examples.');
            breakdown.relevance = Math.min(10, score / 10 + 1);
        }
    } else {
        breakdown.relevance = score / 15;
    }

    // Confidence
    if (feedbackLower.includes('confidence') || feedbackLower.includes('confident')) {
        if (feedbackLower.includes('not confident') || feedbackLower.includes('lacking confidence')) {
            improvements.push('Work on projecting more confidence in your answers.');
            breakdown.confidence = Math.max(4, score / 25);
        } else {
            strengths.push('Demonstrated confidence in responses.');
            breakdown.confidence = Math.min(10, score / 10 + 1);
        }
    } else {
        breakdown.confidence = score / 15;
    }

    // Conciseness
    if (feedbackLower.includes('concise') || feedbackLower.includes('brevity')) {
        if (feedbackLower.includes('not concise') || feedbackLower.includes('too lengthy')) {
            improvements.push('Be more concise in your responses.');
            breakdown.conciseness = Math.max(4, score / 25);
        } else {
            strengths.push('Concise and to-the-point answers.');
            breakdown.conciseness = Math.min(10, score / 10 + 1);
        }
    } else {
        breakdown.conciseness = score / 15;
    }

    // Problem-Solving
    if (feedbackLower.includes('problem-solving') || feedbackLower.includes('solution')) {
        if (feedbackLower.includes('poor solution') || feedbackLower.includes('ineffective')) {
            improvements.push('Improve your problem-solving approach.');
            breakdown.problemSolving = Math.max(4, score / 25);
        } else {
            strengths.push('Effective problem-solving approach.');
            breakdown.problemSolving = Math.min(10, score / 10 + 1);
        }
    } else {
        breakdown.problemSolving = score / 15;
    }

    // Additional improvements based on feedback
    if (feedbackLower.includes('quantifiable') || feedbackLower.includes('results')) {
        improvements.push('Provide more quantifiable results.');
    }
    if (feedbackLower.includes('thought process') || feedbackLower.includes('explain')) {
        improvements.push('Explain your thought process step-by-step.');
    }
    if (feedbackLower.includes('specific') || feedbackLower.includes('example')) {
        improvements.push('Include specific examples to support your answers.');
    }

    return { score, strengths, improvements, breakdown };
}

function parseOverallFeedback(questions) {
    const feedbackPoints = [];
    questions.forEach((q, index) => {
        const { strengths, improvements } = extractFeedbackDetails(q.feedback);
        if (strengths.length > 0) {
            feedbackPoints.push(`**Question ${index + 1} Strengths:** ${strengths.join(', ')}`);
        }
        if (improvements.length > 0) {
            feedbackPoints.push(`**Question ${index + 1} Areas to Improve:** ${improvements.join(', ')}`);
        }
    });
    return feedbackPoints;
}

function initCharts(overallScore, questions) {
    try {
        // Radar chart for performance breakdown
        const breakdown = questions.length > 0 ? extractFeedbackDetails(questions.reduce((acc, q) => acc + q.feedback, '')).breakdown : {
            clarity: 0, relevance: 0, confidence: 0, conciseness: 0, problemSolving: 0
        };
        const radarCtx = document.getElementById('radarChart').getContext('2d');
        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Clarity', 'Relevance', 'Confidence', 'Conciseness', 'Problem-Solving'],
                datasets: [{
                    label: 'Performance',
                    data: [
                        breakdown.clarity,
                        breakdown.relevance,
                        breakdown.confidence,
                        breakdown.conciseness,
                        breakdown.problemSolving
                    ],
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { stepSize: 2 }
                    }
                }
            }
        });

        // Bar chart for question scores
        const questionScores = questions.map(q => extractFeedbackDetails(q.feedback).score);
        const barCtx = document.getElementById('barChart').getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: questions.map((_, index) => `Q${index + 1}`),
                datasets: [{
                    label: 'Question Scores',
                    data: questionScores,
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { stepSize: 20 }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Chart initialization failed:', error);
        document.getElementById('radarChartError').style.display = 'block';
        document.getElementById('barChartError').style.display = 'block';
    }
}

function toggleBreakdown() {
    const breakdown = document.getElementById('performance-breakdown');
    const button = document.querySelector('.toggle-breakdown');
    const isExpanded = breakdown.classList.toggle('visible');
    button.setAttribute('aria-expanded', isExpanded);
}

function downloadPDF(overallScore, questions) {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text('Interview Feedback - InterviewAI', 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Overall Score: ${overallScore}%`, 20, y);
    y += 10;

    const breakdown = questions.length > 0 ? extractFeedbackDetails(questions.reduce((acc, q) => acc + q.feedback, '')).breakdown : {
        clarity: 0, relevance: 0, confidence: 0, conciseness: 0, problemSolving: 0
    };
    doc.text('Performance Breakdown:', 20, y);
    y += 10;
    doc.text(`Clarity: ${breakdown.clarity.toFixed(1)}/10`, 25, y);
    y += 10;
    doc.text(`Relevance: ${breakdown.relevance.toFixed(1)}/10`, 25, y);
    y += 10;
    doc.text(`Confidence: ${breakdown.confidence.toFixed(1)}/10`, 25, y);
    y += 10;
    doc.text(`Conciseness: ${breakdown.conciseness.toFixed(1)}/10`, 25, y);
    y += 10;
    doc.text(`Problem-Solving: ${breakdown.problemSolving.toFixed(1)}/10`, 25, y);
    y += 10;

    doc.text('Key Strengths:', 20, y);
    y += 10;
    const strengths = questions.length > 0 ? extractFeedbackDetails(questions.reduce((acc, q) => acc + q.feedback, '')).strengths : [];
    strengths.forEach((strength, index) => {
        doc.text(`- ${strength}`, 25, y + (index * 10));
    });
    y += strengths.length * 10 + 10;

    doc.text('Areas for Improvement:', 20, y);
    y += 10;
    const improvements = questions.length > 0 ? extractFeedbackDetails(questions.reduce((acc, q) => acc + q.feedback, '')).improvements : [];
    improvements.forEach((improvement, index) => {
        doc.text(`- ${improvement}`, 25, y + (index * 10));
    });
    y += improvements.length * 10 + 10;

    doc.text('Question Breakdown:', 20, y);
    y += 10;
    questions.forEach((q, index) => {
        const score = extractFeedbackDetails(q.feedback).score;
        doc.text(`Q${index + 1}: ${score}% - ${q.question}`, 25, y);
        y += 10;
    });

    doc.save('interview_feedback.pdf');
}

document.addEventListener('DOMContentLoaded', () => {
    // Parse feedback data
    const { overallScore, questions } = parseFeedbackData(feedbackData);
    console.log('Parsed feedback data:', { overallScore, questions }); // Debug log

    // Update overall score
    document.getElementById('score-text').textContent = `${overallScore || 'N/A'}%`;
    document.getElementById('score-circle-fill').setAttribute('stroke-dasharray', `${overallScore || 0}, 100`);
    setScoreCircleColor(overallScore || 0);

    // Update performance breakdown
    const breakdown = questions.length > 0 ? extractFeedbackDetails(questions.reduce((acc, q) => acc + q.feedback, '')).breakdown : {
        clarity: 0, relevance: 0, confidence: 0, conciseness: 0, problemSolving: 0
    };
    document.getElementById('clarity-score').textContent = `${breakdown.clarity.toFixed(1)}/10`;
    document.getElementById('relevance-score').textContent = `${breakdown.relevance.toFixed(1)}/10`;
    document.getElementById('confidence-score').textContent = `${breakdown.confidence.toFixed(1)}/10`;
    document.getElementById('conciseness-score').textContent = `${breakdown.conciseness.toFixed(1)}/10`;
    document.getElementById('problem-solving-score').textContent = `${breakdown.problemSolving.toFixed(1)}/10`;

    // Update average question score
    const questionScores = questions.map(q => extractFeedbackDetails(q.feedback).score);
    const avgQuestionScore = questionScores.length > 0 ? (questionScores.reduce((a, b) => a + b, 0) / questionScores.length).toFixed(0) : 0;
    document.getElementById('avg-score-text').textContent = `${avgQuestionScore}%`;
    document.getElementById('avg-score-circle-fill').setAttribute('stroke-dasharray', `${avgQuestionScore}, 100`);
    setScoreCircleColor(avgQuestionScore);

    // Update strengths and improvements
    const strengthsList = document.getElementById('strengths-list');
    const improvementsList = document.getElementById('improvements-list');
    const allStrengths = [];
    const allImprovements = [];
    questions.forEach(q => {
        const { strengths, improvements } = extractFeedbackDetails(q.feedback);
        strengths.forEach(s => {
            if (!allStrengths.includes(s)) allStrengths.push(s);
        });
        improvements.forEach(i => {
            if (!allImprovements.includes(i)) allImprovements.push(i);
        });
    });
    allStrengths.forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        strengthsList.appendChild(li);
    });
    allImprovements.forEach(improvement => {
        const li = document.createElement('li');
        li.textContent = improvement;
        improvementsList.appendChild(li);
    });

    // Update overall feedback with bullet points
    const overallFeedbackPoints = parseOverallFeedback(questions);
    const overallFeedbackList = document.createElement('ul');
    overallFeedbackPoints.forEach(point => {
        const li = document.createElement('li');
        li.innerHTML = point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        overallFeedbackList.appendChild(li);
    });
    const overallFeedbackContainer = document.getElementById('overall-feedback');
    overallFeedbackContainer.innerHTML = '';
    overallFeedbackContainer.appendChild(overallFeedbackList);

    // Update question breakdown
    const questionBreakdown = document.getElementById('question-breakdown');
    questions.forEach((q, index) => {
        const { score, strengths, improvements } = extractFeedbackDetails(q.feedback);
        const div = document.createElement('div');
        div.className = 'question';
        div.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <div class="score">Score: ${score}%</div>
            <p>${q.question}</p>
            <p><span class="strengths">Strengths:</span> ${strengths.join(', ') || 'None identified'}</p>
            <p><span class="areas-to-improve">Areas to Improve:</span> ${improvements.join(', ') || 'None identified'}</p>
            <div class="progress-bar"><div class="progress" style="width: ${score}%;"></div></div>
        `;
        questionBreakdown.appendChild(div);
    });

    // Initialize charts
    initCharts(overallScore || 0, questions);

    // Event listeners
    document.getElementById('download-feedback').addEventListener('click', () => downloadPDF(overallScore || 0, questions));
    document.getElementById('save-profile').addEventListener('click', () => {
        alert('Feedback saved to profile!');
    });

    document.querySelector('.toggle-breakdown').addEventListener('click', toggleBreakdown);

    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.querySelector('.mobile-menu-btn').addEventListener('click', toggleMenu);

    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
});