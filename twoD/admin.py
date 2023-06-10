from django.contrib import admin
from .models import User, Log, Number, Value, Archive, ArchiveLog, UserSetting
# Register your models here.


admin.site.register(User)
admin.site.register(Log)
admin.site.register(Number)
admin.site.register(Value)
admin.site.register(ArchiveLog)
admin.site.register(Archive)
admin.site.register(UserSetting)


