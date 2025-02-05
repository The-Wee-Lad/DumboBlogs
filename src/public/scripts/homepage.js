
console.log("connected");

const createButton = document.querySelector(".createButton");

const checkLoginForCreate = async (event) => {
    const response = await axios.get('/api/v1/user/isUserLoggedIn')
    .then((res)=>{
            console.log("going to create page",res);
            window.location.href = "/api/v1/articles/create";
        })
    .catch((err)=>{
        console.log(err);
        if(err.name='AxiosError'){
            window.location.href = "/error";
        }
        if(err.response.data.code == 709){
            axios.post("/api/v1/user/refreshAccessToken")
            .then(()=>{checkLogin();})
            .catch((err)=>{ 
                window.location.href = "/api/v1/user/login";
            });
        }
        window.location.href = "/api/v1/user/login";
    })
}

createButton.addEventListener("click",checkLoginForCreate);