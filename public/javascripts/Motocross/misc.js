(function() {

var misc;
if(typeof exports === 'undefined') {
	misc = {};

	if(typeof window === 'object') {
		window.misc = misc;
	}
} 
else {
	misc = exports;
}

misc.clone = function(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = new obj.constructor(); 
    for(var key in obj)
        temp[key] = misc.clone(obj[key]);

    return temp;
};

})();