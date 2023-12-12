var requestLog = [];
const updateInterval = 2000;

function updateDeviceList(log = 0) {
    
    if (log == 1) {
        updateRequestLog("Requisição", "curl -G -X GET \
        'http://iot.intelirede.com.br:1026/v2/entities' \
        -H 'fiware-service: openiot' \
        -H 'fiware-servicepath: /'");
    }

    // curl -G -X GET \
    // 'http://iot.intelirede.com.br:1026/v2/entities' \
    // -H 'fiware-service: openiot' \
    // -H 'fiware-servicepath: /'

    let resp = $.ajax({
        url: 'http://iot.intelirede.com.br:1026/v2/entities',
        headers: {
            'fiware-service': 'openiot',
            'fiware-servicepath': '/'
        },
        type: "GET",
        dataType: "json",
        async: false,
        data: {
        },
        success: function (result) {
            return result;
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
            return {};
         }
    });
    if (log == 1) {
        updateRequestLog("Retorno", JSON.stringify(resp.responseJSON).slice(0, 100) + "...");
    }
    return resp;
};


// --------------------- CREATE HUB FUNCTIONS ------------------------------------------------------------------
// --------------------- UPDATES THE SCREEN AND TEST IF SENSORS ARE SENDING STATUS -----------------------------

function main() {
    document.getElementById("lastUpdate").innerHTML = "Última atualização: " + new Date().toLocaleTimeString('pt-BR');
    initListOfTasks();
}





// ---------------------- CREATE ALL ACTION FUNCTIONS ----------------------------------------------------------
function updateRequestLog(type, text) {
    requestLog.push([type, text]);
    var requestLogHTML = "";
    requestLog.forEach((entry) => {
        requestLogHTML = requestLogHTML + "<p><b>" + entry[0] + "</b>: " + entry[1] + "</p>"
    });
    document.getElementById("requestLogText").innerHTML = requestLogHTML;
};

function triggerAction (id, name, command) {
    // 'curl -iX PATCH \
    //     "http://iot.intelirede.com.br:1026/v2/entities/urn:ngsi-ld:Cafeteira:001/attrs" \
    //     -H "Content-Type: application/json" \
    //     -H "fiware-service: openiot" \
    //     -H "fiware-servicepath: /" \
    //     -d "{ \
    //     "cafelongo": { \
    //         "type" : "command", \
    //         "value" : "" \
    //     } \
    //     }'

    let vURL = "http://iot.intelirede.com.br:1026/v2/entities/" + id + "/attrs";
    let vData = '{"cafelongo": {"type" : "' + command + '","value" : ""}}'

    updateRequestLog("Requisição", "curl -iX PATCH \
    'http://iot.intelirede.com.br:1026/v2/entities/" + id + "/attrs' \
    -H 'Content-Type: application/json' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /' \
    -d '{ \
        \"cafelongo\": { \
            \"type\" : \"" + command + "\", \
            \"value\" : \"\" \
    } \
    }'");

    console.log(vURL);
    console.log(vData);

    let resp = $.ajax({
        url: vURL,
        headers: {
            'Content-Type': 'application/json',
            'fiware-service': 'openiot',
            'fiware-servicepath': '/',
        },
        type: "PATCH",
        dataType: 'text',
        async: false,
        data: vData,
        success: function (result) {
            console.log(result);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
            return {};
         }
    });
    updateRequestLog("Retorno", JSON.stringify(resp));
    initListOfTasks(1);
};

function updateSensor (id, value) {
    console.log("update em " + id + " para " + value); // TODO: CHAMAR CURL E DISPARAR UPDATE
    updateRequestLog("Requisição", "CURL update sensor. Update em " + id + " para " + value);
    initListOfTasks(1);
};

function doButtonTrigger(id, name, commands) { // opens the modal to trigger an action
    var confirmingActionModal = new bootstrap.Modal(document.getElementById("actionModal"), {});
    document.getElementById("modalTitle").innerHTML = "Confirmação";
    document.getElementById("modalBody").innerHTML = "<p>Você deseja iniciar uma ação em "+ name + "?</p>";

    document.getElementById("modalButtonHolder").innerHTML = "";
    commands.filter(function(command) { return command != "standby"; }).forEach((entry) => {
        let button = document.createElement('button');
        button.innerText = entry;
        button.className = 'btn btn-secondary';
        button.onclick = function(){
            confirmingActionModal.hide();
            triggerAction(id, name, entry);
        };
        document.getElementById("modalButtonHolder").appendChild(button);
    });
    confirmingActionModal.show();
};

function doButtonEdit(id, name) { // opens the modal to update a sensor's data
    var editActionModal = new bootstrap.Modal(document.getElementById("actionModal"), {});
    document.getElementById("modalTitle").innerHTML = "Atualizar sensor";

    document.getElementById("modalBody").innerHTML = "";
    let body  = document.createElement('div');
    let bodyText = document.createElement('div');
    bodyText.innerHTML = "<p>Você deseja atualizar o sensor "+ name + "?</p>";
    body.appendChild(bodyText);
    var input = document.createElement("input");
    input.setAttribute('type', 'text');
    body.appendChild(input);
    document.getElementById("modalBody").appendChild(body);

    document.getElementById("modalButtonHolder").innerHTML = "";
    let button = document.createElement('button');
    button.innerText = "Atualizar";
    button.className = 'btn btn-success';
    button.onclick = function(){
        editActionModal.hide();
        updateSensor(id, input.value);
    };
    document.getElementById("modalButtonHolder").appendChild(button);
    editActionModal.show();
};



  
//  ---------------------- CREATE ALL CARDS ---------------------------------------------------------------------
let cardContainer;
let createDeviceCard = (device) => {
    let card = document.createElement('div');
    card.className = 'card shadow cursor-pointer';
    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const deviceIdText = String(device.id)
    const deviceNameText = deviceIdText.replace("urn:ngsi-ld:", "").replace(":", "").toLowerCase();
    const deviceTypeText = String(device.type);
    const deviceStatusText = String(device.state == null ? null : device.state.value);

    var commandList = [];
    Object.entries(device).forEach((entry) => {
        if(entry[1].type == 'command') {commandList.push(entry[0]);}
    });

    let deviceName = document.createElement('h5'); 
    deviceName.innerText = "Nome: " + deviceNameText;
    deviceName.className = 'card-title';
    cardBody.appendChild(deviceName);

    let deviceStatus = document.createElement('h6');
    deviceStatus.innerText = "Status: " + deviceStatusText;
    cardBody.appendChild(deviceStatus);
    
    let deviceId = document.createElement('h6');
    deviceId.innerText = "Id: " + deviceIdText;
    cardBody.appendChild(deviceId);

    let deviceType = document.createElement('h6');
    deviceType.innerText = "Tipo: " + deviceTypeText;
    cardBody.appendChild(deviceType);

    let deviceCommands = document.createElement('h6');
    if (commandList.length != 0) {
        deviceCommands.innerText = "Comandos: " + commandList.join(", ");
    }else{
        deviceCommands.innerText = "Comandos: N/A";
    }
    cardBody.appendChild(deviceCommands);
    

    let buttonHolder = document.createElement('div');
    if(deviceTypeText.includes("sensor") || deviceTypeText.includes("Sensor")) { // add update button
        let buttonEdit = document.createElement('button');
        buttonEdit.innerText = "Editar";
        buttonEdit.className = 'btn btn-secondary';
        buttonEdit.onclick = function(){
            doButtonEdit(deviceIdText, deviceNameText);
        };
        buttonHolder.appendChild(buttonEdit);
    } else { // add trigger button
        let buttonTrigger = document.createElement('button');
        buttonTrigger.innerText = "Acionar";
        buttonTrigger.className = 'btn btn-success';
        buttonTrigger.onclick = function(){
            doButtonTrigger(deviceIdText, deviceNameText, commandList);
        };
        buttonHolder.appendChild(buttonTrigger);
    }

    cardBody.appendChild(buttonHolder);
    card.appendChild(cardBody);
    cardContainer.appendChild(card);
}

let initListOfTasks = (log = 0) => {
    var resp = updateDeviceList(log);
    if (cardContainer) {
        cardContainer.innerHTML = '';
    }
    cardContainer = document.getElementById('card-container');
    resp.responseJSON.forEach((entry) => {
        createDeviceCard(entry);
    });

    console.log("Atualizando tela");
};

updateDeviceList(1);
main();
setInterval(main, updateInterval);