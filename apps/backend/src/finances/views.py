from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from decimal import Decimal

from .models import Wallet, Category, Transaction, RecurringPlan
from .serializers import WalletSerializer, CategorySerializer, TransactionSerializer, RecurringPlanSerializer

def update_wallet_pending_and_free_funds(wallet):
    """Pomocnicza funkcja czyszcząca i wyliczająca planowane wydatki w tym miesiącu"""
    now = timezone.now()
    # Środki na minusie: suma NIEZREALIZOWANYCH WYDATKÓW z bieżącego miesiąca
    pending = Transaction.objects.filter(
        wallet=wallet,
        type='EXPENSE',
        is_realized=False,
        date__year=now.year,
        date__month=now.month
    ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    
    wallet.pending_expenses = pending
    wallet.free_funds = wallet.current_balance - wallet.pending_expenses
    wallet.save()


class WalletInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Pobieranie stanu portfela (Aktualny stan, wolne środki, na minusie)"""
        wallet = request.user.wallet
        update_wallet_pending_and_free_funds(wallet)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Inicjalizacja/Dodawanie pieniędzy stałych"""
        wallet = request.user.wallet
        amount = request.data.get('current_balance')
        
        if amount is None:
            return Response({'detail': 'Pole current_balance jest wymagane.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            wallet.current_balance = Decimal(str(amount))
            wallet.save()
            update_wallet_pending_and_free_funds(wallet)
            return Response(WalletSerializer(wallet).data, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Niepoprawny format kwoty.'}, status=status.HTTP_400_BAD_REQUEST)


class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Pobieranie kategorii domyślnych oraz własnych użytkownika"""
        categories = Category.objects.filter(user__isnull=True) | Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Dodawanie własnej kategorii przez użytkownika"""
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Wyświetlanie historii z filtrowaniem po kategorii, typie lub dacie"""
        wallet = request.user.wallet
        queryset = Transaction.objects.filter(wallet=wallet).order_by('-date', '-created_at')
        
        # Filtry z query params (?type=INCOME&category_id=2&month=5&year=2026)
        t_type = request.query_params.get('type')
        category_id = request.query_params.get('category_id')
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        date = request.query_params.get('date')

        if t_type:
            queryset = queryset.filter(type=t_type)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if date:
            queryset = queryset.filter(date=date)
        if month and year:
            queryset = queryset.filter(date__year=year, date__month=month)

        serializer = TransactionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Dodawanie przychodów i wydatków (Bieżących oraz Spodziewanych)"""
        wallet = request.user.wallet
        serializer = TransactionSerializer(data=request.data)
        
        if serializer.is_valid():
            transaction = serializer.save(wallet=wallet)
            
            # Logika aplikacyjna: Modyfikacja aktualnego stanu konta tylko dla transakcji BIEŻĄCYCH (zrealizowanych)
            if transaction.is_realized:
                if transaction.type == 'INCOME':
                    wallet.current_balance += transaction.amount
                elif transaction.type == 'EXPENSE':
                    wallet.current_balance -= transaction.amount
                wallet.save()

            # Aktualizacja planowanych opłat i wolnych środków
            update_wallet_pending_and_free_funds(wallet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        """Usuwanie transakcji (cofa skutki finansowe w portfelu)"""
        wallet = request.user.wallet
        try:
            transaction = Transaction.objects.get(pk=pk, wallet=wallet)
        except Transaction.DoesNotExist:
            return Response({'detail': 'Transakcja nie istnieje.'}, status=status.HTTP_404_NOT_FOUND)

        # Jeśli była zrealizowana, należy odwrócić jej wpływ na saldo portfela
        if transaction.is_realized:
            if transaction.type == 'INCOME':
                wallet.current_balance -= transaction.amount
            elif transaction.type == 'EXPENSE':
                wallet.current_balance += transaction.amount
            wallet.save()

        transaction.delete()
        update_wallet_pending_and_free_funds(wallet)
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecurringPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Pobieranie listy subskrypcji i rat"""
        wallet = request.user.wallet
        plans = RecurringPlan.objects.filter(wallet=wallet, is_active=True)
        serializer = RecurringPlanSerializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Dodawanie przychodów/wydatków cyklicznych i okresowych"""
        wallet = request.user.wallet
        serializer = RecurringPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(wallet=wallet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MonthlyReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Raport miesięczny: Podsumowanie struktury finansowej"""
        wallet = request.user.wallet
        now = timezone.now()
        year = request.query_params.get('year', now.year)
        month = request.query_params.get('month', now.month)

        transactions = Transaction.objects.filter(wallet=wallet, date__year=year, date__month=month)
        
        total_income = transactions.filter(type='INCOME', is_realized=True).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        total_expense = transactions.filter(type='EXPENSE', is_realized=True).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        
        category_breakdown = transactions.filter(is_realized=True).values('category__name', 'type').annotate(total=Sum('amount')).order_by('-total')

        return Response({
            'year': int(year),
            'month': int(month),
            'total_realized_income': total_income,
            'total_realized_expense': total_expense,
            'net_savings': total_income - total_expense,
            'breakdown': category_breakdown
        }, status=status.HTTP_200_OK)