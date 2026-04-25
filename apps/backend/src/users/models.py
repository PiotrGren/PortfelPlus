from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password() # Bez hasła dla kont z SSO
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    AUTH_PROVIDERS = (
        ('local', 'Local'),
        ('microsoft', 'Microsoft'),
        ('google', 'Google'),
        ('github', 'GitHub'),
    )

    # Główne dane logowania
    email = models.EmailField(unique=True, max_length=255)
    auth_provider = models.CharField(max_length=50, choices=AUTH_PROVIDERS, default='local')
    external_id = models.CharField(max_length=255, null=True, blank=True)

    # Imiona w zależności od źródła
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    full_name = models.CharField(max_length=300, null=True, blank=True)

    # Dodatkowe pola z rejestracji
    gender = models.CharField(max_length=20, null=True, blank=True)
    nickname = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=30, null=True, blank=True)
    alt_email = models.EmailField(null=True, blank=True)

    # Pola administracyjne Django
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # Email i Hasło są domyślnie wymagane, reszta opcjonalna

    def __str__(self):
        return self.email