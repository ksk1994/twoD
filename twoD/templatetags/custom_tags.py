from django import template

register = template.Library()

def abs_value(value):
    return abs(value)

register.filter('abs_value', abs_value)


def format_phone(value):
    # Remove any non-digit characters
    digits = ''.join(filter(str.isdigit, str(value)))
    
    # Split the digits into groups of 3, starting from the right
    groups = [digits[max(i - 3, 0):i] for i in range(len(digits), 0, -3)]
    
    # Reverse the groups and join them with dashes
    formatted = '-'.join(reversed(groups))
    
    # Prepend the country code if available
    if len(formatted) > 0:
        formatted = '0' + formatted
    
    return formatted

register.filter('format_phone', format_phone)



def format_phone_number(value):
    # Check if the input value is a string
    if not isinstance(value, str):
        value = str(value)
    
    # Format the phone number with leading zeros
    formatted_number = value.zfill(11)
    
    
    return formatted_number

register.filter('format_phone_number', format_phone_number)