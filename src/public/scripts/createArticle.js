import axios from "axios";

const btnPrimary = document.querySelector(".btn-primary");
btnPrimary.textContent = "Create";
const maxTitle = 50,
    maxDescription = 250,
    maxContent = 10000;
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
        stateMessage(false,"Post Created Successfully ....redirecting");
        setTimeout(() => {
            window.location.href = "/"
        }, 1000);
    } catch (error) {
        if(error.status < 500){
            if(error.response.data.code == 709){
                await axios.post("/api/v1/user/refreshAccessToken")
                .then(()=>{
                    makeCreateRequest(formData);
                })
                .catch((err) => {
                    if(err.status < 500){
                        stateMessage(true,error.response.data.message);
                    }else{
                        window.location.href = "/error"
                    }
                })
            } else{
                stateMessage(true,error.response.data.message);
            }
        }else {
            window.location.href = "/error"
        }
    }
}

const createPost = async (event) => {
    console.log("in createPost");
    stateMessage(null,null,true);
    const form = document.forms[0];
    
    const formData = {
        title : form.title.value,
        description : form.description.value,
        markdown : form.markdown.value,
        isPublic : form.isPublic.checked,
    };
    
    if(!formData.title || !formData.markdown ||!formData.description){
        stateMessage(true,"All fields are required");
        return;
    } 

    if(formData.title.length >maxTitle){
        stateMessage(true,`Title can't be more than ${maxTitle} charachters`);
        return;
    }
    if(formData.title.length > maxDescription){
        stateMessage(true,`Title can't be more than ${maxDescription} charachters`);
        return;
    }
    console.log("Creating Post");
    stateMessage(false,"Creating Article Post .....");
    btnPrimary.disabled = true;

    makeCreateRequest(formData);
    
    
}

btnPrimary.addEventListener('click',createPost);

