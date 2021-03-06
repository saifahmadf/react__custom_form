import React, { useReducer, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

import CustomTextField from "./components/TextField";
import CustomSelectField from "./components/SelectField";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 20,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.secondary,
  },
  formoutput: {
    marginBottom: "1em",
  },
}));

export default function CustomForm() {
  const classes = useStyles();

  const [paymentResponse, setPaymentResponse] = useState({});
  const [formInput, setFormInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      cardType: "",
      cardNumber: "",
      cardExpiry: "",
      name: "",
      email: "",
    }
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    let data = { formInput };
    const requestData = data.formInput;

    fetch("http://www.mocky.io/v2/5d8de422310000b19d2b517a", {
      method: "POST",
      body: JSON.stringify(requestData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => setPaymentResponse(response))
      .catch((error) => setPaymentResponse(error));
  };

  const handleInput = event => {
    const { name, value } = event.target;
    setFormInput({ [name]: value });
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <div className={classes.formoutput}>Product : ABCD</div>
            <div className={classes.formoutput}>Date : 08/09/2019 12:03:44</div>
            <div className={classes.formoutput}>Amount : 1123.03 USD</div>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          {
            !paymentResponse.responseMessage &&
            (<form onSubmit={handleSubmit}>
              <Paper className={classes.paper}>
                <Grid container spacing={3}>
                  <Grid item xs={6} style={{ marginTop: "24px" }}>
                    Card Types :
                </Grid>
                  <Grid item xs={6}>
                    <CustomSelectField onChange={handleInput}
                      name="cardType"
                      defaultValue={formInput.cardType} />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={6}
                    style={{ marginTop: "20px", paddingTop: "3px" }}
                  >
                    Card Number :
                </Grid>
                  <Grid item xs={6}>
                    <CustomTextField onChange={handleInput}
                      name="cardNumber"
                      defaultValue={formInput.cardNumber} />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={6}
                    style={{ marginTop: "20px", paddingTop: "3px" }}
                  >
                    Expiry :
                </Grid>
                  <Grid item xs={6}>
                    <CustomTextField onChange={handleInput}
                      name="expiry"
                      defaultValue={formInput.expiry} />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={6}
                    style={{ marginTop: "20px", paddingTop: "3px" }}
                  >
                    Name :
                </Grid>
                  <Grid item xs={6}>
                    <CustomTextField onChange={handleInput}
                      name="name"
                      defaultValue={formInput.name} />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={6}
                    style={{ marginTop: "20px", paddingTop: "3px" }}
                  >
                    Email :
                </Grid>
                  <Grid item xs={6}>
                    <CustomTextField onChange={handleInput}
                      name="email"
                      defaultValue={formInput.email} />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={6}></Grid>
                  <Grid item xs={6}>
                    <div>
                      <Button
                        variant="contained"
                        color="default"
                        style={{ "marginTop": "1em" }}
                        type="submit"
                      >
                        Confirm Payment
                  </Button>
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </form>)
          }

          {
            paymentResponse.responseMessage
            && paymentResponse.responseMessage === 'Payment Success' &&
            (<Alert severity="success">
              <AlertTitle>Payment Success!</AlertTitle>
              Your payment was success — <strong>Your invoice number is {paymentResponse.invoiceNo}</strong>
            </Alert>)
          }

          {
            paymentResponse.responseMessage
            && paymentResponse.responseMessage !== 'Payment Success' &&
            (<Alert severity="error">
              <AlertTitle>Payment Failed!</AlertTitle>
              Sorry, we were unable to process this transaction.
            </Alert>)
          }
        </Grid>
      </Grid>
    </div >
  );
}
