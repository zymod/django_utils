from typing import Any
from django.db import models

def get_model_field_names_as_dict(model: models.Model) -> dict:
    """ Zwraca nazwy pól modelu w postaci slownika.
    """
    return {field.name: None for field in model._meta.fields}

def get_model_field_foreign_keys_as_dict(obj: Any) -> dict:
    """ Zwraca pola kluczy obcych modelu w postaci slownika.
    """
    field_names = [field.name for field in obj._meta.fields if isinstance(field, models.ForeignKey)]
    field_values = {field: getattr(obj, field) for field in field_names}

    data_dict = {}
    
    for field, value in field_values.items():
        if field not in data_dict:
            if value is None:
                data_dict[field] = None
            else:
                data_dict[field] = [value.id, str(value)]

    return data_dict

def get_model_field_many_to_many_as_dict(obj: Any) -> dict:
    """ Zwraca pola kluczy obcych modelu w postaci slownika.
    """
    field_names = [field.name for field in obj._meta.get_fields() if isinstance(field, models.ManyToManyField)]
    
    data_dict = {}

    for field_name in field_names:
        for obj in list(getattr(obj, field_name).all()):
            if not field_name in data_dict:
                data_dict[field_name] = [[obj.id, str(obj)]]
            else:
                data_dict[field_name] += [[obj.id, str(obj)]]

    return data_dict