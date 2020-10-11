var budgetController = (function(){
    //takes care of data processing
    var x = 23;

    var add = function(a){
        return x+a;
    }
    /*
    x and add cannot be accesed from the outside environment..
    we can access only the publicTest method which has access to
    x and add because of closures..
    this is a way of implementing module pattern
    */
    return {
        publicTest: function(b){
            return add(b);
        }
    }
})();

var UIController = (function(){
    //takes care of UI related issues
})();

var controller = (function(budgetCtrl,UICtrl){
    //takes care of communication between budget and UI controllers
    var z = budgetCtrl.publicTest(5);
    return {
        anotherPublicMethod : function(){
            console.log(z);
        }
    }
})(budgetController,UIController);
