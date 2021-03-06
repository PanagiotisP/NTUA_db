import React, { Component } from 'react';
import axios from 'axios';
import './DisplayTable.css';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';

import { type } from 'os';

class DisplayTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "",
            address: "",
            displayedData: [],
            displayedFields: {},
            query: {},
            prim_key: {},

        };
    }

    componentWillReceiveProps(props) {
        this.refresh(props);
    }

    refresh(props) {
        this.setState({
            type: props.type,
            address: 'http://localhost:5000/' + props.type,
            displayedData: props.displayedData,
            displayedFields: props.displayedFields,
            query: props.query,
            prim_key: props.prim_key
        })
    }

    orderBy = (e) => {
        if (e.target.getAttribute("value") != "") {
            switch (e.target.getAttribute("order")) {
                case "":
                    e.target.setAttribute("order", "asc")
                    this.state.query["by"] = e.target.getAttribute("value") + ' ' + e.target.getAttribute("order");
                    break;
                case "asc":
                    e.target.setAttribute("order", "desc")
                    this.state.query["by"] = e.target.getAttribute("value") + ' ' + e.target.getAttribute("order");
                    break;
                case "desc":
                    e.target.setAttribute("order", "")
                    this.state.query["by"] = undefined;
                    break;
            }

            axios.get(this.state.address, {
                params: {
                    query: this.state.query
                }
            })
                .then((response) => {
                    if (response.data.errorMsg) {
                        this.props.throwError(response.data.errorMsg);
                    } else {
                        this.setState({ displayedData: [response.data["names"]].concat(response.data["result"]), displayedFields: response.data["orgName"], prim_key: response.data["prim_key"] });
                    }
                });
        }
    }

    deleteEntry = (i) => {
        axios.delete(this.state.address,
            {
                params: i
            })
            .then((response) => {
                if (response.data.errorMsg) {
                    this.props.throwError(response.data.errorMsg);
                } else {
                    this.getEverything();   
                }
            })
    }

    getEverything = () => {
        axios.get(this.state.address, {
            params: {
                query: this.state.query
            }
        })
            .then((response) => {
                if (response.data.errorMsg) {
                    this.props.throwError(response.data.errorMsg);
                } else {
                    this.setState({ displayedData: [response.data["names"]].concat(response.data["result"]), displayedFields: response.data["orgName"], prim_key: response.data["prim_key"] });
                }
            });
    }

    bookCopy = (i, flag) => {
        if (flag) {
            axios.post(this.state.address + "Copy",
                {
                    params: i[0]
                })
                .then(() => {
                    axios.get(this.state.address, {
                        params: {
                            query: this.state.query
                        }
                    })
                        .then((response) => {
                            this.setState({ displayedData: [response.data["names"]].concat(response.data["result"]), displayedFields: response.data["orgName"], prim_key: response.data["prim_key"] });
                        });
                })
        } else {
            axios.delete(this.state.address + "Copy",
                {
                    params: i
                })
                .then(() => {
                    axios.get(this.state.address, {
                        params: {
                            query: this.state.query
                        }
                    })
                        .then((response) => {
                            this.setState({ displayedData: [response.data["names"]].concat(response.data["result"]), displayedFields: response.data["orgName"], prim_key: response.data["prim_key"] });
                        });
                })
        }
    }

    render() {
        const displayType = (this.state.displayedData.length === 1 ? (<p>No results found</p>) :
            (<table id="books" className="Unit-Table">
                <thead>
                    {
                        (<TableHead onClick={this.orderBy} order="" values={Object.values(this.state.displayedFields)}
                            object={this.state.displayedData[0]} addCopy={(this.state.type === "book")} />
                        )
                    }
                </thead>
                <tbody >
                    {
                        this.state.displayedData.slice(1).map((bookObj, i) =>
                            (<TableRow key={i} object={bookObj} rowNo={i} clickFun={
                                () => this.deleteEntry(
                                    this.state.prim_key.map(
                                        (pkey) => ({
                                            [pkey]: bookObj[pkey]
                                        })
                                    )
                                )
                            } addCopy={(this.state.type === "book")}
                                manCopy={
                                    (flag) => this.bookCopy(
                                        this.state.prim_key.map(
                                            (pkey) => ({
                                                [pkey]: bookObj[pkey]
                                            }))
                                        , flag)
                                }
                                prim_keys={this.state.prim_key}
                                errorHandle={this.props.throwError}
                                address={this.state.address}
                                refr={() => this.getEverything()}
                            >
                            </TableRow>))
                    }
                </tbody>
            </table>));
        return (
            <div className="display">
                {displayType}
            </div>

        );
    }
}

const TableHead = (props) => {
    if (props.object !== undefined) {
        return (
            <tr>

                {Object.values(props.object).map((domain, i) =>
                    <td key={i} onClick={props.onClick} order={props.order} value={props.values[i]}
                        id={"h" + i} style={{ cursor: 'pointer' }}>{domain}</td>
                )}
                <td><DeleteRoundedIcon className="classes.icon"/></td>

                    {(props.addCopy) ? <td>Copies</td> : <></>}
                    <td style={{ display: 'none' }}/>   
                    <td></td>

            </tr>
        )
    }
    return null;
}

class TableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            updateMode: []
        }
    }

    updateRow() {
        var to_update = {
            key: {},
            fields: {}
        }
        for (var key in this.props.prim_keys) {
            to_update.key[this.props.prim_keys[key]] = this.props.object[this.props.prim_keys[key]];
        }
        var elements = [...document.getElementsByClassName("Upd" + this.props.rowNo)];

        for (var it = 0; it < elements.length; it++) {

            var field = document.querySelector("#h" + elements[it].id);

            to_update.fields[field.getAttribute('value')] = elements[it].value;
        }

        if (Object.keys(to_update.fields).length !== 0) {
            axios.put(this.props.address, to_update).then((response) => {
                if (response.data.errorMsg) {
                    this.props.errorHandle(response.data.errorMsg);
                    this.setState({
                        updateMode: []
                    })
                } else {
                    this.props.refr();
                    this.setState({
                        updateMode: []
                    })
                }
            })
        }


    }
    doubleClickHandle(i, obj) {
     
        for (var key in this.props.prim_keys) {

            if (obj === this.props.object[this.props.prim_keys[key]]) {
                this.props.errorHandle("Cannot update primary key " + this.props.prim_key);
                return;
            }
        }


        var ind = this.state.updateMode.indexOf(i);
        if (ind === -1) {
            this.state.updateMode.push(i);
            this.setState({
                updateMode: this.state.updateMode
            });
        }
        else {

            this.state.updateMode.splice(ind, 1)
            this.setState({
                updateMode: this.state.updateMode
            })
        }

    }

    render() {
        if (this.props.object !== undefined) {
            return (
                <tr>
                    {Object.values(this.props.object).map((domain, i) =>
                        <td key={i} onDoubleClick={() => this.doubleClickHandle(i, domain)} >{

                            (this.state.updateMode.indexOf(i) !== -1) ? <input type="text" className={"Upd" + this.props.rowNo}
                                id={i}
                                defaultValue={domain} /> : domain
                        }</td>
                    )}
                    <td onClick={this.props.clickFun}  style={{ cursor: 'pointer' }}><p className="delSym">x</p></td>
                    {(this.props.addCopy) ? <td>

                        <i onClick={() => { this.props.manCopy(true) }} 
                             className="addSym" style={{ cursor: 'pointer' }}>+
                            </i> 
                        <i onClick={() => { this.props.manCopy(false) }} className="redSym" style={{ cursor: 'pointer' }}>-</i> </td>
                        :   <></>}
                          {(this.state.updateMode === []) ? <></> :
                        <td style={{}}>  <i onClick={() => this.updateRow()} style={{cursor:'pointer'}}>&#128393;</i> </td>}
                </tr>
            );
        }
    }
}

export default DisplayTable;
