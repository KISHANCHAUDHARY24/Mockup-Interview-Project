# from django.urls import path
# from . import views
# from django.contrib.auth import views as auth_views
# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     path('', views.landing, name='landing'),
#     path('faq/', views.faq, name='faq'),
#     path('interview_start/', views.interview_start, name='interview_start'),
#     path('interview_form/', views.interview_form, name='interview_form'),
#     path('feedback/', views.feedback, name='feedback'),
#     path('contact/', views.contact, name='contact'),
#     path('guide/', views.guide, name='guide'),
#     path('pricing/', views.pricing, name='pricing'),
#     path('privacy/', views.privacy, name='privacy'),
#     path('signup/', views.signup, name='signup'),
#     path('terms/', views.terms, name='terms'),
#     path('testimonials/', views.testimonials, name='testimonials'),
#     path('about/', views.about, name='about'),
#     path('blog/', views.blog, name='blog'),
#     path('profile/', views.profile, name='profile'),
#     path('logout/', auth_views.LogoutView.as_view(), name='logout'),
#     path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
#     path('logout/', auth_views.LogoutView.as_view(next_page='landing'), name='logout'),
#        path('', views.login_view, name='login_view'),
# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('faq/', views.faq, name='faq'),
    path('interview_start/', views.interview_start, name='interview_start'),
    path('interview_form/', views.interview_form_view, name='interview_form'),
    path('feedback/', views.feedback, name='feedback'),
    path('contact/', views.contact, name='contact'),
    path('guide/', views.guide, name='guide'),
    path('pricing/', views.pricing, name='pricing'),
    path('privacy/', views.privacy, name='privacy'),
    path('signup/', views.signup_view, name='signup'),
    path('terms/', views.terms, name='terms'),
    path('testimonials/', views.testimonials, name='testimonials'),
    path('about/', views.about, name='about'),
    path('blog/', views.blog, name='blog'),
    path('profile/', views.profile_view, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('login/', views.login_view, name='login'),
]

# Serve static files during development
from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)