const form = document.forms[0];
const fromStorage = JSON.parse(sessionStorage.getItem("newArticleData"));

form.title.value = fromStorage?.title ?? "",
form.description.value = fromStorage?.description ?? "",
form.markdown.value = fromStorage?.markdown ?? "",
form.isPublic.checked = fromStorage?.isPublic ?? true;

let formData = {
    title : form?.title?.value,
    description : form.description.value,
    markdown : form.markdown.value,
    isPublic : form.isPublic.checked,
};
const btnPrimary = document.querySelector(".btn-primary");
btnPrimary.textContent = "Create";
const maxTitle = 100,
maxDescription = 250,
maxContent = 20000;
const messageDiv = document.querySelector(".message");
const stateMessage = (error = false,message, reset = false) => {
    messageDiv.style.display = "flex"
    if(reset)   messageDiv.style.display = "none";
    if(error){
        messageDiv.style.backgroundcolor = "#f7e9e9";
        messageDiv.style.color= "#571515";
        messageDiv.style.border= "1px solid #e6c3c3";
    } else{
        messageDiv.style.backgroundcolor = "#e9f7ef";
        messageDiv.style.color= "#155724";
        messageDiv.style.border= "1px solid #c3e6cb";
    }
    messageDiv.textContent = message;
}

const makeCreateRequest = async (formData) => {
    try {
        const response = await axios.post("/api/v1/articles/create",{formData});
        console.log(response);
        stateMessage(false,"Post Created Successfully ....redirecting");
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log("Rest",response.data.data._id);
                if(formData.isPublic)
                    window.location.replace(`/api/v1/articles/show/${response.data.data._id}`);
                else
                    window.location.replace(`/api/v1/articles/show-pri/${response.data.data._id}`);
                resolve("Done");
            }, 1000);
        })
        sessionStorage.removeItem("newArticleData");
        return true;
    } catch (error) {
        if(error.status < 500){
            console.log(error);
            if(error.response.data.code == 709){
                await axios.post("/api/v1/user/refreshAccessToken")
                .then(()=>{
                    makeCreateRequest(formData);
                })
                .catch((err) => {
                    if(err.status < 500){
                        console.log("Refresh Token Corrupt Error");
                        stateMessage(true,"Your session expired. Please log in again to continue.");
                        return false;
                    }else{
                        window.location.href = "/error"
                    }
                })
            } else{
                console.log("Access Token Corrupt Error");
                stateMessage(true,(error.response.data.message||error.message) + "Login again");
                return false;
            }
        }else {
            window.location.href = "/error"
        }
    }
}

const createPost = async (event) => {
    console.log("in createPost");
    stateMessage(null,null,true);
    
    
    if(!formData.title || !formData.markdown ||!formData.description){
        stateMessage(true,"All fields are required");
        return;
    } 

    if(formData.title.length >maxTitle){
        stateMessage(true,`Title can't be more than ${maxTitle} charachters`);
        return;
    }
    if(formData.description.length > maxDescription){
        stateMessage(true,`Title can't be more than ${maxDescription} charachters`);
        return;
    }
    if(formData.markdown.length > maxContent){
        stateMessage(true,`Content can't be more than ${maxContent}`);
        return;
    }
    console.log("Creating Post");
    stateMessage(false,"Creating Article Post .....");
    
    btnPrimary.disabled = (await makeCreateRequest(formData));
    
}

btnPrimary.addEventListener('click',createPost);  
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});


form.addEventListener('input',() => {
    formData = {
        title : form.title.value || "",
        description : form.description.value || "", 
        markdown : form.markdown.value || "",
        isPublic : form.isPublic.checked ?? false,
    };
    // console.log(formData);
    sessionStorage.setItem("newArticleData",JSON.stringify(formData));
    // console.log(sessionStorage.getItem("newArticleData"));
})


document.addEventListener("DOMContentLoaded", function () {
    const textarea = document.getElementById("markdown-editor");

    textarea.addEventListener("focus", function () {
        setTimeout(() => {
            window.scrollTo({
                top: textarea.offsetTop - window.innerHeight / 3, // Adjust position
                behavior: "smooth"
            });
        }, 100); // Delay to allow rendering
    });
});