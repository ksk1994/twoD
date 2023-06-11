function showSaveSetting(event) {
    let id = event.currentTarget.id;
    let name = document.getElementById(`name_${id}`).innerHTML;
    document.getElementById('mdl_title').innerHTML = 'Confirm Save';
    let body = document.getElementById('mdl_body');

    body.innerHTML = `${name} အတွက် အခု setting ကို save မှာသေချာပြီလား?`
    
    if (!document.getElementById('mdl_submit')) {
        let btn = document.createElement('button');
        btn.id = 'mdl_submit'
        btn.className = 'btn btn-primary';
        btn.type = 'button';
        

        
        document.getElementById('mdl_footer').append(btn);
    }
    document.getElementById('mdl_submit').onclick = function() {
        saveSetting(id);
    };
    document.getElementById('mdl_submit').innerHTML = 'သေချာတယ်'
    document.getElementById('logModalBtn').click();
}


function saveSetting(id) {
    document.getElementById('mdl_close').click();
    console.log(id)
    let limit = parseInt(document.getElementById(`limit_${id}`).value);
    let payRate = parseFloat(document.getElementById(`pay_${id}`).value);
    let commission = parseFloat(document.getElementById(`com_${id}`).value);

    if (limit > 0 && payRate > 0 && commission > 0) {
        const headers = {
            'X-CSRFToken': getCookie('csrftoken'),
        };
        showLoading();
        fetch('/setting', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                id: id,
                limit: limit,
                payRate: payRate,
                commission: commission,
            })
        })
        .then(response => response.json())
        .then((data) => {
            hideLoading();
            if (data.msg === 'error') {
                showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပြီး နောက်တခေါက်ထပ် လုပ်ကြည့်ပါ! Retry!', false, 'error')
            } else {
                console.log(data)
                document.getElementById(`limit_${data.setting['id']}`).value = data.setting['limit']
                document.getElementById(`pay_${data.setting['id']}`).value = parseFloat(data.setting['payRate'])
                document.getElementById(`com_${data.setting['id']}`).value = parseFloat(data.setting['commission'])
                showNewNoti('အောင်မြင်စွာ saveပြီးပါပြီ။', true, 'success')
            }
            
        })
    } else {
        showNewNoti('ဖြည့်တဲ့ တန်ဖိုးမှားနေပါတယ်| သေသေချာချာ စစ်ကြည့်ပါ', false, 'error')
    }
    
}

function showNewNoti(str, ok, id) {
    console.log(id)
    if (document.getElementById(`noti_${id}`)) {
        document.getElementById(`noti_${id}`).remove();
    }
    var div = document.createElement("div");
    div.id = `noti_${id}`
    if (ok) {
        div.className = 'toast align-items-center text-bg-success border-0'
    } else {
        div.className = 'toast align-items-center text-bg-danger border-0'
    }
    
    div.role = 'alert';
    div.ariaLive = 'assertive';
    div.ariaAtomic = 'true';
    div.setAttribute('data-bs-delay', 5000)
    div.innerHTML = `
    <div class="d-flex">
        <div class="toast-body" id="new_noti_body">
          ${str}
        </div>
        <button type="button" id="close_${id}" class="btn-close btn-close-white me-2 m-auto toastClose" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `
    document.getElementById('noti_con').append(div);
    const toastLiveExample = document.getElementById(`noti_${id}`)
    const toast = new bootstrap.Toast(toastLiveExample)
    toast.show()
    setInterval(function() {
        document.getElementById(`close_${id}`).click()
    }, 5000);
}

function showLoading() {
    document.getElementById('loadingDiv').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingDiv').style.display = 'none';
}

function getCookie(name) {
    let cookieValue = null;
    
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

                break;
            }
        }
    }

    return cookieValue;
}

function activateSaveBtn(event) {
    let id = event.currentTarget.dataset.id;
    let settings = Array.from(document.querySelectorAll(`.setting_${id}`));
    let different = 0
    settings.forEach(setting => {
        console.log(setting)
        let oriValue = parseFloat(setting.dataset.value);
        let newValue = parseFloat(setting.value);
        if (newValue != oriValue) {
            different++
        }
        console.log(newValue, oriValue, newValue === oriValue)
    })
    
    console.log(different)
    if (different > 0) {
        document.getElementById(`${id}`).disabled = false;
    } else {
        document.getElementById(`${id}`).disabled = true;
    }
    
}