from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import Transaction, Category
from .serializer import TransactionSerializer


# Create your views here.

class TransactionViewSet(viewsets.ModelViewSet):
    """
    a viewset to handle CRUD operations for Transactions
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def list(self, request, **kwargs):
        """
        Override list method to filter transactions by the logged-in user
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
        Override create method to associate the transaction with the logged-in user
        """
        user = request.user
        if user.is_authenticated:
            data = request.data.copy()
            data['user'] = user.id
            serializer = TransactionSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
