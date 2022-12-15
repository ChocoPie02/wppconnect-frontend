
import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import {X} from "react-feather";
import api, {socket} from "./api";
import SignModal from "../components/SignModal";
import ErrorModal from "../components/ErrorModal";
import BackdropComponent from "../components/BackdropComponent";
import {useLocation} from "react-router-dom";
import {Container, Description, Formula, ImageCustom, Layout, Title} from "./style";
import {login,getToken,getSession} from "./auth";
import LoginImage from "../assets/login-v2.72cd8a26.svg";
import PropTypes from "prop-types";



const useStyles = makeStyles((theme) => ({
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: 0,
        outline: 0,
        boxShadow: theme.shadows[5],
        padding: 0,
        width: "100%",
        height: "100%"
    },
}));

function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
}


function AllSessionsLogin({open}) {

    //console.log(session)
    //console.log(token)

    const classes = useStyles();
    const [token, setToken] = useState("");
    const [session, setSession] = useState("");
    const [qrCode, setQrCode] = useState("");
    const animationRef = useRef(null);
    const [openBackdrop, setOpenBackdrop] = useState(true);
    const [openSignModal, setOpenSignModal] = useState(false);
    const [openErrorModal, setOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [titleError, setTitleError] = useState("");

    const {state: haveLogin} = useLocation();

    useEffect(() => {

        socket.on("qrCode", (qrCode) => {
            if (session === qrCode.session) {
                setQrCode(qrCode.data);
                handleCloseBackdrop();
                //if (animationRef.current !== null) {
                //    animationRef.current.classList.remove("animation");
                //}
            }
        });

        socket.off("session-logged").on("session-logged", (status) => {
            if (status.session === session) {
                if (token) {
                    //insertLocalStorage(getToken());

                    setTimeout(() => {
                        history.push("/chat");
                    }, 500)
                }
            }
        });
        
    }, [session, token]);

    async function submitSession(e) {
        e.preventDefault();


        if (session === "") {
            handleOpenErrorModal();
            setTitleError("Fill in all fields");
            setErrorMessage("You need to fill in all fields before proceeding.");
        } else {
            handleToggleBackdrop();
            const generate = await api.post(`${getSession()}/${SECRET_KEY}/generate-token`, null, null);
            if (generate.data.status == "success"){
                setToken(generate.data.token);
                insertLocalStorage(generate.data.token);
            } else {
                handleOpenErrorModal();
                setTitleError("Can't Generate Token");
                setErrorMessage("You need to check up config ip server and secret key");
            }
            await startSession();
        }
    }

    const handleCloseBackdrop = () => {
        setOpenBackdrop(false);
    };

    const handleToggleBackdrop = () => {
        setOpenBackdrop(!openBackdrop);
    };

    const handleCloseModal = () => {
        setOpenSignModal(false);
    };

    const handleOpenModal = () => {
        setOpenSignModal(true);
    };

    const handleCloseErrorModal = () => {
        setOpenErrorModal(false);
    };

    const handleOpenErrorModal = () => {
        setOpenErrorModal(true);
    };

    async function startSession() {
        try {
            const config = {
                headers: {Authorization: `Bearer ${getToken()}`}
            };
            console.log("cek session")
            const checkConn = await api.get(`${getSession()}/check-connection-session`, config);
            console.log(checkConn.data.message)
            if (!checkConn.data.status) {
                setTimeout(async function () {
                    await signSession();
                }, 8000);
                while(true){
                    const cek = await api.get(`${getSession()}/status-session`, config);
                    console.log(cek.data.status)
                    if (cek.data.status == "CONNECTED"){
                        handleToggleBackdrop()
                        break;
                    }else if (cek.data.status == "INITIALIZING"){
                        await timeout(8000);
                        continue
                    }else if (cek.data.status == "CLOSED"){
                        setTimeout(async function () {
                            await signSession();
                        }, 8000);
                        await timeout(5000);
                        //handleOpenErrorModal();
                        //setTitleError("Can't Connect Device");
                        //setErrorMessage("Please try again.");
                        //break;
                    }else if (cek.data.status == "QRCODE"){
                        handleCloseBackdrop();
                        setQrCode(cek.data.qrcode);
                        handleOpenModal();
                        await timeout(2000);
                    }
                }
                
                console.log(getSession())
                console.log(getToken())
                //insertLocalStorage(getToken());
                //history.push("/chat");
            } else {
                console.log('else')
                insertLocalStorage(getToken());
                history.push("/chat");
                window.location.reload();
            }
        } catch (e) {
            setTimeout(function () {
                handleCloseBackdrop();
                handleOpenErrorModal();
                setTitleError("Oops... Something went wrong.");
                setErrorMessage("Check that the session and token are correct.");
            }, 2000);
        }
    }

    async function signSession() {
        const config = {
            headers: {Authorization: `Bearer ${getToken()}`}
        };

        await api.post(`${getSession()}/start-session`, null, config)

    }

    

    return (
        <div>
            {open && <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >           
                <Fade in={open}>
                    <Layout className={classes.paper}>
                        <SignModal handleClose={handleCloseModal} open={openSignModal}/>
                        <ErrorModal handleClose={handleCloseErrorModal} open={openErrorModal}
                                    errorMessage={errorMessage}
                                    titleError={titleError}/>
                        <BackdropComponent open={openBackdrop}/>

                        {
                            haveLogin !== undefined ?
                                <div className={"close-item"} onClick={() => history.goBack()}>
                                    <X/>
                                </div>
                                : null
                        }


                    </Layout>
                </Fade>
            </Modal>
            && startSession()
            }
        </div>
    );

}

AllSessionsLogin.propTypes = {
    open: PropTypes.bool.isRequired

};


export default AllSessionsLogin;