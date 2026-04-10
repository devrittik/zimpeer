// const getAuthState = () => {
//     const token = localStorage.getItem("token");

//     let isGuest = true;
//     let isExp = false;

//     if (token) {
//         try {
//             const decoded = jwtDecode(token);
//             isGuest = decoded.isGuest;
//             isExp = decoded.exp * 1000 < Date.now();
//         } catch {
//             isGuest = true;
//             isExp = true;
//         }
//     }

//     return { isGuest, isExp };
// };

// const isAuthenticated = () => {
//     const {isGuest} = getAuthState();
//     return !isGuest;
// }

// const withAuth = (WrappedComponent) => {
//     const AuthComponent = (props) => {
//         const router = useNavigate();
//         const isAuth = isLoggedin();

//         useEffect(() => {
//             if (!isAuth) {
//                 router("/auth");
//             }
//         }, [router]);

//         if (!isAuth) return null;

//         return <WrappedComponent {...props} />
//     }

//     return AuthComponent;
// }

// export {with};
