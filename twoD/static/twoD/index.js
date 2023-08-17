document.addEventListener('DOMContentLoaded', function () {
    loadAllData();
})


async function showLogs() {
    const mdl = document.getElementById('mdl_body');
    mdl.innerHTML = `
        <p aria-hidden="true" class='placeholder-glow'>
            <span class="placeholder col-12"></span>
        </p>`.repeat(5);

    const mdlTitle = document.getElementById('mdl_title');
    mdlTitle.innerHTML = 'ဒီနေ့မှတ်တမ်း';

    try {
        const response = await fetch('/getLogs');
        const data = await response.json();

        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပါ!', false, 'er2ror');
        } else {
            mdl.innerHTML = '<ul class="list-group" id="logList"></ul>';
            const logArea = document.getElementById('logList');

            data.logs.forEach(log => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-start';
                li.id = `log_${log.id}`;
                li.innerHTML = `
                    <div class="ms-2 me-auto">
                        <div class="fw-bold"><span class="me-2 bg-primary rounded p-1 mb-1 text-light">${log.num.num}</span><b>+${log.value}</b></div>
                        ${log.user_name}
                    </div>
                    <div><small class='ms-2'>${log.time}</small></div>
                `;
                logArea.appendChild(li);
            });
        }
    } catch (error) {
        console.error(error);
        showNewNoti('An error occurred. Please try again later.', false, 'error');
    }

    document.getElementById('logModalBtn').click();
    loadAllData();
}



function showNewNoti(str, ok, id) {

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
    div.setAttribute('data-bs-delay', 8000)
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
        if (document.getElementById(`noti_${id}`)) {
        document.getElementById(`noti_${id}`).remove();
        }
    }, 8000);
}



function loadAllData() {
    showLoading();
    fetch('/getOwnerData')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပါ!', false, 'er1ror')
        }

        let totalDiv = document.getElementById('hide_total');
        totalDiv.innerHTML = '';
        for (let y = 0; y < data.data.length; y++) {
            let user = data.data[y]['user'];
            let setting = data.data[y]['setting']
            let total = 0
            for (let x = 0; x < data.data[y]['vals'].length; x++) {

                let val = data.data[y]['vals'][x];
                let td = document.getElementById(`value_${val['num']['id']}_${user['id']}`);
                if (val['limit'] === setting['limit']) {
                    td.innerHTML = `<div class='row'><div class='col vals'>${val['amount']}</div></div>`;
                } else {
                    td.innerHTML = `<div class='row'><div class='col vals'>${val['amount']}</div></div><div class='row lims' id='limit_${val['num']['id']}_${user['id']}'><div class='col'><small>(${val['limit']})</small></div></div>`;
                }
                total += val['amount']

                limitColor(val['num']['id'], user['id'], val['limit'], val['amount']);
            }
            let hideInput = document.createElement('input');
            hideInput.hidden = true;
            hideInput.className = 'hiddenTotal'
            hideInput.dataset.name = `${user['name']}`;
            hideInput.dataset.value = `${total}`;
            totalDiv.append(hideInput);


        }
    })
}

function limitColor(num, user, limit, amount) {
    let amountDiv = document.getElementById(`value_${num}_${user}`);
    if (limit/10*9 < amount) {
        amountDiv.className = 'datas bg-danger';
    } else if (limit/6*5 < amount) {
        amountDiv.className = 'datas bg-danger-subtle';
    } else if (limit/5*4 < amount) {
        amountDiv.className = 'datas bg-warning';
    } else if(limit/4*3 < amount) {
        amountDiv.className = 'datas bg-warning-subtle';
    } else {
        amountDiv.className = 'datas';
    }
}


function oldloadOwnerData() {
    showLoading();
    fetch('/getOwnerData')
    .then(response => response.json())
    .then((data) => {
        hideLoading();


        var dataDiv = document.getElementById('accordionExample');

        for (let y = 0; y < data.data.length; y++) {
            let d = data.data[y]
            let tablediv = document.createElement('div');
            tablediv.className = 'accordion-item';
            tablediv.innerHTML = `

            <h2 class="accordion-header">
            <button class="accordion-button users" data-name='${d['user']['name']}' data-id='${d['user']['id']}' type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${d['user']['username']}" aria-expanded="true" aria-controls="collapseOne">
                <b>${d['user']['name']}</b>|<b id='total_${d['user']['username']}'></b>
            </button>
            </h2>
            <div id="collapse_${d['user']['username']}" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
            <div class="accordion-body">
            <table class="table table-striped">

                <thead>
                    <tr>
                    <th scope="col">No</th>
                    <th scope="col">Limit</th>
                    <th scope="col">Amount</th>
                    </tr>
                </thead>
                <tbody id='table_${d['user']['username']}'>
                </tbody>
            </table>
            </div>
            </div>
            `
            dataDiv.append(tablediv);
            let tbody = document.getElementById(`table_${d['user']['username']}`);
            let total = 0;

            for (let i = 0; i < d['vals'].length; i++) {
                let val = d['vals'][i];
                if (val['limit'] === 99999999999) {
                    var limit = 'No Limit'
                } else {
                    var limit = val['limit'];
                }
                total += val['amount'];
                let tr = document.createElement('tr');
                tr.innerHTML = `
                <th scope="row"><b>${val['num']['num']}</b></th>
                <td>${limit}</td>
                <td>${val['amount']}</td>`
                document.getElementById(`total_${d['user']['username']}`).innerHTML = total;
                tbody.append(tr);

            }
        }
    })
}


function showSetLimit() {
    document.getElementById('mdl_title').innerHTML = 'ဘရိတ် ထည့်မယ်';
    let body = document.getElementById('mdl_body');
    body.innerHTML = '';
    let div = document.createElement('div');
    let users = getUsers();
    let nums = getNums();
    div.innerHTML = `
    <div class="input-group mb-3">

    <select class="form-select" id="num_select">
        <option selected>ဂဏန်းရွေးရန်</option>
        <option value="all_nums">ဂဏန်းအားလုံး</option>

    </select>

    <select class="form-select" id="user_select">
        <option selected>ကော်သမားရွေးရန်</option>
        <option value="all_users">ကော်သမားအားလုံး</option>

    </select>
    <input type="text" class="form-control" id='limit_value'>
    </div>`
    body.append(div);
    let userSelect = document.getElementById('user_select');
    users.forEach(user => {
        let option = document.createElement('option');
        option.value = `${user['id']}`;
        option.innerHTML = `${user['name']}`;
        userSelect.append(option);
    })


    let numSelect = document.getElementById('num_select');
    nums.forEach(num => {
        let option = document.createElement('option');
        option.value = `${num['id']}`;
        option.innerHTML = `${num['num']}`;
        numSelect.append(option);
    })
    if (!document.getElementById('mdl_submit')) {
        let btn = document.createElement('button');
        btn.id = 'mdl_submit'
        btn.className = 'btn btn-primary';
        btn.type = 'button';

        document.getElementById('mdl_footer').append(btn);
    }
    document.getElementById('mdl_submit').onclick = function() {
        setLimit();
    };
    document.getElementById('mdl_submit').style.width = '160px';
    document.getElementById('mdl_submit').innerHTML = 'ထည့်မယ်';

    document.getElementById('logModalBtn').click();


}

function setLimit() {
    let user = document.getElementById('user_select');
    let num = document.getElementById('num_select');
    const selectedUserIndex = user.selectedIndex;
    const selectedUserOption = user.options[selectedUserIndex];
    const u = selectedUserOption.innerHTML;

    const selectedNumIndex = num.selectedIndex;
    const selectedNumOption = num.options[selectedNumIndex];
    const n = selectedNumOption.innerHTML;

    let limit_value = document.getElementById('limit_value').value;
    if (user === 'User' || num === 'Number' ||  limit_value=== "") {
        showNewNoti('ဖြည့်တဲ့ တန်ဖိုးမှားနေပါတယ်| သေသေချာချာ စစ်ကြည့်ပါ', false, 'er3ror')

    } else if (parseInt(limit_value) < 0) {
        showNewNoti('ဖြည့်တဲ့ တန်ဖိုးမှားနေပါတယ်| သေသေချာချာ စစ်ကြည့်ပါ', false, 'er2ror')
    } else {
        const headers = {
            'X-CSRFToken': getCookie('csrftoken'),
        };
        showBtnLoading()
        fetch('/setLimit', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                user: user.value,
                num: num.value,
                limit: limit_value,
            })
        })
        .then(response => response.json())
        .then((data) => {
            hideBtnLoading('ထည့်မယ်')
            if (data.msg === 'error') {
                showNewNoti('Error တက်သွားလို့  နောက်တခေါက်ထပ် လုပ်ကြည့်ပါ! Retry!', false, 'error4')
            }


            if (data.vals) {
                document.getElementById('mdl_close').click();
                    showNewNoti(`<b class='bg-info rounded p-1'>${u}</b>
                        <b class='bg-warning rounded p-1'>${n}</b> ဘရိတ် ${limit_value} ဖြစ်သွားပါပြီ!`, true, 'success1')

                for (let i = 0; i < data.vals.length; i++) {
                    let v = data.vals[i];
                    let defaultLimit = parseInt(document.getElementById(`defaultLimit_${v['user_id']}`).value);

                    if (v['limit'] != defaultLimit) {
                        if (document.getElementById(`limit_${v['num']['id']}_${v['user_id']}`)) {
                            document.getElementById(`limit_${v['num']['id']}_${v['user_id']}`).innerHTML =  `<div class='col'><small>(${v['limit']})</small></div>`
                        } else {
                            let td = document.getElementById(`value_${v['num']['id']}_${v['user_id']}`);
                            let div = document.createElement('div');
                            div.className = 'row lims';
                            div.id = `limit_${v['num']['id']}_${v['user_id']}`;
                            div.innerHTML = `<div class='col'><small>(${v['limit']})</small></div>`;
                            td.append(div);
                        }

                    } else {
                        if (document.getElementById(`limit_${v['num']['id']}_${v['user_id']}`)) {
                            document.getElementById(`limit_${v['num']['id']}_${v['user_id']}`).remove();
                        }

                    }
                    limitColor(v['num']['id'], v['user_id'], v['limit'], v['amount']);

                }
            }
        })
    }

}

function showLoading() {
    document.getElementById('loadingDiv').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingDiv').style.display = 'none';
}

function getUsers() {
    let userElements = Array.from(document.querySelectorAll('.users'));
    let users = []
    userElements.forEach(element => {
        users.push({
            id: element.dataset.id,
            name: element.innerHTML
        })
    })
    return users;
}


function getNums() {
    let numElements = Array.from(document.querySelectorAll('.nums'));
    let nums = []
    numElements.forEach(element => {
        nums.push({
            id: element.dataset.id,
            num: element.innerHTML,
        })
    })
    return nums
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

function checkTotal() {
    let totals = Array.from(document.querySelectorAll('.hiddenTotal'));
    document.getElementById('mdl_title').innerHTML = 'စုစုပေါင်းစာရင်း';
    let body = document.getElementById('mdl_body');
    body.innerHTML = '';
    if (document.getElementById('mdl_submit')) {
        document.getElementById('mdl_submit').remove();
    }
    totals.forEach(total => {
        let div = document.createElement('div');
        div.className = 'input-group mb-3';
        div.innerHTML =`
        <span class="input-group-text fw-bold">${total.dataset.name}</span>
        <input type="text" aria-label="Value" class="form-control" value="${total.dataset.value}" readonly>
        `

        body.append(div);

    })
    document.getElementById('logModalBtn').click();
}


function showCloseEntry() {
    document.getElementById('mdl_title').innerHTML = 'စရင်းပိတ်သဘောတူပါ';
    let body = document.getElementById('mdl_body');
    body.innerHTML = 'စရင်းပိတ်မှာသေချာလား?'

    if (!document.getElementById('mdl_submit')) {
        let btn = document.createElement('button');
        btn.id = 'mdl_submit'
        btn.className = 'btn btn-primary';
        btn.type = 'button';
        document.getElementById('mdl_footer').append(btn);
    }
    document.getElementById('mdl_submit').onclick = function() {
        closeEntry();
    };
    document.getElementById('mdl_submit').innerHTML = 'သေချာတယ်'
    document.getElementById('logModalBtn').click();
}


function showBtnLoading() {
    document.getElementById('mdl_submit').innerHTML = `<div class='mx-1' id='btnLoading' style='display: block;'>
    <div class="spinner-border my-auto text-light" role="status">
    <span class="visually-hidden">Loading...</span>
    </div>
 </div>`;
}

function hideBtnLoading(str) {
    document.getElementById('mdl_submit').innerHTML = `${str}`;
}


function closeEntry() {
    document.getElementById('mdl_close').click();
    showBtnLoading();
    fetch('/closeEntry')
    .then(response => response.json())
    .then((data) => {
        hideBtnLoading('သေချာတယ်')
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပြီး နောက်တခေါက်ထပ် လုပ်ကြည့်ပါ! Retry!', false, 'erro5r')
        }
        document.getElementById('closeOffCanvas').click();

        if (data.msg === 'Success!') {
            let vals = Array.from(document.querySelectorAll('.vals'));
            vals.forEach(v => {

                v.innerHTML = 0;

            })
            let lims = Array.from(document.querySelectorAll('.lims'));
            lims.forEach(l => {

                l.remove();

            })
            let ds = Array.from(document.querySelectorAll('.datas'));
            ds.forEach(d => {
                d.className = 'datas'
            })

            showNewNoti('စရင်းအားလုံးပိတ်ပြီးပါပြီ။ အရင်နေ့စာရင်းထဲမှာ saveထားပါတယ်', true, 'su2ccess')

        }
    })
}

function showAddJackpot() {
    document.getElementById('mdl_title').innerHTML = 'ပေါက်သီးထည့်';
    let body = document.getElementById('mdl_body');
    body.innerHTML = `
    <div class="input-group mb-3">
    <label class="input-group-text" for="inputGroupSelect01">ရွေးချယ်ရန်</label>
    <select class="form-select" id="inputGroupSelect01">

    </select>
    </div>
    <div class="input-group mb-3">
    <span class="input-group-text" id="inputGroup-sizing-default">ပေါက်သီး</span>
    <input type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" id='jackpot'>
  </div>`
    showLoading()
    fetch('/getArcs')
    .then(response => response.json())
    .then((data) => {
        hideLoading()
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပြီး နောက်တခေါက်ထပ် လုပ်ကြည့်ပါ! Retry!', false, 'error6')
        }

        let select = document.getElementById('inputGroupSelect01')
        for (let i = 0; i < data.arcs.length; i++) {
            let option = document.createElement('option');
            option.value = `${data.arcs[i][0]},${data.arcs[i][1]}`;
            option.innerHTML = `${data.arcs[i][0]}(${data.arcs[i][1]})`;
            select.append(option);
        }
    })
    if (!document.getElementById('mdl_submit')) {
        let btn = document.createElement('button');
        btn.id = 'mdl_submit'
        btn.className = 'btn btn-primary';
        btn.type = 'button';
        document.getElementById('mdl_footer').append(btn);
    }
    document.getElementById('mdl_submit').onclick = function() {
        addJackpot();
    };
    document.getElementById('mdl_submit').innerHTML = 'ထည့်မယ်';
    document.getElementById('logModalBtn').click();
}

function addJackpot() {
    let values = document.getElementById('inputGroupSelect01').value.split(",");
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
    };
    showBtnLoading();
    fetch('/addJp', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            jp: document.getElementById('jackpot').value,
            date: values[0],
            ampm: values[1],
        })
    })
    .then(response => response.json())
    .then((data) => {
        hideBtnLoading('ထည့်မယ်');
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပြီး နောက်တခေါက်ထပ် လုပ်ကြည့်ပါ! Retry!', false, 'err7or')
        } else if (data.msg === 'success') {
            showNewNoti('ပေါက်သီးထည့်တာ အောင်မြင်ပါတယ်', true, 'success4')
        }

    })
    document.getElementById('mdl_close').click();
}


function openClose(event) {
    let isOpen = event.currentTarget.checked;
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
    };
    fetch('/close', {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            isClose: ! isOpen
        })
    })
    .then(response => response.json())
    .then((data) => {
        let closeBtn = document.getElementById('openClose');
        let closeBtnLable = document.getElementById('opencloseLabel');
        let closeCaption = document.getElementById('openCloseCaption');
        if (data.c) {
            closeBtn.checked = false;
            closeBtnLable.innerHTML = 'Now Close';
            closeCaption.style.display = 'block';
        } else {
            closeBtn.checked = true;
            closeBtnLable.innerHTML = 'Now Open';
            closeCaption.style.display = 'none';            
        }
    })
}
