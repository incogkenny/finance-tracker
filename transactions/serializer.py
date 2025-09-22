from rest_framework import serializers

from .models import Category, Transaction


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



