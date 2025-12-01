from logging import raiseExceptions

from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Transaction, Category
from .serializer import TransactionSerializer, CategorySerializer, UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    a viewset to handle User registration and management
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ('register','login', 'create'):
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
        return User.objects.filter(username=user)

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(self.get_serializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        token_serialzer = TokenObtainPairSerializer(data=request.data)
        token_serialzer.is_valid(raise_exception=True)
        return Response(token_serialzer.validated_data, status=status.HTTP_200_OK)

# Create your views here.
class CategoryViewSet(viewsets.ModelViewSet):
    """
    a viewset to handle CRUD operations for Categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated,]

    def list(self, request, **kwargs):
        """
        :return list of categories for the logged-in user
        """
        user = request.user
        if user.is_authenticated:
            queryset = Category.objects.filter(user=user)
            serializer = CategorySerializer(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.is_authenticated:
            data = request.data.copy()
            data['user'] = user.pk
            serializer = CategorySerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

class TransactionViewSet(viewsets.ModelViewSet):
    """
    a viewset to handle CRUD operations for Transactions
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated,]

    def list(self, request, **kwargs):
        """
        :return list of transactions for the logged-in user
        """
        user = request.user
        if user.is_authenticated:
            queryset = Transaction.objects.filter(user=user)
            serializer = TransactionSerializer(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

    def create(self, request, *args, **kwargs):
        """
        : create a new transaction for the logged-in user (requires category)
        """
        user = request.user
        if user.is_authenticated:
            data = request.data.copy()
            data['user'] = user.pk
            serializer = TransactionSerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)