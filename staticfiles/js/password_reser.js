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

    // Update profile picture if authenticated
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        fetch('/api/profile/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                sessionStorage.removeItem('refresh_token');
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.profile_picture) {
                const navProfileImage = document.getElementById('navProfileImage');
                const mobileNavProfileImage = document.getElementById('mobileNavProfileImage');
                if (navProfileImage) navProfileImage.src = data.profile_picture;
                if (mobileNavProfileImage) mobileNavProfileImage.src = data.profile_picture;
            }
        })
        .catch(error => console.error('Error fetching profile:', error));
    }

    // Form elements
    const passwordResetForm = document.getElementById('passwordResetForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');

    // Form validation and submission
    passwordResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        // Client-side validation
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

        if (isValid) {
            const formData = new FormData();
            formData.append('email', emailValue);
            formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);

            try {
                // Replace '/password-reset/' with your actual password reset endpoint
                const response = await fetch('/password-reset/', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Password reset link sent! Check your email.');
                    emailInput.value = '';
                    // Optionally redirect: window.location.href = '{% url 'password_reset_done' %}';
                } else {
                    const data = await response.json();
                    emailError.textContent = data.email ? data.email[0] : 'An error occurred';
                }
            } catch (error) {
                console.error('Error:', error);
                emailError.textContent = 'Server error, please try again later';
            }
        }
    });

    // Real-time validation
    emailInput.addEventListener('input', () => {
        const emailValue = emailInput.value.trim();
        if (!emailValue) {
            emailError.textContent = 'Email is required';
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue)) {
            emailError.textContent = 'Please enter a valid email address';
        } else {
            emailError.textContent = '';
        }
    });
});