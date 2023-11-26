exports.getDate = function(){
    const options = {weekday:"long",month:"short",day:"numeric"};
    return new Date().toLocaleDateString("en-US",options);
}