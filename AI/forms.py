
from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import UserProfile

class SignupForm(forms.Form):
    full_name = forms.CharField(
        max_length=255,
        required=True,
        widget=forms.TextInput(attrs={
                'placeholder': 'John Doe',
                'class':'input-with-icon',
                }),
      
        )
    email = forms.EmailField(
        required=True, 
        widget=forms.EmailInput(attrs={''
        'placeholder': 'you@example.com',
        'class':'input-with-icon',
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': '••••••••',
            'class':'input-with-icon'
            }),
              required=True
    )
    agree_to_terms = forms.BooleanField(
        required=True,
        error_messages={'required': 'You must agree to the Terms of Service and Privacy Policy.'}
        
     )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("An account with this email already exists.")
        return email

class LoginForm(forms.Form):
    email = forms.EmailField(
        required=True, 
        widget=forms.EmailInput(attrs={
            'placeholder': 'you@example.com',
               'class':'input-with-icon',
            })
        )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': '••••••••',
            'class':'input-with-icon',
            }), 
            required=True,
        )
    
    remember_me = forms.BooleanField(required=False)


