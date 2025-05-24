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
    } else if (score  <= 90 >= 70) {
        color = '#f97316'; // Orange
     } else if (score >= 50) {
        color = 'ffde21'; // Yellow
    } else {
        color = '#ef4444'; // Red
    }
    document.querySelectorAll('.score-circle-fill').forEach(element => {
        element.style.stroke = color;
    });
}

function initCharts() {
    try {
        const radarCtx = document.getElementById('radarChart').getContext('2d');
        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Clarity', 'Relevance', 'Confidence', 'Conciseness', 'Problem-Solving'],
                datasets: [{
                    label: 'Performance',
                    data: [8, 7, 7.5, 6.5, 8],
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

        const barCtx = document.getElementById('barChart').getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Q1', 'Q2', 'Q3'],
                datasets: [{
                    label: 'Question Scores',
                    data: [80, 75, 70],
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

function downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Interview Feedback - InterviewAI', 20, 20);
    doc.setFontSize(12);
    doc.text('Overall Score: 75%', 20, 30);
    doc.text('Performance Breakdown:', 20, 40);
    doc.text('Clarity: 8/10', 25, 50);
    doc.text('Relevance: 7/10', 25, 60);
    doc.text('Confidence: 7.5/10', 25, 70);
    doc.text('Conciseness: 6.5/10', 25, 80);
    doc.text('Problem-Solving: 8/10', 25, 90);
    doc.text('Key Strengths:', 20, 100);
    doc.text('- Clear articulation of technical concepts', 25, 110);
    doc.text('- Effective problem-solving approach', 25, 120);
    doc.text('Areas for Improvement:', 20, 130);
    doc.text('- Be more concise in responses', 25, 140);
    doc.text('- Provide more quantifiable results', 25, 150);
    doc.text('Question Breakdown:', 20, 160);
    doc.text('Q1: 80% - Design a system to handle user authentication', 25, 170);
    doc.text('Q2: 75% - Longest common subsequence', 25, 180);
    doc.text('Q3: 70% - Microservices vs. monolithic', 25, 190);
    doc.save('interview_feedback.pdf');
}

document.addEventListener('DOMContentLoaded', () => {
    const overallScore = 75; // Example overall score
    const avgQuestionScore = 76; // Example average question score
    setScoreCircleColor(overallScore); // Apply dynamic color only to score circles
    setScoreCircleColor(avgQuestionScore); // Apply to both score circles
    initCharts();

    document.getElementById('download-feedback').addEventListener('click', downloadPDF);
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
});