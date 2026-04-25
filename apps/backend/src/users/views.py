import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated # Dodano IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import RegisterUserSerializer, LoginSerializer, SSOLoginSerializer, UserSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def set_jwt_cookies(response, refresh_token):
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=False, # ZMIEŃ NA True NA PRODUKCJI
        samesite='Lax',
        max_age=7 * 24 * 60 * 60
    )
    return response


class RegisterView(APIView):
    authentication_classes = []  # Brak uwierzytelniania dla tego endpointu
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Zwracamy tylko PUSTY status 201 (CREATED) bez zbędnych danych
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    authentication_classes = []  # Brak uwierzytelniania dla tego endpointu
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(email=email, password=password)

        if user is not None:
            if not user.is_active:
                return Response({'detail': 'Account is disabled.'}, status=status.HTTP_403_FORBIDDEN)
            
            tokens = get_tokens_for_user(user)
            
            # Zwracamy TYLKO access token
            response = Response({'access': tokens['access']}, status=status.HTTP_200_OK)
            return set_jwt_cookies(response, tokens['refresh'])
            
        return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)


class SSOSyncView(APIView):
    authentication_classes = []  # Brak uwierzytelniania dla tego endpointu
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SSOLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        provider = serializer.validated_data['provider']
        token = serializer.validated_data['token']

        try:
            user_info = self.verify_provider_token(provider, token)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        email = user_info.get('email')
        if not email:
            return Response({'detail': f'No email associated with {provider.capitalize()} account.'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'auth_provider': provider,
                'external_id': user_info.get('external_id'),
                'first_name': user_info.get('first_name', ''),
                'last_name': user_info.get('last_name', ''),
                'full_name': user_info.get('full_name', ''),
            }
        )

        if not user.is_active:
            return Response({'detail': 'Account is disabled.'}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        
        # Zwracamy TYLKO access token (i opcjonalnie info czy to nowe konto, czasem się przydaje na froncie)
        response = Response({
            'access': tokens['access'],
            'is_new_user': created
        }, status=status.HTTP_200_OK)
        
        return set_jwt_cookies(response, tokens['refresh'])

    def verify_provider_token(self, provider, token):
        headers = {'Authorization': f'Bearer {token}'}

        if provider == 'google':
            res = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=headers)
            if res.status_code != 200:
                raise ValueError('Invalid Google token.')
            data = res.json()
            return {
                'email': data.get('email'),
                'external_id': data.get('sub'),
                'first_name': data.get('given_name', ''),
                'last_name': data.get('family_name', ''),
                'full_name': data.get('name', '')
            }

        elif provider == 'github':
            res = requests.get('https://api.github.com/user', headers=headers)
            if res.status_code != 200:
                raise ValueError('Invalid GitHub token.')
            data = res.json()
            
            email = data.get('email')
            if not email:
                email_res = requests.get('https://api.github.com/user/emails', headers=headers)
                if email_res.status_code == 200:
                    emails = email_res.json()
                    email = next((e['email'] for e in emails if e['primary']), None)

            name = data.get('name', '')
            first_name, *last_name = name.split(maxsplit=1) if name else ('', '')
            return {
                'email': email,
                'external_id': str(data.get('id')),
                'first_name': first_name,
                'last_name': last_name[0] if last_name else '',
                'full_name': name
            }

        elif provider == 'microsoft':
            res = requests.get('https://graph.microsoft.com/v1.0/me', headers=headers)
            if res.status_code != 200:
                raise ValueError('Invalid Microsoft token.')
            data = res.json()
            return {
                'email': data.get('mail') or data.get('userPrincipalName'),
                'external_id': data.get('id'),
                'first_name': data.get('givenName', ''),
                'last_name': data.get('surname', ''),
                'full_name': data.get('displayName', '')
            }


# NOWY ENDPOINT: Zwraca dane zalogowanego użytkownika
class UserMeView(APIView):
    # Wymaga ważnego tokenu JWT w nagłówku 'Authorization: Bearer <token>'
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user jest tutaj automatycznie ustawiany przez SimpleJWT jeśli token jest ważny
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)