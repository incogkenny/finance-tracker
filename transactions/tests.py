import json

from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User

from transactions.models import Category


# Create your tests here.

class UserTests(APITestCase):
    def test_user_registration(self):
        url = reverse('user-list')
        data = {"username": "testuser", "password": "testpass123"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class JWTAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_jwt_token_obtain(self):
        url = reverse('token_obtain_pair')
        data = {"username": "testuser", "password": "testpass123"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.json())


class CategoryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='catpass123')
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'catpass123'})
        self.token = response.data['access']

    def test_create_category(self):
        url = reverse('category-list')
        data = {"name": "Food"}
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

class TransactionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="transuser", password="transpass123")
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {"username": "transuser", "password": "transpass123"})
        self.token = response.data["access"]
        self.category = Category.objects.create(name="Bills", user=self.user)

    def test_create_transaction(self):
        url = reverse('transaction-list')
        data = {
            "transaction_type": "EXPENSE",
            "amount": "50.00",
            "date": "2024-06-01",
            "category_id": self.category.id
        }
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)