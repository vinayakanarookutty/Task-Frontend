
export enum Routes {
    REGISTRATION = "/",
    HOME = "/home",
    LOGIN= "/login",

}

export function getAppRoutePath(routes: Routes){
    return `/${routes}`;
}
