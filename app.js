var budgetController = (function(){
    //takes care of data processing

    //data structures to store info about income and expenses
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur,idx,arr){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            //ID = last id + 1
            if(data.allItems[type].length === 0)
                ID = 0;
            else
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            
            //create new Item
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
            else{
                newItem = new Income(ID,des,val);
            }

            //push item to the data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate % if income spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            else
                data.percentage = -1;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            return data;
        }
    };
})();

var UIController = (function(){
    //takes care of UI related issues

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncLabel: '.budget__income--value',
        budgetExpLabel: '.budget__expenses--value',
        budgetExpPercentLabel: '.budget__expenses--percentage' 
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                // will be either inc or exp
            
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, ele;
            //create HTML string with placeholder text
            if(type === 'inc'){
                ele = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                ele = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace placeholder text
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);
            
            //insert HTML into the DOM
            document.querySelector(ele).insertAdjacentHTML('beforeend',newHtml);
        },

        displayBudget: function(obj){
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;        
            document.querySelector(DOMStrings.budgetIncLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.budgetExpLabel).textContent = obj.totalExp;
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.budgetExpPercentLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMStrings.budgetExpPercentLabel).textContent = '---';
            }
        },

        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            //querySelectorAll returns a list instead of an array
            //convert the list to an array
            fieldsArray = Array.prototype.slice.call(fields);
            
            //use foreach method to loop over all elements of the array
            //can also be done with for loop
            fieldsArray.forEach(function(cur, idx, arr){
                cur.value = "";
            });

            fieldsArray[0].focus();
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }
})();

var controller = (function(budgetCtrl,UICtrl){
    //takes care of communication between budget and UI controllers
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        //add key press event to entire document
        document.addEventListener('keypress', function(event){
            //console.log(event);
            //key code for enter key is 13
            if(event.keyCode === 13){
                //console.log('Enter was pressed');
                ctrlAddItem();
            }
        });
    }
    var updateBudget = function(){
        //1. calculate budget
        budgetController.calculateBudget();

        //2. return the budget
        var budget = budgetController.getBudget();

        //3. display budget
        UIController.displayBudget(budget);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        //1. get input data
        input = UICtrl.getInput();
        
        //2. check validity of input
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //3. add item to budget controller
            newItem = budgetController.addItem(input.type,input.description,input.value);
        
            //4. add item to UI and clear fileds
            UIController.addListItem(newItem, input.type);
            UIController.clearFields();

            //5. calculate and update budget
            updateBudget();
        }
        
    }
    
    return {
        init: function(){
            console.log('application started');
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController,UIController);

controller.init();


