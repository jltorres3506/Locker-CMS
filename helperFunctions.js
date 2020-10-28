//used for the locker number validatiion before it gets passed to db
const checkIfValueIsNaN = (value)=>{
    const parsedValue = parseInt(value);
    if(isNaN(parsedValue)){
        return false;
    }else return true;
};

module.exports ={
    checkIfValueIsNaN
};