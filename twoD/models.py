from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# Create your models here.


class User(AbstractUser):
    phone = models.IntegerField(blank=True, null=True)
    is_owner = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id}: ({self.username})"
    


class Log(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='user_log')
    num = models.ForeignKey('Number', models.CASCADE, related_name='number')
    value = models.IntegerField()
    time = models.DateTimeField(auto_now_add=True)


    def serialize(self):
        formatted_time = self.time.strftime('%Y-%m-%d %H:%M')
        return {
            'id': self.id,
            'user': self.user.username,
            'num': self.num.serialize(),
            'value': self.value,
            'time': formatted_time,
        }

        



class Value(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='user_value')
    num = models.ForeignKey('Number', models.CASCADE, related_name='number_value')
    amount = models.IntegerField(default=0)
    limit = models.IntegerField(default=99999999999)


    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.username,
            'user_id': self.user.id,
            'num': self.num.serialize(),
            'amount': self.amount,
            'limit': self.limit,
        }


class Number(models.Model):
    num = models.CharField(max_length=3)
    

    def __str__(self):
        return f"{self.num}"
    

    def serialize(self):
        return {
            'id': self.id,
            'num': self.num,
            
        }


class ArchiveLog(models.Model):
    num = models.ForeignKey('Number', models.CASCADE, related_name='archive_log_number')
    value = models.IntegerField()
    limit = models.IntegerField(default=99999999999)

    def serialize(self):
        return {
            'id': self.id,
            'num': self.num.serialize(),
            'value': self.value,
            'limit': self.limit
        }

class Archive(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='archive_user')
    date = models.DateField(default=timezone.now)
    ampm = models.CharField(max_length=3, blank=True, null=True)
    archiveLog = models.ManyToManyField('ArchiveLog', related_name='archive_logs')
    jp = models.CharField(max_length=3, blank=True, null=True)

    def serialize(self):
        return {
            'id': self.id,
            'user_name': self.user.first_name,
            'date': self.date,
            'am_pm': self.ampm,
            'jp': self.jp,
            'logs': [l.serialize() for l in self.archiveLog.all()],
        }


