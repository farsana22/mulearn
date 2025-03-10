import React from "react";
import axios from "axios";
import { privateGateway, publicGateway } from "@/MuLearnServices/apiGateways";
import { dashboardRoutes, onboardingRoutes } from "@/MuLearnServices/urls";

type profileDetails = {
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    gender: string;
    dob: string;
    communities: any;
};
type getAPI = React.Dispatch<
    React.SetStateAction<
        {
            id: string;
            title: string;
        }[]
    >
>;
// type errorHandler = (status: number, dataStatus: number) => void;

export const getEditUserProfile = (
    setProfileDetails: (data: profileDetails) => void
) => {
    privateGateway
        .get(dashboardRoutes.getEditUserProfile)
        .then(response => {
            // console.log(response.data.response);
            const {
                first_name,
                last_name,
                email,
                mobile,
                gender,
                dob,
                communities
            } = response.data.response;
            const profileDetails: profileDetails = {
                first_name: first_name,
                last_name: last_name,
                email,
                mobile: mobile,
                gender,
                dob,
                communities
            };
            setProfileDetails(profileDetails);
        })
        .catch(error => {
            console.log(error);
        });
};

export const updateProfileImage = async (
    profile: File,
    id: string,
    succ?: (msg: string) => void,
    fail?: (msg: string) => void
) => {
    try {
        const access = localStorage.getItem("accessToken");
        const payload = new FormData();
        payload.append("profile", profile);
        payload.append("user_id", id);
        const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}${
                dashboardRoutes.postProfileImage
            }`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${access}`,
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        reloadLocalImage(
            res.data.response.profile_pic + `?${Math.random() * 1000}`
        );
        if (succ) succ(res.toString());
    } catch (err) {
        if (fail) fail(err as any);
    }
};
export const syncDiscordImage = async (
    succ?: (msg: string) => void,
    fail?: (msg: string) => void
) => {
    try {
        const res = await privateGateway.patch(
            dashboardRoutes.postProfileImage
        );
        console.log(res);
        if (succ) succ(res.toString());
    } catch (err) {
        if (fail) fail(err as any);
    }
};
export const patchEditUserProfile = (
    toast: ToastAsPara,
    editedProfileDetails: profileDetails,
    setEditPopUp: (value: boolean) => void,
    setFieldError: (field: string, message: string) => void
) => {
    privateGateway
        .patch(dashboardRoutes.getEditUserProfile, editedProfileDetails)
        .then(response => {
            // console.log(response.data.response);
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated",
                status: "success",
                duration: 3000,
                isClosable: true
            });
            setTimeout(() => {
                setEditPopUp(false);
            }, 1000);
        })
        .catch(error => {
            console.log(error.response.data.response);
            const fieldErrors = error.response.data.response;
            Object.keys(fieldErrors).forEach(field => {
                console.log(`${field}: ${fieldErrors[field][0]}`);
                setFieldError(field, fieldErrors[field][0]);
                toast({
                    title: `${field} Error`,
                    description: `${fieldErrors[field][0]}`,
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            });
        });
};

// request for community list
export const getCommunities = (
    setCommunityAPI: getAPI,
    setLoadStatus: React.Dispatch<React.SetStateAction<boolean>>
) => {
    publicGateway
        .get(onboardingRoutes.communityList)
        .then(response => {
            // console.log(response.data.statusCode);
            response.data.statusCode === 200 &&
                setTimeout(() => {
                    setLoadStatus(true);
                }, 500);
            setCommunityAPI(response.data.response.communities);
        })
        .catch(error => {
            // errorHandler(error.response.status, error.response.data.status);
        });
};

const reloadLocalImage = async (newLink: string) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "");
    userInfo.profile_pic = newLink;
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
};
