# Generated by Django 4.2.1 on 2023-05-19 02:31

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('twoD', '0007_archivelog_archive'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='archivelog',
            name='date',
        ),
        migrations.AddField(
            model_name='archive',
            name='date',
            field=models.DateField(default=django.utils.timezone.now),
        ),
    ]
