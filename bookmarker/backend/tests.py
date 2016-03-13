from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .views import UserViewSet
from .models import User

class AccountTest(APITestCase):
    def test_create_account(self):
        sign_up_page = reverse('sign-up')
        data = {
            'username': 'test',
            'password': 'cooltest',
            'email': ''
        }
        response = self.client.post(sign_up_page, data, format='json')
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(User.objects.count(), 1)
        self.assertEquals(User.objects.get().username, 'test')

    def test_set_password(self):
        user = User.objects.create_user('tonnie', 'tonnie.lwt@gmail.com', 'nopasswd')
        self.client.login(username='tonnie', password='nopasswd')
        set_password_view = reverse('user-set-password', kwargs={'pk':user.id})
        response = self.client.put(set_password_view, {'password': 'yespasswd'})
        self.assertEquals(response.status_code, status.HTTP_200_OK)
