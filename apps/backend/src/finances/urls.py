from django.urls import path
from .views import WalletInfoView, CategoryListView, TransactionView, TransactionDetailView, RecurringPlanView, MonthlyReportView

urlpatterns = [
    path('wallet/', WalletInfoView.as_view(), name='wallet_info'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('transactions/', TransactionView.as_view(), name='transaction_list'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),
    path('recurring/', RecurringPlanView.as_view(), name='recurring_plan'),
    path('report/', MonthlyReportView.as_view(), name='monthly_report'),
]