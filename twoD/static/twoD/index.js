document.addEventListener('DOMContentLoaded', function () {
    showLoading();
    fetch('/getOwnerData')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        let totalDiv = document.getElementById('hide_total');

        for (let y = 0; y < data.data.length; y++) {
            let user = data.data[y]['user'];
            let total = 0
            for (let x = 0; x < data.data[y]['vals'].length; x++) {
                let val = data.data[y]['vals'][x];
                let td = document.getElementById(`value_${val['num']['id']}_${user['id']}`);
                if (val['limit'] === 99999999999) {
                    td.innerHTML = `<div class='row'><div class='col'>${val['amount']}</div></div>`;
                } else {
                    td.innerHTML = `<div class='row'><div class='col'>${val['amount']}</div></div><div class='row' id='limit_${val['num']['id']}_${user['id']}'><div class='col'><small>(${val['limit']})</small></div></div>`;
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
})


function limitColor(num, user, limit, amount) {
    let amountDiv = document.getElementById(`value_${num}_${user}`);
    if (limit/10*9 < amount) {
        amountDiv.className = 'input-group-text bg-danger';
    } else if (limit/6*5 < amount) {
        amountDiv.className = 'input-group-text bg-danger-subtle';
    } else if (limit/5*4 < amount) {
        amountDiv.className = 'input-group-text bg-warning';
    } else if(limit/4*3 < amount) {
        amountDiv.className = 'input-group-text bg-warning-subtle';
    } else {
        amountDiv.className = '';
    }
}


function oldloadOwnerData() {
    showLoading();
    fetch('/getOwnerData')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        console.log(data)

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
    document.getElementById('mdl_title').innerHTML = 'Set Limit';
    let body = document.getElementById('mdl_body');
    body.innerHTML = '';
    let div = document.createElement('div');
    let users = getUsers();
    let nums = getNums();
    div.innerHTML = `
    <div class="input-group mb-3">
    
    <select class="form-select" id="num_select">
        <option selected>Number</option>
        <option value="all_nums">All Number</option>
        
    </select>
    
    <select class="form-select" id="user_select">
        <option selected>User</option>
        <option value="all_users">All Users</option>
        
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

    document.getElementById('mdl_submit').innerHTML = 'Set Limit'
    
    document.getElementById('logModalBtn').click();


}

function setLimit() {
    let user = document.getElementById('user_select').value;
    let num = document.getElementById('num_select').value;
    let limit_value = document.getElementById('limit_value').value;
    if (user === 'User' || num === 'Number' ||  limit_value=== "") {
        alert('Fill the form completely!')
    } else if (parseInt(limit_value) < 0) {
        alert('Invalid Input!')
    } else {
        const headers = {
            'X-CSRFToken': getCookie('csrftoken'),
        };
        showLoading()
        fetch('/setLimit', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                user: user,
                num: num,
                limit: limit_value,
            })
        })
        .then(response => response.json())
        .then((data) => {
            hideLoading()
            console.log(data)
            if (data.vals) {
                for (let i = 0; i < data.vals.length; i++) {
                    let v = data.vals[i];
                    if (v['limit'] != 99999999999) {
                        if (document.getElementById(`limit_${v['num']['id']}_${v['user_id']}`)) {
                            document.getElementById(`limit_${v['num']['id']}_${v['user_id']}`).innerHTML =  `<div class='col'><small>(${v['limit']})</small></div>`
                        } else {
                            let td = document.getElementById(`value_${v['num']['id']}_${v['user_id']}`);
                            let div = document.createElement('div');
                            div.className = 'row';
                            div.id = `limit_${v['num']['id']}_${v['user_id']}`;
                            div.innerHTML = `<div class='col'><small>(${v['limit']})</small></div>`;
                            td.append(div);
                        }
                        
                    } else {
                        document.getElementById(`limit_${v['num']['id']}_${v['user_id']}`).remove();
                    }
                    limitColor(v['num']['id'], v['user_id'], v['limit'], v['amount']);
                    document.getElementById('mdl_close').click();
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
    document.getElementById('mdl_title').innerHTML = 'Total';
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
        console.log(div)
        body.append(div);

    })
    document.getElementById('logModalBtn').click();
}


function showCloseEntry() {
    document.getElementById('mdl_title').innerHTML = 'Confirm Close';
    let body = document.getElementById('mdl_body');
    body.innerHTML = 'Are You sure you want to close entries?'
    
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
    document.getElementById('mdl_submit').innerHTML = 'Confirm'
    document.getElementById('logModalBtn').click();
}


function closeEntry() {
    showLoading();
    fetch('/closeEntry')
    .then(response => response.json())
    .then((data) => {
        hideLoading();
        console.log(data)
    })
}

function showAddJackpot() {
    document.getElementById('mdl_title').innerHTML = 'Add Jackpot';
    let body = document.getElementById('mdl_body');
    body.innerHTML = `
    <div class="input-group mb-3">
    <label class="input-group-text" for="inputGroupSelect01">Options</label>
    <select class="form-select" id="inputGroupSelect01">
        
    </select>
    </div>
    <div class="input-group mb-3">
    <span class="input-group-text" id="inputGroup-sizing-default">Add Winning Number</span>
    <input type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" id='jackpot'>
  </div>`
    showLoading()
    fetch('/getArcs')
    .then(response => response.json())
    .then((data) => {
        hideLoading()
        console.log(data)
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
    document.getElementById('mdl_submit').innerHTML = 'Add'
    document.getElementById('logModalBtn').click();
}

function addJackpot() {
    let values = document.getElementById('inputGroupSelect01').value.split(",");
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
    };
    showLoading();
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
        hideLoading();
        console.log(data)
    })
}

