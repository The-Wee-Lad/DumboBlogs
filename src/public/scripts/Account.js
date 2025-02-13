const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const form1 = document.forms[0];
const form2 = document.forms[1];


let initialForm1Copy;
const changePass = document.querySelector("#changePass");
const resetPass = document.querySelector("#resetPass");
const saveInfo = document.querySelector("#saveInfo");
const resetInfo =  document.querySelector("#resetInfo");

const messageDiv1 = document.querySelector(".message1");
const messageDiv2 = document.querySelector(".message2");
const stateMessage = (error = false, message, reset = false, messageDiv = messageDiv1) => {
    messageDiv.style.display = "flex"
    if (reset) messageDiv.style.display = "none";
    if (error) {
        messageDiv.style.backgroundcolor = "#f7e9e9";
        messageDiv.style.color = "#571515";
        messageDiv.style.border = "1px solid #e6c3c3";
    } else {
        messageDiv.style.backgroundcolor = "#e9f7ef";
        messageDiv.style.color = "#155724";
        messageDiv.style.border = "1px solid #c3e6cb";
    }
    messageDiv.textContent = message;
}


async function initialSetup() {
    stateMessage(null,null,true);
    stateMessage(null,null,true,messageDiv2);
    changePass.disabled=true;
    saveInfo.disabled=true;
    // const fromStorage = JSON.parse(sessionStorage.getItem("updateUserInfo"));
    // sessionStorage.removeItem("updateUserInfo");
    // if(fromStorage){
    //     form1.username.value = fromStorage.username;
    //     form1.fullname.value = fromStorage?.fullname||"";
    //     form1.email.value = fromStorage.email;
    //     saveInfo
    //     return;
    // }

    try {
        const response = await axios.get("/api/v1/user/getCurrentUser");
        const user = response.data.data;
        console.log(user);
        
        form1.username.value = user.username;
        form1.fullname.value = user.fullname||"";
        form1.email.value = user.email;
        initialForm1Copy = Object.fromEntries((new FormData(form1)).entries());;
    } catch (error) {
        console.log(error);
        if(error.response.data.code == 709){
            try {
                await axios.post("/api/v1/user/refreshAccessToken");
                return await initialSetup();
            } catch (error) {
                if(error.status<500){
                    window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
                }else{
                    console.log("minor error : ",error);
                    window.location.href="/error";
                }
            }
        }else{
            if(error.status<500)
                window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
            else{
            console.log("major error : ",error);
            window.location.href="/error";
            }
        }
    }
}

async function makeUserInfoUpdateRequest(){
    try {
        const payload = {
            username:form1.username.value,
            email:form1.email.value,
            fullname:form1.fullname.value,
        }
        await axios.post("/api/v1/user/accounts/updateUser",payload);
        window.location.reload(true);
    } catch (error) {
        console.log("makeUpdateRequest Error",error);
        const errCode = error?.response?.data?.code;
        console.log(errCode);
        if(error.status == 409){
            if(errCode == 731){
                stateMessage(true,"Username already in use");
                return;
            }
            if(errCode == 732){
                stateMessage(true,"Email Already In Use");
                return;
            }
            console.log("Escaped error",error);
            return;
        }
        if(errCode==709){
            try {
                console.log("Refreshing The Access Token");
                await axios.post("/api/v1/user/refreshAccessToken");
                return await makeUserInfoUpdateRequest();
            } catch (error) {
                if(error.status<500){
                    console.log("Login Expired",error);
                    // sessionStorage.setItem("updateUserInfo",JSON.stringify({
                    //     username:form1.username.value,
                    //     fullname:form1.fullname.value,
                    //     email:form1.email.value
                    // }));
                    stateMessage(true,"Couldn't Update : > (  Your Login has expired. Redirecting....")
                    return await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
                            resolve("done");
                        }, 2000)});
                }else{
                    console.log("minor error : ",error);
                    window.location.href="/error";
                }
            }
        }else{
            if(error.status<500){
                console.log("Login Expired ",error);
                    stateMessage(true,"Couldn't Update : > (  Your Login has expired. Redirecting....")
                    return await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
                            resolve("done");
                        }, 2000)});
            }
            console.log("major error : ",error);
            window.location.href="/error";
        }
    }
}

async function updateUserInfo() {

    if(!form1.username.value.trim() || !form1.email.value.trim()){
        stateMessage(true,"Can't Make Updates. Username And Email are neccessary");
        return;
    }    
    if (!regex.test(form1.email.value)) {
        stateMessage(true,"Invalid Email");
        return;
    }
    stateMessage(false,"Updating...");
    saveInfo.disabled=true;
    await makeUserInfoUpdateRequest();
    saveInfo.disabled=false;
}

async function updatePassword(){
    const oldPassword = form2.oldPass.value;
    const newPassword = form2.newPass.value;
    const confPassword = form2.confPass.value;
    
    if(!oldPassword || !confPassword || !newPassword){
        stateMessage(true,"Allfields are required",false,messageDiv2);
        return;
    }
    if(confPassword!=newPassword){
        stateMessage(true,"Confirm Password Doesn't Match New Password!!",false,messageDiv2);
        return;
    }
    if(confPassword.length <8){
        stateMessage(true,"Password must be at least 8 charachters long",false,messageDiv2);
        return;
    }

    changePass.disabled=true;
    stateMessage(false,"Updating Password....",false,messageDiv2);
    await makePasswordUpdateRequest();
    changePass.disabled=false;
}

async function makePasswordUpdateRequest() {
    const oldPassword = form2.oldPass.value;
    const newPassword = form2.newPass.value;
    // console.log(confPassword);
    try {
        await axios.post("/api/v1/user/accounts/updatePassword",{oldPassword,newPassword});
        stateMessage(false,"Password Changed Successfully. Please Wait...",false,messageDiv2);
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                window.location.reload(true);
                resolve("done");
            }, 3000);
        })

    } catch (error) {
        console.log("Password Change Error",error);
        if(error?.response?.data?.code == 733){
            stateMessage(true,"Wrong Old Password",false,messageDiv2);
            return;
        }
        if(error?.response?.data?.code == 709){
            try {
                console.log("Refreshing The Access Token");
                await axios.post("/api/v1/user/refreshAccessToken");
                return await makePasswordUpdateRequest();
            } catch (error) {
                if(error.status<500){
                    console.log("Login Expired ",error);
                    stateMessage(true,"Couldn't change Password : > (  Your Login has expired. Redirecting....")
                    return await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            // window.location.reload(true);
                            window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
                            resolve("done");
                        }, 3000)});
                }else{
                    console.log("minor error : ",error);
                    window.location.href="/error";
                }
            }
        }else{
            console.log("major error : ",error);
            window.location.href="/error";
        }
    }
    
}

const saveInfoHandler = async ()=>{
    await updateUserInfo();
}
const resetInfoHandler=async () => {
    form1.username.value = initialForm1Copy.username;
    form1.fullname.value = initialForm1Copy.fullname||"";
    form1.email.value = initialForm1Copy.email;
    saveInfo.disabled=true;
}

const changePassHandler = async () =>{
    await updatePassword()
}

const resetPassHandler = async () => {
    form2.oldPass.value ="";
    form2.newPass.value ="";
    form2.confPass.value ="";
    stateMessage(null,null,true,messageDiv2);
    changePass.disabled=true;
}

saveInfo.addEventListener("click",saveInfoHandler);
resetInfo.addEventListener("click",resetInfoHandler);
changePass.addEventListener("click",changePassHandler);
resetPass.addEventListener("click",resetPassHandler);

form1.addEventListener("input",(event)=>{
    stateMessage(null,null,true);
    if(
        initialForm1Copy.username!=(form1.username.value).trim() ||
        initialForm1Copy.fullname!=form1.fullname.value.trim() ||
        initialForm1Copy.email!=(form1.email.value).trim()
    ){
        console.log("Change detected");
        saveInfo.disabled=false;
    }
    else{
        saveInfo.disabled=true;
    }
});

form2.addEventListener("input",(event)=>{
    stateMessage(false,false,true,messageDiv2);
    const oldPassword = form2.oldPass.value;
    const newPassword = form2.newPass.value;
    const confPassword = form2.confPass.value;
    if(oldPassword || confPassword || newPassword){
        changePass.disabled=false;
        return;
    }else{
        changePass.disabled=true;
    }

});

initialSetup();