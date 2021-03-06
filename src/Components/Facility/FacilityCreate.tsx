import React, { useState, useReducer } from "react"
import { useDispatch } from "react-redux"
import { FormControl, Grid, Card, CardHeader, CardContent, Button, InputLabel, Select, MenuItem, CardActions } from "@material-ui/core"
import { TextInputField, MultilineInputField } from "../Common/HelperInputFields"
import AppMessage from "../Common/AppMessage"
import { makeStyles } from "@material-ui/styles";
import { navigate } from 'hookrouter';
import { createFacility } from "../../Redux/actions";
import { validateLocationCoordinates, phonePreg } from "../../Constants/common";
import districts from "../../Constants/Static_data/districts.json"
import SaveIcon from '@material-ui/icons/Save';
import {FACILITY_TYPES} from "./constants";
import {Loading} from "../../Components/Common/Loading";

const initForm: any = {
    name: "",
    district: "",
    address: "",
    phone_number: "",
    latitude: "",
    longitude: "",
};

const initialState = {
    form: { ...initForm },
    errors: { ...initForm }
};

const useStyles = makeStyles(theme => ({
    formTop: {
        marginTop: '100px',
    },
    pdLogo: {
        height: '345px',
        border: 'solid 3px white'
    },
    selectEmpty: {
        marginTop: "10px",
    },
    selectLabel: {
        background: 'white',
        padding: '0px 10px'
    },
}));

const facility_create_reducer = (state = initialState, action: any) => {

    switch (action.type) {
        case "set_form": {

            return {
                ...state,
                form: action.form
            }
        }

        case "set_error": {
            return {
                ...state,
                errors: action.errors
            }

        }

        default:
            return state
    }
}

export const FacilityCreate = () => {

    const dispatchAction: any = useDispatch()

    const classes = useStyles();

    const [state, dispatch] = useReducer(facility_create_reducer, initialState);
    const [showAppMessage, setAppMessage] = useState({ show: false, message: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: any) => {
        let form = { ...state.form }

        form[e.target.name] = e.target.value

        dispatch({ type: "set_form", form })
    }

    const validateForm = () => {
        let errors = { ...initForm }
        let invalidForm = false
        Object.keys(state.form).forEach(field => {
            if (!state.form[field]) {
                errors[field] = "Field is required";
                invalidForm = true;
            } else if (field === "phone_number" && !phonePreg(state.form.phone_number)) {
                errors[field] = "Please Enter 10/11 digit mobile number or landline as 0<std code><phone number>"
                invalidForm = true
            } else if ((field === "latitude" || field === "longitude") && !validateLocationCoordinates(state.form[field])) {
                errors[field] = "Please enter valid coordinates"
                invalidForm = true
            }
        });
        if (invalidForm) {
            dispatch({ type: "set_error", errors })
            return false
        }
        dispatch({ type: "set_error", errors })
        return true
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        const validated = validateForm();
        if (validated) {
            setIsLoading(true)
            const data = {
                facility_type: FACILITY_TYPES.HOSPITAL.id,
                name: state.form.name,
                district: state.form.district,
                address: state.form.address,
                location: {
                    latitude: state.form.latitude,
                    longitude: state.form.longitude,
                },
                phone_number: state.form.phone_number,
            }
            const res = await dispatchAction(createFacility(data));
            if (res.data) {
                const id = res.data.id;
                setIsLoading(false)
                dispatch({ type: "set_form", form: initForm })
                setAppMessage({ show: true, message: "Facility Added Successfully", type: "success" })
                navigate(`/facility/${id}/bed/add`);
            }
        }
    }
    if (isLoading) {
        return <Loading />
    }
    return <div className="w3-content" style={{ maxWidth: '400px' }}>
        <div style={{marginTop: '20px'}}>
            <form onSubmit={(e) => handleSubmit(e)}>

                <Card>
                    <AppMessage open={showAppMessage.show} type={showAppMessage.type} message={showAppMessage.message} handleClose={() => setAppMessage({ show: false, message: "", type: "" })} handleDialogClose={() => setAppMessage({ show: false, message: "", type: "" })} />
                    <CardHeader title="Create Facility" />
                    <CardContent>
                        <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
                            <Grid container justify="center" style={{ marginBottom: '10px' }}>
                                <Grid item xs={12}>
                                    <TextInputField
                                        name="name"
                                        label="Hospital Name*"
                                        placeholder=""
                                        variant="outlined"
                                        margin="dense"
                                        value={state.form.name}
                                        onChange={handleChange}
                                        errors={state.errors.name}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container justify="center" >
                                <Grid item xs={12}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="demo-simple-select-outlined-label" className={classes.selectLabel} >Pick Your District*</InputLabel>
                                        <Select
                                            fullWidth
                                            labelId="demo-simple-select-outlined-label"
                                            id="demo-simple-select-outlined"
                                            name="district"
                                            value={state.form.district}
                                            onChange={handleChange}
                                            label="District"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {districts.map((district) => {
                                                return <MenuItem key={district.id.toString()} value={district.id}>{district.name}</MenuItem>
                                            })}
                                        </Select>
                                        <span className="error-text">{state.errors.district}</span>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Grid container justify="center" >
                                <Grid item xs={12}>
                                    <MultilineInputField
                                        name="address"
                                        label="Hospital Address*"
                                        placeholder=""
                                        variant="outlined"
                                        margin="dense"
                                        value={state.form.address}
                                        onChange={handleChange}
                                        errors={state.errors.address}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container justify="center" >
                                <Grid item xs={12}>
                                    <TextInputField
                                        name="phone_number"
                                        label="Emergency Contact Number*"
                                        placeholder=""
                                        variant="outlined"
                                        margin="dense"
                                        value={state.form.phone_number}
                                        onChange={handleChange}
                                        errors={state.errors.phone_number}
                                        inputProps={{ maxLength: 13 }}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container justify="center" >
                                <Grid item xs={12}>
                                    <TextInputField
                                        name="latitude"
                                        label="Latitude*"
                                        placeholder=""
                                        variant="outlined"
                                        margin="dense"
                                        value={state.form.latitude}
                                        onChange={handleChange}
                                        errors={state.errors.latitude}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container justify="center" >
                                <Grid item xs={12}>
                                    <TextInputField
                                        name="longitude"
                                        label="Longitude*"
                                        placeholder=""
                                        variant="outlined"
                                        margin="dense"
                                        value={state.form.longitude}
                                        onChange={handleChange}
                                        errors={state.errors.longitude}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>

                    <CardContent>
                        <CardActions className="padding16" style={{ justifyContent: "space-between" }}>
                            <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                style={{ marginLeft: 'auto' }}
                                onClick={(e) => handleSubmit(e)}
                                startIcon={<SaveIcon>save</SaveIcon>}
                            >Save</Button>
                        </CardActions>
                    </CardContent>
                </Card>
            </form>
        </div>
    </div >
}
