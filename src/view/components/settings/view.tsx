import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { injectIntl } from 'react-intl';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import { _currentViewComponents, _setCurrentViewComponents } from '../../../components/settings';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormLabel from '@material-ui/core/FormLabel';

interface S {
  isLoading:boolean,
  currentVersion:string[],
}

interface P{
  intl:any,
  global:any
}

class Settings extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state ={
      isLoading:false,
      currentVersion:_currentViewComponents().split(","),
    }
  }

  indexOf = (needle:string):boolean=>{
    return this.state.currentVersion.indexOf(needle) > -1
  }

  changeView = (value:string)=>(_e:React.ChangeEvent<HTMLInputElement>):void =>{
    let p = Array.from(this.state.currentVersion);
    if(this.indexOf(value)){
      p = p.filter(v=>v !== value)
    }else{
      p.push(value);
    }
    return this.setState({currentVersion:_setCurrentViewComponents(p)});
  }

  render(){
    const {isLoading} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Container fixed style={{padding:0}}>
        <Paper style={{padding:"15px"}}>
          <FormControl fullWidth>
            <FormLabel component="legend">楽曲リスト/補助表示</FormLabel>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("last")} onChange={this.changeView("last")} value="last" />} label="前回スコアからの更新点数"/>
            </FormGroup>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("djLevel")} onChange={this.changeView("djLevel")} value="djLevel" />} label="DJレベル参考表示"/>
            </FormGroup>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("estRank")} onChange={this.changeView("estRank")} value="estRank" />} label="推定順位"/>
            </FormGroup>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("lastVer")} onChange={this.changeView("lastVer")} value="lastVer" />} label="前作スコアからの更新点数"/>
            </FormGroup>
          </FormControl>
          <Typography variant="caption" display="block">
            楽曲リストにおいて表示する内容を選択してください。<br/>
            「前作スコアからの更新点数」表示は、マシンスペック・表示件数によってはページのレンダリングが遅延する可能性があります。
          </Typography>
        </Paper>
      </Container>
    );
  }
}

export default injectIntl(Settings);