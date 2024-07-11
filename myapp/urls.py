from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    # path('get-transcriptions/', views.get_transcriptions, name='get_transcriptions'),
    path('simplify/', views.simplify, name='simplify'),
    path('resimplify/', views.resimplify, name='resimplify'),
    path('transcript/', views.transcript, name='transcript'),
    path('getimg/', views.generate_images, name='generate_images'),
    path('keywords/', views.keywords,name="keywords")
]