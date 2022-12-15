/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import {Container, Description, Formula, ImageCustom, Layout, Title} from "./style";
import {X} from "react-feather";
import api, {socket} from "../../services/api";
import ModalMenu from "../../components/MenuModal";
import ErrorModal from "../../components/ErrorModal";
import BackdropComponent from "../../components/BackdropComponent";
import {useLocation} from "react-router-dom";
import {login,getToken} from "../../services/auth";
import LoginImage from "../../assets/login-v2.72cd8a26.svg";

const SECRET_KEY = window.IP_SECRET_KEY;
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

export default function LoginPage({history}) {
    const classes = useStyles();
    const [open,] = useState(true);
    const [session, setSession] = useState("");
    const [token, setToken] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [openMenuModal, setOpenMenuModal] = useState(false);
    const [openErrorModal, setOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [titleError, setTitleError] = useState("");
    const animationRef = useRef(null);
    const layoutRef = useRef(null);

    const {state: haveLogin} = useLocation();

    useEffect(() => {

        socket.on("qrCode", (qrCode) => {
            if (session === qrCode.session) {
                setQrCode(qrCode.data);
                handleCloseBackdrop();
                if (animationRef.current !== null) {
                    animationRef.current.classList.remove("animation");
                }
            }
        });

        socket.off("session-logged").on("session-logged", (status) => {
            if (status.session === session) {
                if (token) {
                    insertLocalStorage(getToken());

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
            const generate = await api.post(`${session}/${SECRET_KEY}/generate-token`, null, null);
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

    function insertLocalStorage(tok) {
        login(JSON.stringify({session: session, token: tok}));
        setToken(tok);
        
    }

    async function startSession() {
        try {
            const config = {
                headers: {Authorization: `Bearer ${getToken()}`}
            };

            const checkConn = await api.get(`${session}/check-connection-session`, config);
            if (!checkConn.data.status) {
                setTimeout(async function () {
                    await signSession();
                }, 8000);
                while(true){
                    const cek = await api.get(`${session}/status-session`, config);
                    if (cek.data.status == "CONNECTED"){
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
                        setQrCode(cek.data.qrcode);
                        handleCloseBackdrop();
                        await timeout(2000);
                    }
                }
                //console.log('data')
                //insertLocalStorage(getToken());
                //history.push("/chat");
            } else {
                console.log('else')
                insertLocalStorage(getToken());
                history.push("/chat");
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

        await api.post(`${session}/start-session`, null, config)

    }

    const handleCloseBackdrop = () => {
        setOpenBackdrop(false);
    };

    const handleToggleBackdrop = () => {
        setOpenBackdrop(!openBackdrop);
    };

    const handleCloseModal = () => {
        setOpenMenuModal(false);
    };

    const handleOpenModal = () => {
        setOpenMenuModal(true);
    };

    const handleCloseErrorModal = () => {
        setOpenErrorModal(false);
    };

    const handleOpenErrorModal = () => {
        setOpenErrorModal(true);
    };

    return (
        <div>
            <Modal
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
                        <ModalMenu handleClose={handleCloseModal} open={openMenuModal}/>
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

                        <Container>
                            <div className={"container-session"}>
                                <div id={"left-div"}>
                                    <img src={LoginImage} alt={"Login Team"}/>
                                </div>

                                <div id={"right-div"}>
                                    {
                                        qrCode === "" ? null : (
                                            <div style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <ImageCustom
                                                    ref={animationRef}
                                                    className={"animation noselect"}
                                                    autoplay
                                                    src={qrCode}
                                                    alt={"Smartphone"}
                                                    draggable={"false"}
                                                />
                                                <Title>
                                                    Scan QRCode
                                                </Title>
                                            </div>
                                        )
                                    }

                                    {
                                        qrCode !== "" ? null : (
                                            <Formula onSubmit={(e) => submitSession(e)}>
                                                <Title id={"title"}>
                                                    Login with your session
                                                </Title>

                                                <Description id={"description"}>
                                                    Enter session name to log into your account
                                                </Description>

                                                <div className={"top-info"}>
                                                    <small>
                                                        Session
                                                    </small>
                                                </div>
                                                <input
                                                    id={"session"}
                                                    autoComplete="off"
                                                    placeholder="Session Name"
                                                    value={session}
                                                    onChange={(e) => setSession(e.target.value)}
                                                />

                                                

                                                <button type="submit" id="send-btn">
                                                    Submit
                                                </button>
                                            </Formula>
                                        )
                                    }
                                </div>
                            </div>

                        </Container>
                    </Layout>
                </Fade>
            </Modal>
        </div>
    );
}