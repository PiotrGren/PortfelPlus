from rest_framework import serializers
from .models import User

# 1. Serializer do zwracania danych użytkownika (np. do wyciągnięcia profilu)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'auth_provider', 'external_id',
            'first_name', 'last_name', 'full_name',
            'gender', 'nickname', 'phone', 'alt_email',
            'date_joined'
        )
        read_only_fields = ('id', 'auth_provider', 'external_id', 'date_joined')


# 2. Serializer do rejestracji z walidacją hasła i tworzeniem pełnego imienia
class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = (
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'gender',
            'nickname', 'phone', 'alt_email'
        )

    def validate(self, attrs):
        # Sprawdzenie czy hasła się zgadzają
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        # Usuwamy password_confirm, bo nasz manager go nie potrzebuje
        validated_data.pop('password_confirm')
        
        # Złożenie full_name
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        full_name = f"{first_name} {last_name}".strip()

        # Używamy naszego customowego managera, który hashuje hasło
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            full_name=full_name,
            gender=validated_data.get('gender'),
            nickname=validated_data.get('nickname'),
            phone=validated_data.get('phone'),
            alt_email=validated_data.get('alt_email'),
            auth_provider='local'
        )
        return user
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Sama weryfikacja użytkownika odbędzie się w widoku 
            # przy użyciu authenticate(), ale tutaj upewniamy się, 
            # że dane są poprawnie przesłane.
            return attrs
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
        

class SSOLoginSerializer(serializers.Serializer):
    PROVIDER_CHOICES = (
        ('microsoft', 'Microsoft'),
        ('google', 'Google'),
        ('github', 'GitHub'),
    )
    
    provider = serializers.ChoiceField(choices=PROVIDER_CHOICES)
    # Przesyłamy token (w zależności od dostawcy może to być access_token lub id_token)
    token = serializers.CharField()

    def validate(self, attrs):
        # Tutaj tylko sprawdzamy czy pola są, 
        # weryfikacja tokena "u źródła" (w Google/MS/GitHub) 
        # odbędzie się w logice widoku.
        return attrs