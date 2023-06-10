from django import template

register = template.Library()

def abs_value(value):
    return abs(value)

register.filter('abs_value', abs_value)
