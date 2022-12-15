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
import {blue} from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import {Plus, User} from "react-feather";
import {Layout} from "./style";
import history from "../../../history";
import {login} from "../../../services/auth";
import api, {socket} from "../../../services/api";
import signSession from "../../../services/start-session";
import PropTypes from "prop-types";

const SECRET_KEY = window.IP_SECRET_KEY;
const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
});



function AllSessionsDialog({onClose, selectedValue, open, sessions}) {

    const [handle, setHandle] = useState(false);

    const classes = useStyles();

    const handleClose = () => {
        onClose(selectedValue);
        setHandle(true);
    };

    async function gettoken(session) {
        const generate = await api.post(`${session}/${SECRET_KEY}/generate-token`, null, null);
        console.log("fungsi")
            if (generate.data.status == "success"){
                console.log(`token :${generate.data.token}`)
                return generate.data.token;
            } else {
                //handleOpenErrorModal();
                //setTitleError("Can't Generate Token");
                //setErrorMessage("You need to check up config ip server and secret key");
            }
        
    }

     const gettoken1 = async (session) => {
        console.log("fungsi")
        const generate = await api.post(`${session}/${SECRET_KEY}/generate-token`, null, null);
        
            if (generate.data.status == "success"){
                console.log(generate.data.token);
                insertLocaltoken(generate.data.token);
                return JSON.stringify(generate.data.token);
            } else {
                //handleOpenErrorModal();
                //setTitleError("Can't Generate Token");
                //setErrorMessage("You need to check up config ip server and secret key");
            }
        
    }


    const handleListItemClick = (value) => {
        onClose(value.session);
        (async () => {
            const response = await api.post(`${value.session}/${SECRET_KEY}/generate-token`, null, null);
            if (response.data.status == "success"){
                value.token = response.data.token;
                console.log(value.token);
                login(JSON.stringify({session: value.session, token: response.data.token}));
                
            } else {
                handleOpenErrorModal();
                setTitleError("Can't Generate Token");
                setErrorMessage("You need to check up config ip server and secret key");
            }
            
        })();
        console.log(value.session)

        handleClose();
        //window.location.reload();
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <Layout>
                <DialogTitle id="simple-dialog-title">Choose a session</DialogTitle>
                <List>
                    {sessions.map((sessao, index) => (
                        <ListItem button onClick={() => handleListItemClick(sessao)} key={index}>
                            <ListItemAvatar>
                                <Avatar className={classes.avatar}>
                                    <User/>
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText primary={sessao.session}/>
                        </ListItem>
                    ))}

                    <ListItem autoFocus button onClick={() => history.push("new-session")}>
                        <ListItemAvatar>
                            <Avatar>
                                <Plus/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="New Session"/>
                    </ListItem>
                </List>
            </Layout>
        </Dialog>
    );
}

AllSessionsDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    selectedValue: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    sessions: PropTypes.array.isRequired
};

export default AllSessionsDialog;