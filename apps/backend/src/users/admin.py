from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'auth_provider', 'full_name', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'full_name', 'first_name', 'last_name')
    list_filter = ('auth_provider', 'is_active', 'is_staff')
    ordering = ('-date_joined',)
    
    # Aby w panelu admina hasła były bezpieczne (nie wyświetlały się jako plain-text)
    readonly_fields = ('password',)