from django.db import migrations

def populate_default_data(apps, schema_editor):
    # W migracjach danych MUSIMY pobierać modele w ten sposób, 
    # zamiast bezpośrednio z models.py. Zapewnia to zgodność historyczną.
    Currency = apps.get_model('finances', 'Currency')
    Category = apps.get_model('finances', 'Category')

    # 1. Zasilanie Walut
    currencies = [
        {'code': 'PLN', 'name': 'Polski Złoty', 'symbol': 'zł'},
        {'code': 'USD', 'name': 'Dolar Amerykański', 'symbol': '$'},
        {'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
    ]
    
    for curr_data in currencies:
        # Używamy get_or_create, żeby migracja była bezpieczna (idempotentna).
        # Jeśli odpalimy ją dwa razy, nie wywali błędu ani nie zduplikuje danych.
        Currency.objects.get_or_create(
            code=curr_data['code'],
            defaults={
                'name': curr_data['name'],
                'symbol': curr_data['symbol']
            }
        )

    # 2. Zasilanie Domyślnych Kategorii (user = None)
    categories = [
        # Przychody
        {'name': 'Wypłata', 'type': 'INCOME'},
        {'name': 'Prezent', 'type': 'INCOME'},
        {'name': 'Zwrot środków', 'type': 'INCOME'},
        {'name': 'Inne przychody', 'type': 'INCOME'},
        
        # Wydatki
        {'name': 'Jedzenie i chemia', 'type': 'EXPENSE'},
        {'name': 'Mieszkanie i rachunki', 'type': 'EXPENSE'},
        {'name': 'Transport i auto', 'type': 'EXPENSE'},
        {'name': 'Rozrywka i hobby', 'type': 'EXPENSE'},
        {'name': 'Zdrowie', 'type': 'EXPENSE'},
        {'name': 'Ubrania', 'type': 'EXPENSE'},
        {'name': 'Inne wydatki', 'type': 'EXPENSE'},
    ]

    for cat_data in categories:
        Category.objects.get_or_create(
            name=cat_data['name'],
            type=cat_data['type'],
            user=None  # Wskazuje, że to kategoria globalna
        )

def reverse_default_data(apps, schema_editor):
    # Logika na wypadek cofania migracji (migrate <nazwa_apki> <numer_wstecz>)
    Currency = apps.get_model('finances', 'Currency')
    Category = apps.get_model('finances', 'Category')
    
    Currency.objects.filter(code__in=['PLN', 'USD', 'EUR']).delete()
    Category.objects.filter(user__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        # UWAGA: Upewnij się, że ta nazwa zgadza się z plikiem,
        # który wygenerował się, gdy tworzyłeś modele!
        ('finances', '0001_initial'), 
    ]

    operations = [
        migrations.RunPython(populate_default_data, reverse_default_data),
    ]