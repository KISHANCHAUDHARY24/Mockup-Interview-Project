document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileNav.classList.toggle('active');
        });
    }

    // Form elements
    const signupForm = document.getElementById('signup-form');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const agreeToTermsInput = document.getElementById('agreeToTerms');
    const signupButton = document.getElementById('signupButton');
    const fullNameError = document.getElementById('fullName-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const termsError = document.getElementById('terms-error');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    // Password strength calculation
    const calculatePasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;

        if (score <= 25) {
            strengthFill.style.width = '25%';
            strengthFill.style.backgroundColor = '#ef4444';
            strengthText.textContent = 'Password strength: Too weak';
            return 'weak';
        } else if (score <= 50) {
            strengthFill.style.width = '50%';
            strengthFill.style.backgroundColor = '#f59e0b';
            strengthText.textContent = 'Password strength: Weak';
            return 'weak';
        } else if (score <= 75) {
            strengthFill.style.width = '75%';
            strengthFill.style.backgroundColor = '#f59e0b';
            strengthText.textContent = 'Password strength: Medium';
            return 'medium';
        } else {
            strengthFill.style.width = '100%';
            strengthFill.style.backgroundColor = '#10b981';
            strengthText.textContent = 'Password strength: Strong';
            return 'strong';
        }
    };

    // Enable/disable signup button
    const updateSignupButton = () => {
        const fullNameValid = fullNameInput.value.trim().length >= 2;
        const emailValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailInput.value.trim());
        const passwordStrength = calculatePasswordStrength(passwordInput.value);
        const termsChecked = agreeToTermsInput.checked;

        signupButton.disabled = !(fullNameValid && emailValid && passwordStrength !== 'weak' && termsChecked);
    };

    // Form validation on submit
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Full name validation
        const fullNameValue = fullNameInput.value.trim();
        if (!fullNameValue) {
            fullNameError.textContent = 'Full name is required';
            isValid = false;
        } else if (fullNameValue.length < 2) {
            fullNameError.textContent = 'Full name must be at least 2 characters';
            isValid = false;
        } else {
            fullNameError.textContent = '';
        }

        // Email validation
        const emailValue = emailInput.value.trim();
        if (!emailValue) {
            emailError.textContent = 'Email is required';
            isValid = false;
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue)) {
            emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // Password validation
        const passwordValue = passwordInput.value.trim();
        if (!passwordValue) {
            passwordError.textContent = 'Password is required';
            isValid = false;
        } else if (passwordValue.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters';
            isValid = false;
        } else if (calculatePasswordStrength(passwordValue) === 'weak') {
            passwordError.textContent = 'Password is too weak';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        // Terms validation
        if (!agreeToTermsInput.checked) {
            termsError.textContent = 'You must agree to the terms';
            isValid = false;
        } else {
            termsError.textContent = '';
        }

        if (isValid) {
            // Simulate form submission (replace with actual backend call)
            alert('Signup successful! (This is a simulation)');
            signupForm.reset();
            strengthFill.style.width = '0';
            strengthText.textContent = 'Password strength: Too weak';
            signupButton.disabled = true;
        }
    });

    // Real-time validation
    fullNameInput.addEventListener('input', () => {
        const fullNameValue = fullNameInput.value.trim();
        if (!fullNameValue) {
            fullNameError.textContent = 'Full name is required';
        } else if (fullNameValue.length < 2) {
            fullNameError.textContent = 'Full name must be at least 2 characters';
        } else {
            fullNameError.textContent = '';
        }
        updateSignupButton();
    });

    emailInput.addEventListener('input', () => {
        const emailValue = emailInput.value.trim();
        if (!emailValue) {
            emailError.textContent = 'Email is required';
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue)) {
            emailError.textContent = 'Please enter a valid email address';
        } else {
            emailError.textContent = '';
        }
        updateSignupButton();
    });

    passwordInput.addEventListener('input', () => {
        const passwordValue = passwordInput.value.trim();
        if (!passwordValue) {
            passwordError.textContent = 'Password is required';
        } else if (passwordValue.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters';
        } else if (calculatePasswordStrength(passwordValue) === 'weak') {
            passwordError.textContent = 'Password is too weak';
        } else {
            passwordError.textContent = '';
        }
        updateSignupButton();
    });

    agreeToTermsInput.addEventListener('change', () => {
        if (!agreeToTermsInput.checked) {
            termsError.textContent = 'You must agree to the terms';
        } else {
            termsError.textContent = '';
        }
        updateSignupButton();
    });

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.querySelector('.eye-icon').classList.toggle('visible');
        });
    }

    // Social signup buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.getAttribute('data-provider');
            alert(`Sign up with ${provider} clicked! (This is a simulation)`);
            // Replace with actual OAuth redirect in production
        });
    });
});





// for login

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('id_password');
    const signupButton = document.getElementById('signupButton');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    const agreeToTerms = document.getElementById('id_agree_to_terms');

    function updateButtonState() {
        signupButton.disabled = !agreeToTerms.checked || passwordInput.value.length < 8;
    }

    function updatePasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;

        strengthFill.style.width = `${strength}%`;
        strengthText.textContent = `Password strength: ${
            strength < 40 ? 'Too weak' :
            strength < 60 ? 'Weak' :
            strength < 80 ? 'Moderate' :
            'Strong'
        }`;
        updateButtonState();
    }

    passwordInput.addEventListener('input', updatePasswordStrength);
    agreeToTerms.addEventListener('change', updateButtonState);

    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
    });

    // Initial check
    updatePasswordStrength();
    updateButtonState();
});