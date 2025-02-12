const logButton = document.querySelector('.login');
const signUpButton = document.querySelector('.signup');
const currentLocation = encodeURIComponent(window.location.pathname);
const myblogs = document.querySelector(".myblogs");
// console.log(logButton);



function toggleMenu() {
    const elem = document.querySelector('.nav-links');
    elem.classList.toggle('active');
    const toggleButton = document.querySelector('.menu-toggle');
    if(toggleButton.textContent.charCodeAt(0) == 9886)
        toggleButton.innerHTML = "&#9776;";
    else
        toggleButton.innerHTML = "&#9886;";
}

let loginStatus=null;
async function checkLogin() { 
    try {
        const response = await axios.get('/api/v1/user/isUserLoggedIn');
        // console.log("this works",response);   
        // console.log(response);
        return {loginStatus : true,user:response?.data?.data};
    } catch (error) {
        if(error.status<500){
            if(error.response.data.code == 709){
                console.log("Refreshing Token .....");
                try {
                    await axios.post("/api/v1/user/refreshAccessToken")
                    console.log("Refreshed the Token. checking for login again....");
                    return checkLogin();
                } catch (error) {
                    if(error.status < 500){
                        console.log("Refresh Token Expired or Invalid");
                        return {loginStatus : false,user:null};
                    } else{
                        setTimeout(() => {
                            window.location.href = "/error";                
                        }, 1000);
                    }
                }
            }else{
                return {loginStatus : false,user:null};
            }
        } else{
            console.log("here too");
            setTimeout(() => {
                window.location.href = "/error";                
            }, 1000);
        }
    }
}


const logoutHandler = async (event) => {
    try{
        console.log("Logging Out...");
        await axios.get("/api/v1/user/logout");
        sessionStorage.clear();
        window.location.reload();
        // window.location.href = "/";
    } catch(error){
        console.log("Error in logutHandler: ",error);
        if(error.status<500){
            if(error.response.data.code == 709){
                console.log("Refreshing Token in logoutHandler");
                await axios.post("/api/v1/user/refreshAccessToken")
                .then((res)=>{logoutHandler();})
                .catch((err)=>{
                    console.log("Refresh has failed : error ",err);
                    if(err.status<500){
                        loginStatus = false;
                        sessionStorage.clear();
                        window.location.reload();
                    }else {
                        console.log("Catastrophic Error Occurred");
                        // throw error
                        window.location.href = "/error";
                    }
                });
            }else{
                loginStatus = false;
                sessionStorage.clear();
                console.log("Error ",error);
                // window.location.reload();
                // window.location.href = "/";
            }
        } else{
            console.log("Outside");
            // throw err
            // window.location.href = "/error"
        }
    }
};

const setUpNavBar = async ()=>{
    loginStatus = (await checkLogin())?.loginStatus ?? false;
    console.log("To Display",loginStatus);
    if (loginStatus) {
        logButton.href = "#";
        logButton.addEventListener('click',logoutHandler);
        logButton.textContent = "Logout";
        logButton.style.backgroundColor = "#f48989";
        signUpButton.style.backgroundColor = "aquamarine";
        signUpButton.textContent = "Account";
        signUpButton.href = "/";
        myblogs.style.display="flex";
    } else {
        logButton.removeEventListener('click',logoutHandler);
        logButton.href = `/api/v1/user/login?redirect=${currentLocation}`;
        logButton.textContent = "Login";
        logButton.style.backgroundColor = " #22cb98";
        signUpButton.style.backgroundColor = "#324b9e";
        signUpButton.textContent = "SignUp";
        signUpButton.href = "/api/v1/user/register";
        myblogs.style.display="none";
    }
};

document.body.addEventListener('click',(event)=>{
    const elem = document.querySelector('.navbar');
    const links = document.querySelector('.nav-links');
    if(!elem.contains(event.target) && links.classList.contains('active'))
        toggleMenu();
});

window.addEventListener("pageshow",(event) => {
    if((window.location.href).split("/").splice(-1,1) != "error")
        setUpNavBar();
});


const toCreatePage = async (event) => {
    console.log("Creating Page request");
    const response = await axios.get('/api/v1/user/isUserLoggedIn')
    .then((res)=>{
            console.log("going to create page",res);
            window.location.href = "/api/v1/articles/create";
        })
    .catch((err)=>{
        console.log(err);
        if(err.response.data.code == 709){
            axios.post("/api/v1/user/refreshAccessToken")
            .then(()=>{toCreatePage();})
            .catch((err)=>{ 
                console.log("this is done");
                window.location.href = "/api/v1/user/login?redirect=/api/v1/articles/create";
            });
        }else{
            window.location.href = "/api/v1/user/login?redirect=/api/v1/articles/create";
        }
        console.log("Slipped to the end");
    })
}

document.querySelector(".newBlog").addEventListener("click",toCreatePage);
document.querySelector(".newBlog").addEventListener("touchstart",toCreatePage);
