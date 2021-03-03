import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    padding: '5px 10px'
  },
  control: {
    padding: theme.spacing(2)
  },
  formControl: {
    margin: '10px 0',
    minWidth: 150,
  },
  button: {
    'margin-top': '10px;'
  },
  appBar: {
    padding: '25px',
    'margin-bottom': '20px'
  }
}));
