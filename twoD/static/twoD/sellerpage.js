document.addEventListener('DOMContentLoaded', function() {
    loadData()
})



function loadData() {
    showLoading();
    fetch('/getData')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပါ!', false, 'error')
        }
        console.log(data)
        let defaultLimit = parseInt(document.getElementById('defaultLimit').value);
        let dataArea = document.getElementById('allData');
        for (let i = 0; i < data.vals.length; i++) {
            let val = data.vals[i]
            
            let div = document.createElement('div');
            div.className = 'input-group mb-3';
            div.innerHTML = `
                <span class="input-group-text px-1 nums" data-id='${val['num']['id']}' id='num_${val['num']['id']}'>${val['num']['num']}</span>
                <span class="input-group-text bg-success px-1" id="original_value_${val['num']['id']}">${val['amount']}</span>
                <span class="input-group-text bg-info px-1" type='number' value="${val['limit']}" id='limit_${val['num']['id']}' hidden>${val['limit']}</span>
                <input id="value_${val['num']['id']}" type="number" min="1" class="form-control" placeholder="Add Amount" aria-label="Add Amount">
                <button onclick="addValue(event)" class="btn btn-outline-success" id="${val['num']['id']}" type="button" ><i class="bi bi-plus-lg"></i></button>
            `
            dataArea.append(div)
            if (val['limit'] != defaultLimit) {
                document.getElementById(`limit_${val['num']['id']}`).hidden = false;
            }
            limitCheck(val['limit'], val['amount'], val['num']['id'])
        }
    })
}


function limitCheck(limit, amount, id) {
    if (limit/10*9 < amount) {
        document.getElementById(`original_value_${id}`).className = 'input-group-text bg-danger';
    } else if (limit/6*5 < amount) {
        document.getElementById(`original_value_${id}`).className = 'input-group-text bg-danger-subtle';
    } else if (limit/5*4 < amount) {
        document.getElementById(`original_value_${id}`).className = 'input-group-text bg-warning';
    } else if(limit/4*3 < amount) {
        document.getElementById(`original_value_${id}`).className = 'input-group-text bg-warning-subtle';
    } else {
        document.getElementById(`original_value_${id}`).className = 'input-group-text bg-success';
    }
}



function addValue(event) {
    let id = event.currentTarget.id;
    let value = parseInt(document.getElementById(`value_${id}`).value)
    console.log(id, value)
    let isExceedLimit = checkLimit(id, value)
    let valueChecked = checkValue(id, value);
    if (isExceedLimit && valueChecked) {
        const jsonData = {
            nums: [id, ],
            value: value,
        };
        
        fetchValue(jsonData);
    } else {
        showNewNoti('ဘရိတ်ကျော်နေတယ်။', false, 'error')
    }
}


function fetchValue(jsonData) {
    console.log(jsonData)
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
    };
    const ids = jsonData['nums'];
    ids.forEach(id => {
        showBtnLoading(id);
    })
    
    fetch('/add_value', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then((data) => {
        ids.forEach(id => {
            hideBtnLoading(id, `<i class="bi bi-plus-lg"></i>`);
        })
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပါ!', false, 'error')
        }
        console.log(data)
        for (let i = 0; i < data.errors.length; i++) {
            let error = data.errors[i];
            document.getElementById(`limit_${error['num']['id']}`).value = error['limit'];
            document.getElementById(`limit_${error['num']['id']}`).innerHTML = error['limit'];
            if (parseInt(document.getElementById('defaultLimit').value) != error['limit']) {
                document.getElementById(`limit_${error['num']['id']}`).hidden = false;
            }
            document.getElementById(`value_${error['num']['id']}`).value = '';
            showNewNoti(`<b class='bg-info rounded p-1'>${error['num']['num']}</b> limit <b class='bg-warning rounded p-1'>${error['limit']}</b> is reached.`, false, error['num']['id'])
        }
        for (let i = 0; i < data.vals.length; i++) {
            let val = data.vals[i];
            document.getElementById(`original_value_${val['num']['id']}`).innerHTML = `${val['amount']}`;
            limitCheck(val['limit'], val['amount'], val['num']['id'])
            document.getElementById(`value_${val['num']['id']}`).value = '';
            showNewNoti(`<b class='bg-info rounded p-1'>${val['num']['num']}</b> ${jsonData['value']} ကို ဒိုင်မှ လက်ခံပါတယ်.`, true, val['num']['id'])
        }
    })
}

function GetMyLogs() {
    showLoading();
    fetch('/getLogs')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပါ!', false, 'error')
        } else {
            console.log(data)
            document.getElementById('logModalLabel').innerHTML = 'ဒီနေ့မှတ်တမ်း';
            let logArea = document.getElementById('logMdlBody');
            logArea.innerHTML = ''
            for(let i = 0; i < data.logs.length; i++) {
                let log = data.logs[i];
                let div = document.createElement('div');
                div.className = 'input-group mb-2 remove';
                div.style.animationPlayState = 'paused'
                div.style.width = '100%';
                div.id = `log_${log['id']}`;
                div.innerHTML = `
                    <span class="input-group-text fw-bold">${log['num']['num']}</span>
                    <input type="text" aria-label="Value" class="form-control" value="+${log['value']}" readonly>
                    <span class="input-group-text"><small>${log['time']}</small></span>
                    <button class="btn btn-outline-danger" type="button" id="${log['id']}" onclick="showRemoveLog(event)"><i class="bi bi-trash"></i></button>
                `
                logArea.append(div);
            }
            showMdl()
        }
        
    })
}

function showRemoveLog(event) {
    let id = event.currentTarget.id;
    let conBtn = document.createElement('button');
    conBtn.className = 'btn btn-outline-success';
    conBtn.type = 'button';
    conBtn.id = `confirm_${id}`;
    conBtn.setAttribute('onclick', `removeLog(${id})`);
    conBtn.innerHTML = `<i class="bi bi-check-lg"></i>`
    document.getElementById(`log_${id}`).append(conBtn);

    document.getElementById(`${id}`).removeAttribute('onclick');
    document.getElementById(`${id}`).setAttribute('onclick', `cancleRemove(${id})`);
    document.getElementById(`${id}`).innerHTML = `<i class="bi bi-x-lg"></i>`;
}

function cancleRemove(id) {
    document.getElementById(`${id}`).removeAttribute('onclick');
    document.getElementById(`${id}`).setAttribute('onclick', `showRemoveLog(event)`);
    document.getElementById(`${id}`).innerHTML = `<i class="bi bi-trash"></i>`;
    document.getElementById(`confirm_${id}`).remove();
}


function GetTotalAcount() {
    showLoading();
    fetch('/getFullAccount')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        console.log(data)
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပါ!', false, 'error')
        }
        if (data.vals) {
            document.getElementById('logModalLabel').innerHTML = 'စုစုပေါင်း စာရင်း';
            document.getElementById('logMdlBody').innerHTML = `<table class="table table-striped" id='acc_table'>
            <thead>
                <tr>
                    <th class='text-start' scope="col">ဂဏန်း</th>
                    <th class='text-center' scope="col">Amount</th>
                </tr>
            </thead>
            <tbody  id='acc_table_body'></tbody>
            </table>`
            let table = document.getElementById('acc_table_body');
            let total = 0;
            for (let i = 0; i < data.vals.length; i++) {
                let val = data.vals[i];
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class='text-start fit-width px-1'>${val['num']['num']}</th>
                    <td class='text-center'>${val['amount']}</th>
                `
                total += val['amount'];
                table.append(tr);
            }
            let comRate = parseFloat(document.getElementById('commission').value);
            let commission = total * comRate;
            let tfoot = document.createElement('tfoot');
            tfoot.className = 'bg-primary-subtle';
            tfoot.innerHTML = `
            <tr>
            <td class='text-center'><b>စုစုပေါင်း</b></td>
            <td class='text-center'><b>${total}</b></td>
            </tr>
            <tr>
            <td class='text-center'><b>ကော်ကြေး</b><small>(*${comRate})</small></td>
            <td class='text-center'><b>${commission}</b></td>
            </tr>`
            document.getElementById('acc_table').append(tfoot);
            showMdl()
        }

    })
}


function showSell() {
    document.getElementById('logModalLabel').innerHTML = 'ရောင်းမယ်';
    let logArea = document.getElementById('logMdlBody');
    logArea.innerHTML = `
    
    <div class="input-group mb-3">
    <div class="input-group-text">
        <input class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input" id='r'>
        <label class="form-check-label" for="r">
            R
        </label>
    </div>
    <select class="form-select" id="numSelect" onChange='checkRable(event)'>
        <option selected>ဂဏန်း</option>
        
    </select>
    <input type="number" id='sellValue' class="form-control" aria-label="Text input with checkbox">
    </div>
    <div class='text-end' style='width: 100%;'>
    <button class='btn btn-primary' type='button' id='mdlBtn' onclick='fetchSell()'>ရောင်းမယ်</button>
    </div>`
    let nums = getNums();
    let numOptions = document.getElementById('numSelect');
    nums.forEach(num => {
        let option = document.createElement('option');
        option.value = num['id'];
        option.id = num['num']
        option.style.width = 'fit-content'
        option.innerHTML = num['num'];
        numOptions.append(option)
    })
    showMdl()
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


function showMdl() {
    let toasts = Array.from(document.querySelectorAll('.toastClose'));
    toasts.forEach(toast => {
        toast.click()
    })
    document.getElementById('logModalBtn').click();
}

function fetchSell() {
    let selected = document.getElementById('numSelect');
    let value = parseInt(document.getElementById(`sellValue`).value);
    nums = [selected.value, ]

    okNums = []
    if (document.getElementById('r').checked) {
        const selectedIndex = selected.selectedIndex;
        const selectedOption = selected.options[selectedIndex];
        const rNum = convertString(selectedOption.innerHTML);
        let rId = document.getElementById(rNum).value;
        nums.push(rId);
    }
    nums.forEach(num => {
        let limit = parseInt(document.getElementById(`limit_${num}`).innerHTML);
        
        let target = parseInt(document.getElementById(`original_value_${num}`).innerHTML) + value;
        let no = document.getElementById(`num_${num}`).innerHTML;
        console.log(limit, target, limit < target)
        if (limit < target) {
            showNewNoti(`<b class='bg-info rounded p-1'>${no}</b> ဘရိတ်ကျော်နေတယ်။ ဒိုင်မှ ${value} ကို လက်မခံပါ!`, false, num)
        } else {
            okNums.push(num);
        };
        
        
    })
    
    if (okNums.length > 0) {
        const jsonData = {
            nums: okNums,
            value: value,
        };
        showBtnLoading('mdlBtn');
        fetchValue(jsonData);
        hideBtnLoading('mdlBtn', 'ရောင်းမယ်');
        document.getElementById('mdl_close').click()
        document.getElementById('closeOffCanvas').click()
    }
}

function convertString(input) {
    const reversed = input.split('').reverse().join('');
    return reversed;
}

function checkRable(event) {
    // Get the select element
  const selectElement = event.target;
  
  // Get the selected option
  const selectedIndex = selectElement.selectedIndex;
  const selectedOption = selectElement.options[selectedIndex];
  
  // Get the inner HTML of the selected option
  const selectedText = selectedOption.innerHTML;
  
  const parts = selectedText.split('');
  let r = document.getElementById('r');
  if (parts[0] === parts[1]) {
    
    r.checked = false;
    r.disabled = true;
  } else {
    r.disabled = false;
  }
}

function removeLog(id) {
    console.log(id);
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
    };
    showBtnLoading(`confirm_${id}`);
    fetch('/deleteLog', {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({
            id: id,
        })
    })
    .then(response => response.json())
    .then((data) => {
        hideBtnLoading(`confirm_${id}`, `<i class="bi bi-check-lg"></i>`);
        if (data.msg === 'error') {
            showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပြီး နောက်တခေါက်ထပ် လုပ်ကြည့်ပါ!', false, 'error')
        }
        console.log(data)
        if(data.val) {
            document.getElementById(`original_value_${data.val['num']['id']}`).innerHTML = `${data.val['amount']}`;
            limitCheck(data.val['limit'], data.val['amount'], data.val['num']['id']);
            document.getElementById(`log_${id}`).style.animationPlayState = 'running';
            document.getElementById(`log_${id}`).addEventListener('animationend', function() {
                document.getElementById(`log_${id}`).remove();
                showNewNoti('မှတ်တမ်းကို ဖျက်ပြီးပါပြီ!', true, id)
            })
        }
        
    })
}

function checkLimit(id, value) {
    let limit = parseInt(document.getElementById(`limit_${id}`).value);
    let target = parseInt(document.getElementById(`original_value_${id}`).innerHTML) + value;
  
    if (limit < target) {
        document.getElementById(`value_${id}`).value = '';
        let num = document.getElementById(`num_${id}`);
        showNewNoti(`<b class='bg-info rounded p-1'>${num}</b> limit <b class='bg-warning rounded p-1'>${limit}</b> ဘရိတ် တန်ဖိုးရောက်နေပါပြီ`, false, id)
        return false
    } else {
        return true
    }
}

function checkValue(id, value) {
    if (value > 0) {
        return true
    } else {
        document.getElementById(`value_${id}`).value = '';
        showNewNoti('ဖြည့်တဲ့ တန်ဖိုးမှားနေပါတယ်| သေသေချာချာ စစ်ကြည့်ပါ', false, id);
        return false;
    }
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


function showLoading() {
    document.getElementById('loadingDiv').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingDiv').style.display = 'none';
}



function showNewNoti(str, ok, id) {
    console.log(id)
    
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
        if (document.getElementById(`noti_${id}`)) {
            document.getElementById(`noti_${id}`).remove();
        }
    }, 5000);
}

function showBtnLoading(id) {
    document.getElementById(`${id}`).disabled = true;
    document.getElementById(`${id}`).innerHTML = `<div class='m-0 p-0' id='btnLoading' style='width: 100%; height: 100%; display: block;'>
    <div class="spinner-border my-auto text-warning" role="status">
    <span class="visually-hidden">Loading...</span>
    </div>
 </div>`;
}

function hideBtnLoading(id, str) {
    document.getElementById(`${id}`).disabled = false;
    document.getElementById(`${id}`).innerHTML = `${str}`;
}
