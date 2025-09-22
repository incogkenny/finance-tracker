from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response

from .models import Transaction, Category
from .serializer import TransactionSerializer, CategorySerializer


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
