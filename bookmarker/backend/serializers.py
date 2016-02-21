from .models import User, Entry, Favorite, Setting, Tag
from rest_framework import serializers

class TagSerializer(serializers.HyperlinkedModelSerializer):
    # entries = serializers.HyperlinkedIdentityField(many=True, read_only=True, view_name='entry-detail')

    class Meta:
        model = Tag
        fields = ('name',)


class EntrySerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    tags = TagSerializer(many=True)

    class Meta:
        model = Entry
        fields = ('id', 'url', 'title', 'thumbnail', 'updated_at', 'created_at',
            'belong', 'priority', 'is_public', 'created_by', 'remark', 'tags')
        extra_kwargs = {
            'is_public': {'read_only': True},
            'created_by': {'lookup_field': 'id'}
        }


class FavoriteSerializer(serializers.HyperlinkedModelSerializer):
    entries = EntrySerializer(many=True, read_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'name', 'created_at', 'is_public', 'created_by', 'entries', 'entries_num')
        extra_kwargs = {
            'entries_num': {'read_only': True},
            'created_by': {'read_only': True}
        }


class SettingSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Setting
        fields = ('id', 'display_style', 'layout_style', 'quick_mode')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    user_id = serializers.ReadOnlyField(source='id')
    default_favor = serializers.PrimaryKeyRelatedField(read_only=True)
    setting = serializers.PrimaryKeyRelatedField(read_only=True)
    # favorites = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name='favorite-detail')

    class Meta:
        model = User
        fields = ('user_id', 'username', 'avatar', 'email', 'password', 'default_favor', 'setting')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if not (2 <= len(data['username']) <= 12):
            raise serializers.ValidationError({'username': "用户名长度应在2~12位"})
        if not (6 <= len(data['password']) <= 18):
            raise serializers.ValidationError({'password': "密码长度应在6~18位"})
        return data

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class PasswordSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('password', )
