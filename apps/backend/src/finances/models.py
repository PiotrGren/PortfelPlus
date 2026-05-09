from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

User = settings.AUTH_USER_MODEL

class TransactionType(models.TextChoices):
    INCOME = 'INCOME', 'Przychód'
    EXPENSE = 'EXPENSE', 'Wydatek'

class Category(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='custom_categories')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    
    # Przechowywanie stanów bezpośrednio w bazie
    current_balance = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.00, 
        help_text="Ile użytkownik ma obecnie kasy"
    )
    pending_expenses = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.00, 
        help_text="Suma zaplanowanych wydatków w tym miesiącu"
    )
    free_funds = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.00, 
        help_text="Wolne środki (np. balans - wydatki)"
    )
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Portfel użytkownika {self.user.email}"


class Transaction(models.Model):
    """
    Obejmuje: 
    - Wydatki/Przychody bieżące (is_realized=True, date=dzisiaj)
    - Wydatki/Przychody spodziewane (is_realized=False, date=przyszłość)
    """
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True)
    is_realized = models.BooleanField(default=True, help_text="Czy transakcja już się odbyła?")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.amount} PLN ({self.date})"


class RecurringPlan(models.Model):
    """
    Obejmuje:
    - Wydatki/Przychody cykliczne (brak end_date, np. subskrypcje, wypłata)
    - Wydatki/Przychody okresowe (z end_date, np. raty)
    """
    class Frequency(models.TextChoices):
        DAILY = 'DAILY', 'Codziennie'
        WEEKLY = 'WEEKLY', 'Co tydzień'
        MONTHLY = 'MONTHLY', 'Co miesiąc'
        YEARLY = 'YEARLY', 'Co rok'

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='recurring_plans')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='recurring_plans')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    frequency = models.CharField(max_length=10, choices=Frequency.choices, default=Frequency.MONTHLY)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Pozostaw puste dla nieskończonych subskrypcji")
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Cykliczny {self.type} - {self.amount} ({self.frequency})"
    

class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True, help_text="Kod ISO waluty (np. PLN, USD, EUR)")
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10, help_text="Symbol waluty (np. zł, $, €)")

    class Meta:
        verbose_name_plural = "Currencies"

    def __str__(self):
        return f"{self.code} ({self.symbol})"