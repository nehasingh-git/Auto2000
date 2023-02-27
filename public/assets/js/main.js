
window.onload = function () {
  aos_init();
}

// Init AOS
function aos_init() {
  AOS.init({
    duration: 1000,
    easing: "ease-in-out",
    once: true,
    mirror: false
  });
}




document.querySelector('#btnRegistration').addEventListener('click', registrationVehicle);
function registrationVehicle() {
  var selectModel = document.getElementById('selectCarModel')

  var ele = document.querySelector("#inputRegistration");
  if (!ele.value) {
    alert("Please Enter Registration Number.")
  }

  else if (selectModel.value == 'Please Select a Model') {
    alert('Please Select a Model')
  }
  else if (ele.value.length < 3) {
    alert("Please Enter Valid Registration Number.")
  }
  else {
    window.location.href = "./appointment/" + ele.value + '/' + selectModel.value;
  }
}



async function test(e) {
  var myHeaders = new Headers();
  myHeaders.append("x-api-key", "p8RCmO5r2l1JwiHIdbjao9In8f6uRltP6C1jEIfR");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");

  var raw = JSON.stringify({
    "registrationNumber": e.value ? e.value : "F370PLP"
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

// document.querySelector('#btnRegistration').addEventListener('click', registrationVehicle);
// function registrationVehicle() {

//   var ele = document.querySelector("#inputRegistration");
//   if (!ele.value) {
//     alert("Please Enter Registration Number.")
//   }

//   else if (ele.value.length < 3) {
//     alert("Please Enter Valid Registration Number.")
//   }
//   else {
//     window.location.href = "./appointment/" + ele.value;
//   }
// }