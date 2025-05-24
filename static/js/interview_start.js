let currentQuestion = 0;
const totalQuestions = 3;
let mediaRecorder;
let audioChunks = [];
let currentUtterance = null;
let isPaused = false;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

async function fetchQuestion() {
    document.getElementById('loading-spinner').classList.add('active');
    document.getElementById('error').textContent = '';
    try {
        const response = await fetch('/interview_start/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        document.getElementById('loading-spinner').classList.remove('active');
        if (data.error) {
            document.getElementById('error').textContent = data.error;
            return;
        }
        document.getElementById('question-text').textContent = data.question || 'No question available';
        document.getElementById('current-question').textContent = data.current + '/10';
        // Speak the question or greeting
        speakQuestion(data.question);
    } catch (error) {
        document.getElementById('loading-spinner').classList.remove('active');
        document.getElementById('error').textContent = 'Failed to load question: ' + error.message;
    }
}

function speakQuestion(text) {
    // Cancel any previous utterance
    window.speechSynthesis.cancel();
    currentUtterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Victoria'));
    if (femaleVoice) {
        currentUtterance.voice = femaleVoice;
    }
    currentUtterance.rate = 1.0;
    currentUtterance.pitch = 1.0;
    currentUtterance.onend = () => {
        document.getElementById('play-audio').disabled = false;
        document.getElementById('pause-audio').disabled = true;
        document.getElementById('resume-audio').disabled = true;
    };
    window.speechSynthesis.speak(currentUtterance);
    // Update button states
    document.getElementById('play-audio').disabled = true;
    document.getElementById('pause-audio').disabled = false;
    document.getElementById('resume-audio').disabled = true;
    isPaused = false;
}

function playQuestion() {
    if (currentUtterance) {
        speakQuestion(document.getElementById('question-text').textContent);
    }
}

function pauseQuestion() {
    if (currentUtterance && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        document.getElementById('pause-audio').disabled = true;
        document.getElementById('resume-audio').disabled = false;
    }
}

function resumeQuestion() {
    if (currentUtterance && isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        document.getElementById('pause-audio').disabled = false;
        document.getElementById('resume-audio').disabled = true;
    }
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
    document.getElementById('submit-loading').classList.add('active');
    document.getElementById('submit-button').disabled = true;
    document.getElementById('error').textContent = '';
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
                'X-CSRFToken': csrftoken
            }
        });

        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType.includes('application/json')) {
            const errorText = await response.text();
            throw new Error("Unexpected response format or error: " + errorText);
        }

        const data = await response.json();
        document.getElementById('submit-loading').classList.remove('active');
        document.getElementById('submit-button').disabled = false;

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
        document.getElementById('submit-loading').classList.remove('active');
        document.getElementById('submit-button').disabled = false;
        document.getElementById('error').textContent = 'Submission failed: ' + error.message;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestion();
    document.getElementById('audio-input').style.display = 'none';
    // Ensure voices are loaded for speech synthesis
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
});