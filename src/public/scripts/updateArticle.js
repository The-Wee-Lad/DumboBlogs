const maxTitle = 100,
    maxDescription = 250,
    maxContent = 10000;
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
const form = document.forms[0];
let formData;
const articleId = window.location.pathname.split('/').pop();
const btnPrimary = document.querySelector(".btn-primary");
btnPrimary.textContent = "Update";
btnPrimary.disabled = true;
const btnTertiary = document.querySelector(".btn-tertiary");
const delCancel = document.querySelector(".delete-button-cancel");
const delConfirm = document.querySelector(".delete-button-confirm");
console.log("In update article");

const messageDiv = document.querySelector(".message");
const stateMessage = (error = false, message, reset = false) => {
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



const makeUpdateRequest = async (formData) => {
    console.log("Updating Post");
    console.log("Form Data", formData);
    try {
        console.log("Sending Axios request");
        await axios.patch(`/api/v1/articles/update/${articleId}`,{formData});
        stateMessage(false, "Article Updated. redirecting....");
        await new Promise((res, rej) => {
            setTimeout(() => {
                if(formData.isPublic)
                    window.location.replace(`/api/v1/articles/show/${articleId}`);
                else
                    window.location.replace(`/api/v1/articles/show-pri/${articleId}`);

                res("done");
            }, 1000);
        });
    } catch (error) {
        console.log("Update Request Error : ", error);
        if (error.response.data.code == 709) {
            console.log("Refreshing Acces Token for updating");
            try {
                await axios.post("/api/v1/user/refreshAccessToken");
                return await makeUpdateRequest(formData);
            } catch (error) {
                console.log("Refresh Token Expired Login Again : ",error);
                stateMessage(true, "Refresh Token Expired. Login Again ...redirecting");
                await new Promise((res, rej) => {
                    setTimeout(() => {
                        window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
                        res("done");
                    }, 1000);
                });
            }
        } else {
            console.log("Network or db error");
            stateMessage(true, "server Error ...redirecting");
            await new Promise((res, rej) => {
                setTimeout(() => {
                    window.location.replace('/error');
                    res("Done");
                }, 1000);
            });
        }
    }
}


const updatePost = async (event) => {
    console.log("in updatePost");
    stateMessage(null, null, true);


    if (!formData.title || !formData.markdown || !formData.description) {
        stateMessage(true, "All fields are required");
        return;
    }

    if (formData.title.length > maxTitle) {
        stateMessage(true, `Title can't be more than ${maxTitle} charachters`);
        return;
    }
    if (formData.title.length > maxDescription) {
        stateMessage(true, `Title can't be more than ${maxDescription} charachters`);
        return;
    }
    console.log("Updating Post");
    stateMessage(false, "Updating Article Post .....");
    btnPrimary.disabled = true;
    btnPrimary.disabled = (await makeUpdateRequest(formData));

}



const deletePopUpHandler = async (event) => {
    const deletePopup = document.querySelector(".delete-popup");
    deletePopup.style.display = "flex";
    console.log(btnTertiary, "POPUP");
}

const cancelDeleteHandler = async (event) => {
    const deletePopup = document.querySelector(".delete-popup");
    deletePopup.style.display = "none";
    console.log(btnTertiary, "POPDOWN");
}

const confirmDeleteHandler = async (event) => {
    console.log("AAAAAAAAAAAAA:", articleId);
    try {
        await axios.delete(`/api/v1/articles/update/${articleId}`)
        console.log("Article Deleted!");
        delCancel.style.display = "none";
        delConfirm.style.display = "none";
        const message = document.querySelector(".delete-message");
        let time = 3;
        message.textContent=`Article Deleted. Redirecting......${time}`;
        setInterval(() => {
            time--;
            message.textContent = `Article Deleted. Redirecting......${time}`;
        }, 1000);
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                window.location.replace('/api/v1/articles/myBlogs');
            },  3000);
        })
    } catch (error) {
        console.log("Delete Error : ", error);
        if (error.status < 500) {
            if (error.response.data.code == 709) {
                console.log("[Delete]  refreshing the token");
                try {
                    await axios.post("/api/v1/user/refreshAccessToken")
                    await confirmDeleteHandler();
                } catch (err) {
                    if (err.status < 500) {
                        console.log("[Delete] Refresh Token Corrupt Error");
                        stateMessage(true, "Your session expired. Please log in again to continue.");
                        window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
                        return false;
                    } else {
                        window.location.href = "/error"
                    }
                }
            } else {
                console.log("[Delete] Access Token Corrupt Error");
                stateMessage(true, (error.response.data.message || error.data) + "Login again");
                window.location.replace("/");
                return false;
            }
        } else {
            window.location.href = "/error"
        }
    }
}



async function setup() {
    btnPrimary.disabled = true;
    await fillForm();
    console.log("Enabling Button Handlers");
    btnPrimary.disabled = false;
    btnPrimary.addEventListener('click', updatePost);
    btnTertiary.addEventListener('click', deletePopUpHandler);
    delCancel.addEventListener('click', cancelDeleteHandler);
    delConfirm.addEventListener('click', confirmDeleteHandler);
    form.addEventListener('input', () => {
        formData = {
            title: form.title.value || "",
            description: form.description.value || "",
            markdown: form.markdown.value || "",
            isPublic: form.isPublic.checked ?? false,
        };
    });
}

async function fillForm() {
    console.log("Fetching the Article");
    stateMessage(false, "Fetching an Article");
    try {
        const response = await axios.get(`/api/v1/articles/get/${articleId}`);
        const receivedArticle = response.data.data;
        form.title.value = receivedArticle.title;
        form.description.value = receivedArticle.description;
        form.markdown.value = receivedArticle.markdown;
        form.isPublic.checked = receivedArticle.isPublic;

        formData = {
            title: form.title.value || "",
            description: form.description.value || "",
            markdown: form.markdown.value || "",
            isPublic: form.isPublic.checked ?? false,
        };

    } catch (error) {
        console.log("GET ARTICLE ERROR : ", error);
        if (error.response.data.code == 720) {
            stateMessage(true, "No Article  found or invalid Login[Private article]");
            console.log("Article Not Found or invalid Login[Private Article");
            await new Promise((res, rej) => {
                setTimeout(() => {
                    window.location.replace('/');
                    res("done");
                }, 5000);
            })
        }
        else if (error.response.data.code == 709) {
            stateMessage(true, "Refreshing Token in getArticle");
            try {
                console.log("Refreshing Access Token");
                await axios.post("/api/v1/user/refreshAccessToken");
                return await fillForm();
            } catch (error) {
                console.log("Refresh Token Is not Valif any more : ", error);
                stateMessage(true, "I am sorry, login again ...redirecting");
                await new Promise((res, rej) => {
                    setTimeout(() => {
                        window.location.replace('/api/v1/user/login');
                        res(done);
                    }, 5000);
                })
            }
        } else {
            console.log("505 network error or Db error or Invalid Login")
            window.location.replace('/');
        }
    }
    console.log("Form Filled!!!");
    stateMessage(false, false, true);
}

setup();
