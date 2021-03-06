import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: "80%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function CustomSelectField(props) {
  const classes = useStyles();
  const [cardTypes, setCardTypes] = useState(['']);
  const [cardType, setCardType] = useState('');

  const fetchCards = async () => {
    const apiCall = await fetch('http://www.mocky.io/v2/5d145fa22f0000ff3ec4f030');
    const response = await apiCall.json();
    setCardTypes(
      response.cardTypes.map(x => x.value)
    );
  }

  useEffect(() => {
    fetchCards();
  }, [])

  const handleChange = (event) => {
    setCardType(event.target.value);
    props.onChange(event);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">- Select Card Type -</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          name={props.name}
          value={cardType}
          defaultValue={props.defaultValue}
          onChange={handleChange}
        >
          {
            cardTypes.map(element => <MenuItem value={element}>{element}</MenuItem>)
          }
        </Select>
      </FormControl>
    </div>
  );
}
