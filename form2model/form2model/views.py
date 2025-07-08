from django.apps import apps
from django.core import serializers
from django.http import JsonResponse
from .utils import (
    get_model_field_names_as_dict,
    get_model_field_foreign_keys_as_dict,
    get_model_field_many_to_many_as_dict
)

def get_object_json_view(request, app_label:str, model_name: str, obj_id: int) -> JsonResponse:
    model = apps.get_model(app_label, model_name)
    obj = model.objects.get(pk=obj_id)
    obj_json = serializers.serialize('json', [obj])
    data_json = {'obj': obj_json, 'obj_str': str(obj)}
    return JsonResponse(data_json, status=200)

def get_object_with_related_fields_json_view(request, app_label:str, model_name: str, obj_id: int) -> JsonResponse:
    model = apps.get_model(app_label, model_name)
    obj = model.objects.get(pk=obj_id)
    related_fields = get_model_field_foreign_keys_as_dict(obj)
    m2m_fields = get_model_field_many_to_many_as_dict(obj)

    if m2m_fields:
        for key, value in m2m_fields.items():
            related_fields[key] = value

    obj_json = serializers.serialize('json', [obj])
    data_json = {'success': True, 'obj': obj_json, 'obj_str': str(obj), 'related_fields': related_fields}
    return JsonResponse(data_json)

