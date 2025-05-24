from django.contrib import admin

# Register your models here.

#  to manage UserProfile in the django admin

from .models import UserProfile

admin.site.register(UserProfile)

