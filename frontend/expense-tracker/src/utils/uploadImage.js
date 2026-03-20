import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosinstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // Append Image file to form data
    formData.append('image',imageFile);

    try{
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData,{
            headers: {
                'Content-Type':'multipart/form-data', //Set Header for file upload
            },
        });
        return response.data; //Return Response Data
    }catch(error){
        console.error('Error Uploading Image:',error);
        throw error;
    }
};
export default uploadImage;