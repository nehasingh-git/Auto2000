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
async function registrationVehicle() {
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
    let motData = await getMotData(ele.value);
    if (motData.status == true) {
      window.location.href = "./appointment/" + ele.value + '/' + selectModel.value;
    }
    else {
      alert(motData.message);
    }

  }
}


async function getMotData(regNo) {
  const response = await fetch("/getMot/" + regNo, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return await response.json()
}

