from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "user"]
        extra_kwargs = {"user": {"write_only": True}, }

    def create(self, validated_data):
        user = validated_data.pop("user")
        category = Category.objects.create(user=user, **validated_data)
        return category


class TransactionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )

    class Meta:
        model = Transaction
        fields = ["id", "transaction_type", "amount", "date", "notes", "category", "category_id", "user"]



