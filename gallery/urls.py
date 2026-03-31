from django.urls import path

from . import views

app_name = 'gallery'

urlpatterns = [
    path('', views.frames, name='frames'),
    path('frames/', views.frames, name='frames'),
    path('frame-editor/', views.frame_editor, name='frame_editor'),
]

