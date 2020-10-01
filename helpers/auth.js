import cookie from "js-cookie";
import Router from "next/router";
// since nextJS runs on both server side and client side so need to ensure when we 
// are on client side and when on server side
// process.browser is true on the client and undefined on the server. 
// first time it runs on client then on evry refresh/request it runs on server everytime

export const setCookie = (key, value) => {
    if(process.browser){
        cookie.set(key, value, {expires: 1});
    }
}

//remove from cookie
export const removeCookie = (key) => {
    if(process.browser){
        cookie.remove(key);
    }
}

//get from cookie such as stored token
export const getCookie = (key, req) => {
    // if(process.browser){
    //     return cookie.get(key);
    // }
    return process.browser ? getCookieFromBrowser(key):getCookieFromServer(key, req);
}

export const getCookieFromBrowser = (key) => {
    return cookie.get(key);
}

export const getCookieFromServer = (key, req) => {
    if(!req.headers.cookie){
        return undefined;
    }
    // return tokenValue;
    // console.log("req.headers.cookie",req.headers.cookie);
    let token = req.headers.cookie.split(";").find(c => c.trim().startsWith(`${key}=`));
    if(!token){
        return undefined;
    }
    let tokenValue = token.split("=")[1];
    // console.log("getCookieFromServer", tokenValue);
    return tokenValue;
}

// set in localstorage
export const setLocalStorage = (key, value) => {
    if(process.browser){
        localStorage.setItem(key, JSON.stringify(value), {expires: 1});
    }
}

//remove from localstorage
export const removeLocalStorage = (key) => {
    if(process.browser){
        localStorage.removeItem(key);
    }
}

//authenticate user by passing data to cookie and localstorage during signin
export const authenticate = (response, next) => {
   setCookie("token", response.data.token);
   setLocalStorage("user", response.data.user);
   next();
}

// access user info from localstorage
export const isAuth = () => {
    if(process.browser){
        const cookieChecked = getCookie("token");
        if(cookieChecked){
            if(localStorage.getItem("user")){
                return JSON.parse(localStorage.getItem("user"));
            }
            else{
                return false;
            }
        }
    }
 }

 export const logout = (key) => {
    removeLocalStorage("user");
    removeCookie("token");
    Router.push("/login");
 }

 export const updateUser = (user, next) => {
    if (process.browser) {
        if (localStorage.getItem('user')) {
            let auth = JSON.parse(localStorage.getItem('user'));
            auth = user;
            localStorage.setItem('user', JSON.stringify(auth));
            next();
        }
    }
};