from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Wallet, Currency

User = settings.AUTH_USER_MODEL

@receiver(post_save, sender=User)
def create_user_wallet_and_currency(sender, instance, created, **kwargs):
    """
    Sygnał odpalany za każdym razem, gdy na modelu User wywoływana jest metoda save().
    Zmienna 'created' ma wartość True, jeśli to jest nowo utworzony rekord (INSERT), 
    a False, jeśli to tylko aktualizacja istniejącego rekordu (UPDATE).
    """
    if created:
        Wallet.objects.create(user=instance)
        
        if not instance.preferred_currency:
            default_currency = Currency.objects.filter(code='PLN').first()
            if default_currency:
                instance.preferred_currency = default_currency
                instance.save()