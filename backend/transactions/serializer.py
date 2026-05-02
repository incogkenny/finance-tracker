from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Category, Transaction


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

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
        extra_kwargs = {"user": {"write_only": True, "required": False}}


class TransactionSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        required=False,
        allow_null=True,
    )

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            fields['category_id'].queryset = Category.objects.filter(user=request.user)
        return fields

    class Meta:
        model = Transaction
        fields = ["id", "transaction_type", "amount", "date", "notes", "category_id", "user"]
        extra_kwargs = {"user": {"write_only": True, "required": False}}

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value



