import zh from './zh'
import Store from '../store';

const localeObj = {zh}

function locale(){
    return localeObj[Store.lang];
}

export default locale;
