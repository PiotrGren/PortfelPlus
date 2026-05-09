from rest_framework import serializers
from .models import Category, Wallet, Transaction, RecurringPlan, Currency

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class RecurringPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringPlan
        fields = '__all__'


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol']

# Jeśli chcesz, aby Wallet zwracał też info o walucie, możesz go zaktualizować:
class WalletSerializer(serializers.ModelSerializer):
    # Możemy dodać pole waluty bezpośrednio z usera (tylko do odczytu)
    currency_symbol = serializers.CharField(source='user.preferred_currency.symbol', read_only=True)

    class Meta:
        model = Wallet
        fields = [
            'id', 'user', 'current_balance', 'pending_expenses', 
            'free_funds', 'currency_symbol', 'updated_at'
        ]
        read_only_fields = ('id', 'user', 'updated_at', 'currency_symbol')