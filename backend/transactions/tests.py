from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from .models import Category, Transaction


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

class AuthMixin:
    """Authenticate the test client using the app's custom login endpoint."""

    def login(self, username: str, password: str) -> str:
        url = reverse("user-login")
        response = self.client.post(url, {"username": username, "password": password})
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return token

    def logout(self):
        self.client.credentials()


# ---------------------------------------------------------------------------
# User / Auth tests
# ---------------------------------------------------------------------------

class UserRegistrationTests(APITestCase):
    def test_register_success(self):
        response = self.client.post(
            reverse("user-register"),
            {"username": "newuser", "password": "securepass1"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_duplicate_username_fails(self):
        User.objects.create_user(username="existing", password="pass")
        response = self.client.post(
            reverse("user-register"),
            {"username": "existing", "password": "pass2"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_password_fails(self):
        response = self.client.post(reverse("user-register"), {"username": "nopass"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthenticationTests(APITestCase, AuthMixin):
    def setUp(self):
        self.user = User.objects.create_user(username="authuser", password="authpass123")

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            reverse("user-login"),
            {"username": "authuser", "password": "authpass123"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_jwt_contains_username_claim(self):
        token_str = self.login("authuser", "authpass123")
        token = AccessToken(token_str)
        self.assertEqual(token["username"], "authuser")

    def test_login_invalid_password_fails(self):
        response = self.client.post(
            reverse("user-login"),
            {"username": "authuser", "password": "wrongpass"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user_fails(self):
        response = self.client.post(
            reverse("user-login"),
            {"username": "ghost", "password": "pass"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Category tests
# ---------------------------------------------------------------------------

class CategoryTests(APITestCase, AuthMixin):
    def setUp(self):
        self.user = User.objects.create_user(username="catuser", password="catpass123")
        self.other_user = User.objects.create_user(username="other", password="otherpass123")
        self.login("catuser", "catpass123")

    # -- create --

    def test_create_category_authenticated(self):
        response = self.client.post(reverse("category-list"), {"name": "Food"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Food")

    def test_create_category_unauthenticated_returns_401(self):
        self.logout()
        response = self.client.post(reverse("category-list"), {"name": "Food"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_category_blank_name_fails(self):
        response = self.client.post(reverse("category-list"), {"name": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -- list --

    def test_list_categories_returns_only_own(self):
        Category.objects.create(name="Mine", user=self.user)
        Category.objects.create(name="Theirs", user=self.other_user)
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [c["name"] for c in response.data]
        self.assertIn("Mine", names)
        self.assertNotIn("Theirs", names)

    def test_list_categories_unauthenticated_returns_401(self):
        self.logout()
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # -- delete --

    def test_delete_own_category(self):
        category = Category.objects.create(name="Bills", user=self.user)
        url = reverse("category-detail", args=[category.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=category.id).exists())

    def test_delete_other_users_category_returns_404(self):
        other_cat = Category.objects.create(name="Theirs", user=self.other_user)
        url = reverse("category-detail", args=[other_cat.id])
        response = self.client.delete(url)
        # DRF returns 404 when the queryset doesn't include the object
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])


# ---------------------------------------------------------------------------
# Transaction tests
# ---------------------------------------------------------------------------

class TransactionTests(APITestCase, AuthMixin):
    def setUp(self):
        self.user = User.objects.create_user(username="txuser", password="txpass123")
        self.other_user = User.objects.create_user(username="other2", password="otherpass123")
        self.category = Category.objects.create(name="Wages", user=self.user)
        self.login("txuser", "txpass123")

    def _create_payload(self, **overrides):
        base = {
            "transaction_type": "INCOME",
            "amount": "100.00",
            "date": "2026-01-15",
        }
        base.update(overrides)
        return base

    # -- create --

    def test_create_transaction_without_category(self):
        response = self.client.post(reverse("transaction-list"), self._create_payload())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data["category_id"])

    def test_create_transaction_with_category(self):
        payload = self._create_payload(category_id=self.category.id)
        response = self.client.post(reverse("transaction-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category_id"], self.category.id)

    def test_create_transaction_with_other_users_category_fails(self):
        other_cat = Category.objects.create(name="Other", user=self.other_user)
        payload = self._create_payload(category_id=other_cat.id)
        response = self.client.post(reverse("transaction-list"), payload)
        # Category not in queryset → DRF validation error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_transaction_unauthenticated_returns_401(self):
        self.logout()
        response = self.client.post(reverse("transaction-list"), self._create_payload())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_transaction_invalid_type_fails(self):
        payload = self._create_payload(transaction_type="INVALID")
        response = self.client.post(reverse("transaction-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_transaction_negative_amount_fails(self):
        payload = self._create_payload(amount="-10.00")
        response = self.client.post(reverse("transaction-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_expense_transaction(self):
        payload = self._create_payload(transaction_type="EXPENSE", amount="45.50")
        response = self.client.post(reverse("transaction-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["transaction_type"], "EXPENSE")

    # -- list --

    def test_list_transactions_returns_only_own(self):
        Transaction.objects.create(
            user=self.user, transaction_type="INCOME", amount="50", date="2026-01-01"
        )
        Transaction.objects.create(
            user=self.other_user, transaction_type="EXPENSE", amount="20", date="2026-01-01"
        )
        response = self.client.get(reverse("transaction-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(str(response.data[0]["amount"]), "50.00")

    def test_list_transactions_unauthenticated_returns_401(self):
        self.logout()
        response = self.client.get(reverse("transaction-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # -- delete --

    def test_delete_own_transaction(self):
        tx = Transaction.objects.create(
            user=self.user, transaction_type="INCOME", amount="100", date="2026-01-01"
        )
        url = reverse("transaction-detail", args=[tx.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Transaction.objects.filter(id=tx.id).exists())

    def test_delete_other_users_transaction_returns_404(self):
        other_tx = Transaction.objects.create(
            user=self.other_user, transaction_type="EXPENSE", amount="30", date="2026-01-01"
        )
        url = reverse("transaction-detail", args=[other_tx.id])
        response = self.client.delete(url)
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_delete_unauthenticated_returns_401(self):
        tx = Transaction.objects.create(
            user=self.user, transaction_type="INCOME", amount="100", date="2026-01-01"
        )
        self.logout()
        url = reverse("transaction-detail", args=[tx.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class CategoryModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="modeluser", password="pass")

    def test_category_str(self):
        category = Category.objects.create(name="Groceries", user=self.user)
        self.assertEqual(str(category), "Groceries")

    def test_category_cascade_deletes_with_user(self):
        Category.objects.create(name="Temp", user=self.user)
        self.user.delete()
        self.assertEqual(Category.objects.count(), 0)


class TransactionModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="modeluser2", password="pass")

    def test_transaction_str(self):
        tx = Transaction.objects.create(
            user=self.user, transaction_type="INCOME", amount="250.00", date="2026-05-01"
        )
        self.assertIn("INCOME", str(tx))
        self.assertIn("250.00", str(tx))

    def test_transaction_category_nullable(self):
        tx = Transaction.objects.create(
            user=self.user, transaction_type="EXPENSE", amount="10.00", date="2026-05-01"
        )
        self.assertIsNone(tx.category)

    def test_transaction_cascade_deletes_with_user(self):
        Transaction.objects.create(
            user=self.user, transaction_type="INCOME", amount="1.00", date="2026-01-01"
        )
        self.user.delete()
        self.assertEqual(Transaction.objects.count(), 0)
