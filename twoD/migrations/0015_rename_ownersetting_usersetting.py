# Generated by Django 4.2.1 on 2023-06-01 06:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('twoD', '0014_ownersetting'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='OwnerSetting',
            new_name='UserSetting',
        ),
    ]
