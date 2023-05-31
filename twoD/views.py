from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, JsonResponse, FileResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as dj_login
from django.contrib.auth import logout as auth_logout
from django.contrib import messages
from django.db import IntegrityError
import json
import pytz
from django.utils import timezone
from datetime import time
from django.core.paginator import Paginator


#importing models
from .models import User, Log, Number, Value, ArchiveLog, Archive

# Create your views here.
@login_required(login_url='/login')
def index(request):
    user = request.user
    print(f"{user.is_owner}")

    
    if request.user.is_owner:
        nums = Number.objects.all()
        users = User.objects.filter(is_owner=False)
        return render(request, 'twoD/index.html', {
            'nums': nums,
            'users': users
        })
    else:
        return render(request, 'twoD/sellerPage.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            dj_login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, "Invalid input!")
            return HttpResponseRedirect(reverse("login"))
    else:
        return render(request, 'twoD/login.html')
    
def register(request):
    if request.method == 'POST':
        name = request.POST['name'].strip().capitalize()
        username = request.POST['username'].strip()
        password = request.POST['password']
        confirmation = request.POST['confirmation']
        phone = request.POST['phone'].strip()
        email = 'exemple@exemple.cpm'

        #checking if password match with confirmation
        if password != confirmation:
            messages.error(request, "Passwords not match!")
            return HttpResponseRedirect(reverse("register"))
        
        #creating new account
        try:
            user = User.objects.create_user(username, email, password)
            user.phone = phone
            user.first_name = name
            user.save()
            

        except IntegrityError:
            messages.error(request, "Username already taken!")
            return HttpResponseRedirect(reverse("register"))
        
        nums = Number.objects.all()
        val_list = []
        for num in nums:
            val_list.append(Value(num=num, user=user))
        
        Value.objects.bulk_create(val_list)
        dj_login(request, user)
        messages.success(request, 'Successfully registered!')
        return HttpResponseRedirect(reverse('index'))

    else:
        return render(request, 'twoD/register.html')
        

def logout_view(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse("index"))


def addNumber(request):
    for i in range(100):
        num = Number()
        num.num = "{:02d}".format(i)
        num.save()

@login_required
def closeEntry(request):
    if request.user.is_owner:
        #get local time
        myanmar_tz = pytz.timezone('Asia/Yangon')
        current_time = timezone.localtime(timezone.now(), myanmar_tz)
        
        #check pm am
        am_pm = 'AM' if current_time.hour < 11 or (current_time.hour == 11 and current_time.minute < 50) else 'PM'

        users = User.objects.filter(is_owner=False)

        archives = []
        for user in users:
            #query all values
            values = Value.objects.filter(user=user, amount__gt=0)

            archive = Archive(user=user, ampm=am_pm)
            archive.save()

            archive_logs = []
            for v in values:
                archive_logs.append(ArchiveLog(num=v.num, value=v.amount, limit=v.limit))
                v.amount = 0
                v.limit = 99999999999

            Value.objects.bulk_update(values, ['amount', 'limit'])

            ArchiveLog.objects.bulk_create(archive_logs)
            archive.archiveLog.set(archive_logs)
            archive.save()
            archives.append(archive)

            Log.objects.filter(user=user).delete()

        return JsonResponse({
            'archives': [archive.serialize() for archive in archives]
        }, status=201)


@login_required
def history(request):
    if request.user.is_owner:
        arcs = Archive.objects.all().order_by('date', 'ampm', 'user')
    else:
        arcs = Archive.objects.filter(user=request.user).order_by('date', 'ampm')
    archives = []
    for ar in arcs:
        total = 0
        loss = 0
        for l in ar.archiveLog.all():
            total += l.value
            if ar.jp == l.num.num:
                loss = l.value * 80


        archives.append({
            'total': total,
            'arc': ar,
            'loss': loss,
        })
    paginator = Paginator(archives, 25)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request, 'twoD/history.html', {
        'arcs': page_obj
    })
        




@login_required
def add_value(request):
    if request.method == "POST":
        json_data = json.loads(request.body)
        id = json_data.get('id')
        new_value = json_data.get('value')
        try:
            num = Number.objects.get(pk=id)
            value = Value.objects.get(user=request.user, num=num)
        except (Number.DoesNotExist, Value.DoesNotExist):
            return JsonResponse({'message': 'Error'}, status=400)
        new_log = Log()
        new_log.user = request.user
        new_log.num = num
        new_log.value = int(new_value)
        new_log.save()

        #add new amount to value
        
        value.amount = value.amount + int(new_value)
        value.save()

        try:
            val = Value.objects.get(user=request.user, num=num)
        except Number.DoesNotExist:
            return JsonResponse({'message': 'Error'}, status=400)
        
        return JsonResponse({
                'val': val.serialize()}, status=201)
    

@login_required
def getData(request):
    if request.method == "GET":
        vals = Value.objects.filter(user=request.user)

        return JsonResponse({
            'vals': [val.serialize() for val in vals]
        }, status=201)
    

@login_required
def getLogs(request):
    if request.method == "GET":
        logs = Log.objects.filter(user=request.user)

        return JsonResponse({
            'logs': [log.serialize() for log in logs]
        }, status=201)
    

@login_required
def deleteLog(request):
    if request.method == "DELETE":
        json_data = json.loads(request.body)
        id = json_data.get('id')
        try:
            
            log = Log.objects.get(pk=id)
            value = Value.objects.get(user=request.user, num=log.num)
        except (Log.DoesNotExist, Value.DoesNotExist):
            return JsonResponse({'message': 'Error'}, status=400)
        
        
        value.amount = value.amount - log.value
        value.save()
        log.delete()

        return JsonResponse({"val": value.serialize()}, status=201)
    

@login_required
def getFullAccount(request):

    if request.method == 'GET':
        vals = Value.objects.filter(user=request.user, amount__gt=0)
        return JsonResponse({"vals": [value.serialize() for value in vals]}, status=201)
    


@login_required
def getOwnerData(request):

    if request.method == "GET" and request.user.is_owner:
        users = User.objects.filter(is_owner=False)

        jsonData = []
        for u in users:
            vals = Value.objects.filter(user=u)
            data = {
                'user': {
                    'id':u.id,
                    'name': u.first_name,
                    'username': u.username,
                },
                'vals': [v.serialize() for v in vals],
            }
            jsonData.append(data)
            
        return JsonResponse({'data': jsonData}, status=201)
    

@login_required
def setLimit(request):
    if request.method == 'PUT':
        json_data = json.loads(request.body)
        user = json_data.get('user')
        num = json_data.get('num')
        limit = json_data.get('limit')
        if user == 'all_users' and num == 'all_nums':
            value = Value.objects.all()
        elif user == 'all_users' and num != 'all_nums':
            value = Value.objects.filter(num_id=num)
        elif user != 'all_users' and num == 'all_nums':
            value = Value.objects.filter(user_id=user)
        else:
            value = Value.objects.filter(user_id=user, num_id=num)

        if len(value) != 0:
            for v in value:
                v.limit = limit
            Value.objects.bulk_update(value, ['limit'])

            return JsonResponse({
                'vals': [v.serialize() for v in value]
            }, status=201)
        

@login_required
def getArcs(request):
    if request.method == 'GET' and request.user.is_owner:
        arcs = Archive.objects.filter(jp__isnull=True)
        a_date = set()

        for a in arcs:
            a_date.add(
                (a.date, a.ampm)
            )
        aDate = list(a_date)
        return JsonResponse({
            'arcs': aDate
        }, status=201)

    
@login_required
def addJp(request):
    if request.method == 'POST' and request.user.is_owner:
        json_data = json.loads(request.body)
        jp = int(json_data.get('jp'))
        date = json_data.get('date')
        ampm = json_data.get('ampm')

        arcs = Archive.objects.filter(date=date, ampm=ampm)
        for a in arcs:
            a.jp = "{:02d}".format(jp)
        Archive.objects.bulk_update(arcs, ['jp'])

        return JsonResponse({
            'msg': 'success',
            'arcs': [a.serialize() for a in arcs]
        }, status=201)


