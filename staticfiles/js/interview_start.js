let currentQuestion = 0;
const totalQuestions = 3;
let mediaRecorder;
let audioChunks = [];

// Helper to get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken'); // 💡 Get CSRF token from cookies

async function fetchQuestion() {
    try {
        const response = await fetch('/interview_start/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.error) {
            document.getElementById('error').textContent = data.error;
            return;
        }
        document.getElementById('question-text').textContent = data.question || 'No question available';
        document.getElementById('current-question').textContent = data.current + '/10';
        speakQuestion(data.question);
    } catch (error) {
        document.getElementById('error').textContent = 'Failed to load question: ' + error.message;
    }
}

function speakQuestion(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioInput = document.getElementById('audio-input');
            audioInput.src = URL.createObjectURL(audioBlob);
            audioInput.style.display = 'block';
        };
        mediaRecorder.start();
        document.getElementById('start-recording').disabled = true;
        document.getElementById('stop-recording').disabled = false;
        document.getElementById('recording-status').textContent = 'Recording...';
    } catch (error) {
        document.getElementById('error').textContent = 'Microphone access denied: ' + error.message;
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream =>
            stream.getTracks().forEach(track => track.stop())
        );
        document.getElementById('start-recording').disabled = false;
        document.getElementById('stop-recording').disabled = true;
        document.getElementById('recording-status').textContent = 'Recording stopped';
    }
}

async function submitResponse() {
    const textAnswer = document.getElementById('text-answer').value;
    const audioBlob = audioChunks.length > 0 ? new Blob(audioChunks, { type: 'audio/webm' }) : null;
    const formData = new FormData();
    formData.append('textAnswer', textAnswer || '');
    if (audioBlob) formData.append('audio_response', audioBlob, 'response.webm');

    try {
        const response = await fetch('/interview_start/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrftoken  // ✅ Add CSRF token here
            }
        });

        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType.includes('application/json')) {
            const errorText = await response.text();
            throw new Error("Unexpected response format or error: " + errorText);
        }

        const data = await response.json();

        if (data.error) {
            document.getElementById('error').textContent = data.error;
            return;
        }

        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
            document.getElementById('question-text').textContent = data.question || 'No question available';
            document.getElementById('current-question').textContent = data.current + '/10';
            speakQuestion(data.question);
            document.getElementById('text-answer').value = '';
            audioChunks = [];
            document.getElementById('audio-input').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('error').textContent = 'Submission failed: ' + error.message;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestion();
    document.getElementById('audio-input').style.display = 'none'; // Hide audio input initially
});
