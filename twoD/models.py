from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import random


def generate_random_four_digits():
    while True:
        # Generate a random four-digit integer
        random_number = random.randint(1000, 9999)
        
        # Check if the generated number is unique
        if not User.objects.filter(random_field=random_number).exists():
            return random_number

# Create your models here.


class User(AbstractUser):
    phone = models.IntegerField(blank=True, null=True)
    is_owner = models.BooleanField(default=False)
    random_field = models.IntegerField(default=generate_random_four_digits)
    
    def __str__(self):
        return f"{self.id}: ({self.username})"
    


class Log(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='user_log')
    num = models.ForeignKey('Number', models.CASCADE, related_name='number')
    value = models.IntegerField()
    time = models.DateTimeField(auto_now_add=True)


    def serialize(self):
        formatted_time = self.time.strftime("%I:%M %p")
        return {
            'id': self.id,
            'user': self.user.username,
            'user_name': self.user.first_name,
            'num': self.num.serialize(),
            'value': self.value,
            'time': formatted_time,
        }

class Close(models.Model):
    is_close = models.BooleanField(default=True)



class Value(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='user_value')
    num = models.ForeignKey('Number', models.CASCADE, related_name='number_value')
    amount = models.IntegerField(default=0)
    limit = models.IntegerField(default=99999999999)


    def __str__(self):
        return f"{self.amount} {self.limit}"


    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.username,
            'user_id': self.user.id,
            'num': self.num.serialize(),
            'amount': self.amount,
            'limit': self.limit,
        }

    def checkLimit(self, newValue):
        if self.limit < self.amount + int(newValue):
            return True
        return False

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
    payout_rate = models.FloatField(default=80.0)
    commission = models.FloatField(default=0.12)
    
    def serialize(self):
        return {
            'id': self.id,
            'user_name': self.user.first_name,
            'date': self.date,
            'am_pm': self.ampm,
            'jp': self.jp,
            'logs': [l.serialize() for l in self.archiveLog.all()],
        }

class UserSetting(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='user_setting')
    limit = models.IntegerField(default=99999999999)
    payout_rate = models.FloatField(default=80.0)
    commission = models.FloatField(default=0.12)

    def serialize(self):
        return {
            'id': self.id,
            'user_name': self.user.first_name,
            'limit': self.limit,
            'payRate': self.payout_rate,
            'commission': self.commission
        }

