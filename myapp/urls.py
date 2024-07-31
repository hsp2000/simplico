from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('simplify/', views.simplify, name='simplify'),
    path('resimplify/', views.resimplify, name='resimplify'),
    path('transcript/', views.transcript, name='transcript'),
    path('summary/', views.summary, name='summary'),
    path('getimg/', views.generate_images, name='generate_images'),
    path('getemoji/', views.generate_emojis, name='generate_emojis'),
    path('keywords/', views.keywords,name="keywords")
]