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
import React, { useEffect, useState } from "react";
import IconButton from "@material-ui/core/IconButton";
//import MenuIcon from "@material-ui/icons/Menu";
import MenuIcon from '@mui/icons-material/KeyboardArrowRight';
import { useDrawer, DrawerProvider } from "components/Drawer";
import { Container, HeaderComponent, Layout, TableContainer, LeftContainer, RightContainer } from "./style";
import { DataGrid } from '@mui/x-data-grid';
import { Cast } from "react-feather";
import api from "../../services/api";
import { toast } from "react-toastify";
import { getSession } from "../../services/auth";
import config from "../../util/sessionHeader";
import { ListOrdered, Sheet, UserPlus } from "lucide-react";
import AceEditor from "react-ace";
import CSVReader from "react-csv-reader";

// import "//colorlib.com/etc/cf/ContactFrom_v10/vendor/bootstrap/css/bootstrap.min.css";
// import "//colorlib.com/etc/cf/ContactFrom_v10/fonts/font-awesome-4.7.0/css/font-awesome.min.css";
// import "https://colorlib.com/etc/cf/ContactFrom_v10/css/main.css";

// import "//colorlib.com/etc/cf/ContactFrom_v10/vendor/jquery/jquery-3.2.1.min.js";
// import "//colorlib.com/etc/cf/ContactFrom_v10/vendor/bootstrap/js/bootstrap.min.js";
// import "//colorlib.com/etc/cf/ContactFrom_v10/js/main.js";






import {
    JsonToCsv,
    useJsonToCsv
} from 'react-json-csv';

const { saveAsCsv } = useJsonToCsv();

function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
}

const BroadcastPage = () => {
    const [data, setData] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [csv, setdata] = useState([]);
    const [keys, setKey] = useState([]);
    const [datacsv, setdatacsv] = useState([]);
    const [, setSelected] = useState([]);
    const drawerCtx = useDrawer();
    const [message, setMessage] = useState("");
    const [nomer, setNomer] = useState("");


    const hasil = [];
    useEffect(() => {
        //getAllContacts();
        //setdatacsv(csv);
        setData(hasil);

        return () => {
            setContacts([]);
        };
    }, []);



    const papaparseOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header => header.toLowerCase().replace(/\W/g, "_")
    };



    const handleForce = (data1) => {
        //console.log(data.length);
        //console.log(data);
        setdata(data1);
        const arre = [];

        for (var i = 0; i <= data1.length; i++) {
            let res = data1.map(x => Object.keys(x)[i]);
            //console.log(res[0])
            if (res[0] !== undefined) {
                arre.push(res[0]);
            }
        }

        console.log(arre);
        setKey(arre);



    }

    async function getAllContacts() {
        const { data } = await api.get(`${getSession()}/all-contacts`, config())
        const arr = [];

        for (const contact of data.response) {
            if (contact.isMyContact && contact.id.user !== undefined)
                arr.push(contact);
        }

        setContacts(arr);
        setData(arr);
    }

    const rows = hasil.map((contato, index) => {
        return {
            id: index,
            penerima: contato.penerima,
            pesan: contato.pesan
        };
    });



    const columns = [
        {
            field: "penerima",
            headerName: "Penerima",
            width: "200"
        },
        {
            field: "pesan",
            headerName: "Pesan",
            width: "400"
        },
    ];
    function searchContact(e) {
        let query = e.target.value;

        let users = data.filter((filtro) => {
            if (filtro.name !== undefined && filtro.id._serialized !== undefined) {
                return filtro.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().indexOf(query.toLowerCase()) > -1 || filtro.id._serialized.indexOf(query) > -1;
            } else {
                return [];
            }
        }
        );

        setContacts(users);

        if (query === "") {
            setContacts(data);
        }
    }

    const columnsExcel = () => {
        return ({
            "name": "Name",
            "phone": "Phone"
        })
    }

    async function sendMessage() {
        if (!!message.trim() && !!getSession()) {
            //   const by = `*${getUser()}:* \n\n`;
            const by = "";
            let endpoint = "send-message";
            console.log(csv)
            console.log(csv.length)



            for (const kirim of csv) {

                var msg = message
                for (var i = 0; i < keys.length; i++) {


                    if (msg.includes(`<<${keys[i]}>>`)) {
                        console.log(`ada ${keys[i]}`);

                        msg = msg.replaceAll(`<<${keys[i]}>>`, kirim[`${keys[i]}`])


                        console.log(msg);
                        //setMessage(msg);
                    } else {
                        console.log(`ga ada ${keys[i]}`);
                    }

                }

                
                console.log(kirim[nomer])

                var no = kirim[nomer].toString()
                if (no.includes(`@g.us`)) {
                    var body = {
                        phone: `${kirim[nomer]}`,
                        message: by + msg,
                        isGroup: true
                    };
                    //body.push({isGroup: true})
                } else{
                    var body = {
                        phone: `${kirim[nomer]}`,
                        message: by + msg
                    };
                }

                

                try {
                    var kir = await api.post(`${getSession()}/${endpoint}`, body, config());

                    if (kir.data.response.status !== "success") {
                        if (kir.data.response.message) {
                            var pesan = kir.data.response.message
                        } else {
                            var pesan = `error ${kir.data.status} ${kir.data.statusText} `
                        }
                    } else {
                        var pesan = kir.data.response.response.body
                    }

                    var penerima = kir.data.response.response.to.replace('@c.us', '');

                    hasil.push({ penerima: penerima, pesan: pesan })
                } catch (ee) {
                    console.log(ee);
                }



                timeout(7000)

                //console.log(message);
                //console.log(kirim[`${nomer}`]);

            }

            //console.log(msg);





            //await api.post(`${getSession()}/${endpoint}`, body, config());

        } else {
            toast.error("Type a message!", {
                position: "bottom-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    return (
        <Layout>
            <Container>
                <LeftContainer>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => {
                            drawerCtx.open()
                        }}
                        edge="start"
                    //className={clsx(classes.menuButton, open && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>

                    <div className="container-contact100">
                        <div className="wrap-contact100">
                            <div className="contact100-form validate-form">



                                <div className={"contact100-form validate-form"}>

                                    <div className={"mb-3"}>
                                        <CSVReader
                                            className="form-control form-control-sm form-label"
                                            label="Select CSV"
                                            onFileLoaded={handleForce}
                                            parserOptions={papaparseOptions}
                                        />
                                    </div>
                                    <div className={"wrap-input100 validate-input"}>
                                        <textarea className={"input100 bg-dark"}
                                            placeholder={"Type a message..."}
                                            rows={ 13 }
                                            style={{ resize:"none" }}
                                            value={message}
                                            onChange={(e) => {
                                                setMessage(e.target.value);
                                            }}
                                        ></textarea>
                                        <span className="focus-input100 "></span>
                                    </div>
                                    <div className={"contact100-form validate-form"}>
                                        <input className={"input100 bg-dark"}
                                            placeholder={"Tag Nomer"}
                                            value={nomer}
                                            onChange={(e) => {
                                                setNomer(e.target.value);
                                            }}
                                        />
                                    </div>

                                    <div className={"container-contact100-form-btn"}>
                                        <buttons  className={"contact100-form-btn"} onClick={(e) => sendMessage(e)}>
                                            <span>
                                                <i className="fa fa-paper-plane-o m-r-6" aria-hidden="true"></i>
                                                Send
                                            </span>
                                            {/* <Cast onClick={(e) => sendMessage(e)} /> */}
                                        </buttons>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div >


                    {/* <ul>
                    <li onClick={() => setSelected(1)}>
                        <div className={"wrapper-li"}>
                            <div className={"wrapper-ic"}>
                                <ListOrdered />
                            </div>
                            <div className={"wrapper-text"}>
                                <h2>
                                    All Contacts
                                </h2>
                                <p>
                                    Manage all your contacts.
                                </p>
                            </div>
                        </div>
                    </li>

                    <li onClick={() => setSelected(2)}>
                        <div className={"wrapper-li"}>
                            <div className={"wrapper-ic"}>
                                <UserPlus />
                            </div>
                            <div className={"wrapper-text"}>
                                <h2>
                                    Add Contacts (Soon)
                                </h2>
                                <p>
                                    Add contacts remotely.
                                </p>
                            </div>
                        </div>
                    </li>

                    <li onClick={() => {
                        saveAsCsv({
                            data: rows,
                            fields: { "name": "Name", "phone": "Phone" },
                            filename: `contacts-${getSession()}`
                        });
                        setSelected(3);
                    }}>
                        <div className={"wrapper-li"}>
                            <div className={"wrapper-ic"}>
                                <Sheet />
                            </div>
                            <div className={"wrapper-text"}>
                                <h2>
                                    Export Contact List
                                </h2>
                                <p>
                                    Export your contact list to excel.
                                </p>
                            </div>
                        </div>
                    </li>
                </ul> */}
                </LeftContainer>

                <RightContainer>
                    <HeaderComponent>
                        <h2>
                            Hasil Kirim
                        </h2>

                        <div>
                            <input placeholder={"Search contacts..."} onChange={(e) => searchContact(e)} />
                        </div>
                    </HeaderComponent>

                    <TableContainer>
                        <DataGrid
                            color="primary"
                            variant="outlined"
                            shape="rounded"
                            pageSize={15}
                            columns={columns}
                            rows={rows}
                            minHeight="100%"
                        />
                    </TableContainer>
                </RightContainer>
            </Container>

        </Layout >
    );
};

export default BroadcastPage;
