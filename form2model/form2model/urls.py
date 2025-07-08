from django.urls import path
from . import views

app_name = 'form2model'

urlpatterns = [
    path('<str:app_label>/<str:model_name>/<int:obj_id>/', views.get_object_json_view, name='get_object'),
    path('<str:app_label>/<str:model_name>/<int:obj_id>/related_fields/', views.get_object_with_related_fields_json_view, name='get_object_with_related_fields'),
]
