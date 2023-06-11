from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout_view', views.logout_view, name='logout_view'),
    path('register', views.register, name='register'),
    path('history', views.history, name='history'),
    path('setting', views.setting, name='setting'),
    path('recover', views.recover, name='recover'),

    #api path
    path('add_value', views.add_value, name="add_value"),
    path('getData', views.getData, name='getData'),
    path('getLogs', views.getLogs, name="getLogs"),
    path('deleteLog', views.deleteLog, name="deleteLog"),
    path('getFullAccount', views.getFullAccount, name='getFullAccount'),
    path('getOwnerData', views.getOwnerData, name='getOwnerData'),
    path('setLimit', views.setLimit, name='setLimit'),
    path('closeEntry', views.closeEntry, name='closeEntry'),
    path('addJp', views.addJp, name='addJp'),
    path('getArcs', views.getArcs, name='getArcs'),
]
