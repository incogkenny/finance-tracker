from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import Transaction, Category
from .serializer import TransactionSerializer, CategorySerializer, UserSerializer, CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    a viewset to handle User registration and management
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ('register', 'login', 'create'):
            return [permissions.AllowAny()]
        elif self.action == 'list':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(pk=user.pk)

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(self.get_serializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        token_serializer = CustomTokenObtainPairSerializer(data=request.data)
        token_serializer.is_valid(raise_exception=True)
        return Response(token_serializer.validated_data, status=status.HTTP_200_OK)


# Create your views here.
class CategoryViewSet(viewsets.ModelViewSet):
    """
    a viewset to handle CRUD operations for Categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, ]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def list(self, request, **kwargs):
        """
        :return list of categories for the logged-in user
        """
        serializer = CategorySerializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    a viewset to handle CRUD operations for Transactions
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, ]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def list(self, request, **kwargs):
        """
        :return list of transactions for the logged-in user
        """
        serializer = TransactionSerializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
