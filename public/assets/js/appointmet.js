
window.onload = function () {
    //    testGet("http://localhost:3000/url")
}

function testGet(url) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin', 'http://localhost:5500');
    fetch(url, {
        mode: 'cors',
        method: 'GET',
        headers: headers
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
    }).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });
}


async function getRegistrationData(regNo) {
    const response = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
        method: 'POST',
        headers: {
            'x-api-key': 'p8RCmO5r2l1JwiHIdbjao9In8f6uRltP6C1jEIfR',
            'Content-Type': 'application/json'
        },
        body: `{
      "registrationNumber": "TE57VRN"
  }`,
    });
    response.json().then(data => {
        console.log(data);
    });
}

function test() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles");
    xhr.setRequestHeader('x-api-key', 'p8RCmO5r2l1JwiHIdbjao9In8f6uRltP6C1jEIfR');
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }
    };
    let data = `{ "registrationNumber": "TE57VRN"}`;
    xhr.send(data);
}


