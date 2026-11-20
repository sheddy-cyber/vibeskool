"""Errors leave the API in one shape: {"error": "Human readable message"}.

Validation errors also carry the field details under "fields", so a form
can point at the right input.
"""
from rest_framework.views import exception_handler


def _first_message(detail):
    if isinstance(detail, list):
        return _first_message(detail[0]) if detail else ''
    if isinstance(detail, dict):
        return _first_message(next(iter(detail.values()))) if detail else ''
    return str(detail)


def error_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    data = response.data
    if isinstance(data, dict) and set(data) == {'error'}:
        return response
    if isinstance(data, dict) and 'detail' in data and len(data) == 1:
        response.data = {'error': str(data['detail'])}
    else:
        response.data = {'error': _first_message(data) or 'Something went wrong.', 'fields': data}
    return response
