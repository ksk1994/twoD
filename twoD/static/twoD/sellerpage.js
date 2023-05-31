document.addEventListener('DOMContentLoaded', function() {
    loadData()
})


function loadData() {
    showLoading();
    fetch('/getData')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        console.log(data)
        let dataArea = document.getElementById('allData');
        for (let i = 0; i < data.vals.length; i++) {
            let val = data.vals[i]
            let div = document.createElement('div');
            div.className = 'input-group mb-3';
            div.innerHTML = `
                <span class="input-group-text ">${val['num']['num']}</span>
                <span class="input-group-text bg-success" id="original_value_${val['num']['id']}">${val['amount']}</span>
                <input type='number' value="${val['limit']}" id='limit_${val['num']['id']}' hidden>
                <input id="value_${val['num']['id']}" type="number" min="1" class="form-control" placeholder="Add Amount" aria-label="Add Amount">
                <button onclick="addValue(event)" class="btn btn-outline-secondary" id="${val['num']['id']}" type="button" >Add</button>
            `
            dataArea.append(div)
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
    console.log(id)
    let isExceedLimit = checkLimit(id, value)
    let valueChecked = checkValue(id, value);
    if (isExceedLimit && valueChecked) {
        const jsonData = {
            id: id,
            value: value,
        };
        console.log(jsonData)
        const headers = {
            'X-CSRFToken': getCookie('csrftoken'),
        };
        showLoading();
        fetch('/add_value', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then((data) => {
            hideLoading();
            console.log(data)
            document.getElementById(`original_value_${data.val.num.id}`).innerHTML = `${data.val.amount}`;
            
            limitCheck(data.val['limit'], data.val['amount'], data.val['num']['id'])
            
            document.getElementById(`value_${id}`).value = '';
        })
    } else {
        console.log('Limit exceeded')
    }
    
}


function GetMyLogs() {
    showLoading();
    fetch('/getLogs')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        console.log(data)
        document.getElementById('logModalLabel').innerHTML = 'My Logs';
        let logArea = document.getElementById('logMdlBody');
        logArea.innerHTML = ''
        for(let i = 0; i < data.logs.length; i++) {
            let log = data.logs[i];
            let div = document.createElement('div');
            div.className = 'input-group mb-2';
            div.style.width = '100%';
            div.id = `log_${log['id']}`;
            div.innerHTML = `
                <span class="input-group-text fw-bold">${log['num']['num']}</span>
                <input type="text" aria-label="Value" class="form-control" value="+${log['value']}" readonly>
                <span class="input-group-text"><small>${log['time']}</small></span>
                <button class="btn btn-outline-danger" type="button" id="${log['id']}" onclick="removeLog(event)"><i class="bi bi-trash"></i></button>
            `
            logArea.append(div);
        }
        document.getElementById('logModalBtn').click();
    })
}


function GetTotalAcount() {
    showLoading();
    fetch('/getFullAccount')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        console.log(data)
        if (data.vals) {
            document.getElementById('logModalLabel').innerHTML = 'Total Amounts';
            document.getElementById('logMdlBody').innerHTML = `<table class="table table-striped" id='acc_table'>
            <thead>
                <tr>
                    <th class='text-start' scope="col">Number</th>
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
                    <td class='text-start p-2'>${val['num']['num']}</th>
                    <td class='text-center'>${val['amount']}</th>
                `
                total += val['amount'];
                table.append(tr);
            }

            let tfoot = document.createElement('tfoot');
            tfoot.className = 'bg-primary-subtle';
            tfoot.innerHTML = `
            <td class='text-center'><b>TOTAL</b></td>
            <td class='text-center'><b>${total}</b></td>`
            document.getElementById('acc_table').append(tfoot);
            document.getElementById('logModalBtn').click();
        }

    })
}


function removeLog(event) {
    let id = event.currentTarget.id;
    console.log(id);
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
    };
    showLoading();
    fetch('/deleteLog', {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({
            id: id,
        })
    })
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        console.log(data)
        if(data.val) {
            document.getElementById(`original_value_${data.val['num']['id']}`).innerHTML = `${data.val['amount']}`;
            limitCheck(data.val['limit'], data.val['amount'], data.val['num']['id'])
            document.getElementById(`log_${id}`).remove();
        }
        
    })
}

function checkLimit(id, value) {
    let limit = parseInt(document.getElementById(`limit_${id}`).value);
    let target = parseInt(document.getElementById(`original_value_${id}`).innerHTML) + value;
    console.log(limit, target, limit < target)
    if (limit < target) {
        document.getElementById(`value_${id}`).value = '';
        alert('Limit Exceed!')
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
        alert('Invalid Input');
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